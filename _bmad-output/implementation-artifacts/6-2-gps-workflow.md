# Story 6.2: GPS Workflow

Status: review

## Story

As a field operations user,
I want reliable GPS validation and route optimization support,
so that location-dependent workflows can enforce geofence requirements and improve dispatch efficiency.

## Acceptance Criteria

1. **Given** a ticket with geofence center/radius  
   **When** a GPS reading is captured  
   **Then** geofence validation runs against a 500m default radius  
   **And** the result returns within/outside status with measured distance.
2. **Given** GPS readings may have poor precision  
   **When** validation runs  
   **Then** low-accuracy readings are flagged using configured accuracy thresholds  
   **And** UI feedback explains whether retry is needed.
3. **Given** multiple ticket coordinates are available  
   **When** route optimization is requested  
   **Then** an optimized visitation order is produced  
   **And** route view UI renders resulting sequence and path summary.
4. **Given** map workflows consume GPS/route state  
   **When** pages render  
   **Then** reusable hook/service abstractions are used (`useGPSValidation`, route optimization service).

## Tasks / Subtasks

- [x] Implement geofencing workflow utilities (AC: 1, 2)
  - [x] Reuse and compose existing GPS/geofence validators for workflow-level evaluation.
  - [x] Add utility helpers for GPS accuracy + geofence status output.
  - [x] Add unit tests covering within/outside/low-accuracy cases.
- [x] Create GPS validation hook (AC: 1, 2, 4)
  - [x] Add `useGPSValidation` hook for current position capture and validation state.
  - [x] Support manual refresh and actionable error states.
  - [x] Keep hook reusable for Week 6.3 status transitions.
- [x] Implement route optimization service (AC: 3, 4)
  - [x] Add route optimization utility/service for coordinate ordering.
  - [x] Return optimized stops, route coordinates, and distance summary.
  - [x] Add unit tests for deterministic route ordering and edge cases.
- [x] Create route view UI wiring (AC: 3)
  - [x] Integrate optimized route view in map workflow page.
  - [x] Show sequence summary and recalculation trigger.
  - [x] Keep UI scoped to Week 6.2 (no status transition workflow yet).
- [x] Run tests and validations (AC: 1-4)
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement only Week 6 Task 6.2.
- Do not implement status transition workflow logic (Task 6.3).

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 6 Task 6.2)
- `grid-electric-docs/09-DATA-FLOW-ANALYSIS.md` (geofence validation)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Story created and set to `in-progress` for active implementation.
- 2026-02-12: Added GPS workflow utility composition over existing validators.
- 2026-02-12: Added reusable `useGPSValidation` hook for geolocation + geofence evaluation.
- 2026-02-12: Added route optimization service and integrated route view UI in admin map page.
- 2026-02-12: Validation passed:
  - `npx vitest run` (17 files, 95 tests)
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Implemented geofencing workflow utility composition in `src/lib/utils/gpsWorkflow.ts`.
- Added reusable GPS validation hook in `src/hooks/useGPSValidation.ts` for current-position checks and actionable status/error handling.
- Implemented nearest-neighbor route optimization service in `src/lib/services/routeOptimizationService.ts`.
- Integrated route view UI in admin map page:
  - route optimization toggle
  - optimized stop sequence
  - estimated route distance
- Integrated GPS/geofence validation UI in subcontractor map page:
  - manual validation trigger
  - geofence within/outside result
  - distance and accuracy feedback
- Added unit test coverage for new GPS workflow and route optimization logic.

### File List

- `_bmad-output/implementation-artifacts/6-2-gps-workflow.md`
- `src/lib/utils/gpsWorkflow.ts`
- `src/lib/utils/gpsWorkflow.test.ts`
- `src/hooks/useGPSValidation.ts`
- `src/lib/services/routeOptimizationService.ts`
- `src/lib/services/routeOptimizationService.test.ts`
- `src/app/(admin)/map/page.tsx`
- `src/app/(subcontractor)/map/page.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Created Story 6.2 and set status to `in-progress`.
- 2026-02-12: Implemented Story 6.2 GPS workflow, route optimization, and route-view wiring; moved to `review`.
