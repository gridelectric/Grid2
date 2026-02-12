# Story 2.1: Contractor Completes Core Onboarding Profile

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Contractor,
I want to submit my required onboarding profile information,
so that I can enter the readiness review process.

## Acceptance Criteria

1. **Given** I am an authenticated contractor without verified onboarding  
   **When** I complete and submit required fields (name, phone, email, emergency contact)  
   **Then** the onboarding profile is saved  
   **And** my status is set to pending verification.
2. **Given** required fields are missing or invalid  
   **When** I attempt submission  
   **Then** submission is blocked  
   **And** field-level validation errors are shown.

## Tasks / Subtasks

- [x] Implement core onboarding profile validation contract (AC: 1, 2)
  - [x] Add shared schema for required fields: first name, last name, email, phone, emergency contact name, emergency contact phone
  - [x] Enforce field-level validation messages in onboarding profile UI

- [x] Implement authenticated contractor onboarding profile submission (AC: 1)
  - [x] Add onboarding service method to submit core profile data
  - [x] Enforce contractor-only submission and block verified users
  - [x] Persist profile details and onboarding status as pending verification

- [x] Wire profile submission into onboarding form flow (AC: 1, 2)
  - [x] Update `src/components/features/onboarding/PersonalInfoForm.tsx` to capture emergency contact fields
  - [x] Submit validated payload through onboarding service and surface clear error feedback

- [x] Add automated tests and run regressions (AC: 1, 2)
  - [x] Add unit tests for validation and authorization/business rules
  - [x] Run `npx vitest run`, `npx tsc --noEmit`, and targeted `npx eslint` on changed files

## Dev Notes

### Story Requirements Context

- Story source: `_bmad-output/planning-artifacts/epics.md` under "Story 2.1: Contractor Completes Core Onboarding Profile".
- Existing onboarding route/component scaffolding already exists under `src/app/(onboarding)` and `src/components/features/onboarding`.

### Technical Requirements

- Required onboarding profile fields for this story:
  - Name (first + last)
  - Phone
  - Email
  - Emergency contact (name + phone)
- Submission must require authenticated `CONTRACTOR` role and reject non-contractor access.
- Submission must block users with verified onboarding state.
- Successful submission must persist profile data and set onboarding status to pending verification (`PENDING`).

### Architecture Compliance

- Keep core write logic in service layer, not directly in UI rendering.
- Reuse existing Supabase client and role source-of-truth in `profiles.role`.
- Preserve existing onboarding flow and route structure; apply minimal change needed for Story 2.1.

### File Structure Requirements

- Add:
  - `src/lib/schemas/onboarding.ts`
  - `src/lib/services/onboardingService.ts`
  - `src/lib/services/onboardingService.test.ts`
- Modify:
  - `src/components/features/onboarding/PersonalInfoForm.tsx`
  - `src/components/providers/OnboardingProvider.tsx`

### Testing Requirements

- Validate required-field and invalid input behavior.
- Validate contractor-only and unverified-only submission rules.
- Validate status assignment to pending verification on successful submit.

### References

- Epic source: `_bmad-output/planning-artifacts/epics.md`
- Onboarding provider/form files:
  - `src/components/providers/OnboardingProvider.tsx`
  - `src/components/features/onboarding/PersonalInfoForm.tsx`
- Auth context and role source:
  - `src/components/providers/AuthProvider.tsx`
  - `src/lib/supabase/middleware.ts`
- Database contracts:
  - `src/types/database.ts`
  - `sql/02_core_tables.sql`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story file bootstrapped from epic definition because `2-1-personality-system.md` was missing in implementation artifacts.

### Implementation Plan

- Add a shared schema for core onboarding profile validation.
- Implement onboarding service submission with role/state enforcement and Supabase persistence.
- Wire Personal Info form to include emergency contact and call submission service.
- Add unit tests and run full validation checks.

### Completion Notes List

- Added `coreOnboardingProfileSchema` with required profile + emergency contact fields and reused shared validators.
- Added `submitCoreOnboardingProfile` service:
  - requires authenticated user
  - allows contractor role only
  - blocks already-verified (`APPROVED`) onboarding records
  - writes profile updates and persists subcontractor onboarding status as `PENDING`
- Updated personal info onboarding form:
  - added emergency contact name/phone fields
  - submits through onboarding service
  - surfaces field-level and submission-level errors
- Updated onboarding provider step calculation to derived path-based state to satisfy hook/lint constraints.
- Added Story 2.1 unit tests covering:
  - schema required-field behavior
  - auth/role/verified-state gating
  - insert vs update persistence paths
- Validation results:
  - `npx vitest run` passed (7 files, 46 tests)
  - `npx tsc --noEmit` passed
  - `npx eslint` on changed files passed

### File List

- `_bmad-output/implementation-artifacts/2-1-personality-system.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/lib/schemas/onboarding.ts`
- `src/lib/services/onboardingService.ts`
- `src/lib/services/onboardingService.test.ts`
- `src/components/features/onboarding/PersonalInfoForm.tsx`
- `src/components/providers/OnboardingProvider.tsx`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`

### Change Log

- 2026-02-12: Created Story 2.1 artifact from epic definition and set status to `in-progress`.
- 2026-02-12: Implemented Story 2.1 core onboarding profile submission, added tests, and moved status to `review`.
