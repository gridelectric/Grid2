import { describe, expect, it, vi } from 'vitest';

import {
  COMPLIANCE_ALLOWED_MIME_TYPES,
  COMPLIANCE_MAX_FILE_SIZE_BYTES,
  ONBOARDING_DOCUMENT_AUTH_REQUIRED_ERROR,
  ONBOARDING_DOCUMENT_CONTEXT_ERROR,
  ONBOARDING_DOCUMENT_PERMISSION_ERROR,
  uploadOnboardingComplianceDocuments,
  validateComplianceDocumentFile,
} from './onboardingDocumentsService';

function createFile(name: string, type: string, size = 1024): File {
  return new File(['x'.repeat(Math.min(size, 64))], name, { type });
}

interface MockOptions {
  userId?: string | null;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'CONTRACTOR';
  subcontractorId?: string | null;
  failInsuranceUpload?: boolean;
}

function createMockClient(options: MockOptions = {}) {
  const userId = options.userId === undefined ? 'contractor-1' : options.userId;
  const role = options.role ?? 'CONTRACTOR';
  const subcontractorId = options.subcontractorId === undefined ? 'sub-1' : options.subcontractorId;
  const failInsuranceUpload = options.failInsuranceUpload ?? false;

  const profileSelectSingle = vi.fn().mockResolvedValue({
    data: { role },
    error: null,
  });
  const profileSelectEq = vi.fn(() => ({ single: profileSelectSingle }));
  const profileSelect = vi.fn(() => ({ eq: profileSelectEq }));

  const subcontractorSelectMaybeSingle = vi.fn().mockResolvedValue({
    data: subcontractorId ? { id: subcontractorId } : null,
    error: null,
  });
  const subcontractorSelectEq = vi.fn(() => ({ maybeSingle: subcontractorSelectMaybeSingle }));
  const subcontractorSelect = vi.fn(() => ({ eq: subcontractorSelectEq }));

  const mediaInsert = vi.fn().mockResolvedValue({ error: null });

  const storageUpload = vi.fn(
    async (path: string) => {
      if (failInsuranceUpload && path.includes('/insurance/')) {
        return { data: null, error: new Error('storage failed') };
      }

      return { data: { path }, error: null };
    }
  );
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
        return { select: profileSelect };
      }

      if (table === 'subcontractors') {
        return { select: subcontractorSelect };
      }

      if (table === 'media_assets') {
        return { insert: mediaInsert };
      }

      throw new Error(`Unexpected table: ${table}`);
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

describe('validateComplianceDocumentFile', () => {
  it('accepts allowed compliance document mime types', () => {
    for (const mime of COMPLIANCE_ALLOWED_MIME_TYPES) {
      const file = createFile(`file-${mime.replace('/', '-')}.dat`, mime);
      const validationError = validateComplianceDocumentFile(file);
      expect(validationError).toBeNull();
    }
  });

  it('rejects unsupported file types with accepted format guidance', () => {
    const file = createFile('document.exe', 'application/x-msdownload');
    const validationError = validateComplianceDocumentFile(file);

    expect(validationError).toContain('Accepted formats: PDF, JPEG, PNG, WEBP');
  });

  it('rejects files that exceed maximum size requirements', () => {
    const oversizeFile = {
      name: 'too-large.pdf',
      type: 'application/pdf',
      size: COMPLIANCE_MAX_FILE_SIZE_BYTES + 1,
    } as File;

    const validationError = validateComplianceDocumentFile(oversizeFile);
    expect(validationError).toContain('Maximum allowed size is 10MB');
  });
});

describe('uploadOnboardingComplianceDocuments', () => {
  const input = {
    w9File: createFile('w9.pdf', 'application/pdf'),
    insuranceFile: createFile('insurance.pdf', 'application/pdf'),
  };

  it('rejects unauthenticated uploads', async () => {
    const { client } = createMockClient({ userId: null });

    await expect(
      uploadOnboardingComplianceDocuments(input, client as never)
    ).rejects.toThrow(ONBOARDING_DOCUMENT_AUTH_REQUIRED_ERROR);
  });

  it('rejects non-contractor uploads', async () => {
    const { client } = createMockClient({ role: 'ADMIN' });

    await expect(
      uploadOnboardingComplianceDocuments(input, client as never)
    ).rejects.toThrow(ONBOARDING_DOCUMENT_PERMISSION_ERROR);
  });

  it('rejects uploads when onboarding record is missing', async () => {
    const { client } = createMockClient({ subcontractorId: null });

    await expect(
      uploadOnboardingComplianceDocuments(input, client as never)
    ).rejects.toThrow(ONBOARDING_DOCUMENT_CONTEXT_ERROR);
  });

  it('uploads both required documents and links to onboarding record', async () => {
    const { client, spies } = createMockClient();

    const result = await uploadOnboardingComplianceDocuments(input, client as never);

    expect(result.w9.status).toBe('uploaded');
    expect(result.insurance.status).toBe('uploaded');

    expect(spies.storageFrom).toHaveBeenCalledWith('compliance-documents');
    expect(spies.mediaInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          subcontractor_id: 'sub-1',
          entity_type: 'subcontractor_onboarding',
          entity_id: 'sub-1',
          file_type: 'DOCUMENT',
          upload_status: 'COMPLETED',
        }),
      ])
    );
  });

  it('returns failed status when one required upload fails', async () => {
    const { client } = createMockClient({ failInsuranceUpload: true });

    const result = await uploadOnboardingComplianceDocuments(input, client as never);

    expect(result.w9.status).toBe('uploaded');
    expect(result.insurance.status).toBe('failed');
    expect(result.insurance.message).toContain('Unable to upload insurance document');
  });
});
