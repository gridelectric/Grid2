import { COMPLIANCE_STORAGE_BUCKET } from './onboardingDocumentsService';

type RequiredDocumentType = 'w9' | 'insurance';

interface ContractorArtifactContext {
  id: string;
  profile_id: string;
  onboarding_status: string;
}

interface ProfileArtifactContext {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface OnboardingDocumentRow {
  contractor_id: string | null;
  original_name: string | null;
  storage_path: string;
  created_at: string;
}

interface AuthlessContractorsTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      single: () => Promise<{ data: ContractorArtifactContext | null; error: unknown }>;
    };
  };
}

interface AuthlessProfilesTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      single: () => Promise<{ data: ProfileArtifactContext | null; error: unknown }>;
    };
  };
}

interface MediaAssetsTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      in: (
        inColumn: string,
        values: string[]
      ) => Promise<{ data: OnboardingDocumentRow[] | null; error: unknown }>;
    };
  };
  insert: (
    values: Array<{
      uploaded_by: string;
      contractor_id: string;
      file_name: string;
      original_name: string;
      file_type: 'DOCUMENT';
      mime_type: 'application/pdf';
      file_size_bytes: number;
      storage_bucket: string;
      storage_path: string;
      entity_type: 'contractor_compliance_artifact';
      entity_id: string;
      upload_status: 'COMPLETED';
    }>
  ) => Promise<{ error: unknown }>;
}

interface StorageBucketClient {
  upload: (
    path: string,
    body: Uint8Array,
    options?: { upsert?: boolean; contentType?: string }
  ) => Promise<{ data: { path: string } | null; error: unknown }>;
}

interface StorageClient {
  from: (bucket: string) => StorageBucketClient;
}

interface ComplianceArtifactSupabaseClient {
  storage: StorageClient;
  from(table: 'contractors'): AuthlessContractorsTableClient;
  from(table: 'profiles'): AuthlessProfilesTableClient;
  from(table: 'media_assets'): MediaAssetsTableClient;
}

interface SourceDocumentDetails {
  type: RequiredDocumentType;
  originalName: string;
  storagePath: string;
  createdAt: string;
}

export interface FinalizeOnboardingComplianceArtifactsInput {
  contractorId: string;
  actorUserId: string;
}

export interface GeneratedComplianceArtifact {
  documentType: RequiredDocumentType;
  fileName: string;
  storagePath: string;
}

export const ONBOARDING_ARTIFACTS_INCOMPLETE_ERROR =
  'Required onboarding documents and acknowledgments must be completed before finalization.';
export const ONBOARDING_ARTIFACTS_GENERATION_ERROR =
  'Unable to generate compliance artifacts. Please retry or contact support.';

function classifyRequiredDocument(document: OnboardingDocumentRow): RequiredDocumentType | null {
  const storagePath = document.storage_path.toLowerCase();
  const originalName = (document.original_name ?? '').toLowerCase();

  if (storagePath.includes('/w9/') || /w-?9/.test(originalName)) {
    return 'w9';
  }

  if (storagePath.includes('/insurance/') || originalName.includes('insurance')) {
    return 'insurance';
  }

  return null;
}

function getLatestDocumentsByType(rows: OnboardingDocumentRow[]): Partial<Record<RequiredDocumentType, SourceDocumentDetails>> {
  const byType: Partial<Record<RequiredDocumentType, SourceDocumentDetails>> = {};

  for (const row of rows) {
    if (!row.contractor_id) {
      continue;
    }

    const type = classifyRequiredDocument(row);
    if (!type) {
      continue;
    }

    const existing = byType[type];
    if (existing && existing.createdAt >= row.created_at) {
      continue;
    }

    byType[type] = {
      type,
      originalName: row.original_name ?? `${type}.pdf`,
      storagePath: row.storage_path,
      createdAt: row.created_at,
    };
  }

  return byType;
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildSimplePdf(lines: string[]): Uint8Array {
  const contentLines = lines
    .map((line, index) => `1 0 0 1 50 ${760 - index * 18} Tm (${escapePdfText(line)}) Tj`)
    .join('\n');
  const stream = `BT\n/F1 12 Tf\n${contentLines}\nET`;

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += object;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

async function getDefaultClient(): Promise<ComplianceArtifactSupabaseClient> {
  const { supabase } = await import('../supabase/client');
  return supabase as unknown as ComplianceArtifactSupabaseClient;
}

export async function finalizeOnboardingComplianceArtifacts(
  input: FinalizeOnboardingComplianceArtifactsInput,
  client?: ComplianceArtifactSupabaseClient
): Promise<GeneratedComplianceArtifact[]> {
  const activeClient = client ?? await getDefaultClient();

  try {
    const { data: contractor, error: contractorError } = await activeClient
      .from('contractors')
      .select('id, profile_id, onboarding_status')
      .eq('id', input.contractorId)
      .single();

    if (contractorError || !contractor) {
      throw contractorError ?? new Error('Missing contractor context');
    }

    const { data: profile, error: profileError } = await activeClient
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('id', contractor.profile_id)
      .single();

    if (profileError || !profile) {
      throw profileError ?? new Error('Missing profile context');
    }

    const { data: mediaRows, error: mediaRowsError } = await activeClient
      .from('media_assets')
      .select('contractor_id, original_name, storage_path, created_at')
      .eq('entity_type', 'contractor_onboarding')
      .in('contractor_id', [contractor.id]);

    if (mediaRowsError) {
      throw mediaRowsError;
    }

    const latestDocuments = getLatestDocumentsByType(mediaRows ?? []);
    const requiredW9 = latestDocuments.w9;
    const requiredInsurance = latestDocuments.insurance;

    if (!requiredW9 || !requiredInsurance) {
      throw new Error(ONBOARDING_ARTIFACTS_INCOMPLETE_ERROR);
    }

    const sourceDocuments: SourceDocumentDetails[] = [requiredW9, requiredInsurance];
    const generatedArtifacts: GeneratedComplianceArtifact[] = [];

    for (const sourceDoc of sourceDocuments) {
      const generatedAt = new Date().toISOString();
      const fileName = `${sourceDoc.type}-compliance-artifact-${contractor.id}-${Date.now()}.pdf`;
      const storagePath = `${contractor.profile_id}/artifacts/${fileName}`;
      const pdfBytes = buildSimplePdf([
        'Grid Electric Services - Compliance Artifact',
        `Contractor: ${profile.first_name} ${profile.last_name}`,
        `Email: ${profile.email}`,
        `Contractor ID: ${contractor.id}`,
        `Source Document Type: ${sourceDoc.type.toUpperCase()}`,
        `Source File: ${sourceDoc.originalName}`,
        `Source Path: ${sourceDoc.storagePath}`,
        `Source Uploaded: ${sourceDoc.createdAt}`,
        `Generated At: ${generatedAt}`,
      ]);

      const { error: uploadError } = await activeClient
        .storage
        .from(COMPLIANCE_STORAGE_BUCKET)
        .upload(storagePath, pdfBytes, { upsert: false, contentType: 'application/pdf' });

      if (uploadError) {
        throw uploadError;
      }

      const { error: insertError } = await activeClient
        .from('media_assets')
        .insert([
          {
            uploaded_by: input.actorUserId,
            contractor_id: contractor.id,
            file_name: fileName,
            original_name: fileName,
            file_type: 'DOCUMENT',
            mime_type: 'application/pdf',
            file_size_bytes: pdfBytes.byteLength,
            storage_bucket: COMPLIANCE_STORAGE_BUCKET,
            storage_path: storagePath,
            entity_type: 'contractor_compliance_artifact',
            entity_id: contractor.id,
            upload_status: 'COMPLETED',
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      generatedArtifacts.push({
        documentType: sourceDoc.type,
        fileName,
        storagePath,
      });
    }

    return generatedArtifacts;
  } catch (error) {
    if (error instanceof Error && error.message === ONBOARDING_ARTIFACTS_INCOMPLETE_ERROR) {
      throw error;
    }

    console.error('Compliance artifact generation failed', {
      contractorId: input.contractorId,
      error,
    });
    throw new Error(ONBOARDING_ARTIFACTS_GENERATION_ERROR);
  }
}
