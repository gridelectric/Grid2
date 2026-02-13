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
import { subcontractorService, type SubcontractorDetail } from '@/lib/services/subcontractorService';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

function toDisplayStatus(subcontractor: SubcontractorDetail): string {
  if (subcontractor.onboardingStatus.toUpperCase() === 'APPROVED') {
    return subcontractor.eligibleForAssignment ? 'Active' : 'Inactive';
  }

  if (subcontractor.onboardingStatus.toUpperCase() === 'PENDING') {
    return 'Pending';
  }

  return 'Onboarding';
}

export default function SubcontractorDetailPage() {
  const params = useParams();
  const subcontractorId = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params?.id]);

  const [subcontractor, setSubcontractor] = useState<SubcontractorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!subcontractorId) {
      setSubcontractor(null);
      setIsLoading(false);
      return;
    }

    let active = true;

    const loadSubcontractor = async () => {
      setIsLoading(true);
      try {
        const detail = await subcontractorService.getSubcontractorById(subcontractorId);
        if (active) {
          setSubcontractor(detail);
        }
      } catch (error) {
        console.error('Failed to load subcontractor details:', error);
        if (active) {
          setSubcontractor(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadSubcontractor();

    return () => {
      active = false;
    };
  }, [subcontractorId]);

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading subcontractor details...</div>;
  }

  if (!subcontractor) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Subcontractor Not Found"
          description="The requested subcontractor record could not be loaded."
          showBackButton
          backHref="/admin/contractors"
        />
      </div>
    );
  }

  const initials = subcontractor.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="space-y-6">
      <PageHeader
        title={subcontractor.fullName}
        description="Subcontractor details and management"
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">
                {subcontractor.fullName}
              </h2>
              <p className="text-slate-500">{subcontractor.businessName}</p>
              <div className="mt-4">
                <StatusBadge status={toDisplayStatus(subcontractor)} />
              </div>
              <div className="mt-6 space-y-2 w-full text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{subcontractor.email || 'No email on file'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{subcontractor.phone ?? subcontractor.businessPhone ?? 'No phone on file'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{[subcontractor.city, subcontractor.state].filter(Boolean).join(', ') || 'Location unavailable'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">YTD Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(subcontractor.ytdEarnings)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Active Tickets</p>
                <p className="text-2xl font-bold">{subcontractor.activeTicketCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Total Tickets</p>
                <p className="text-2xl font-bold">{subcontractor.totalTicketCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Eligible</p>
                <p className="text-2xl font-bold text-green-600">
                  {subcontractor.eligibleForAssignment ? 'Yes' : 'No'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Compliance Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Onboarding:</span> {subcontractor.onboardingStatus}
              </p>
              <p>
                <span className="font-medium">Assignment Eligibility:</span>{' '}
                {subcontractor.eligibleForAssignment ? 'Eligible' : 'Not Eligible'}
              </p>
              {!subcontractor.eligibleForAssignment && subcontractor.eligibilityReason ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-900">
                  {subcontractor.eligibilityReason}
                </p>
              ) : null}
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                Added {formatDate(subcontractor.createdAt)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Ticket className="h-4 w-4 text-blue-600" />
                Recent Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subcontractor.recentTickets.length === 0 ? (
                <p className="text-sm text-slate-500">No assigned tickets found.</p>
              ) : (
                subcontractor.recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block rounded-md border p-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{ticket.ticketNumber}</p>
                      <StatusBadge status={ticket.status} size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
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
