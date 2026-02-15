

'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { Ticket, UserRole } from '@/types';
import { canPerformManagementAction } from '@/lib/auth/authorization';
import { ticketService } from '@/lib/services/ticketService';
import { DataTable, Column } from '@/components/common/data-display/DataTable';
import { StatusBadge } from '@/components/common/data-display/StatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { formatDate } from '@/lib/utils/formatters';
import { getErrorLogContext, getErrorMessage } from '@/lib/utils/errorHandling';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TicketFilters, TicketFiltersState } from './TicketFilters';
import { TicketCard } from './TicketCard';
import { TicketAssign } from './TicketAssign';
import { toast } from 'sonner';

interface TicketListProps {
    userRole: 'admin' | 'contractor';
    profileRole: UserRole;
    userId?: string; // For contractor view
}

export function TicketList({ userRole, profileRole, userId }: TicketListProps) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<TicketFiltersState>({
        search: "",
        status: "ALL",
        priority: "ALL",
    });
    const [assignRequest, setAssignRequest] = useState<{ ticketId: string, ticketNumber: string, currentAssigneeId?: string } | null>(null);
    const router = useRouter();
    const canCreateTicket = canPerformManagementAction(profileRole, 'ticket_entry_write');
    const canAssignContractor = canPerformManagementAction(profileRole, 'contractor_assignment_write');

    const loadTickets = useCallback(async () => {
        if (userRole === 'contractor' && !userId) {
            setTickets([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            let data: Ticket[];
            if (userRole === 'contractor' && userId) {
                data = await ticketService.getTicketsByAssignee(userId);
            } else {
                data = await ticketService.getTickets();
            }
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.warn('Failed to load tickets:', getErrorLogContext(error));
            setTickets([]);
            toast.error(getErrorMessage(error, 'Failed to load tickets'));
        } finally {
            setIsLoading(false);
        }
    }, [userRole, userId]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);


    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const matchesSearch = filters.search === "" ||
                ticket.ticket_number.toLowerCase().includes(filters.search.toLowerCase()) ||
                ticket.utility_client.toLowerCase().includes(filters.search.toLowerCase()) ||
                (ticket.work_description && ticket.work_description.toLowerCase().includes(filters.search.toLowerCase()));

            const matchesStatus = filters.status === "ALL" || ticket.status === filters.status;
            const matchesPriority = filters.priority === "ALL" || ticket.priority === filters.priority;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tickets, filters]);

    const handleAssignTicket = async (contractorId: string) => {
        if (!assignRequest) return;
        if (!canAssignContractor) {
            toast.error('Only Super Admin can assign contractors.');
            return;
        }

        try {
            await ticketService.updateTicket(assignRequest.ticketId, {
                assigned_to: contractorId,
                status: 'ASSIGNED', // Automatically update status to ASSIGNED? Or keep existing? Usually logic implies assignment = assigned status.
                // But check existing status... if it was DRAFT, now ASSIGNED.
            });
            toast.success(`Ticket ${assignRequest.ticketNumber} assigned successfully`);
            loadTickets(); // Reload to update list
        } catch (error) {
            console.error('Failed to assign ticket:', getErrorLogContext(error));
            toast.error(getErrorMessage(error, 'Failed to assign ticket'));
        }
    };

    const columns: Column<Ticket>[] = [
        {
            key: 'ticket_number',
            header: 'Ticket #',
            cell: (ticket) => (
                <span className="font-medium">{ticket.ticket_number}</span>
            ),
        },
        {
            key: 'title',
            header: 'Client / Description',
            cell: (ticket) => (
                <div className="flex flex-col">
                    <span className="font-medium">{ticket.utility_client}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {ticket.work_description || 'No description'}
                    </span>
                </div>
            ),
        },
        {
            key: 'priority',
            header: 'Priority',
            cell: (ticket) => <TicketPriorityBadge priority={ticket.priority} />,
        },
        {
            key: 'status',
            header: 'Status',
            cell: (ticket) => <StatusBadge status={ticket.status} />,
        },
        {
            key: 'location',
            header: 'Location',
            cell: (ticket) => (
                <div className="text-sm">
                    {ticket.city}, {ticket.state}
                </div>
            )
        },
        {
            key: 'created_at',
            header: 'Created',
            cell: (ticket) => formatDate(ticket.created_at),
        },
        {
            key: 'actions',
            header: '',
            cell: (ticket) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tickets/${ticket.id}`}>
                            View
                        </Link>
                    </Button>
                    {userRole === 'admin' && canAssignContractor && (
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Assign Ticket"
                            onClick={(e) => {
                                e.stopPropagation();
                                setAssignRequest({
                                    ticketId: ticket.id,
                                    ticketNumber: ticket.ticket_number,
                                    currentAssigneeId: ticket.assigned_to
                                });
                            }}
                        >
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const handleRowClick = (ticket: Ticket) => {
        router.push(`/tickets/${ticket.id}`);
    };

    return (
        <div className="space-y-4">
            <div className="storm-surface flex items-center justify-between rounded-xl p-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-grid-navy">Tickets</h2>
                    <p className="text-sm text-slate-500">
                        {isLoading ? 'Loading...' : `${filteredTickets.length} visible ticket${filteredTickets.length === 1 ? '' : 's'}`}
                    </p>
                </div>
                {userRole === 'admin' && canCreateTicket && (
                    <Button asChild>
                        <Link href="/tickets/create">
                            <Plus className="mr-2 h-4 w-4" /> Create Ticket
                        </Link>
                    </Button>
                )}
            </div>

            <div className="storm-surface rounded-xl p-4">
                <TicketFilters onFilterChange={setFilters} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <DataTable
                    columns={columns}
                    data={filteredTickets}
                    keyExtractor={(ticket) => ticket.id}
                    isLoading={isLoading}
                    onRowClick={handleRowClick}
                    emptyMessage="No tickets found matching your filters."
                />
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No tickets found matching your filters.</div>
                ) : (
                    filteredTickets.map(ticket => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            onClick={handleRowClick}
                        />
                    ))
                )}
            </div>

            <TicketAssign
                isOpen={!!assignRequest}
                onClose={() => setAssignRequest(null)}
                onAssign={handleAssignTicket}
                currentAssigneeId={assignRequest?.currentAssigneeId}
                ticketNumber={assignRequest?.ticketNumber || ''}
            />
        </div>
    );
}
