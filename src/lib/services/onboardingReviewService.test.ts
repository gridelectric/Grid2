import { describe, expect, it, vi } from 'vitest';

import {
  ONBOARDING_REVIEW_AUTH_REQUIRED_ERROR,
  ONBOARDING_REVIEW_NOT_FOUND_ERROR,
  ONBOARDING_REVIEW_PERMISSION_ERROR,
  getPendingOnboardingPackages,
  setOnboardingVerificationDecision,
} from './onboardingReviewService';

interface MockOptions {
  userId?: string | null;
  role?: 'CEO' | 'SUPER_ADMIN' | 'ADMIN' | 'CONTRACTOR';
  pendingRows?: Array<{
    id: string;
    profile_id: string;
    onboarding_status: string;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    created_at: string;
  }>;
  profileRows?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  }>;
  mediaRows?: Array<{
    contractor_id: string;
    original_name: string | null;
    storage_path: string;
    created_at: string;
  }>;
  missingTarget?: boolean;
}

function createMockClient(options: MockOptions = {}) {
  const userId = options.userId === undefined ? 'super-admin-1' : options.userId;
  const role = options.role ?? 'SUPER_ADMIN';
  const pendingRows = options.pendingRows ?? [
    {
      id: 'sub-1',
      profile_id: 'profile-1',
      onboarding_status: 'PENDING',
      emergency_contact_name: 'Jamie Stone',
      emergency_contact_phone: '(555) 000-1212',
      created_at: '2026-02-12T12:00:00.000Z',
    },
  ];
  const profileRows = options.profileRows ?? [
    {
      id: 'profile-1',
      first_name: 'Casey',
      last_name: 'Stone',
      email: 'casey.stone@example.com',
      phone: '(555) 111-2222',
    },
  ];
  const mediaRows = options.mediaRows ?? [
    {
      contractor_id: 'sub-1',
      original_name: 'w9.pdf',
      storage_path: 'profile-1/w9/1-w9.pdf',
      created_at: '2026-02-12T12:10:00.000Z',
    },
    {
      contractor_id: 'sub-1',
      original_name: 'insurance.pdf',
      storage_path: 'profile-1/insurance/1-insurance.pdf',
      created_at: '2026-02-12T12:15:00.000Z',
    },
  ];

  const profilesRoleSelectSingle = vi.fn().mockResolvedValue({
    data: { role },
    error: null,
  });
  const profilesRoleSelectEq = vi.fn(() => ({ single: profilesRoleSelectSingle }));
  const profilesIn = vi.fn().mockResolvedValue({
    data: profileRows,
    error: null,
  });
  const profileDetailSingle = vi.fn().mockResolvedValue({
    data: profileRows[0] ?? null,
    error: null,
  });
  const profileDetailEq = vi.fn(() => ({ single: profileDetailSingle }));
  const profilesSelect = vi.fn((columns: string) => {
    if (columns === 'role') {
      return { eq: profilesRoleSelectEq };
    }
    return { in: profilesIn, eq: profileDetailEq };
  });

  const contractorPendingIn = vi.fn().mockResolvedValue({
    data: pendingRows,
    error: null,
  });
  const contractorTargetSingle = vi.fn().mockResolvedValue({
    data: options.missingTarget ? null : pendingRows[0] ?? null,
    error: null,
  });
  const contractorTargetEq = vi.fn(() => ({ single: contractorTargetSingle }));

  const contractorUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const contractorUpdate = vi.fn(() => ({ eq: contractorUpdateEq }));

  const mediaIn = vi.fn().mockResolvedValue({
    data: mediaRows,
    error: null,
  });
  const mediaEq = vi.fn(() => ({ in: mediaIn }));
  const mediaSelect = vi.fn(() => ({ eq: mediaEq }));
  const mediaInsert = vi.fn().mockResolvedValue({ error: null });
  const storageUpload = vi.fn().mockResolvedValue({ data: { path: 'artifacts/path.pdf' }, error: null });
  const storageFrom = vi.fn(() => ({ upload: storageUpload }));

  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId } : null },
        error: null,
      }),
    },
    storage: {
      from: storageFrom,
    },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return { select: profilesSelect };
      }
      if (table === 'contractors') {
        return {
          select: vi.fn((columns: string) => {
            if (columns.includes('profile_id') && columns.includes('onboarding_status')) {
              return { in: contractorPendingIn, eq: contractorTargetEq };
            }
            return { in: contractorPendingIn, eq: contractorTargetEq };
          }),
          update: contractorUpdate,
        };
      }
      if (table === 'media_assets') {
        return { select: mediaSelect, insert: mediaInsert };
      }
      throw new Error(`Unexpected table ${table}`);
    }),
  };

  return {
    client,
    spies: {
      contractorUpdate,
      contractorUpdateEq,
      profilesSelect,
      mediaSelect,
      mediaInsert,
      storageFrom,
      storageUpload,
    },
  };
}

describe('getPendingOnboardingPackages', () => {
  it('requires authenticated super admin context', async () => {
    const { client } = createMockClient({ userId: null });
    await expect(getPendingOnboardingPackages(client as never)).rejects.toThrow(
      ONBOARDING_REVIEW_AUTH_REQUIRED_ERROR
    );
  });

  it('blocks non-super-admin callers', async () => {
    const { client } = createMockClient({ role: 'ADMIN' });
    await expect(getPendingOnboardingPackages(client as never)).rejects.toThrow(
      ONBOARDING_REVIEW_PERMISSION_ERROR
    );
  });

  it('allows CEO callers', async () => {
    const { client } = createMockClient({ role: 'CEO' });
    await expect(getPendingOnboardingPackages(client as never)).resolves.toHaveLength(1);
  });

  it('returns pending packages with required document statuses', async () => {
    const { client } = createMockClient();
    const packages = await getPendingOnboardingPackages(client as never);

    expect(packages).toHaveLength(1);
    expect(packages[0]).toMatchObject({
      contractorId: 'sub-1',
      profile: {
        firstName: 'Casey',
        lastName: 'Stone',
        email: 'casey.stone@example.com',
      },
      documents: {
        w9: { status: 'uploaded' },
        insurance: { status: 'uploaded' },
      },
    });
  });
});

describe('setOnboardingVerificationDecision', () => {
  it('requires authenticated super admin context', async () => {
    const { client } = createMockClient({ userId: null });
    await expect(
      setOnboardingVerificationDecision(
        { contractorId: 'sub-1', decision: 'verified' },
        client as never
      )
    ).rejects.toThrow(ONBOARDING_REVIEW_AUTH_REQUIRED_ERROR);
  });

  it('blocks non-super-admin callers', async () => {
    const { client } = createMockClient({ role: 'ADMIN' });
    await expect(
      setOnboardingVerificationDecision(
        { contractorId: 'sub-1', decision: 'verified' },
        client as never
      )
    ).rejects.toThrow(ONBOARDING_REVIEW_PERMISSION_ERROR);
  });

  it('throws when target onboarding package is missing', async () => {
    const { client } = createMockClient({ missingTarget: true });
    await expect(
      setOnboardingVerificationDecision(
        { contractorId: 'sub-1', decision: 'verified' },
        client as never
      )
    ).rejects.toThrow(ONBOARDING_REVIEW_NOT_FOUND_ERROR);
  });

  it('marks contractor verified with eligibility enabled', async () => {
    const { client, spies } = createMockClient();
    const result = await setOnboardingVerificationDecision(
      { contractorId: 'sub-1', decision: 'verified' },
      client as never
    );

    expect(result).toEqual({
      contractorId: 'sub-1',
      onboardingStatus: 'APPROVED',
      isEligibleForAssignment: true,
    });
    expect(spies.contractorUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        onboarding_status: 'APPROVED',
        is_eligible_for_assignment: true,
      })
    );
    expect(spies.mediaInsert).toHaveBeenCalled();
  });

  it('blocks verification when artifact finalization prerequisites are incomplete', async () => {
    const { client } = createMockClient({
      mediaRows: [
        {
          contractor_id: 'sub-1',
          original_name: 'w9.pdf',
          storage_path: 'profile-1/w9/w9.pdf',
          created_at: '2026-02-12T12:10:00.000Z',
        },
      ],
    });

    await expect(
      setOnboardingVerificationDecision(
        { contractorId: 'sub-1', decision: 'verified' },
        client as never
      )
    ).rejects.toThrow('Required onboarding documents and acknowledgments must be completed before finalization.');
  });

  it('marks contractor not verified with eligibility disabled', async () => {
    const { client, spies } = createMockClient();
    const result = await setOnboardingVerificationDecision(
      { contractorId: 'sub-1', decision: 'not_verified', reason: 'Missing insurance proof' },
      client as never
    );

    expect(result).toEqual({
      contractorId: 'sub-1',
      onboardingStatus: 'SUSPENDED',
      isEligibleForAssignment: false,
    });
    expect(spies.contractorUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        onboarding_status: 'SUSPENDED',
        is_eligible_for_assignment: false,
        eligibility_reason: 'Missing insurance proof',
      })
    );
  });
});
