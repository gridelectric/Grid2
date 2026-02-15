'use client';

import Link from 'next/link';
import { AlertTriangle, Clock, DollarSign, MapPin, Plus, Users } from 'lucide-react';

import { PageHeader } from '@/components/common/layout/PageHeader';
import { DashboardMetrics } from '@/components/features/dashboard';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { canPerformManagementAction } from '@/lib/auth/authorization';

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const canManageStormEvents = canPerformManagementAction(profile?.role, 'storm_event_write');
  const canCreateTickets = canPerformManagementAction(profile?.role, 'ticket_entry_write');
  const canAssignContractors = canPerformManagementAction(profile?.role, 'contractor_assignment_write');

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Live operations overview, financial throughput, and review workload.">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/reports">View Reports</Link>
        </Button>

        {canManageStormEvents ? (
          <Button asChild size="sm">
            <Link href="/admin/storms/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Storm Event
            </Link>
          </Button>
        ) : (
          <Button size="sm" disabled title="Only Super Admin can create storm events">
            <Plus className="mr-2 h-4 w-4" />
            Create Storm Event
          </Button>
        )}
      </PageHeader>

      <Card className="storm-surface">
        <CardHeader>
          <CardTitle className="text-grid-navy">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {canCreateTickets ? (
              <Button asChild size="sm">
                <Link href="/tickets/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Ticket Entry
                </Link>
              </Button>
            ) : (
              <Button size="sm" disabled title="Only Super Admin can create tickets">
                <Plus className="mr-2 h-4 w-4" />
                Create Ticket Entry
              </Button>
            )}

            {canManageStormEvents ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/storms/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Storm Event
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled title="Only Super Admin can create storm events">
                <Plus className="mr-2 h-4 w-4" />
                Create Storm Event
              </Button>
            )}

            <Button
              asChild={canAssignContractors}
              variant="outline"
              size="sm"
              disabled={!canAssignContractors}
              title={canAssignContractors ? 'Assign routes' : 'Only Super Admin can assign contractors'}
            >
              {canAssignContractors ? (
                <Link href="/admin/map">
                  <Users className="mr-2 h-4 w-4" />
                  Assign Route
                </Link>
              ) : (
                <span>
                  <Users className="mr-2 h-4 w-4" />
                  Assign Route
                </span>
              )}
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href="/admin/time-review">
                <Clock className="mr-2 h-4 w-4" />
                Review Timesheets
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href="/admin/reports">
                <MapPin className="mr-2 h-4 w-4" />
                Open Reports
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href="/admin/invoice-generation">
                <DollarSign className="mr-2 h-4 w-4" />
                Generate Invoices
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <DashboardMetrics />

      <div className="grid grid-cols-1 gap-6">
        <Card className="storm-surface">
          <CardHeader>
            <CardTitle className="text-grid-navy">Today&apos;s Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-xl border border-grid-surface bg-grid-surface p-6">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <MapPin className="mb-3 h-10 w-10 text-grid-blue" />
                <p className="text-sm font-medium text-grid-navy">Live map operations are available in Map View.</p>
                <p className="mt-1 text-xs text-slate-500">
                  Use map mode to validate geofence activity and monitor route progress.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/admin/map">Open Map View</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="storm-surface">
          <CardHeader>
            <CardTitle className="text-grid-navy">Operational Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <p>Pending reviews should be cleared before end-of-day invoice cycles.</p>
              </div>
            </div>
            <div className="rounded-md border border-grid-storm-100 bg-grid-storm-50 p-3 text-grid-navy">
              <p>Week 12 reporting exports are now available from the Reports dashboard.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="storm-surface">
          <CardHeader>
            <CardTitle className="text-grid-navy">Week 12 Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>Task 12.1: Invoice generation and 1099 tracking completed.</p>
            <p>Task 12.2: Dashboard metrics and report exports in progress.</p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/admin/reports">Continue Reporting Work</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
