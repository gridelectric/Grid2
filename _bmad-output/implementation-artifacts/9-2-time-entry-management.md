# Story 9.2: Time Entry Management

Status: review

## Story

As an operations team member or field subcontractor,
I want structured time entry history, calculation rollups, and admin review controls,
so that labor records can be audited and approved accurately.

## Acceptance Criteria

1. **Given** subcontractor time history needs
   **When** users open the time tracking experience
   **Then** a `TimeEntryList` component is available for filtered entry history.
2. **Given** individual time records
   **When** users view an entry in detail
   **Then** a `TimeEntryCard` component presents status, timing, and billing values.
3. **Given** multiple entries with varying durations
   **When** entries are aggregated
   **Then** total minutes, billable minutes, and billable amount calculations are computed consistently.
4. **Given** pending time entries for operations review
   **When** an admin processes entries
   **Then** approve/reject actions are available, including batch actions and rejection reason enforcement.

## Tasks / Subtasks

- [x] Create `TimeEntryList` component (AC: 1)
  - [x] Add filtering controls (search, status, date range).
  - [x] Add summary metrics for count/time/amount/pending.
  - [x] Add desktop table + mobile card rendering.
- [x] Create `TimeEntryCard` component (AC: 2)
  - [x] Display ticket/subcontractor context, status, timing, sync state.
  - [x] Display work type, durations, and billable amount.
  - [x] Add optional review/select controls for admin mode.
- [x] Implement time calculations (AC: 3)
  - [x] Add reusable amount and summary calculation helpers.
  - [x] Add entry total/billable resolution for persisted vs computed values.
  - [x] Add unit coverage for calculations.
- [x] Create admin time review interface (AC: 4)
  - [x] Add `timeEntryManagementService` list + review methods.
  - [x] Add `app/(admin)/time-review/page.tsx`.
  - [x] Add single + batch approve/reject flows with required reject reason.
- [x] Integrate subcontractor history
  - [x] Add `TimeEntryList` under subcontractor `TimeClock` page.
- [x] Add tests and run validations
  - [x] Add service tests for remote/local listing + review behavior.
  - [x] Extend calculation tests for summary/amount resolution.
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 9 Task 9.2 only.
- Do not start Week 10 expense features in this story.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 9 Task 9.2)
- `grid-electric-docs/03-WIREFRAMES.md` (AD10 Time Review)
- `grid-electric-docs/05-API-SPECIFICATIONS.md` (Time Tracking 5.3-5.5)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added `timeEntryManagementService` for list/review workflows with offline subcontractor fallback.
- 2026-02-12: Added `TimeEntryList` + `TimeEntryCard` components for history and review UX.
- 2026-02-12: Added aggregated time/billing calculation utilities and tests.
- 2026-02-12: Validation passed:
  - `npx vitest run` (33 files, 166 tests)
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Added `src/lib/services/timeEntryManagementService.ts` for:
  - time-entry list retrieval with filters
  - subcontractor local fallback when offline or remote fetch fails
  - admin review mutations (approve/reject)
- Added `src/components/features/time-tracking/TimeEntryList.tsx` with:
  - search/status/date filtering
  - summary rollups (entries/time/billable/pending)
  - admin batch selection and approve/reject actions
  - desktop table and mobile card views
- Added `src/components/features/time-tracking/TimeEntryCard.tsx` for reusable per-entry presentation and optional review controls.
- Updated `src/app/(subcontractor)/time/page.tsx` to include entry history management below `TimeClock`.
- Added `src/app/(admin)/time-review/page.tsx` for dedicated admin time review.
- Added portal-prefixed route aliases for nav compatibility:
  - `src/app/(subcontractor)/subcontractor/time/page.tsx`
  - `src/app/(admin)/admin/time-review/page.tsx`
- Extended `src/lib/utils/timeTracking.ts` with amount and summary helpers; expanded tests.

### File List

- `_bmad-output/implementation-artifacts/9-2-time-entry-management.md`
- `src/lib/services/timeEntryManagementService.ts`
- `src/lib/services/timeEntryManagementService.test.ts`
- `src/components/features/time-tracking/TimeEntryList.tsx`
- `src/components/features/time-tracking/TimeEntryCard.tsx`
- `src/components/features/time-tracking/index.ts`
- `src/lib/utils/timeTracking.ts`
- `src/lib/utils/timeTracking.test.ts`
- `src/app/(subcontractor)/time/page.tsx`
- `src/app/(admin)/time-review/page.tsx`
- `src/app/(subcontractor)/subcontractor/time/page.tsx`
- `src/app/(admin)/admin/time-review/page.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 9.2 implemented and moved to `review`.
