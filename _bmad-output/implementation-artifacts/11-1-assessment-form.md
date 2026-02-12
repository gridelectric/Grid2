# Story 11.1: Assessment Form

Status: review

## Story

As a subcontractor in the field,
I want a structured damage assessment form with safety, equipment, damage, and photo sections,
so that I can submit complete assessment evidence tied to a ticket.

## Acceptance Criteria

1. **Given** an in-scope ticket assessment workflow  
   **When** a subcontractor opens the assessment screen  
   **Then** an `AssessmentForm` is available to capture and submit the required sections.
2. **Given** safety observation requirements  
   **When** the form is completed  
   **Then** a `SafetyChecklist` component captures all safety flags.
3. **Given** equipment damage reporting requirements  
   **When** equipment is evaluated  
   **Then** an `EquipmentAssessment` component supports multiple equipment entries and condition details.
4. **Given** classification and recommendation requirements  
   **When** assessment details are entered  
   **Then** a `DamageClassification` component captures cause, priority, and repair recommendation fields.
5. **Given** photo evidence requirements  
   **When** photos are captured  
   **Then** `PhotoGallery` integration is present and required-photo validation is enforced before submit.

## Tasks / Subtasks

- [x] Create `AssessmentForm` component (AC: 1)
  - [x] Orchestrate safety, equipment, damage, and photo sections.
  - [x] Add submit validation for ticket context, equipment item presence, and required photo coverage.
  - [x] Submit through assessment service with online/offline behavior.
- [x] Create `SafetyChecklist` component (AC: 2)
  - [x] Add all required safety observation flags.
  - [x] Wire controlled state updates for checklist values.
- [x] Create `EquipmentAssessment` component (AC: 3)
  - [x] Add multi-item equipment editor with add/remove actions.
  - [x] Capture type, condition, tags, description, and replacement requirement.
- [x] Create `DamageClassification` component (AC: 4)
  - [x] Capture cause, weather, repair hours, priority, immediate actions, recommendation, and cost.
- [x] Integrate `PhotoGallery`/photo flow (AC: 5)
  - [x] Reuse existing `PhotoCapture` + `PhotoGallery` integration.
  - [x] Enforce minimum photos and required types before submission.
- [x] Add submission service + route wiring
  - [x] Add `assessmentSubmissionService` with remote create and local queue fallback.
  - [x] Add subcontractor assessment create route and ticket entry-point link.
- [x] Add tests and run validations
  - [x] Add unit tests for assessment submission service behavior.
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` for changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 11 Task 11.1 only.
- Do not start Week 11 Task 11.2 equipment catalog integration/review UI.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 11 Task 11.1)
- `grid-electric-docs/03-WIREFRAMES.md` (SC7 Damage Assessment Form)
- `grid-electric-docs/01-TECHNICAL-PRD.md` (Section 5.5 Damage Assessment Forms)
- `sql/05_assessment_tables.sql` (`damage_assessments`, `equipment_assessments`)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added Week 11 assessment form components and draft types.
- 2026-02-12: Added `assessmentSubmissionService` with online-first create and offline queue fallback.
- 2026-02-12: Added subcontractor assessment create route and wired ticket details assessment launch link.
- 2026-02-12: Validation passed:
  - `npx vitest run` (39 files, 191 tests)
  - `npx tsc --noEmit`
  - targeted `npx eslint` on changed files

### Completion Notes List

- Added `AssessmentForm`, `SafetyChecklist`, `EquipmentAssessment`, and `DamageClassification` in `src/components/features/assessments/`.
- Reused and integrated existing `PhotoCapture`/`PhotoGallery` photo workflow into assessment submission.
- Added `src/lib/services/assessmentSubmissionService.ts`:
  - remote insert into `damage_assessments` and `equipment_assessments`
  - offline fallback to IndexedDB + sync queue when offline/remote failure
- Added subcontractor assessment create route:
  - `src/app/(subcontractor)/assessments/create/page.tsx`
  - `src/app/(subcontractor)/subcontractor/assessments/create/page.tsx`
- Updated ticket details tab to launch assessment form with ticket context.

### File List

- `_bmad-output/implementation-artifacts/11-1-assessment-form.md`
- `src/components/features/assessments/assessmentFormTypes.ts`
- `src/components/features/assessments/SafetyChecklist.tsx`
- `src/components/features/assessments/EquipmentAssessment.tsx`
- `src/components/features/assessments/DamageClassification.tsx`
- `src/components/features/assessments/AssessmentForm.tsx`
- `src/components/features/assessments/index.ts`
- `src/lib/services/assessmentSubmissionService.ts`
- `src/lib/services/assessmentSubmissionService.test.ts`
- `src/lib/db/dexie.ts`
- `src/app/(subcontractor)/assessments/create/page.tsx`
- `src/app/(subcontractor)/subcontractor/assessments/create/page.tsx`
- `src/app/tickets/[id]/page.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 11.1 implemented and moved to `review`.
