import { supabase } from '@/lib/supabase/client';
import { canPerformManagementAction, type ManagementAction } from '@/lib/auth/authorization';
import { APP_CONFIG } from '@/lib/config/appConfig';
import { validateGPSWorkflow } from '@/lib/utils/gpsWorkflow';
import { Ticket, TicketStatus, UserRole } from '@/types';
import { Database } from '@/types/database';
import { isValidTransition } from '@/lib/utils/statusTransitions';

type ProfileRole = Pick<Database['public']['Tables']['profiles']['Row'], 'role'>;

interface ProfilesRoleTableClient {
    select: (columns: string) => {
        eq: (column: string, value: string) => {
            single: () => Promise<{ data: ProfileRole | null; error: unknown }>;
        };
    };
}

const TICKET_ENTRY_EDIT_FIELDS: Array<keyof Ticket> = [
    'ticket_number',
    'utility_client',
    'work_order_ref',
    'work_description',
    'special_instructions',
    'priority',
    'status',
    'scheduled_date',
    'due_date',
    'address',
    'city',
    'state',
    'zip_code',
    'geofence_radius_meters',
];

async function getCurrentProfileRole(): Promise<UserRole | null> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const profilesTable = supabase.from('profiles') as unknown as ProfilesRoleTableClient;
    const { data: profile } = await profilesTable
        .select('role')
        .eq('id', user.id)
        .single();

    return (profile?.role as UserRole | undefined) ?? null;
}

async function assertManagementActionAllowed(action: ManagementAction): Promise<void> {
    const role = await getCurrentProfileRole();

    if (!canPerformManagementAction(role, action)) {
        throw new Error('You do not have permission to perform this action.');
    }
}

export const ticketService = {
    async getTickets() {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Ticket[];
    },

    async getTicketById(id: string) {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Ticket;
    },

    async createTicket(ticket: Partial<Ticket>) {
        await assertManagementActionAllowed('ticket_entry_write');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('tickets') as any)
            .insert([ticket])
            .select()
            .single();

        if (error) throw error;
        return data as Ticket;
    },

    async updateTicket(id: string, updates: Partial<Ticket>) {
        const updateKeys = Object.keys(updates) as Array<keyof Ticket>;
        const isAssignmentUpdate = updateKeys.includes('assigned_to');
        const isTicketEntryEdit = updateKeys.some((key) => TICKET_ENTRY_EDIT_FIELDS.includes(key));

        if (isAssignmentUpdate) {
            await assertManagementActionAllowed('contractor_assignment_write');
        }

        if (isTicketEntryEdit) {
            await assertManagementActionAllowed('ticket_entry_write');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('tickets') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Ticket;
    },

    async getTicketsByAssignee(assigneeId: string) {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('assigned_to', assigneeId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Ticket[];
    },

    /**
     * Updates a ticket status and logs the change in history.
     */
    async updateTicketStatus(
        id: string,
        newStatus: TicketStatus,
        userId: string,
        role: UserRole,
        changeReason?: string,
        location?: { latitude: number; longitude: number; accuracy: number }
    ) {
        // 1. Get current status
        const ticket = await this.getTicketById(id);
        const currentStatus = ticket.status;

        // 2. Validate transition
        if (!isValidTransition(currentStatus, newStatus, role)) {
            throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus} for role ${role}`);
        }

        const gpsRequiredStatuses: TicketStatus[] = ['IN_ROUTE', 'ON_SITE', 'COMPLETE'];
        const isFieldRole = role === 'CONTRACTOR';
        const requiresGeofence = newStatus === 'ON_SITE' || newStatus === 'COMPLETE';

        if (isFieldRole && gpsRequiredStatuses.includes(newStatus)) {
            if (!location) {
                throw new Error(`GPS validation is required to update status to ${newStatus}.`);
            }

            const hasTicketCoordinates = typeof ticket.latitude === 'number' && typeof ticket.longitude === 'number';
            if (requiresGeofence && !hasTicketCoordinates) {
                throw new Error('Ticket coordinates are missing. Unable to validate geofence.');
            }

            const workflowValidation = validateGPSWorkflow(
                {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    accuracy: location.accuracy,
                },
                hasTicketCoordinates
                    ? {
                        latitude: ticket.latitude as number,
                        longitude: ticket.longitude as number,
                        radiusMeters: ticket.geofence_radius_meters ?? APP_CONFIG.GEOFENCE_RADIUS_METERS,
                    }
                    : undefined,
                APP_CONFIG.MIN_GPS_ACCURACY_METERS,
            );

            if (!workflowValidation.gpsValid) {
                throw new Error(workflowValidation.gpsError ?? 'GPS validation failed.');
            }

            if (requiresGeofence && workflowValidation.withinGeofence !== true) {
                const geofenceRadius = ticket.geofence_radius_meters ?? APP_CONFIG.GEOFENCE_RADIUS_METERS;
                const distanceText = workflowValidation.distanceMeters !== undefined
                    ? ` (current distance: ${workflowValidation.distanceMeters}m)`
                    : '';
                throw new Error(`Must be within ${geofenceRadius}m geofence to update status.${distanceText}`);
            }
        }

        // 3. Start transaction-like update
        // Note: Supabase doesn't support multi-table transactions in a simple client call, 
        // but we can use an Edge Function or just sequential calls for this MVP.

        // Update ticket
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase.from('tickets') as any)
            .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
                updated_by: userId
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // Log history
        await this.logStatusChange(id, currentStatus, newStatus, userId, changeReason, location);

        return true;
    },

    /**
     * Logs a status change in the history table.
     */
    async logStatusChange(
        ticketId: string,
        fromStatus: TicketStatus | null,
        toStatus: TicketStatus,
        changedBy: string,
        changeReason?: string,
        location?: { latitude: number; longitude: number; accuracy: number }
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('ticket_status_history') as any)
            .insert([{
                ticket_id: ticketId,
                from_status: fromStatus,
                to_status: toStatus,
                changed_by: changedBy,
                change_reason: changeReason,
                gps_latitude: location?.latitude,
                gps_longitude: location?.longitude,
                gps_accuracy: location?.accuracy,
                changed_at: new Date().toISOString()
            }]);

        if (error) throw error;
    },

    /**
     * Fetches status history for a specific ticket.
     */
    async getStatusHistory(ticketId: string) {
        const { data, error } = await supabase
            .from('ticket_status_history')
            .select(`
                *,
                profiles:changed_by (
                    first_name,
                    last_name
                )
            `)
            .eq('ticket_id', ticketId)
            .order('changed_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};
