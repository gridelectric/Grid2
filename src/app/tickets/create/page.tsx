
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { canPerformManagementAction } from '@/lib/auth/authorization';
import { TicketForm } from '@/components/features/tickets/TicketForm';
import { PageHeader } from '@/components/common/layout/PageHeader';
import { UTILITY_CLIENTS } from '@/lib/constants/utilityClients';

export default function CreateTicketPage() {
    const router = useRouter();
    const { profile, isLoading } = useAuth();
    const [defaultUtilityClient, setDefaultUtilityClient] = useState<string | undefined>(undefined);
    const canCreateTicket = canPerformManagementAction(profile?.role, 'ticket_entry_write');

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const utilityClientFromQuery = searchParams.get('utility_client');
        const isKnownUtilityClient = utilityClientFromQuery
            ? UTILITY_CLIENTS.includes(utilityClientFromQuery as (typeof UTILITY_CLIENTS)[number])
            : false;

        setDefaultUtilityClient(isKnownUtilityClient ? utilityClientFromQuery ?? undefined : undefined);
    }, []);

    useEffect(() => {
        if (!isLoading && !canCreateTicket) {
            router.replace('/forbidden');
        }
    }, [canCreateTicket, isLoading, router]);

    if (isLoading || !canCreateTicket) {
        return <div className="text-sm text-slate-500">Checking access...</div>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Create New Ticket"
                description="Fill out the form below to create a new service ticket."
                backHref="/tickets"
            />
            <div className="bg-card rounded-lg border p-6">
                <TicketForm
                    defaultUtilityClient={defaultUtilityClient}
                    lockUtilityClient={Boolean(defaultUtilityClient)}
                />
            </div>
        </div>
    );
}
