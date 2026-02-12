# Story 6.3: Status Update Flow

Status: review

## Story

As a field subcontractor,
I want a GPS-validated 3-step status workflow with a mobile-first map experience,
so that I can update tickets from In Route to On Site to Complete with location integrity.

## Acceptance Criteria

1. **Given** an assigned ticket in field workflow  
   **When** the subcontractor progresses the ticket  
   **Then** the status flow supports `IN_ROUTE -> ON_SITE -> COMPLETE`.
2. **Given** a status update is attempted  
   **When** transition is submitted  
   **Then** a fresh GPS validation is required before update  
   **And** geofence checks are enforced for on-site/completion transitions.
3. **Given** subcontractors use phones in the field  
   **When** viewing map workflows on mobile  
   **Then** a full-screen map view is available for ticket navigation/status context.
4. **Given** workflow logic is introduced  
   **When** tests run  
   **Then** utility coverage validates status transition behavior.

## Tasks / Subtasks

- [x] Implement field status flow utility (AC: 1)
  - [x] Add reusable transition helper for `ASSIGNED -> IN_ROUTE -> ON_SITE -> COMPLETE`.
  - [x] Add tests for transition mapping and status inclusion checks.
- [x] Enforce GPS checks during status updates (AC: 2)
  - [x] Require GPS payload for field-role updates to `IN_ROUTE`, `ON_SITE`, `COMPLETE`.
  - [x] Validate geofence for `ON_SITE` and `COMPLETE`.
  - [x] Expose async GPS capture in hook for transition flows.
- [x] Build subcontractor status UI flow (AC: 1, 2)
  - [x] Add status flow component with action button + GPS validation feedback.
  - [x] Wire component into subcontractor map page and refresh ticket state on success.
- [x] Add full-screen mobile map mode (AC: 3)
  - [x] Add mobile full-screen map entrypoint from subcontractor map page.
  - [x] Preserve marker selection/geofence context in full-screen mode.
- [x] Run validations and update trackers (AC: 4)
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 6 Task 6.3 only.
- Do not implement Week 7 photo-capture requirements in this story.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 6 Task 6.3)
- `grid-electric-docs/09-DATA-FLOW-ANALYSIS.md` Section 1 (field lifecycle)
- `grid-electric-docs/08-PROJECT-ROADMAP.md` Week 6 (mobile map deliverable)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Story initialized and moved to `in-progress`.
- 2026-02-12: Added dedicated field status workflow utility and unit coverage.
- 2026-02-12: Added async GPS capture API (`refreshAndValidate`) for transition-time checks.
- 2026-02-12: Enforced GPS + geofence validation in ticket status service for field roles.
- 2026-02-12: Added subcontractor map status flow UI and mobile full-screen map mode.
- 2026-02-12: Validation passed:
  - `npx vitest run` (18 files, 102 tests)
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Implemented reusable 3-step field transition helper in `src/lib/utils/statusUpdateFlow.ts`.
- Added test coverage for field transition rules in `src/lib/utils/statusUpdateFlow.test.ts`.
- Extended `useGPSValidation` with async `refreshAndValidate()` to force fresh location capture before updates.
- Enforced GPS requirements in `ticketService.updateTicketStatus` for field-role transitions to `IN_ROUTE`, `ON_SITE`, and `COMPLETE`, including geofence checks for on-site/completion.
- Added `StatusUpdateFlow` UI component for subcontractor ticket progression with GPS-validated updates and location feedback.
- Integrated status flow and full-screen mobile map mode into subcontractor map page.
- Updated ticket detail page to prevent non-GPS status updates by field users outside map workflow.
- Expanded contractor transition rules to support `ON_SITE -> COMPLETE` in the 3-status field flow.

### File List

- `_bmad-output/implementation-artifacts/6-3-status-update-flow.md`
- `src/lib/utils/statusUpdateFlow.ts`
- `src/lib/utils/statusUpdateFlow.test.ts`
- `src/hooks/useGPSValidation.ts`
- `src/lib/services/ticketService.ts`
- `src/lib/utils/statusTransitions.ts`
- `src/lib/utils/statusTransitions.test.ts`
- `src/components/features/tickets/StatusUpdateFlow.tsx`
- `src/app/(subcontractor)/map/page.tsx`
- `src/app/tickets/[id]/page.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story created and set to `in-progress`.
- 2026-02-12: Implemented GPS-validated 3-status flow + full-screen mobile map mode and moved to `review`.
