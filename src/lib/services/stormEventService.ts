import { supabase } from '@/lib/supabase/client';
import { isAuthOrPermissionError, isMissingDatabaseObjectError } from '@/lib/utils/errorHandling';

const CLOSED_TICKET_STATUSES = new Set(['CLOSED', 'ARCHIVED', 'EXPIRED']);

interface RemoteStormEventRow {
  id: string;
  event_code: string;
  name: string;
  utility_client: string;
  status: string;
  region: string | null;
  contract_reference: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
}

interface RemoteTicketCountRow {
  storm_event_id: string | null;
  status: string;
}

export type StormEventStatus = 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETE' | 'ARCHIVED';

export interface StormEventSummary {
  id: string;
  eventCode: string;
  name: string;
  utilityClient: string;
  status: StormEventStatus;
  region: string | null;
  contractReference: string | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
  activeTickets: number;
}

export interface CreateStormEventInput {
  eventCode?: string;
  name: string;
  utilityClient: string;
  status?: StormEventStatus;
  region?: string | null;
  contractReference?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
}

function normalizeStormEventStatus(value: string | null | undefined): StormEventStatus {
  const normalized = String(value ?? '').toUpperCase();
  if (normalized === 'ACTIVE') {
    return 'ACTIVE';
  }
  if (normalized === 'PAUSED') {
    return 'PAUSED';
  }
  if (normalized === 'COMPLETE') {
    return 'COMPLETE';
  }
  if (normalized === 'ARCHIVED') {
    return 'ARCHIVED';
  }
  return 'PLANNED';
}

function normalizeOptional(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildEventCode(utilityClient: string): string {
  const utilityPrefix = utilityClient
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4) || 'GRID';
  const dateFragment = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const timeFragment = Date.now().toString().slice(-4);
  return `SE-${utilityPrefix}-${dateFragment}-${timeFragment}`;
}

function isActiveTicketStatus(status: string): boolean {
  return !CLOSED_TICKET_STATUSES.has(status.toUpperCase());
}

function mapStormEventRow(
  row: RemoteStormEventRow,
  activeTicketCountByEventId: Map<string, number>,
): StormEventSummary {
  return {
    id: row.id,
    eventCode: row.event_code,
    name: row.name,
    utilityClient: row.utility_client,
    status: normalizeStormEventStatus(row.status),
    region: row.region,
    contractReference: row.contract_reference,
    startDate: row.start_date,
    endDate: row.end_date,
    notes: row.notes,
    createdAt: row.created_at,
    activeTickets: activeTicketCountByEventId.get(row.id) ?? 0,
  };
}

async function getActiveTicketCountByEventId(eventIds: string[]): Promise<Map<string, number>> {
  if (eventIds.length === 0) {
    return new Map();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('tickets') as any)
    .select('storm_event_id, status')
    .in('storm_event_id', eventIds);

  if (error) {
    if (isAuthOrPermissionError(error) || isMissingDatabaseObjectError(error)) {
      return new Map();
    }
    throw error;
  }

  const rows = (data ?? []) as RemoteTicketCountRow[];
  const countByEventId = new Map<string, number>();
  for (const row of rows) {
    if (!row.storm_event_id || !isActiveTicketStatus(row.status)) {
      continue;
    }

    countByEventId.set(row.storm_event_id, (countByEventId.get(row.storm_event_id) ?? 0) + 1);
  }

  return countByEventId;
}

export const stormEventService = {
  async listStormEvents(): Promise<StormEventSummary[]> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('storm_events') as any)
      .select(
        'id, event_code, name, utility_client, status, region, contract_reference, start_date, end_date, notes, created_at',
      )
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      if (isAuthOrPermissionError(error) || isMissingDatabaseObjectError(error)) {
        return [];
      }
      throw error;
    }

    const rows = (data ?? []) as RemoteStormEventRow[];
    const eventIds = rows.map((row) => row.id);
    const activeTicketCountByEventId = await getActiveTicketCountByEventId(eventIds);
    return rows.map((row) => mapStormEventRow(row, activeTicketCountByEventId));
  },

  async getStormEventById(id: string): Promise<StormEventSummary | null> {
    if (!id) {
      return null;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('storm_events') as any)
      .select(
        'id, event_code, name, utility_client, status, region, contract_reference, start_date, end_date, notes, created_at',
      )
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error) {
      if (isAuthOrPermissionError(error) || isMissingDatabaseObjectError(error)) {
        return null;
      }
      throw error;
    }

    if (!data) {
      return null;
    }

    const activeTicketCountByEventId = await getActiveTicketCountByEventId([id]);
    return mapStormEventRow(data as RemoteStormEventRow, activeTicketCountByEventId);
  },

  async createStormEvent(input: CreateStormEventInput): Promise<StormEventSummary> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const eventCode = normalizeOptional(input.eventCode) ?? buildEventCode(input.utilityClient);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('storm_events') as any)
      .insert({
        event_code: eventCode,
        name: input.name.trim(),
        utility_client: input.utilityClient.trim(),
        status: normalizeStormEventStatus(input.status ?? 'PLANNED'),
        region: normalizeOptional(input.region),
        contract_reference: normalizeOptional(input.contractReference),
        start_date: normalizeOptional(input.startDate),
        end_date: normalizeOptional(input.endDate),
        notes: normalizeOptional(input.notes),
        created_by: user?.id ?? null,
        updated_by: user?.id ?? null,
      })
      .select(
        'id, event_code, name, utility_client, status, region, contract_reference, start_date, end_date, notes, created_at',
      )
      .single();

    if (error) {
      throw error;
    }

    return mapStormEventRow(data as RemoteStormEventRow, new Map());
  },
};

