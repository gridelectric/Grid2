
'use client';

import { PageHeader } from '@/components/common/layout/PageHeader';
import { TicketList } from '@/components/features/tickets/TicketList';
import { useAuth } from '@/components/providers/AuthProvider';
import { useContractorId } from '@/hooks/useContractorId';

export default function TicketsPage() {
  const { profile, isLoading } = useAuth();
  const { contractorId } = useContractorId(profile?.id);

  const userRole: 'admin' | 'contractor' =
    profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN'
      ? 'admin'
      : 'contractor';

  if (isLoading) {
    return <div className="storm-surface rounded-xl p-4 text-sm text-slate-500">Loading tickets...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={userRole === 'admin' ? 'Ticket Management' : 'My Tickets'}
      />
      {profile ? (
        <TicketList
          profileRole={profile.role}
          userId={userRole === 'contractor' ? contractorId : undefined}
          userRole={userRole}
        />
      ) : (
        <div className="storm-surface rounded-xl p-4 text-sm">Please log in to view tickets.</div>
      )}
    </div>
  );
}
