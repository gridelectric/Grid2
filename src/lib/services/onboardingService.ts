import type { OnboardingStatus, UserRole } from '../../types';
import type { Database } from '../../types/database';
import { coreOnboardingProfileSchema, type CoreOnboardingProfileInput } from '../schemas/onboarding';

type ProfileRole = Pick<Database['public']['Tables']['profiles']['Row'], 'role'>;
type ExistingContractor = Pick<
  Database['public']['Tables']['contractors']['Row'],
  'id' | 'business_name' | 'onboarding_status'
>;
type ProfileUpdatePayload = Pick<
  Database['public']['Tables']['profiles']['Update'],
  'first_name' | 'last_name' | 'email' | 'phone' | 'updated_at'
>;
type ContractorWritePayload = Pick<
  Database['public']['Tables']['contractors']['Insert'],
  | 'profile_id'
  | 'business_name'
  | 'business_email'
  | 'business_phone'
  | 'emergency_contact_name'
  | 'emergency_contact_phone'
  | 'onboarding_status'
>;
type ContractorWriteResult = Pick<
  Database['public']['Tables']['contractors']['Row'],
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

interface ContractorsTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      maybeSingle: () => Promise<{ data: ExistingContractor | null; error: unknown }>;
    };
  };
  insert: (values: ContractorWritePayload[]) => {
    select: (columns: string) => {
      single: () => Promise<{ data: ContractorWriteResult | null; error: unknown }>;
    };
  };
  update: (values: ContractorWritePayload) => {
    eq: (column: string, value: string) => {
      select: (columns: string) => {
        single: () => Promise<{ data: ContractorWriteResult | null; error: unknown }>;
      };
    };
  };
}

interface OnboardingSupabaseClient {
  auth: AuthClient;
  from(table: 'profiles'): ProfilesTableClient;
  from(table: 'contractors'): ContractorsTableClient;
}

interface CoreOnboardingSubmissionResult {
  contractorId: string;
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
  existingContractor: ExistingContractor | null
): ContractorWritePayload {
  const fallbackBusinessName = `${input.firstName} ${input.lastName}`.trim();

  return {
    profile_id: userId,
    business_name: existingContractor?.business_name?.trim() || fallbackBusinessName,
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
  const contractorsTable = activeClient.from('contractors');

  const { data: existingContractor, error: existingContractorError } = await contractorsTable
    .select('id, business_name, onboarding_status')
    .eq('profile_id', userId)
    .maybeSingle();

  if (existingContractorError) {
    throw existingContractorError;
  }

  if (existingContractor?.onboarding_status === 'APPROVED') {
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

  const pendingPayload = getPendingPayload(userId, parsedInput, existingContractor);

  if (existingContractor) {
    const { data: updatedContractor, error: contractorUpdateError } = await contractorsTable
      .update(pendingPayload)
      .eq('profile_id', userId)
      .select('id, onboarding_status')
      .single();

    if (contractorUpdateError || !updatedContractor) {
      throw contractorUpdateError || new Error('Failed to update onboarding profile.');
    }

    return {
      contractorId: updatedContractor.id,
      onboardingStatus: updatedContractor.onboarding_status as OnboardingStatus,
    };
  }

  const { data: insertedContractor, error: contractorInsertError } = await contractorsTable
    .insert([pendingPayload])
    .select('id, onboarding_status')
    .single();

  if (contractorInsertError || !insertedContractor) {
    throw contractorInsertError || new Error('Failed to create onboarding profile.');
  }

  return {
    contractorId: insertedContractor.id,
    onboardingStatus: insertedContractor.onboarding_status as OnboardingStatus,
  };
}
