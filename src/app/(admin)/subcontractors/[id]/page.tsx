'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/common/layout/PageHeader';
import { StatusBadge } from '@/components/common/data-display/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Ticket,
  XCircle,
} from 'lucide-react';
import { contractorService, type ContractorDetail } from '@/lib/services/contractorService';
import { getErrorLogContext, isAuthOrPermissionError } from '@/lib/utils/errorHandling';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

function toDisplayStatus(contractor: ContractorDetail): string {
  if (contractor.onboardingStatus.toUpperCase() === 'APPROVED') {
    return contractor.eligibleForAssignment ? 'Active' : 'Inactive';
  }

  if (contractor.onboardingStatus.toUpperCase() === 'PENDING') {
    return 'Pending';
  }

  return 'Onboarding';
}

export default function ContractorDetailPage() {
  const params = useParams();
  const contractorId = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params?.id]);

  const [contractor, setContractor] = useState<ContractorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!contractorId) {
      setContractor(null);
      setIsLoading(false);
      return;
    }

    let active = true;

    const loadContractor = async () => {
      setIsLoading(true);
      try {
        const detail = await contractorService.getContractorById(contractorId);
        if (active) {
          setContractor(detail);
        }
      } catch (error) {
        if (!isAuthOrPermissionError(error)) {
          console.warn('Failed to load contractor details:', getErrorLogContext(error));
        }
        if (active) {
          setContractor(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadContractor();

    return () => {
      active = false;
    };
  }, [contractorId]);

  if (isLoading) {
    return <div className="storm-surface rounded-xl p-4 text-sm text-grid-muted">Loading contractor details...</div>;
  }

  if (!contractor) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Contractor Not Found"
          description="The requested contractor record could not be loaded."
          showBackButton
          backHref="/admin/contractors"
        />
      </div>
    );
  }

  const initials = contractor.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="space-y-6">
      <PageHeader
        title={contractor.fullName}
        description="Contractor details and management"
        showBackButton
        backHref="/admin/contractors"
      >
        <Button variant="destructive" disabled>
          <XCircle className="w-4 h-4 mr-2" />
          Deactivate
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="storm-surface">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="bg-grid-storm-100 text-grid-navy text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">
                {contractor.fullName}
              </h2>
              <p className="text-grid-muted">{contractor.businessName}</p>
              <div className="mt-4">
                <StatusBadge status={toDisplayStatus(contractor)} />
              </div>
              <div className="mt-6 space-y-2 w-full text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-grid-subtle" />
                  <span>{contractor.email || 'No email on file'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-grid-subtle" />
                  <span>{contractor.phone ?? contractor.businessPhone ?? 'No phone on file'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-grid-subtle" />
                  <span>{[contractor.city, contractor.state].filter(Boolean).join(', ') || 'Location unavailable'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="storm-surface">
              <CardContent className="pt-6">
                <p className="text-sm text-grid-muted">YTD Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(contractor.ytdEarnings)}</p>
              </CardContent>
            </Card>
            <Card className="storm-surface">
              <CardContent className="pt-6">
                <p className="text-sm text-grid-muted">Active Tickets</p>
                <p className="text-2xl font-bold">{contractor.activeTicketCount}</p>
              </CardContent>
            </Card>
            <Card className="storm-surface">
              <CardContent className="pt-6">
                <p className="text-sm text-grid-muted">Total Tickets</p>
                <p className="text-2xl font-bold">{contractor.totalTicketCount}</p>
              </CardContent>
            </Card>
            <Card className="storm-surface">
              <CardContent className="pt-6">
                <p className="text-sm text-grid-muted">Eligible</p>
                <p className="text-2xl font-bold text-grid-success">
                  {contractor.eligibleForAssignment ? 'Yes' : 'No'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="storm-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-grid-blue" />
                Compliance Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Onboarding:</span> {contractor.onboardingStatus}
              </p>
              <p>
                <span className="font-medium">Assignment Eligibility:</span>{' '}
                {contractor.eligibleForAssignment ? 'Eligible' : 'Not Eligible'}
              </p>
              {!contractor.eligibleForAssignment && contractor.eligibilityReason ? (
                <p className="rounded-md border border-grid-warning bg-grid-warning-soft p-2 text-grid-navy">
                  {contractor.eligibilityReason}
                </p>
              ) : null}
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-grid-subtle" />
                Added {formatDate(contractor.createdAt)}
              </p>
            </CardContent>
          </Card>

          <Card className="storm-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Ticket className="h-4 w-4 text-grid-blue" />
                Recent Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contractor.recentTickets.length === 0 ? (
                <p className="text-sm text-grid-muted">No assigned tickets found.</p>
              ) : (
                contractor.recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="transition-grid block rounded-lg border border-grid-surface p-3 hover:bg-grid-storm-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{ticket.ticketNumber}</p>
                      <StatusBadge status={ticket.status} size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-grid-muted">
                      {ticket.utilityClient} • Priority {ticket.priority} • Updated {formatDate(ticket.updatedAt)}
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
