
'use client';

import { TicketList } from '@/components/features/tickets/TicketList';
import { PageHeader } from '@/components/common/layout/PageHeader';
import { useAuth } from '@/components/providers/AuthProvider';

export default function TicketsPage() {
    const { profile, isLoading } = useAuth();

    // Map UserRole to TicketList role format
    const userRole: 'admin' | 'subcontractor' =
        profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || profile?.role === 'TEAM_LEAD'
            ? 'admin'
            : 'subcontractor';

    if (isLoading) {
        return <div className="text-sm text-slate-500">Loading tickets...</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={userRole === 'admin' ? 'Ticket Management' : 'My Tickets'}
                description={userRole === 'admin' ? 'View and manage all service tickets.' : 'View and manage your assigned damage assessment tickets.'}
            />
            {profile ? (
                <TicketList
                    userRole={userRole}
                    profileRole={profile.role}
                    userId={userRole === 'subcontractor' ? profile.id : undefined}
                />
            ) : (
                <div>Please log in to view tickets.</div>
            )}
        </div>
    );
}
