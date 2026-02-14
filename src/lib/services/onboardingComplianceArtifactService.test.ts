import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ONBOARDING_ARTIFACTS_GENERATION_ERROR,
  ONBOARDING_ARTIFACTS_INCOMPLETE_ERROR,
  finalizeOnboardingComplianceArtifacts,
} from './onboardingComplianceArtifactService';

interface MockOptions {
  mediaRows?: Array<{
    contractor_id: string | null;
    original_name: string | null;
    storage_path: string;
    created_at: string;
  }>;
  failInsuranceUpload?: boolean;
}

function createMockClient(options: MockOptions = {}) {
  const mediaRows = options.mediaRows ?? [
    {
      contractor_id: 'sub-1',
      original_name: 'w9.pdf',
      storage_path: 'profile-1/w9/w9.pdf',
      created_at: '2026-02-12T10:00:00.000Z',
    },
    {
      contractor_id: 'sub-1',
      original_name: 'insurance.pdf',
      storage_path: 'profile-1/insurance/insurance.pdf',
      created_at: '2026-02-12T10:01:00.000Z',
    },
  ];

  const contractorSingle = vi.fn().mockResolvedValue({
    data: { id: 'sub-1', profile_id: 'profile-1', onboarding_status: 'COMPLETE' },
    error: null,
  });
  const contractorEq = vi.fn(() => ({ single: contractorSingle }));
  const contractorSelect = vi.fn(() => ({ eq: contractorEq }));

  const profileSingle = vi.fn().mockResolvedValue({
    data: {
      id: 'profile-1',
      first_name: 'Casey',
      last_name: 'Stone',
      email: 'casey.stone@example.com',
    },
    error: null,
  });
  const profileEq = vi.fn(() => ({ single: profileSingle }));
  const profileSelect = vi.fn(() => ({ eq: profileEq }));

  const mediaIn = vi.fn().mockResolvedValue({
    data: mediaRows,
    error: null,
  });
  const mediaEq = vi.fn(() => ({ in: mediaIn }));
  const mediaSelect = vi.fn(() => ({ eq: mediaEq }));
  const mediaInsert = vi.fn().mockResolvedValue({ error: null });

  const storageUpload = vi.fn(async (path: string) => {
    if (options.failInsuranceUpload && path.includes('insurance')) {
      return { data: null, error: new Error('upload failed') };
    }

    return { data: { path }, error: null };
  });
  const storageFrom = vi.fn(() => ({ upload: storageUpload }));

  const client = {
    storage: {
      from: storageFrom,
    },
    from: vi.fn((table: string) => {
      if (table === 'contractors') {
        return {
          select: contractorSelect,
        };
      }

      if (table === 'profiles') {
        return {
          select: profileSelect,
        };
      }

      if (table === 'media_assets') {
        return {
          select: mediaSelect,
          insert: mediaInsert,
        };
      }

      throw new Error(`Unexpected table ${table}`);
    }),
  };

  return {
    client,
    spies: {
      mediaInsert,
      storageFrom,
      storageUpload,
    },
  };
}

describe('finalizeOnboardingComplianceArtifacts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('blocks finalization when required documents are incomplete', async () => {
    const { client } = createMockClient({
      mediaRows: [
        {
          contractor_id: 'sub-1',
          original_name: 'w9.pdf',
          storage_path: 'profile-1/w9/w9.pdf',
          created_at: '2026-02-12T10:00:00.000Z',
        },
      ],
    });

    await expect(
      finalizeOnboardingComplianceArtifacts(
        { contractorId: 'sub-1', actorUserId: 'super-admin-1' },
        client as never
      )
    ).rejects.toThrow(ONBOARDING_ARTIFACTS_INCOMPLETE_ERROR);
  });

  it('generates and stores PDF artifacts with traceable linkage', async () => {
    const { client, spies } = createMockClient();

    const artifacts = await finalizeOnboardingComplianceArtifacts(
      { contractorId: 'sub-1', actorUserId: 'super-admin-1' },
      client as never
    );

    expect(artifacts).toHaveLength(2);
    expect(spies.storageFrom).toHaveBeenCalledWith('compliance-documents');
    expect(spies.mediaInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          contractor_id: 'sub-1',
          entity_type: 'contractor_compliance_artifact',
          entity_id: 'sub-1',
          mime_type: 'application/pdf',
          file_type: 'DOCUMENT',
          upload_status: 'COMPLETED',
        }),
      ])
    );
  });

  it('blocks finalization and logs actionable errors when artifact storage fails', async () => {
    const { client } = createMockClient({ failInsuranceUpload: true });
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      finalizeOnboardingComplianceArtifacts(
        { contractorId: 'sub-1', actorUserId: 'super-admin-1' },
        client as never
      )
    ).rejects.toThrow(ONBOARDING_ARTIFACTS_GENERATION_ERROR);

    expect(logSpy).toHaveBeenCalled();
  });
});
