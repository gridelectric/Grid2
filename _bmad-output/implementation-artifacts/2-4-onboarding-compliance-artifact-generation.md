# Story 2.4: Onboarding Compliance Artifact Generation

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Super Admin,
I want onboarding outputs generated as audit-ready PDF artifacts replacing legacy Adobe Sign workflow,
so that compliance records are standardized and retrievable.

## Acceptance Criteria

1. **Given** required onboarding documents and acknowledgments are completed  
   **When** onboarding package is finalized  
   **Then** the system generates PDF compliance artifacts for required documents  
   **And** artifacts are stored with traceable linkage to the contractor record.
2. **Given** artifact generation or storage fails  
   **When** finalization is attempted  
   **Then** finalization is blocked  
   **And** an actionable error is logged and surfaced for retry or support.

## Tasks / Subtasks

- [x] Implement compliance artifact generation service contract (AC: 1, 2)
  - [x] Add service to derive required onboarding docs and generate PDF artifacts
  - [x] Store generated PDFs in compliance storage with contractor linkage metadata
  - [x] Return traceable artifact descriptors for downstream review flows

- [x] Enforce artifact generation in onboarding finalization workflow (AC: 1, 2)
  - [x] Integrate artifact generation into super-admin verification finalization path
  - [x] Block onboarding finalization when generation/storage fails
  - [x] Surface actionable finalization errors to review UI and log error context

- [x] Add automated tests and run regressions (AC: 1, 2)
  - [x] Add unit tests for artifact generation success/failure behavior
  - [x] Add unit coverage for finalization blocking behavior when artifact generation fails
  - [x] Run `npx vitest run`, `npx tsc --noEmit`, and targeted `npx eslint` on changed files

## Dev Notes

### Story Requirements Context

- Story source: `_bmad-output/planning-artifacts/epics.md` under "Story 2.4: Onboarding Compliance Artifact Generation".
- Story 2.3 introduced service-backed onboarding verification and contractor access gating.

### Technical Requirements

- Finalization for verified onboarding must generate PDF artifacts for required compliance docs (W-9 and insurance evidence).
- Generated artifact files must be stored with:
  - contractor linkage (`subcontractor_id`)
  - onboarding artifact entity context for traceability
  - auditable metadata (file name/path/type/timestamp)
- If artifact generation or storage fails, onboarding finalization must not proceed.
- Failure paths must log actionable context and return user-safe retry/support guidance.

### Architecture Compliance

- Keep artifact generation in service layer.
- Keep onboarding finalization mutation authoritative in onboarding review service.
- Reuse existing compliance storage/media patterns introduced in Story 2.2.

### File Structure Requirements

- Add:
  - `src/lib/services/onboardingComplianceArtifactService.ts`
  - `src/lib/services/onboardingComplianceArtifactService.test.ts`
- Modify:
  - `src/lib/services/onboardingReviewService.ts`
  - `src/lib/services/onboardingReviewService.test.ts`
  - `src/app/(admin)/subcontractors/approval/page.tsx` (error surface only if needed)

### Testing Requirements

- Validate successful artifact generation for both required doc classes.
- Validate finalization is blocked when artifact generation/storage fails.
- Validate actionable error messaging/logging behavior.

### References

- Epic source: `_bmad-output/planning-artifacts/epics.md`
- Existing onboarding services:
  - `src/lib/services/onboardingDocumentsService.ts`
  - `src/lib/services/onboardingReviewService.ts`
- Approval UI:
  - `src/app/(admin)/subcontractors/approval/page.tsx`
- Schema references:
  - `sql/07_media_audit_tables.sql`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story file bootstrapped from epic definition because `2-4-onboarding-compliance-artifact-generation.md` was missing in implementation artifacts.

### Implementation Plan

- Add compliance artifact generation service for PDF output + storage linkage.
- Integrate artifact generation into onboarding verification finalization.
- Add tests for success and blocked failure paths.

### Completion Notes List

- Added onboarding compliance artifact generation service:
  - derives required source docs (W-9 + insurance) from onboarding uploads
  - generates PDF artifacts with traceable context (contractor, source doc metadata, generation timestamp)
  - stores artifacts in `compliance-documents` bucket
  - writes linked `media_assets` records under `subcontractor_compliance_artifact` entity context
- Integrated artifact generation into super-admin onboarding finalization path:
  - verification (`decision: verified`) now requires artifact generation to succeed before status update
  - finalization is blocked when required source docs are incomplete
  - finalization is blocked when artifact generation/storage/linking fails
- Implemented actionable error handling:
  - generation/storage failures logged via `console.error` with subcontractor context
  - UI receives retry/support-safe error messaging from service
- Added Story 2.4 test coverage:
  - unit tests for artifact generation success, missing-required-doc block, and storage-failure block
  - onboarding review finalization test verifying approval blocked when artifact prerequisites are incomplete
- Validation results:
  - `npx vitest run` passed (11 files, 70 tests)
  - `npx tsc --noEmit` passed
  - `npx eslint` on changed files passed

### File List

- `_bmad-output/implementation-artifacts/2-4-onboarding-compliance-artifact-generation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/lib/services/onboardingComplianceArtifactService.ts`
- `src/lib/services/onboardingComplianceArtifactService.test.ts`
- `src/lib/services/onboardingReviewService.ts`
- `src/lib/services/onboardingReviewService.test.ts`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`

### Change Log

- 2026-02-12: Created Story 2.4 artifact from epic definition and set status to `in-progress`.
- 2026-02-12: Implemented Story 2.4 compliance artifact generation and moved status to `review`.
