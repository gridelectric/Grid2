# Story 2.2: Contractor Uploads Required Compliance Documents

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Contractor,
I want to upload required compliance documents,
so that Super Admin can validate my eligibility.

## Acceptance Criteria

1. **Given** I am on onboarding document step  
   **When** I upload W-9 and insurance files in allowed formats  
   **Then** files are accepted and linked to my onboarding record  
   **And** upload status is shown for each required document.
2. **Given** file type is not allowed or upload fails validation  
   **When** I attempt upload  
   **Then** the file is rejected  
   **And** I receive a clear error indicating accepted formats and requirements.

## Tasks / Subtasks

- [x] Implement compliance document validation and upload contract (AC: 1, 2)
  - [x] Add allowed-format and size validation for onboarding compliance documents
  - [x] Add upload result contract that captures per-document status and error detail

- [x] Implement authenticated contractor upload service (AC: 1, 2)
  - [x] Add onboarding compliance service to upload W-9 and insurance documents
  - [x] Enforce authenticated contractor role and resolve onboarding record linkage
  - [x] Link uploaded files to onboarding record (`subcontractor_id` + onboarding entity context)

- [x] Wire onboarding insurance/documents UI to service (AC: 1, 2)
  - [x] Update `src/components/features/onboarding/InsuranceUploadForm.tsx` to include required W-9 + insurance uploads
  - [x] Show per-document upload status (`pending/uploaded/failed`) and clear validation/error messages

- [x] Add automated tests and run regressions (AC: 1, 2)
  - [x] Add unit tests for validation and upload service behavior
  - [x] Run `npx vitest run`, `npx tsc --noEmit`, and targeted `npx eslint` on changed files

## Dev Notes

### Story Requirements Context

- Story source: `_bmad-output/planning-artifacts/epics.md` under "Story 2.2: Contractor Uploads Required Compliance Documents".
- Story 2.1 already established contractor-only onboarding profile submission and pending onboarding status.

### Technical Requirements

- Required documents in this story:
  - W-9 document
  - Insurance proof document
- Accepted file formats: PDF, JPEG, PNG, WEBP.
- Upload flow must:
  - reject invalid file types/sizes with clear user-facing messages
  - persist successful uploads and link them to contractor onboarding context
  - expose status for each required document

### Architecture Compliance

- Keep write logic in a service layer (no direct storage/database writes in UI component render logic).
- Reuse existing Supabase auth role source (`profiles.role`) and onboarding linkage (`subcontractors.profile_id`).
- Keep UI updates scoped to onboarding documents step and preserve existing flow structure.

### File Structure Requirements

- Add:
  - `src/lib/services/onboardingDocumentsService.ts`
  - `src/lib/services/onboardingDocumentsService.test.ts`
- Modify:
  - `src/components/features/onboarding/InsuranceUploadForm.tsx`
  - `src/components/providers/OnboardingProvider.tsx` (only if needed for onboarding document state)

### Testing Requirements

- Validation coverage for unsupported file types and oversize files.
- Service coverage for contractor-only access and onboarding linkage.
- Service coverage for successful upload result statuses and failed upload result messaging.

### References

- Epic source: `_bmad-output/planning-artifacts/epics.md`
- Onboarding UI:
  - `src/app/(onboarding)/insurance/page.tsx`
  - `src/components/features/onboarding/InsuranceUploadForm.tsx`
  - `src/components/providers/OnboardingProvider.tsx`
- Story 2.1 service pattern:
  - `src/lib/services/onboardingService.ts`
- DB/media schema:
  - `sql/07_media_audit_tables.sql`
  - `src/types/database.ts`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story file bootstrapped from epic definition because `2-2-chat-interface.md` was missing in implementation artifacts.

### Implementation Plan

- Add a dedicated onboarding documents service with per-document validation and upload status reporting.
- Update onboarding documents form to handle required W-9 + insurance files and render status/errors clearly.
- Add unit tests and run full checks.

### Completion Notes List

- Added onboarding documents upload service with clear, reusable contracts:
  - allowed format validation (PDF/JPEG/PNG/WEBP)
  - max file size validation (10MB)
  - per-document upload result statuses (`uploaded` / `failed`)
- Added contractor-only upload enforcement and onboarding linkage resolution:
  - authenticated user required
  - role must be `CONTRACTOR`
  - `subcontractors` record required for onboarding context
- Implemented storage and onboarding linkage behavior:
  - uploads to `compliance-documents` storage bucket
  - inserts `media_assets` records linked to onboarding via `subcontractor_id` + `entity_type/entity_id`
- Updated onboarding document UI:
  - required W-9 and insurance uploads
  - per-document status badges (`pending/uploaded/failed`)
  - clear field-level and submit-level errors for rejected/failed uploads
  - explicit accepted formats and size guidance
- Updated onboarding insurance page copy to match compliance document requirements.
- Validation results:
  - `npx vitest run` passed (8 files, 54 tests)
  - `npx tsc --noEmit` passed
  - `npx eslint` on changed files passed

### File List

- `_bmad-output/implementation-artifacts/2-2-chat-interface.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/lib/services/onboardingDocumentsService.ts`
- `src/lib/services/onboardingDocumentsService.test.ts`
- `src/components/features/onboarding/InsuranceUploadForm.tsx`
- `src/components/providers/OnboardingProvider.tsx`
- `src/app/(onboarding)/insurance/page.tsx`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`

### Change Log

- 2026-02-12: Created Story 2.2 artifact from epic definition and set status to `in-progress`.
- 2026-02-12: Implemented Story 2.2 compliance document uploads and moved status to `review`.
