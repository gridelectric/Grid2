
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { canPerformManagementAction } from '@/lib/auth/authorization';
import { PageHeader } from '@/components/common/layout/PageHeader';
import { stormEventService, type StormEventSummary } from '@/lib/services/stormEventService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/errorHandling';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export default function CreateTicketPage() {
    const router = useRouter();
    const { profile, isLoading } = useAuth();
    const [stormEvents, setStormEvents] = useState<StormEventSummary[]>([]);
    const [isStormEventsLoading, setIsStormEventsLoading] = useState(true);
    const canCreateTicket = canPerformManagementAction(profile?.role, 'ticket_entry_write');

    useEffect(() => {
        if (!isLoading && !canCreateTicket) {
            router.replace('/forbidden');
        }
    }, [canCreateTicket, isLoading, router]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const stormId = searchParams.get('storm_event_id');
        if (stormId) {
            router.replace(`/storms/${stormId}/tickets/new`);
        }
    }, [router]);

    useEffect(() => {
        let active = true;
        const loadStormEvents = async () => {
            setIsStormEventsLoading(true);
            try {
                const items = await stormEventService.listStormEvents();
                if (active) {
                    setStormEvents(items.filter((item) => item.status !== "CLOSED"));
                }
            } catch (error) {
                if (active) {
                    setStormEvents([]);
                    toast.error(getErrorMessage(error, "Failed to load storm events"));
                }
            } finally {
                if (active) {
                    setIsStormEventsLoading(false);
                }
            }
        };

        void loadStormEvents();
        return () => {
            active = false;
        };
    }, []);

    const handleStormSelect = (stormId: string) => {
        router.push(`/storms/${stormId}/tickets/new`);
    };

    if (isLoading || !canCreateTicket) {
        return <div className="storm-surface rounded-xl p-4 text-sm text-slate-500">Checking access...</div>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Create New Ticket"
                description="Select a storm event to begin creating a ticket."
                backHref="/tickets"
            />
            <div className="storm-surface rounded-xl p-6 space-y-4">
                <div className="space-y-2">
                    <Label>Select Storm Event</Label>
                    <Select onValueChange={handleStormSelect} disabled={isStormEventsLoading}>
                        <SelectTrigger className="storm-contrast-field">
                            <SelectValue placeholder={isStormEventsLoading ? "Loading storm events..." : "Select Storm Event"} />
                        </SelectTrigger>
                        <SelectContent>
                            {stormEvents.map((stormEvent) => (
                                <SelectItem key={stormEvent.id} value={stormEvent.id}>
                                    {stormEvent.eventCode} - {stormEvent.name} ({stormEvent.utilityClient})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!isStormEventsLoading && stormEvents.length === 0 && (
                        <p className="text-xs text-amber-700">
                            No active storm events found. Please create a storm event first.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
