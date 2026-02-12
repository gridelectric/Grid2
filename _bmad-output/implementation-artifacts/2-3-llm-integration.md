# Story 2.3: Super Admin Reviews and Verifies Onboarding

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Super Admin,
I want to review submitted onboarding packages and mark verification decisions,
so that only compliant contractors can access storm project features.

## Acceptance Criteria

1. **Given** a contractor onboarding package is pending  
   **When** I open the review screen  
   **Then** I can view profile details and required uploaded documents  
   **And** I can mark onboarding as verified or not verified.
2. **Given** contractor is not verified  
   **When** contractor attempts to access storm project features  
   **Then** access is denied  
   **And** the user is directed to complete or resolve onboarding.

## Tasks / Subtasks

- [x] Implement onboarding review/verification service contract (AC: 1)
  - [x] Add service method to list pending onboarding packages with profile details
  - [x] Add service method to collect required uploaded document status (W-9 + insurance)
  - [x] Add super-admin-only verification decision mutation (`verified` / `not verified`)

- [x] Wire admin onboarding approval UI to service (AC: 1)
  - [x] Replace mock onboarding approval data in `src/app/(admin)/subcontractors/approval/page.tsx` with service data
  - [x] Show profile details + required document status in review panel
  - [x] Hook approve/reject actions to verification mutation and refresh pending list

- [x] Enforce onboarding verification gate for contractor storm feature access (AC: 2)
  - [x] Add onboarding access helper for storm-feature path checks and resolution redirect
  - [x] Update `src/lib/supabase/middleware.ts` to block contractor access when onboarding not verified
  - [x] Redirect blocked contractors to onboarding resolution flow

- [x] Add automated tests and run regressions (AC: 1, 2)
  - [x] Add unit tests for onboarding review/verification service rules
  - [x] Add unit tests for onboarding access-path helper behavior
  - [x] Run `npx vitest run`, `npx tsc --noEmit`, and targeted `npx eslint` on changed files

## Dev Notes

### Story Requirements Context

- Story source: `_bmad-output/planning-artifacts/epics.md` under "Story 2.3: Super Admin Reviews and Verifies Onboarding".
- Story 2.1 + 2.2 already established contractor onboarding profile + compliance document uploads.

### Technical Requirements

- Pending onboarding review must include:
  - contractor profile details (name, email, phone, emergency contact)
  - required uploaded document statuses (W-9, insurance)
- Verification decisions:
  - `verified` should transition onboarding to approved/eligible
  - `not verified` should keep contractor blocked from storm features
- Storm project feature gate for contractor users should apply at server-side boundary (middleware path protection).

### Architecture Compliance

- Keep review/verification mutations in service layer.
- Keep server-side access gate in middleware to prevent protected data leakage.
- Reuse existing role source-of-truth (`profiles.role`) and onboarding state (`subcontractors.onboarding_status`).

### File Structure Requirements

- Add:
  - `src/lib/services/onboardingReviewService.ts`
  - `src/lib/services/onboardingReviewService.test.ts`
  - `src/lib/auth/onboardingAccess.ts`
  - `src/lib/auth/onboardingAccess.test.ts`
- Modify:
  - `src/app/(admin)/subcontractors/approval/page.tsx`
  - `src/lib/supabase/middleware.ts`

### Testing Requirements

- Verify super-admin-only verification mutation behavior.
- Verify pending package projection includes required document status outputs.
- Verify onboarding access helper path matching and redirect behavior for unverified contractors.

### References

- Epic source: `_bmad-output/planning-artifacts/epics.md`
- Admin review UI: `src/app/(admin)/subcontractors/approval/page.tsx`
- Existing onboarding services:
  - `src/lib/services/onboardingService.ts`
  - `src/lib/services/onboardingDocumentsService.ts`
- Middleware boundary: `src/lib/supabase/middleware.ts`
- DB contracts: `src/types/database.ts`, `sql/02_core_tables.sql`, `sql/07_media_audit_tables.sql`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story file bootstrapped from epic definition because `2-3-llm-integration.md` was missing in implementation artifacts.

### Implementation Plan

- Build onboarding review service for pending packages and verification decisions.
- Replace approval page mocks with service-backed data/actions.
- Add middleware onboarding verification gate for contractor storm-feature paths.
- Add tests and run full checks.

### Completion Notes List

- Added onboarding review service for super-admin-only workflow:
  - fetches pending onboarding packages with contractor profile details
  - derives required document statuses for W-9 and insurance from onboarding media uploads
  - supports verification decisions (`verified` -> `APPROVED`, `not_verified` -> `SUSPENDED`)
- Replaced onboarding approval page mock data with service-backed data/actions:
  - pending application list now loads from actual onboarding package query
  - review panel displays profile details and required document status outputs
  - approve/reject actions call verification mutation and refresh queue
- Added onboarding storm-feature access guard:
  - helper methods for contractor storm-feature path matching and resolution redirect
  - middleware now blocks contractor access to storm features when onboarding is not `APPROVED`
  - unverified contractors are redirected to `/review?reason=onboarding-required`
- Added onboarding resolution messaging on review page when redirected by gate.
- Validation results:
  - `npx vitest run` passed (10 files, 66 tests)
  - `npx tsc --noEmit` passed
  - `npx eslint` on changed files passed

### File List

- `_bmad-output/implementation-artifacts/2-3-llm-integration.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/lib/services/onboardingReviewService.ts`
- `src/lib/services/onboardingReviewService.test.ts`
- `src/lib/auth/onboardingAccess.ts`
- `src/lib/auth/onboardingAccess.test.ts`
- `src/app/(admin)/subcontractors/approval/page.tsx`
- `src/lib/supabase/middleware.ts`
- `src/app/(onboarding)/review/page.tsx`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`

### Change Log

- 2026-02-12: Created Story 2.3 artifact from epic definition and set status to `in-progress`.
- 2026-02-12: Implemented Story 2.3 onboarding review/verification and access gating; moved status to `review`.
