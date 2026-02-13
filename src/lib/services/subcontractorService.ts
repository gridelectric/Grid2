import { supabase } from '@/lib/supabase/client';

interface RemoteSubcontractorRow {
  id: string;
  profile_id: string;
  business_name: string;
  business_type: string | null;
  city: string | null;
  state: string | null;
  onboarding_status: string;
  is_eligible_for_assignment: boolean;
  eligibility_reason: string | null;
  business_email: string | null;
  business_phone: string | null;
  created_at: string;
  updated_at: string;
}

interface RemoteProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

interface RemoteTicketRow {
  id: string;
  ticket_number: string;
  status: string;
  priority: string;
  utility_client: string;
  updated_at: string;
  assigned_to: string | null;
}

interface RemoteInvoiceRow {
  subcontractor_id: string;
  total_amount: number | null;
  status: string | null;
}

export interface SubcontractorListItem {
  id: string;
  profileId: string;
  fullName: string;
  businessName: string;
  businessType: string | null;
  city: string | null;
  state: string | null;
  onboardingStatus: string;
  eligibleForAssignment: boolean;
  eligibilityReason: string | null;
  email: string;
  phone: string | null;
  activeTicketCount: number;
  ytdEarnings: number;
  alerts: string[];
}

export interface SubcontractorListFilters {
  search?: string;
  onboardingStatus?: string;
  eligibleOnly?: boolean;
}

export interface AssignableSubcontractor {
  id: string;
  displayName: string;
}

export interface SubcontractorDetail {
  id: string;
  profileId: string;
  fullName: string;
  businessName: string;
  businessType: string | null;
  email: string;
  phone: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  city: string | null;
  state: string | null;
  onboardingStatus: string;
  eligibleForAssignment: boolean;
  eligibilityReason: string | null;
  activeTicketCount: number;
  totalTicketCount: number;
  ytdEarnings: number;
  createdAt: string;
  updatedAt: string;
  recentTickets: Array<{
    id: string;
    ticketNumber: string;
    status: string;
    priority: string;
    utilityClient: string;
    updatedAt: string;
  }>;
}

function formatFullName(profile?: RemoteProfileRow): string {
  if (!profile) {
    return 'Unknown';
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  return fullName.length > 0 ? fullName : profile.email;
}

function getCurrentYearDateRange() {
  const year = new Date().getUTCFullYear();
  return {
    year,
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

function toCurrencyNumber(value: number | null | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isActiveTicketStatus(status: string): boolean {
  const normalized = status.toUpperCase();
  return normalized !== 'CLOSED' && normalized !== 'ARCHIVED' && normalized !== 'EXPIRED';
}

function buildAlerts(subcontractor: RemoteSubcontractorRow): string[] {
  const alerts: string[] = [];

  if (subcontractor.onboarding_status.toUpperCase() !== 'APPROVED') {
    alerts.push('Onboarding pending');
  }

  if (!subcontractor.is_eligible_for_assignment) {
    alerts.push(subcontractor.eligibility_reason ?? 'Not eligible for assignment');
  }

  return alerts;
}

async function fetchProfilesByIds(profileIds: string[]): Promise<Map<string, RemoteProfileRow>> {
  if (profileIds.length === 0) {
    return new Map();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('profiles') as any)
    .select('id, first_name, last_name, email, phone')
    .in('id', profileIds);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as RemoteProfileRow[];
  return new Map(rows.map((row) => [row.id, row]));
}

async function fetchTicketRows(subcontractorIds: string[]): Promise<RemoteTicketRow[]> {
  if (subcontractorIds.length === 0) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('tickets') as any)
    .select('id, ticket_number, status, priority, utility_client, updated_at, assigned_to')
    .in('assigned_to', subcontractorIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as RemoteTicketRow[];
}

async function fetchYtdInvoiceRows(subcontractorIds: string[]): Promise<RemoteInvoiceRow[]> {
  if (subcontractorIds.length === 0) {
    return [];
  }

  const { start, end } = getCurrentYearDateRange();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('subcontractor_invoices') as any)
    .select('subcontractor_id, total_amount, status')
    .in('subcontractor_id', subcontractorIds)
    .gte('billing_period_start', start)
    .lte('billing_period_end', end);

  if (error) {
    throw error;
  }

  return (data ?? []) as RemoteInvoiceRow[];
}

function buildActiveTicketCountBySubcontractor(ticketRows: RemoteTicketRow[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const row of ticketRows) {
    if (!row.assigned_to || !isActiveTicketStatus(row.status)) {
      continue;
    }

    counts.set(row.assigned_to, (counts.get(row.assigned_to) ?? 0) + 1);
  }

  return counts;
}

function buildTotalTicketCountBySubcontractor(ticketRows: RemoteTicketRow[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const row of ticketRows) {
    if (!row.assigned_to) {
      continue;
    }

    counts.set(row.assigned_to, (counts.get(row.assigned_to) ?? 0) + 1);
  }

  return counts;
}

function buildYtdEarningsBySubcontractor(invoiceRows: RemoteInvoiceRow[]): Map<string, number> {
  const totals = new Map<string, number>();

  for (const row of invoiceRows) {
    if (!row.subcontractor_id) {
      continue;
    }

    if ((row.status ?? '').toUpperCase() === 'VOID') {
      continue;
    }

    const current = totals.get(row.subcontractor_id) ?? 0;
    totals.set(row.subcontractor_id, toCurrencyNumber(current + toCurrencyNumber(row.total_amount)));
  }

  return totals;
}

function applySearchFilter(items: SubcontractorListItem[], search?: string): SubcontractorListItem[] {
  const normalizedSearch = search?.trim().toLowerCase();
  if (!normalizedSearch) {
    return items;
  }

  return items.filter((item) => {
    const searchable = [
      item.fullName,
      item.businessName,
      item.email,
      item.city ?? '',
      item.state ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalizedSearch);
  });
}

function applyStatusFilter(items: SubcontractorListItem[], onboardingStatus?: string): SubcontractorListItem[] {
  if (!onboardingStatus || onboardingStatus === 'ALL') {
    return items;
  }

  const normalizedStatus = onboardingStatus.toUpperCase();
  return items.filter((item) => item.onboardingStatus.toUpperCase() === normalizedStatus);
}

function sortByName(items: SubcontractorListItem[]): SubcontractorListItem[] {
  return items.sort((left, right) => left.fullName.localeCompare(right.fullName));
}

export const subcontractorService = {
  async listSubcontractors(filters: SubcontractorListFilters = {}): Promise<SubcontractorListItem[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('subcontractors') as any).select(
      [
        'id',
        'profile_id',
        'business_name',
        'business_type',
        'city',
        'state',
        'onboarding_status',
        'is_eligible_for_assignment',
        'eligibility_reason',
        'business_email',
        'business_phone',
        'created_at',
        'updated_at',
      ].join(','),
    );

    if (filters.eligibleOnly) {
      query = query.eq('is_eligible_for_assignment', true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as RemoteSubcontractorRow[];
    const profileIds = rows.map((row) => row.profile_id);
    const subcontractorIds = rows.map((row) => row.id);

    const [profilesById, ticketRows, invoiceRows] = await Promise.all([
      fetchProfilesByIds(profileIds),
      fetchTicketRows(subcontractorIds),
      fetchYtdInvoiceRows(subcontractorIds),
    ]);

    const activeTicketCountBySubcontractor = buildActiveTicketCountBySubcontractor(ticketRows);
    const ytdEarningsBySubcontractor = buildYtdEarningsBySubcontractor(invoiceRows);

    const mappedItems = rows.map((row) => {
      const profile = profilesById.get(row.profile_id);
      const fullName = formatFullName(profile);
      const email = profile?.email ?? row.business_email ?? '';

      return {
        id: row.id,
        profileId: row.profile_id,
        fullName,
        businessName: row.business_name,
        businessType: row.business_type,
        city: row.city,
        state: row.state,
        onboardingStatus: row.onboarding_status,
        eligibleForAssignment: row.is_eligible_for_assignment,
        eligibilityReason: row.eligibility_reason,
        email,
        phone: profile?.phone ?? row.business_phone,
        activeTicketCount: activeTicketCountBySubcontractor.get(row.id) ?? 0,
        ytdEarnings: ytdEarningsBySubcontractor.get(row.id) ?? 0,
        alerts: buildAlerts(row),
      } satisfies SubcontractorListItem;
    });

    return sortByName(
      applyStatusFilter(
        applySearchFilter(mappedItems, filters.search),
        filters.onboardingStatus,
      ),
    );
  },

  async listAssignableSubcontractors(): Promise<AssignableSubcontractor[]> {
    const subcontractors = await this.listSubcontractors({
      onboardingStatus: 'APPROVED',
      eligibleOnly: true,
    });

    return subcontractors
      .map((subcontractor) => ({
        id: subcontractor.id,
        displayName: `${subcontractor.fullName} (${subcontractor.businessName})`,
      }))
      .sort((left, right) => left.displayName.localeCompare(right.displayName));
  },

  async getSubcontractorById(subcontractorId: string): Promise<SubcontractorDetail | null> {
    if (!subcontractorId) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('subcontractors') as any)
      .select(
        [
          'id',
          'profile_id',
          'business_name',
          'business_type',
          'city',
          'state',
          'onboarding_status',
          'is_eligible_for_assignment',
          'eligibility_reason',
          'business_email',
          'business_phone',
          'created_at',
          'updated_at',
        ].join(','),
      )
      .eq('id', subcontractorId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    const row = data as RemoteSubcontractorRow;
    const [profilesById, ticketRows, invoiceRows] = await Promise.all([
      fetchProfilesByIds([row.profile_id]),
      fetchTicketRows([row.id]),
      fetchYtdInvoiceRows([row.id]),
    ]);

    const profile = profilesById.get(row.profile_id);
    const activeTicketCountBySubcontractor = buildActiveTicketCountBySubcontractor(ticketRows);
    const totalTicketCountBySubcontractor = buildTotalTicketCountBySubcontractor(ticketRows);
    const ytdEarningsBySubcontractor = buildYtdEarningsBySubcontractor(invoiceRows);

    const recentTickets = ticketRows
      .sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at))
      .slice(0, 8)
      .map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        status: ticket.status,
        priority: ticket.priority,
        utilityClient: ticket.utility_client,
        updatedAt: ticket.updated_at,
      }));

    return {
      id: row.id,
      profileId: row.profile_id,
      fullName: formatFullName(profile),
      businessName: row.business_name,
      businessType: row.business_type,
      email: profile?.email ?? row.business_email ?? '',
      phone: profile?.phone ?? row.business_phone,
      businessEmail: row.business_email,
      businessPhone: row.business_phone,
      city: row.city,
      state: row.state,
      onboardingStatus: row.onboarding_status,
      eligibleForAssignment: row.is_eligible_for_assignment,
      eligibilityReason: row.eligibility_reason,
      activeTicketCount: activeTicketCountBySubcontractor.get(row.id) ?? 0,
      totalTicketCount: totalTicketCountBySubcontractor.get(row.id) ?? 0,
      ytdEarnings: ytdEarningsBySubcontractor.get(row.id) ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      recentTickets,
    };
  },
};
