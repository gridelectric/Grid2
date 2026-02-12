# Story 9.1: Time Clock

Status: review

## Story

As a field subcontractor,
I want a GPS-verified time clock workflow with active timer visibility,
so that I can reliably clock in/out and keep compliant time records in low-connectivity conditions.

## Acceptance Criteria

1. **Given** subcontractors in the field  
   **When** they open time tracking  
   **Then** a dedicated `TimeClock` page and component are available.
2. **Given** a clock-in or clock-out action  
   **When** the action is submitted  
   **Then** fresh GPS validation is required and invalid readings are blocked.
3. **Given** an active shift  
   **When** time is running  
   **Then** an `ActiveTimer` component displays elapsed time and warning/exceeded thresholds.
4. **Given** multiple work types  
   **When** a subcontractor starts a shift  
   **Then** a `WorkTypeSelector` component is available for choosing the work type.

## Tasks / Subtasks

- [x] Create time tracking page and core component (AC: 1)
  - [x] Add `app/(subcontractor)/time/page.tsx`.
  - [x] Add `components/features/time-tracking/TimeClock.tsx`.
  - [x] Wire component exports through `components/features/time-tracking/index.ts`.
- [x] Implement GPS-verified clock in/out workflow (AC: 2)
  - [x] Reuse `useGPSValidation` to validate clock-in/out attempts.
  - [x] Add online/offline-capable clock logic with local queue fallback.
  - [x] Add `timeEntryService` for active entry lookup + clock actions.
- [x] Create ActiveTimer component (AC: 3)
  - [x] Add timer component with warning/exceeded threshold visuals.
  - [x] Add reusable time-tracking utility helpers for elapsed state.
- [x] Create WorkTypeSelector component (AC: 4)
  - [x] Add selectable work-type component and options definitions.
  - [x] Integrate selector into `TimeClock` workflow.
- [x] Add tests and run validations
  - [x] Add unit tests for time-tracking utilities.
  - [x] Add service tests for clock-in/out and offline queue behavior.
  - [x] Add work-type option test coverage.
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 9 Task 9.1 only.
- Do not implement Week 9 Task 9.2 list/review interfaces in this story.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 9 Task 9.1)
- `grid-electric-docs/10-IMPLEMENTATION-CHECKLIST.md` (time tracking validation requirements)
- `grid-electric-docs/07-OFFLINE-PWA-STRATEGY.md` (offline queue/sync expectations)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added subcontractor time-tracking page and `TimeClock` experience.
- 2026-02-12: Added offline-capable `timeEntryService` with queue fallback for clock-in/out.
- 2026-02-12: Added `ActiveTimer` and reusable time-tracking duration helpers.
- 2026-02-12: Added `WorkTypeSelector` and work-type options module.
- 2026-02-12: Validation passed:
  - `npx vitest run` (32 files, 156 tests)
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Added `src/app/(subcontractor)/time/page.tsx` with a dedicated subcontractor time-tracking route.
- Added `src/components/features/time-tracking/TimeClock.tsx` with:
  - GPS-gated clock-in/clock-out actions
  - active-entry and last-entry summaries
  - work type/rate/break input controls
- Added `src/lib/services/timeEntryService.ts` for:
  - active entry lookup (local-first, online fallback)
  - online-first clock in/out with local queue fallback
  - duration and billable-minute calculations
- Added `src/components/features/time-tracking/ActiveTimer.tsx`.
- Added `src/components/features/time-tracking/WorkTypeSelector.tsx` and `src/components/features/time-tracking/workTypeOptions.ts`.
- Added tests:
  - `src/lib/utils/timeTracking.test.ts`
  - `src/lib/services/timeEntryService.test.ts`
  - `src/components/features/time-tracking/WorkTypeSelector.test.ts`

### File List

- `_bmad-output/implementation-artifacts/9-1-time-clock.md`
- `src/app/(subcontractor)/time/page.tsx`
- `src/components/features/time-tracking/TimeClock.tsx`
- `src/components/features/time-tracking/ActiveTimer.tsx`
- `src/components/features/time-tracking/WorkTypeSelector.tsx`
- `src/components/features/time-tracking/workTypeOptions.ts`
- `src/components/features/time-tracking/index.ts`
- `src/components/features/time-tracking/WorkTypeSelector.test.ts`
- `src/lib/services/timeEntryService.ts`
- `src/lib/services/timeEntryService.test.ts`
- `src/lib/utils/timeTracking.ts`
- `src/lib/utils/timeTracking.test.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 9.1 implemented and moved to `review`.
