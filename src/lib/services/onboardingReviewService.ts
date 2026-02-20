import type { OnboardingStatus, UserRole } from '../../types';
import type { Database } from '../../types/database';
import { isSuperAdminClassRole } from '../auth/roleGuards';
import { finalizeOnboardingComplianceArtifacts } from './onboardingComplianceArtifactService';

type ProfileRole = Pick<Database['public']['Tables']['profiles']['Row'], 'role'>;
type ProfileSummary = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'first_name' | 'last_name' | 'email' | 'phone'
>;
type ContractorPendingRow = Pick<
  Database['public']['Tables']['contractors']['Row'],
  | 'id'
  | 'profile_id'
  | 'onboarding_status'
  | 'emergency_contact_name'
  | 'emergency_contact_phone'
  | 'created_at'
>;
interface MediaDocumentRow {
  contractor_id: string | null;
  original_name: string | null;
  storage_path: string;
  created_at: string;
}
type ContractorVerificationRow = Pick<
  Database['public']['Tables']['contractors']['Row'],
  'id' | 'onboarding_status'
>;
type ContractorVerificationUpdate = Pick<
  Database['public']['Tables']['contractors']['Update'],
  | 'onboarding_status'
  | 'is_eligible_for_assignment'
  | 'eligibility_reason'
  | 'approved_by'
  | 'approved_at'
  | 'updated_at'
>;

export const ONBOARDING_REVIEW_AUTH_REQUIRED_ERROR = 'You must be signed in to review onboarding.';
export const ONBOARDING_REVIEW_PERMISSION_ERROR = 'Only CEO or Super Admin can review onboarding submissions.';
export const ONBOARDING_REVIEW_NOT_FOUND_ERROR = 'Onboarding package not found.';

type RequiredDocumentType = 'w9' | 'insurance';
type RequiredDocumentStatus = 'uploaded' | 'missing';

export interface RequiredOnboardingDocument {
  status: RequiredDocumentStatus;
  fileName?: string;
  uploadedAt?: string;
}

export interface OnboardingReviewPackage {
  contractorId: string;
  onboardingStatus: string;
  submittedAt: string;
  profile: {
    profileId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  };
  documents: {
    w9: RequiredOnboardingDocument;
    insurance: RequiredOnboardingDocument;
  };
}

export interface OnboardingVerificationDecisionInput {
  contractorId: string;
  decision: 'verified' | 'not_verified';
  reason?: string;
}

export interface OnboardingVerificationDecisionResult {
  contractorId: string;
  onboardingStatus: OnboardingStatus;
  isEligibleForAssignment: boolean;
}

interface AuthClient {
  getUser: () => Promise<{ data: { user: { id: string } | null }; error: unknown }>;
}

interface ProfilesTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      single: () => Promise<{ data: ProfileRole | null; error: unknown }>;
    };
    in: (column: string, values: string[]) => Promise<{ data: ProfileSummary[] | null; error: unknown }>;
  };
}

interface ContractorsTableClient {
  select: (columns: string) => {
    in: (
      column: string,
      values: string[]
    ) => Promise<{ data: ContractorPendingRow[] | null; error: unknown }>;
    eq: (column: string, value: string) => {
      single: () => Promise<{ data: ContractorVerificationRow | null; error: unknown }>;
    };
  };
  update: (values: ContractorVerificationUpdate) => {
    eq: (column: string, value: string) => Promise<{ error: unknown }>;
  };
}

interface MediaAssetsTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      in: (
        inColumn: string,
        values: string[]
      ) => Promise<{ data: MediaDocumentRow[] | null; error: unknown }>;
    };
  };
}

interface OnboardingReviewSupabaseClient {
  auth: AuthClient;
  from(table: 'profiles'): ProfilesTableClient;
  from(table: 'contractors'): ContractorsTableClient;
  from(table: 'media_assets'): MediaAssetsTableClient;
}

function classifyRequiredDocument(document: MediaDocumentRow): RequiredDocumentType | null {
  const path = document.storage_path.toLowerCase();
  const originalName = (document.original_name ?? '').toLowerCase();

  if (path.includes('/w9/') || /w-?9/.test(originalName)) {
    return 'w9';
  }

  if (path.includes('/insurance/') || originalName.includes('insurance')) {
    return 'insurance';
  }

  return null;
}

function buildMissingDocument(): RequiredOnboardingDocument {
  return {
    status: 'missing',
  };
}

async function getDefaultClient(): Promise<OnboardingReviewSupabaseClient> {
  const { supabase } = await import('../supabase/client');
  return supabase as unknown as OnboardingReviewSupabaseClient;
}

async function requireSuperAdmin(client: OnboardingReviewSupabaseClient): Promise<{ userId: string }> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error(ONBOARDING_REVIEW_AUTH_REQUIRED_ERROR);
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(ONBOARDING_REVIEW_PERMISSION_ERROR);
  }

  const role = profile.role as UserRole;
  if (!isSuperAdminClassRole(role)) {
    throw new Error(ONBOARDING_REVIEW_PERMISSION_ERROR);
  }

  return { userId: user.id };
}

export async function getPendingOnboardingPackages(
  client?: OnboardingReviewSupabaseClient
): Promise<OnboardingReviewPackage[]> {
  const activeClient = client ?? await getDefaultClient();
  await requireSuperAdmin(activeClient);

  const { data: pendingRows, error: pendingError } = await activeClient
    .from('contractors')
    .select('id, profile_id, onboarding_status, emergency_contact_name, emergency_contact_phone, created_at')
    .in('onboarding_status', ['PENDING', 'IN_PROGRESS', 'COMPLETE', 'SUSPENDED']);

  if (pendingError) {
    throw pendingError;
  }

  if (!pendingRows || pendingRows.length === 0) {
    return [];
  }

  const profileIds = pendingRows.map((row) => row.profile_id);
  const contractorIds = pendingRows.map((row) => row.id);

  const { data: profiles, error: profilesError } = await activeClient
    .from('profiles')
    .select('id, first_name, last_name, email, phone')
    .in('id', profileIds);

  if (profilesError) {
    throw profilesError;
  }

  const { data: mediaRows, error: mediaError } = await activeClient
    .from('media_assets')
    .select('contractor_id, original_name, storage_path, created_at')
    .eq('entity_type', 'contractor_onboarding')
    .in('contractor_id', contractorIds);

  if (mediaError) {
    throw mediaError;
  }

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const docStatusByContractor = new Map<
    string,
    { w9: RequiredOnboardingDocument; insurance: RequiredOnboardingDocument }
  >();

  for (const contractorId of contractorIds) {
    docStatusByContractor.set(contractorId, {
      w9: buildMissingDocument(),
      insurance: buildMissingDocument(),
    });
  }

  for (const row of mediaRows ?? []) {
    if (!row.contractor_id) {
      continue;
    }

    const docType = classifyRequiredDocument(row);
    if (!docType) {
      continue;
    }

    const current = docStatusByContractor.get(row.contractor_id) ?? {
      w9: buildMissingDocument(),
      insurance: buildMissingDocument(),
    };

    const currentUploadedAt = current[docType].uploadedAt ?? '';
    if (currentUploadedAt && currentUploadedAt >= row.created_at) {
      continue;
    }

    current[docType] = {
      status: 'uploaded',
      fileName: row.original_name ?? undefined,
      uploadedAt: row.created_at,
    };
    docStatusByContractor.set(row.contractor_id, current);
  }

  return pendingRows.map((row) => {
    const profile = profileById.get(row.profile_id);
    const docs = docStatusByContractor.get(row.id) ?? {
      w9: buildMissingDocument(),
      insurance: buildMissingDocument(),
    };

    return {
      contractorId: row.id,
      onboardingStatus: row.onboarding_status,
      submittedAt: row.created_at,
      profile: {
        profileId: row.profile_id,
        firstName: profile?.first_name ?? 'Unknown',
        lastName: profile?.last_name ?? 'User',
        email: profile?.email ?? '',
        phone: profile?.phone ?? null,
        emergencyContactName: row.emergency_contact_name ?? null,
        emergencyContactPhone: row.emergency_contact_phone ?? null,
      },
      documents: docs,
    };
  });
}

export async function setOnboardingVerificationDecision(
  input: OnboardingVerificationDecisionInput,
  client?: OnboardingReviewSupabaseClient
): Promise<OnboardingVerificationDecisionResult> {
  const activeClient = client ?? await getDefaultClient();
  const { userId } = await requireSuperAdmin(activeClient);

  const { data: targetRow, error: targetError } = await activeClient
    .from('contractors')
    .select('id, onboarding_status')
    .eq('id', input.contractorId)
    .single();

  if (targetError) {
    throw targetError;
  }

  if (!targetRow) {
    throw new Error(ONBOARDING_REVIEW_NOT_FOUND_ERROR);
  }

  const updatePayload: ContractorVerificationUpdate =
    input.decision === 'verified'
      ? {
        onboarding_status: 'APPROVED',
        is_eligible_for_assignment: true,
        eligibility_reason: null,
        approved_by: userId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      : {
        onboarding_status: 'SUSPENDED',
        is_eligible_for_assignment: false,
        eligibility_reason: input.reason || 'Not verified during onboarding review',
        approved_by: null,
        approved_at: null,
        updated_at: new Date().toISOString(),
      };

  if (input.decision === 'verified') {
    await finalizeOnboardingComplianceArtifacts(
      {
        contractorId: input.contractorId,
        actorUserId: userId,
      },
      activeClient as never
    );
  }

  const { error: updateError } = await activeClient
    .from('contractors')
    .update(updatePayload)
    .eq('id', input.contractorId);

  if (updateError) {
    throw updateError;
  }

  return {
    contractorId: input.contractorId,
    onboardingStatus: updatePayload.onboarding_status as OnboardingStatus,
    isEligibleForAssignment: updatePayload.is_eligible_for_assignment ?? false,
  };
}
