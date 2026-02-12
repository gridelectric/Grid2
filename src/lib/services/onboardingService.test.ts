import { describe, expect, it, vi } from 'vitest';

import { coreOnboardingProfileSchema } from '../schemas/onboarding';

import {
  ONBOARDING_ALREADY_VERIFIED_ERROR,
  ONBOARDING_AUTH_REQUIRED_ERROR,
  ONBOARDING_PERMISSION_ERROR,
  submitCoreOnboardingProfile,
} from './onboardingService';

const validInput = {
  firstName: 'Taylor',
  lastName: 'Fields',
  email: 'taylor.fields@example.com',
  phone: '(555) 111-2222',
  emergencyContactName: 'Jordan Fields',
  emergencyContactPhone: '(555) 333-4444',
};

interface MockOptions {
  userId?: string | null;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'TEAM_LEAD' | 'CONTRACTOR' | 'READ_ONLY';
  existingSubcontractor?: {
    id: string;
    business_name: string;
    onboarding_status: string;
  } | null;
}

function createMockClient(options: MockOptions = {}) {
  const userId = options.userId === undefined ? 'user-1' : options.userId;
  const role = options.role ?? 'CONTRACTOR';
  const existingSubcontractor = options.existingSubcontractor ?? null;

  const profileSelectSingle = vi.fn().mockResolvedValue({
    data: { role },
    error: null,
  });
  const profileSelectEq = vi.fn(() => ({ single: profileSelectSingle }));
  const profileSelect = vi.fn(() => ({ eq: profileSelectEq }));

  const profileUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const profileUpdate = vi.fn(() => ({ eq: profileUpdateEq }));

  const subcontractorSelectMaybeSingle = vi.fn().mockResolvedValue({
    data: existingSubcontractor,
    error: null,
  });
  const subcontractorSelectEq = vi.fn(() => ({ maybeSingle: subcontractorSelectMaybeSingle }));
  const subcontractorSelect = vi.fn(() => ({ eq: subcontractorSelectEq }));

  const subcontractorInsertSingle = vi.fn().mockResolvedValue({
    data: { id: 'sub-new', onboarding_status: 'PENDING' },
    error: null,
  });
  const subcontractorInsertSelect = vi.fn(() => ({ single: subcontractorInsertSingle }));
  const subcontractorInsert = vi.fn(() => ({ select: subcontractorInsertSelect }));

  const subcontractorUpdateSingle = vi.fn().mockResolvedValue({
    data: { id: existingSubcontractor?.id ?? 'sub-existing', onboarding_status: 'PENDING' },
    error: null,
  });
  const subcontractorUpdateSelect = vi.fn(() => ({ single: subcontractorUpdateSingle }));
  const subcontractorUpdateEq = vi.fn(() => ({ select: subcontractorUpdateSelect }));
  const subcontractorUpdate = vi.fn(() => ({ eq: subcontractorUpdateEq }));

  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId } : null },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: profileSelect,
          update: profileUpdate,
        };
      }

      if (table === 'subcontractors') {
        return {
          select: subcontractorSelect,
          insert: subcontractorInsert,
          update: subcontractorUpdate,
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  return {
    client,
    spies: {
      profileUpdate,
      profileUpdateEq,
      subcontractorInsert,
      subcontractorUpdate,
    },
  };
}

describe('coreOnboardingProfileSchema', () => {
  it('requires all core onboarding fields', () => {
    const result = coreOnboardingProfileSchema.safeParse({
      ...validInput,
      emergencyContactPhone: '',
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.flatten().fieldErrors).toMatchObject({
      emergencyContactPhone: expect.any(Array),
    });
  });

  it('accepts a valid payload', () => {
    const result = coreOnboardingProfileSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });
});

describe('submitCoreOnboardingProfile', () => {
  it('rejects unauthenticated submissions', async () => {
    const { client } = createMockClient({ userId: null });

    await expect(
      submitCoreOnboardingProfile(validInput, client as never)
    ).rejects.toThrow(ONBOARDING_AUTH_REQUIRED_ERROR);
  });

  it('rejects non-contractor submissions', async () => {
    const { client } = createMockClient({ role: 'ADMIN' });

    await expect(
      submitCoreOnboardingProfile(validInput, client as never)
    ).rejects.toThrow(ONBOARDING_PERMISSION_ERROR);
  });

  it('rejects users with verified onboarding', async () => {
    const { client } = createMockClient({
      existingSubcontractor: {
        id: 'sub-verified',
        business_name: 'Verified Electric',
        onboarding_status: 'APPROVED',
      },
    });

    await expect(
      submitCoreOnboardingProfile(validInput, client as never)
    ).rejects.toThrow(ONBOARDING_ALREADY_VERIFIED_ERROR);
  });

  it('creates a new subcontractor record when one does not exist', async () => {
    const { client, spies } = createMockClient();

    const result = await submitCoreOnboardingProfile(validInput, client as never);

    expect(result).toEqual({
      subcontractorId: 'sub-new',
      onboardingStatus: 'PENDING',
    });

    expect(spies.profileUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: validInput.firstName,
        last_name: validInput.lastName,
        email: validInput.email,
        phone: validInput.phone,
      })
    );

    expect(spies.subcontractorInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        profile_id: 'user-1',
        business_email: validInput.email,
        business_phone: validInput.phone,
        emergency_contact_name: validInput.emergencyContactName,
        emergency_contact_phone: validInput.emergencyContactPhone,
        onboarding_status: 'PENDING',
      }),
    ]);
  });

  it('updates an existing subcontractor record', async () => {
    const { client, spies } = createMockClient({
      existingSubcontractor: {
        id: 'sub-existing',
        business_name: 'Existing Electric LLC',
        onboarding_status: 'IN_PROGRESS',
      },
    });

    const result = await submitCoreOnboardingProfile(validInput, client as never);

    expect(result).toEqual({
      subcontractorId: 'sub-existing',
      onboardingStatus: 'PENDING',
    });
    expect(spies.subcontractorInsert).not.toHaveBeenCalled();
    expect(spies.subcontractorUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        business_name: 'Existing Electric LLC',
        onboarding_status: 'PENDING',
      })
    );
  });
});
