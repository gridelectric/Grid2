'use client';

import { useEffect, useMemo, useState } from 'react';
import { CloudRain, Edit, Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import { canPerformManagementAction } from '@/lib/auth/authorization';
import { ticketService } from '@/lib/services/ticketService';
import type { Ticket } from '@/types';

interface StormOperationsRow {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PLANNED';
  region: string;
  activeTickets: number;
}

function toRegionLabel(tickets: Ticket[]): string {
  const stateCounts = new Map<string, number>();

  for (const ticket of tickets) {
    if (!ticket.state) {
      continue;
    }

    stateCounts.set(ticket.state, (stateCounts.get(ticket.state) ?? 0) + 1);
  }

  const mostFrequent = Array.from(stateCounts.entries()).sort((left, right) => right[1] - left[1])[0];
  return mostFrequent ? `${mostFrequent[0]} Region` : 'Unspecified Region';
}

function getOperationStatus(tickets: Ticket[]): 'ACTIVE' | 'PLANNED' {
  const hasInFlightWork = tickets.some((ticket) => {
    const status = ticket.status.toUpperCase();
    return status === 'IN_ROUTE' || status === 'ON_SITE' || status === 'IN_PROGRESS';
  });

  return hasInFlightWork ? 'ACTIVE' : 'PLANNED';
}

export default function StormsPage() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canManageStormProjects = canPerformManagementAction(profile?.role, 'storm_project_write');

  useEffect(() => {
    let active = true;

    const loadStormOperations = async () => {
      setIsLoading(true);
      try {
        const data = await ticketService.getTickets();
        if (active) {
          setTickets(data);
        }
      } catch (error) {
        console.error('Failed to load storm operations:', error);
        if (active) {
          setTickets([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadStormOperations();

    return () => {
      active = false;
    };
  }, []);

  const stormOperations = useMemo<StormOperationsRow[]>(() => {
    const grouped = new Map<string, Ticket[]>();

    for (const ticket of tickets) {
      const key = ticket.utility_client || 'Unassigned Utility';
      const existing = grouped.get(key) ?? [];
      existing.push(ticket);
      grouped.set(key, existing);
    }

    return Array.from(grouped.entries())
      .map(([utilityClient, groupedTickets]) => ({
        id: utilityClient.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: `${utilityClient} Operations`,
        status: getOperationStatus(groupedTickets),
        region: toRegionLabel(groupedTickets),
        activeTickets: groupedTickets.filter((ticket) => {
          const status = ticket.status.toUpperCase();
          return status !== 'CLOSED' && status !== 'ARCHIVED' && status !== 'EXPIRED';
        }).length,
      }))
      .sort((left, right) => right.activeTickets - left.activeTickets);
  }, [tickets]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Storm Projects"
        description="Operational grouping derived from live ticket activity."
      >
        <Button
          disabled={!canManageStormProjects}
          title={canManageStormProjects ? 'Create storm project' : 'Only Super Admin can create storm projects'}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Storm Project
        </Button>
      </PageHeader>

      {!canManageStormProjects && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Admin users can view storm projects, but create/edit actions are restricted to Super Admin.
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div className="rounded-md border bg-white px-4 py-6 text-sm text-slate-500">Loading storm operations...</div>
        ) : stormOperations.length === 0 ? (
          <div className="rounded-md border bg-white px-4 py-6 text-sm text-slate-500">
            No active ticket operations found.
          </div>
        ) : (
          stormOperations.map((storm) => (
            <Card key={storm.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CloudRain className="h-5 w-5 text-blue-600" />
                  {storm.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  <p>Status: {storm.status}</p>
                  <p>Region: {storm.region}</p>
                  <p>Active Tickets: {storm.activeTickets}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canManageStormProjects}
                  title={canManageStormProjects ? 'Edit storm project' : 'Only Super Admin can edit storm projects'}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
