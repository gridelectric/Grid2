import type { UserRole } from '../../types';
import type { Database } from '../../types/database';

const COMPLIANCE_MAX_FILE_SIZE_MB = 10;
export const COMPLIANCE_MAX_FILE_SIZE_BYTES = COMPLIANCE_MAX_FILE_SIZE_MB * 1024 * 1024;
export const COMPLIANCE_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export const COMPLIANCE_STORAGE_BUCKET = 'compliance-documents';

export const ONBOARDING_DOCUMENT_AUTH_REQUIRED_ERROR = 'You must be signed in to upload compliance documents.';
export const ONBOARDING_DOCUMENT_PERMISSION_ERROR = 'Only contractors can upload onboarding compliance documents.';
export const ONBOARDING_DOCUMENT_CONTEXT_ERROR = 'Onboarding record not found. Complete your core profile first.';

type ProfileRole = Pick<Database['public']['Tables']['profiles']['Row'], 'role'>;
type SubcontractorContext = Pick<Database['public']['Tables']['subcontractors']['Row'], 'id'>;

type ComplianceDocumentType = 'w9' | 'insurance';
type DocumentUploadStatus = 'uploaded' | 'failed';

export interface ComplianceDocumentUploadResult {
  status: DocumentUploadStatus;
  message?: string;
  storagePath?: string;
}

export interface OnboardingComplianceUploadResult {
  w9: ComplianceDocumentUploadResult;
  insurance: ComplianceDocumentUploadResult;
}

export interface OnboardingComplianceUploadInput {
  w9File: File;
  insuranceFile: File;
}

interface AuthClient {
  getUser: () => Promise<{ data: { user: { id: string } | null }; error: unknown }>;
}

interface ProfilesTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      single: () => Promise<{ data: ProfileRole | null; error: unknown }>;
    };
  };
}

interface SubcontractorsTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      maybeSingle: () => Promise<{ data: SubcontractorContext | null; error: unknown }>;
    };
  };
}

interface MediaAssetsTableClient {
  insert: (
    values: Array<{
      uploaded_by: string;
      subcontractor_id: string;
      file_name: string;
      original_name: string;
      file_type: 'DOCUMENT';
      mime_type: string;
      file_size_bytes: number;
      storage_bucket: string;
      storage_path: string;
      entity_type: 'subcontractor_onboarding';
      entity_id: string;
      upload_status: 'COMPLETED';
    }>
  ) => Promise<{ error: unknown }>;
}

interface StorageBucketClient {
  upload: (path: string, file: File, options?: { upsert?: boolean }) => Promise<{ data: { path: string } | null; error: unknown }>;
}

interface StorageClient {
  from: (bucket: string) => StorageBucketClient;
}

interface OnboardingDocumentsSupabaseClient {
  auth: AuthClient;
  storage: StorageClient;
  from(table: 'profiles'): ProfilesTableClient;
  from(table: 'subcontractors'): SubcontractorsTableClient;
  from(table: 'media_assets'): MediaAssetsTableClient;
}

interface ContractorUploadContext {
  userId: string;
  subcontractorId: string;
}

const DOCUMENT_LABELS: Record<ComplianceDocumentType, string> = {
  w9: 'W-9',
  insurance: 'insurance',
};

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function getDefaultClient(): Promise<OnboardingDocumentsSupabaseClient> {
  const { supabase } = await import('../supabase/client');
  return supabase as unknown as OnboardingDocumentsSupabaseClient;
}

export function validateComplianceDocumentFile(file: Pick<File, 'name' | 'type' | 'size'>): string | null {
  if (!COMPLIANCE_ALLOWED_MIME_TYPES.includes(file.type as (typeof COMPLIANCE_ALLOWED_MIME_TYPES)[number])) {
    return 'Invalid file type. Accepted formats: PDF, JPEG, PNG, WEBP.';
  }

  if (file.size > COMPLIANCE_MAX_FILE_SIZE_BYTES) {
    return `File too large. Maximum allowed size is ${COMPLIANCE_MAX_FILE_SIZE_MB}MB.`;
  }

  return null;
}

async function getContractorUploadContext(client: OnboardingDocumentsSupabaseClient): Promise<ContractorUploadContext> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error(ONBOARDING_DOCUMENT_AUTH_REQUIRED_ERROR);
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(ONBOARDING_DOCUMENT_PERMISSION_ERROR);
  }

  const role = profile.role as UserRole;
  if (role !== 'CONTRACTOR') {
    throw new Error(ONBOARDING_DOCUMENT_PERMISSION_ERROR);
  }

  const { data: subcontractor, error: subcontractorError } = await client
    .from('subcontractors')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (subcontractorError || !subcontractor) {
    throw new Error(ONBOARDING_DOCUMENT_CONTEXT_ERROR);
  }

  return {
    userId: user.id,
    subcontractorId: subcontractor.id,
  };
}

async function uploadSingleDocument(
  client: OnboardingDocumentsSupabaseClient,
  context: ContractorUploadContext,
  documentType: ComplianceDocumentType,
  file: File
): Promise<ComplianceDocumentUploadResult> {
  const validationError = validateComplianceDocumentFile(file);
  if (validationError) {
    return {
      status: 'failed',
      message: validationError,
    };
  }

  const safeFileName = sanitizeFileName(file.name);
  const storagePath = `${context.userId}/${documentType}/${Date.now()}-${safeFileName}`;
  const label = DOCUMENT_LABELS[documentType];

  const { error: uploadError } = await client
    .storage
    .from(COMPLIANCE_STORAGE_BUCKET)
    .upload(storagePath, file, { upsert: false });

  if (uploadError) {
    return {
      status: 'failed',
      message: `Unable to upload ${label} document. Please retry.`,
    };
  }

  const { error: mediaInsertError } = await client
    .from('media_assets')
    .insert([
      {
        uploaded_by: context.userId,
        subcontractor_id: context.subcontractorId,
        file_name: safeFileName,
        original_name: file.name,
        file_type: 'DOCUMENT',
        mime_type: file.type,
        file_size_bytes: file.size,
        storage_bucket: COMPLIANCE_STORAGE_BUCKET,
        storage_path: storagePath,
        entity_type: 'subcontractor_onboarding',
        entity_id: context.subcontractorId,
        upload_status: 'COMPLETED',
      },
    ]);

  if (mediaInsertError) {
    return {
      status: 'failed',
      message: `Unable to link ${label} document to onboarding. Please retry.`,
    };
  }

  return {
    status: 'uploaded',
    storagePath,
  };
}

export async function uploadOnboardingComplianceDocuments(
  input: OnboardingComplianceUploadInput,
  client?: OnboardingDocumentsSupabaseClient
): Promise<OnboardingComplianceUploadResult> {
  const activeClient = client ?? await getDefaultClient();
  const context = await getContractorUploadContext(activeClient);

  const [w9, insurance] = await Promise.all([
    uploadSingleDocument(activeClient, context, 'w9', input.w9File),
    uploadSingleDocument(activeClient, context, 'insurance', input.insuranceFile),
  ]);

  return {
    w9,
    insurance,
  };
}
