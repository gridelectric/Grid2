# Story 11.2: Equipment Catalog

Status: review

## Story

As a subcontractor and admin reviewer,
I want DB-backed equipment and wire-size selectors with assessment review tooling,
so that assessments are standardized and review decisions are operationally actionable.

## Acceptance Criteria

1. **Given** assessment equipment entry requirements  
   **When** a subcontractor selects equipment  
   **Then** an `EquipmentSelect` component provides searchable catalog options.
2. **Given** wire details requirements  
   **When** wire size is needed  
   **Then** a `WireSizeSelect` component provides grouped selectable wire sizes.
3. **Given** Supabase catalog tables (`equipment_types`, `wire_sizes`)  
   **When** selectors load options  
   **Then** options are fetched from DB-backed services with resilient mapping.
4. **Given** admin quality control requirements  
   **When** admins open assessment review  
   **Then** they can filter assessments and approve/request rework through an assessment review UI.

## Tasks / Subtasks

- [x] Create `EquipmentSelect` component (AC: 1)
  - [x] Add search + select workflow with catalog fetch.
  - [x] Return selected equipment metadata to parent form.
- [x] Create `WireSizeSelect` component (AC: 2)
  - [x] Add search + grouped dropdown (AWG, kcmil, Other).
  - [x] Return selected wire size metadata to parent form.
- [x] Integrate equipment types from DB (AC: 3)
  - [x] Add `assessmentCatalogService` for equipment + wire catalog loading.
  - [x] Wire selectors into `EquipmentAssessment` in `AssessmentForm` flow.
- [x] Create assessment review UI (AC: 4)
  - [x] Add `assessmentReviewService` for list/review operations.
  - [x] Add `AssessmentReviewList` with filters, summary cards, single/batch decisions.
  - [x] Add admin routes for review page and alias.
- [x] Add tests and validations
  - [x] Add `assessmentCatalogService` tests.
  - [x] Add `assessmentReviewService` tests.
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 11 Task 11.2 only.
- Leave Week 12 invoicing/reporting tasks untouched.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 11 Task 11.2)
- `grid-electric-docs/10-IMPLEMENTATION-CHECKLIST.md` (Sections 5.2 and 5.3)
- `grid-electric-docs/03-WIREFRAMES.md` (SC7 Damage Assessment context)
- `sql/05_assessment_tables.sql` (`equipment_types`, `wire_sizes`, `damage_assessments`)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added catalog services and selectors for equipment/wire-size integration.
- 2026-02-12: Integrated selectors into assessment form equipment workflow.
- 2026-02-12: Added admin assessment review service/UI and routes.
- 2026-02-12: Validation passed:
  - `npx vitest run` (41 files, 198 tests)
  - `npx tsc --noEmit`
  - targeted `npx eslint` on changed files

### Completion Notes List

- Added `src/lib/services/assessmentCatalogService.ts` with robust DB mapping/filtering for:
  - `equipment_types`
  - `wire_sizes`
- Added selectors:
  - `src/components/features/assessments/EquipmentSelect.tsx`
  - `src/components/features/assessments/WireSizeSelect.tsx`
- Updated assessment equipment flow:
  - `src/components/features/assessments/EquipmentAssessment.tsx`
  - `src/components/features/assessments/AssessmentForm.tsx`
  - `src/components/features/assessments/assessmentFormTypes.ts`
  - `src/lib/services/assessmentSubmissionService.ts`
- Added admin review foundations:
  - `src/lib/services/assessmentReviewService.ts`
  - `src/components/features/assessments/AssessmentReviewList.tsx`
  - `src/app/(admin)/assessment-review/page.tsx`
  - `src/app/(admin)/admin/assessment-review/page.tsx`

### File List

- `_bmad-output/implementation-artifacts/11-2-equipment-catalog.md`
- `src/lib/services/assessmentCatalogService.ts`
- `src/lib/services/assessmentCatalogService.test.ts`
- `src/lib/services/assessmentReviewService.ts`
- `src/lib/services/assessmentReviewService.test.ts`
- `src/components/features/assessments/EquipmentSelect.tsx`
- `src/components/features/assessments/WireSizeSelect.tsx`
- `src/components/features/assessments/AssessmentReviewList.tsx`
- `src/components/features/assessments/EquipmentAssessment.tsx`
- `src/components/features/assessments/AssessmentForm.tsx`
- `src/components/features/assessments/assessmentFormTypes.ts`
- `src/components/features/assessments/index.ts`
- `src/lib/services/assessmentSubmissionService.ts`
- `src/lib/db/dexie.ts`
- `src/app/(admin)/assessment-review/page.tsx`
- `src/app/(admin)/admin/assessment-review/page.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 11.2 implemented and moved to `review`.
