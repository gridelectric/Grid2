'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import { PageHeader } from '@/components/common/layout/PageHeader';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { canPerformManagementAction } from '@/lib/auth/authorization';
import { UTILITY_CLIENTS } from '@/lib/constants/utilityClients';
import { stormEventService, type StormEventStatus } from '@/lib/services/stormEventService';
import { getErrorMessage } from '@/lib/utils/errorHandling';
import { toast } from 'sonner';

const STORM_EVENT_STATUSES: StormEventStatus[] = ['PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETE', 'ARCHIVED'];

export default function CreateStormEventPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuth();
  const canCreateStormEvent = canPerformManagementAction(profile?.role, 'storm_event_write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventCode, setEventCode] = useState('');
  const [name, setName] = useState('');
  const [utilityClient, setUtilityClient] = useState<string>(UTILITY_CLIENTS[0] ?? 'Entergy');
  const [status, setStatus] = useState<StormEventStatus>('PLANNED');
  const [region, setRegion] = useState('');
  const [contractReference, setContractReference] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isLoading && !canCreateStormEvent) {
      router.replace('/forbidden');
    }
  }, [canCreateStormEvent, isLoading, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Storm event name is required.');
      return;
    }

    if (!utilityClient.trim()) {
      toast.error('Utility client is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdEvent = await stormEventService.createStormEvent({
        eventCode,
        name: trimmedName,
        utilityClient,
        status,
        region,
        contractReference,
        startDate,
        endDate,
        notes,
      });

      toast.success('Storm event created. Continue with ticket entry.');
      router.push(
        `/tickets/create?storm_event_id=${encodeURIComponent(createdEvent.id)}&utility_client=${encodeURIComponent(createdEvent.utilityClient)}`,
      );
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create storm event.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !canCreateStormEvent) {
    return <div className="storm-surface rounded-xl p-4 text-sm text-slate-500">Checking access...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Create Storm Event"
        description="Start a new storm event umbrella for tickets, contractors, time, expenses, and billing."
        backHref="/admin/storms"
      />

      <Card className="storm-surface">
        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="storm-event-name">Storm Event Name *</Label>
                <Input
                  id="storm-event-name"
                  value={name}
                  onChange={(nextEvent) => setName(nextEvent.target.value)}
                  placeholder="Entergy North Region - February 2026"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storm-event-code">Storm Event Code</Label>
                <Input
                  id="storm-event-code"
                  value={eventCode}
                  onChange={(nextEvent) => setEventCode(nextEvent.target.value)}
                  placeholder="Auto-generated if blank"
                />
              </div>

              <div className="space-y-2">
                <Label>Utility Client *</Label>
                <Select value={utilityClient} onValueChange={setUtilityClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select utility client" />
                  </SelectTrigger>
                  <SelectContent>
                    {UTILITY_CLIENTS.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as StormEventStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORM_EVENT_STATUSES.map((stormEventStatus) => (
                      <SelectItem key={stormEventStatus} value={stormEventStatus}>
                        {stormEventStatus}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storm-event-region">Region</Label>
                <Input
                  id="storm-event-region"
                  value={region}
                  onChange={(nextEvent) => setRegion(nextEvent.target.value)}
                  placeholder="LA Region 4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storm-event-contract-reference">Contract Reference</Label>
                <Input
                  id="storm-event-contract-reference"
                  value={contractReference}
                  onChange={(nextEvent) => setContractReference(nextEvent.target.value)}
                  placeholder="Master service agreement or work order"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storm-event-start-date">Start Date</Label>
                <Input
                  id="storm-event-start-date"
                  type="date"
                  value={startDate}
                  onChange={(nextEvent) => setStartDate(nextEvent.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storm-event-end-date">End Date</Label>
                <Input
                  id="storm-event-end-date"
                  type="date"
                  value={endDate}
                  onChange={(nextEvent) => setEndDate(nextEvent.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storm-event-notes">Notes</Label>
              <Textarea
                id="storm-event-notes"
                value={notes}
                onChange={(nextEvent) => setNotes(nextEvent.target.value)}
                placeholder="Negotiated terms, billing notes, utility contacts, and kickoff details."
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                <Plus className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Creating Storm Event...' : 'Create Storm Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
