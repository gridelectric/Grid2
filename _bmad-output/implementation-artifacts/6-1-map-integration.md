# Story 6.1: Map Integration

Status: review

## Story

As a Super Admin,
I want map-based ticket and route visualization components,
so that I can see location context before dispatch and assignment actions.

## Acceptance Criteria

1. **Given** a valid `NEXT_PUBLIC_MAPBOX_TOKEN`  
   **When** the map view is loaded  
   **Then** a Mapbox GL map renders successfully  
   **And** the map can be panned/zoomed without runtime errors.
2. **Given** ticket coordinate data is provided  
   **When** the map is displayed  
   **Then** ticket markers render using a reusable `TicketMarkers` component  
   **And** marker interactions expose ticket context for follow-up actions.
3. **Given** route and geofence geometry is provided  
   **When** overlays are enabled  
   **Then** route lines render via `RouteOverlay`  
   **And** geofence boundaries render via `GeofenceCircle`.
4. **Given** map primitives are implemented  
   **When** developers build Week 6+ workflows  
   **Then** `MapView`, `TicketMarkers`, `RouteOverlay`, and `GeofenceCircle` are reusable from `src/components/features/map/`.

## Tasks / Subtasks

- [x] Integrate Mapbox GL foundation (AC: 1)
  - [x] Add/verify Mapbox client integration pattern for App Router pages.
  - [x] Implement base `MapView` component with typed props and safe fallback state.
  - [x] Validate token-missing behavior with actionable UI error.
- [x] Build ticket marker rendering primitive (AC: 2)
  - [x] Create `TicketMarkers` component for map marker rendering.
  - [x] Support click/selection callback contract for ticket context.
  - [x] Add minimal marker styling aligned with design system.
- [x] Build route and geofence overlays (AC: 3)
  - [x] Create `RouteOverlay` component for polyline rendering.
  - [x] Create `GeofenceCircle` component for radius-based boundaries.
  - [x] Ensure overlays are optional/toggleable through component props.
- [x] Add automated tests and checks (AC: 1-4)
  - [x] Add unit tests for prop validation and rendering guards.
  - [x] Run `npx vitest run`, `npx tsc --noEmit`, and targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement only Week 6 Task 6.1 map integration primitives.
- Do not implement geofence validation logic (Week 6 Task 6.2).
- Do not implement status transition workflow (Week 6 Task 6.3).

### Technical Requirements

- Map provider: Mapbox GL JS.
- Component location: `src/components/features/map/`.
- Required components:
  - `MapView.tsx`
  - `TicketMarkers.tsx`
  - `RouteOverlay.tsx`
  - `GeofenceCircle.tsx`
- Ensure mobile + desktop rendering parity (iPad/desktop first).

### Architecture / Project Notes

- Reuse existing auth/route boundaries; map components remain feature-level UI primitives.
- Keep Mapbox token usage behind environment variable checks.
- Avoid introducing dependencies beyond project baseline unless approved.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Phase 2, Week 6, Task 6.1)
- `grid-electric-docs/05-API-SPECIFICATIONS.md` (Mapbox section)
- `grid-electric-docs/03-WIREFRAMES.md` (map-related screens)
- `grid-electric-docs/04-DESIGN-SYSTEM.md` (styling and interaction consistency)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Story created as part of sprint tracker re-baseline after approved Correct Course proposal.
- 2026-02-12: `npx vitest run` passed (15 files, 84 tests).
- 2026-02-12: `npx tsc --noEmit` passed.
- 2026-02-12: Targeted `npx eslint` on map + route files passed.

### Completion Notes List

- Implemented reusable map feature primitives in `src/components/features/map/`:
  - `MapView` map initialization, token guard, and overlay composition.
  - `TicketMarkers` geojson marker source/layer rendering with click-selection callback.
  - `RouteOverlay` polyline source/layer rendering for route visualization.
  - `GeofenceCircle` polygon source/layer rendering for geofence boundaries.
- Added admin and subcontractor map pages:
  - `src/app/(admin)/map/page.tsx`
  - `src/app/(subcontractor)/map/page.tsx`
- Added map-focused unit coverage for prop validation and rendering guards.
- Updated subcontractor sidebar navigation to include map route.

### File List

- `_bmad-output/implementation-artifacts/6-1-map-integration.md`
- `src/components/features/map/types.ts`
- `src/components/features/map/MapView.tsx`
- `src/components/features/map/TicketMarkers.tsx`
- `src/components/features/map/RouteOverlay.tsx`
- `src/components/features/map/GeofenceCircle.tsx`
- `src/components/features/map/index.ts`
- `src/components/features/map/MapView.test.ts`
- `src/components/features/map/TicketMarkers.test.ts`
- `src/components/features/map/RouteOverlay.test.ts`
- `src/components/features/map/GeofenceCircle.test.ts`
- `src/app/(admin)/map/page.tsx`
- `src/app/(subcontractor)/map/page.tsx`
- `src/components/common/layout/navigationConfig.ts`
- `src/components/common/layout/Sidebar.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Created Story 6.1 and marked as `ready-for-dev` to unblock `dev-story`.
- 2026-02-12: Implemented Week 6 Task 6.1 map integration components/pages with tests and moved status to `review`.
