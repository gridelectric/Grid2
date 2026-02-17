'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, DollarSign, MapPin, Plus, Users } from 'lucide-react';

import { DashboardMetrics } from '@/components/features/dashboard';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { canPerformManagementAction } from '@/lib/auth/authorization';
import { stormEventService, type StormEventSummary } from '@/lib/services/stormEventService';
import { getErrorMessage } from '@/lib/utils/errorHandling';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const canManageStormEvents = canPerformManagementAction(profile?.role, 'storm_event_write');
  const canCreateTickets = canPerformManagementAction(profile?.role, 'ticket_entry_write');
  const canAssignContractors = canPerformManagementAction(profile?.role, 'contractor_assignment_write');
  const [activeStormEvent, setActiveStormEvent] = useState<StormEventSummary | null>(null);
  const [stormEvents, setStormEvents] = useState<StormEventSummary[]>([]);
  const [selectedStormEventId, setSelectedStormEventId] = useState<string>('');

  useEffect(() => {
    let active = true;

    const loadActiveStormEnvironment = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const fromQuery = searchParams.get('storm_event_id')?.trim();
      const fromStorage = window.localStorage.getItem('active_storm_event_id')?.trim();
      const stormEventId = fromQuery || fromStorage;

      if (!stormEventId) {
        if (active) {
          setActiveStormEvent(null);
        }
        return;
      }

      if (fromQuery) {
        window.localStorage.setItem('active_storm_event_id', fromQuery);
      }

      try {
        const [stormEvent, allStormEvents] = await Promise.all([
          stormEventService.getStormEventById(stormEventId),
          stormEventService.listStormEvents(),
        ]);
        if (active) {
          setActiveStormEvent(stormEvent);
          setStormEvents(allStormEvents);
          setSelectedStormEventId(stormEvent?.id ?? '');
        }
      } catch (error) {
        if (active) {
          setActiveStormEvent(null);
          setStormEvents([]);
          setSelectedStormEventId('');
        }
        toast.error(getErrorMessage(error, 'Failed to load active storm environment.'));
      }
    };

    void loadActiveStormEnvironment();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (stormEvents.length > 0) {
      return;
    }

    const loadStormEvents = async () => {
      try {
        const allStormEvents = await stormEventService.listStormEvents();
        if (active) {
          setStormEvents(allStormEvents);
        }
      } catch {
        if (active) {
          setStormEvents([]);
        }
      }
    };

    void loadStormEvents();

    return () => {
      active = false;
    };
  }, [stormEvents.length]);

  const switchActiveStormEnvironment = async () => {
    if (!selectedStormEventId) {
      return;
    }

    try {
      const stormEvent = await stormEventService.getStormEventById(selectedStormEventId);
      if (!stormEvent) {
        toast.error('Selected storm event was not found.');
        return;
      }

      window.localStorage.setItem('active_storm_event_id', stormEvent.id);
      window.history.replaceState(null, '', `/admin/dashboard?storm_event_id=${encodeURIComponent(stormEvent.id)}`);
      setActiveStormEvent(stormEvent);
      toast.success('Active storm environment updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to switch storm environment.'));
    }
  };

  const clearActiveStormEnvironment = () => {
    window.localStorage.removeItem('active_storm_event_id');
    window.history.replaceState(null, '', '/admin/dashboard');
    setActiveStormEvent(null);
    setSelectedStormEventId('');
    toast.success('Active storm environment cleared.');
  };

  const createTicketHref = activeStormEvent
    ? `/tickets/create?storm_event_id=${encodeURIComponent(activeStormEvent.id)}&utility_client=${encodeURIComponent(activeStormEvent.utilityClient)}`
    : '/tickets/create';

  return (
    <div className="space-y-6">
      {activeStormEvent ? (
        <Card className="storm-surface">
          <CardHeader>
            <CardTitle className="text-grid-navy">Active Storm Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-grid-body">
            <p><span className="font-semibold text-grid-navy">Storm Name:</span> {activeStormEvent.name}</p>
            <p><span className="font-semibold text-grid-navy">Utility Client:</span> {activeStormEvent.utilityClient}</p>
            <p><span className="font-semibold text-grid-navy">State:</span> {activeStormEvent.region ?? 'Unspecified'}</p>
            <p><span className="font-semibold text-grid-navy">Status:</span> {activeStormEvent.status}</p>
            <p><span className="font-semibold text-grid-navy">Storm ID:</span> <span className="font-mono text-xs">{activeStormEvent.id}</span></p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
              <Select value={selectedStormEventId} onValueChange={setSelectedStormEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select another storm environment" />
                </SelectTrigger>
                <SelectContent>
                  {stormEvents.map((stormEvent) => (
                    <SelectItem key={stormEvent.id} value={stormEvent.id}>
                      {stormEvent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={switchActiveStormEnvironment} disabled={!selectedStormEventId}>
                Set Active
              </Button>
              <Button type="button" variant="outline" onClick={clearActiveStormEnvironment}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="storm-surface">
          <CardHeader>
            <CardTitle className="text-grid-navy">Active Storm Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-grid-body">
            <p>No active storm environment selected.</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
              <Select value={selectedStormEventId} onValueChange={setSelectedStormEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select storm environment" />
                </SelectTrigger>
                <SelectContent>
                  {stormEvents.map((stormEvent) => (
                    <SelectItem key={stormEvent.id} value={stormEvent.id}>
                      {stormEvent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={switchActiveStormEnvironment} disabled={!selectedStormEventId}>
                Set Active
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="storm-surface">
        <CardHeader>
          <CardTitle className="text-grid-navy">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {canCreateTickets ? (
              <Button asChild size="sm">
                <Link href={createTicketHref}>
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
                <p className="mt-1 text-xs text-grid-muted">
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
            <div className="rounded-md border border-grid-warning bg-grid-warning-soft p-3 text-grid-navy">
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
          <CardContent className="space-y-2 text-sm text-grid-body">
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
