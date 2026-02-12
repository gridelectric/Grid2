import type { OnboardingStatus, UserRole } from '../../types';
import type { Database } from '../../types/database';
import { coreOnboardingProfileSchema, type CoreOnboardingProfileInput } from '../schemas/onboarding';

type ProfileRole = Pick<Database['public']['Tables']['profiles']['Row'], 'role'>;
type ExistingSubcontractor = Pick<
  Database['public']['Tables']['subcontractors']['Row'],
  'id' | 'business_name' | 'onboarding_status'
>;
type ProfileUpdatePayload = Pick<
  Database['public']['Tables']['profiles']['Update'],
  'first_name' | 'last_name' | 'email' | 'phone' | 'updated_at'
>;
type SubcontractorWritePayload = Pick<
  Database['public']['Tables']['subcontractors']['Insert'],
  | 'profile_id'
  | 'business_name'
  | 'business_email'
  | 'business_phone'
  | 'emergency_contact_name'
  | 'emergency_contact_phone'
  | 'onboarding_status'
>;
type SubcontractorWriteResult = Pick<
  Database['public']['Tables']['subcontractors']['Row'],
  'id' | 'onboarding_status'
>;

interface AuthClient {
  getUser: () => Promise<{ data: { user: { id: string } | null }; error: unknown }>;
}

interface ProfilesTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      single: () => Promise<{ data: ProfileRole | null; error: unknown }>;
    };
  };
  update: (values: ProfileUpdatePayload) => {
    eq: (column: string, value: string) => Promise<{ error: unknown }>;
  };
}

interface SubcontractorsTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      maybeSingle: () => Promise<{ data: ExistingSubcontractor | null; error: unknown }>;
    };
  };
  insert: (values: SubcontractorWritePayload[]) => {
    select: (columns: string) => {
      single: () => Promise<{ data: SubcontractorWriteResult | null; error: unknown }>;
    };
  };
  update: (values: SubcontractorWritePayload) => {
    eq: (column: string, value: string) => {
      select: (columns: string) => {
        single: () => Promise<{ data: SubcontractorWriteResult | null; error: unknown }>;
      };
    };
  };
}

interface OnboardingSupabaseClient {
  auth: AuthClient;
  from(table: 'profiles'): ProfilesTableClient;
  from(table: 'subcontractors'): SubcontractorsTableClient;
}

interface CoreOnboardingSubmissionResult {
  subcontractorId: string;
  onboardingStatus: OnboardingStatus;
}

export const ONBOARDING_AUTH_REQUIRED_ERROR = 'You must be signed in to submit onboarding.';
export const ONBOARDING_PERMISSION_ERROR = 'Only contractors can submit onboarding profiles.';
export const ONBOARDING_ALREADY_VERIFIED_ERROR = 'Onboarding is already verified for this account.';

async function getDefaultClient(): Promise<OnboardingSupabaseClient> {
  const { supabase } = await import('../supabase/client');
  return supabase as unknown as OnboardingSupabaseClient;
}

function getPendingPayload(
  userId: string,
  input: CoreOnboardingProfileInput,
  existingSubcontractor: ExistingSubcontractor | null
): SubcontractorWritePayload {
  const fallbackBusinessName = `${input.firstName} ${input.lastName}`.trim();

  return {
    profile_id: userId,
    business_name: existingSubcontractor?.business_name?.trim() || fallbackBusinessName,
    business_email: input.email,
    business_phone: input.phone,
    emergency_contact_name: input.emergencyContactName,
    emergency_contact_phone: input.emergencyContactPhone,
    onboarding_status: 'PENDING',
  };
}

async function getCurrentContractorUserId(client: OnboardingSupabaseClient): Promise<string> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error(ONBOARDING_AUTH_REQUIRED_ERROR);
  }

  const profilesTable = client.from('profiles');
  const { data: profile, error: profileError } = await profilesTable
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(ONBOARDING_PERMISSION_ERROR);
  }

  const role = profile.role as UserRole;
  if (role !== 'CONTRACTOR') {
    throw new Error(ONBOARDING_PERMISSION_ERROR);
  }

  return user.id;
}

export async function submitCoreOnboardingProfile(
  input: CoreOnboardingProfileInput,
  client?: OnboardingSupabaseClient
): Promise<CoreOnboardingSubmissionResult> {
  const activeClient = client ?? await getDefaultClient();
  const parsedInput = coreOnboardingProfileSchema.parse(input);
  const userId = await getCurrentContractorUserId(activeClient);

  const profilesTable = activeClient.from('profiles');
  const subcontractorsTable = activeClient.from('subcontractors');

  const { data: existingSubcontractor, error: existingSubcontractorError } = await subcontractorsTable
    .select('id, business_name, onboarding_status')
    .eq('profile_id', userId)
    .maybeSingle();

  if (existingSubcontractorError) {
    throw existingSubcontractorError;
  }

  if (existingSubcontractor?.onboarding_status === 'APPROVED') {
    throw new Error(ONBOARDING_ALREADY_VERIFIED_ERROR);
  }

  const { error: profileUpdateError } = await profilesTable
    .update({
      first_name: parsedInput.firstName,
      last_name: parsedInput.lastName,
      email: parsedInput.email,
      phone: parsedInput.phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (profileUpdateError) {
    throw profileUpdateError;
  }

  const pendingPayload = getPendingPayload(userId, parsedInput, existingSubcontractor);

  if (existingSubcontractor) {
    const { data: updatedSubcontractor, error: subcontractorUpdateError } = await subcontractorsTable
      .update(pendingPayload)
      .eq('profile_id', userId)
      .select('id, onboarding_status')
      .single();

    if (subcontractorUpdateError || !updatedSubcontractor) {
      throw subcontractorUpdateError || new Error('Failed to update onboarding profile.');
    }

    return {
      subcontractorId: updatedSubcontractor.id,
      onboardingStatus: updatedSubcontractor.onboarding_status as OnboardingStatus,
    };
  }

  const { data: insertedSubcontractor, error: subcontractorInsertError } = await subcontractorsTable
    .insert([pendingPayload])
    .select('id, onboarding_status')
    .single();

  if (subcontractorInsertError || !insertedSubcontractor) {
    throw subcontractorInsertError || new Error('Failed to create onboarding profile.');
  }

  return {
    subcontractorId: insertedSubcontractor.id,
    onboardingStatus: insertedSubcontractor.onboarding_status as OnboardingStatus,
  };
}
