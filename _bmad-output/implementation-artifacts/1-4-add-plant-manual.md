# Story 1.4: Role-Based Authorization and Admin Capability Boundaries

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system user,
I want strict role-based access enforcement,
so that each role only sees and performs permitted actions.

## Acceptance Criteria

1. **Given** I am logged in as Contractor  
   **When** I access admin-only routes or actions  
   **Then** access is denied  
   **And** protected data is not returned.
2. **Given** I am logged in as Admin  
   **When** I access dashboards, tickets, and assessments  
   **Then** I can view permitted operational data  
   **And** create/edit actions for storm projects, ticket entry, and contractor assignment are blocked.
3. **Given** I am logged in as Super Admin  
   **When** I access admin capabilities  
   **Then** all role-restricted management actions for this epic are available  
   **And** authorization checks are enforced server-side and at data-access layer.

## Tasks / Subtasks

- [x] Implement explicit management capability contract (AC: 2, 3)
  - [x] Add `src/lib/auth/authorization.ts` with management actions for storm project write, ticket entry write, and contractor assignment write
  - [x] Add path-to-action resolver for super-admin-only action routes
  - [x] Add unit tests in `src/lib/auth/authorization.test.ts`

- [x] Enforce server-side authorization for role-restricted actions (AC: 1, 2, 3)
  - [x] Update `src/lib/supabase/middleware.ts` to enforce super-admin-only action paths
  - [x] Preserve existing 1.3 cross-portal restrictions and 1.2 unauthenticated/session-expired behavior

- [x] Enforce data-access layer authorization for ticket-entry and assignment actions (AC: 2, 3)
  - [x] Update `src/lib/services/ticketService.ts` to require Super Admin for ticket create/edit entry and contractor assignment updates
  - [x] Ensure unauthorized attempts fail with clear, non-sensitive errors

- [x] Align admin UI to view-only boundaries where required (AC: 2)
  - [x] Update `src/app/tickets/page.tsx` and `src/app/tickets/[id]/page.tsx` to consume role from AuthProvider profile as source-of-truth
  - [x] Update `src/components/features/tickets/TicketList.tsx` and `src/app/tickets/create/page.tsx` to block create/assign actions for non-Super Admin roles
  - [x] Add `src/app/(admin)/storms/page.tsx` with storm project visibility and create/edit action gating for admin vs super admin

- [x] Validate behavior with tests and regression checks (AC: 1, 2, 3)
  - [x] Run unit tests for authorization and existing suites
  - [x] Run type-check and lint on changed files
  - [x] Document manual verification matrix for contractor/admin/super-admin route/action behavior

## Dev Notes

### Story Requirements Context

- Story source: `_bmad-output/planning-artifacts/epics.md` under "Story 1.4: Role-Based Authorization and Admin Capability Boundaries".
- Story 1.3 already established portal isolation and forbidden behavior for cross-portal access.

### Technical Requirements

- Role source-of-truth remains `profiles.role`.
- Contractor must be denied admin-only routes/actions and protected data access.
- Admin can view operational data but cannot perform management actions:
  - Storm project create/edit
  - Ticket entry create/edit
  - Contractor assignment
- Super Admin can perform all role-restricted management actions.

### Architecture Compliance

- Keep server-side enforcement in `src/lib/supabase/middleware.ts`.
- Keep data-access layer checks inside service layer where write actions execute.
- Keep existing App Router route structure and `src/` pathing.

### File Structure Requirements

- Add:
  - `src/lib/auth/authorization.ts`
  - `src/lib/auth/authorization.test.ts`
  - `src/app/(admin)/storms/page.tsx`
- Modify:
  - `src/lib/supabase/middleware.ts`
  - `src/lib/services/ticketService.ts`
  - `src/app/tickets/page.tsx`
  - `src/app/tickets/[id]/page.tsx`
  - `src/components/features/tickets/TicketList.tsx`
  - `src/app/tickets/create/page.tsx`

### Testing Requirements

- Unit test role capability contract and action-path mapping.
- Verify no regressions to Story 1.2 session/login behavior and Story 1.3 portal boundaries.
- Validate role behavior matrix for contractor, admin, and super admin.

### References

- Epic source: `_bmad-output/planning-artifacts/epics.md`
- Existing authorization/middleware files: `src/lib/auth/portalAccess.ts`, `src/lib/supabase/middleware.ts`
- Ticket data layer: `src/lib/services/ticketService.ts`
- Ticket routes/components: `src/app/tickets/*`, `src/components/features/tickets/*`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story file bootstrapped from epics because `1-4-add-plant-manual.md` was missing in implementation artifacts.
- Added red-phase tests for authorization capability contract and path mappings before implementation.
- Preserved existing middleware session handling while layering management-action authorization gates.
- Updated ticket pages to use AuthProvider profile role to avoid mixed role sources.

### Completion Notes List

- Implemented management capability contract with explicit actions:
  - `storm_project_write`
  - `ticket_entry_write`
  - `contractor_assignment_write`
- Added server-side action-path enforcement in middleware:
  - `/tickets/create`
  - `/admin/subcontractors/approval`
  - `/admin/storms/create`
  - `/admin/storms/:id/edit`
- Added data-access layer enforcement in `ticketService`:
  - Ticket create requires super admin
  - Ticket entry edits and contractor assignment updates require super admin
- Updated admin/ticket UI to enforce view-only boundaries for non-super-admin roles:
  - ticket create and assign affordances hidden/blocked for admin
  - admin dashboard quick-action buttons disabled for restricted actions
  - added storms page with view access and create/edit disabled for admin
- Validation results:
  - `npx vitest run` passed (6 files, 39 tests)
  - `npx tsc --noEmit` passed
  - `npx eslint` on changed files passed
- Manual verification matrix (browser):
  - Contractor cannot access admin-only routes/actions and receives forbidden behavior
  - Admin can view dashboards/tickets/storm projects, but cannot create ticket, assign contractor, or create/edit storm projects
  - Super Admin can perform all restricted management actions
  - Unauthenticated users continue redirect to `/login`

### File List

- `_bmad-output/implementation-artifacts/1-4-add-plant-manual.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/lib/auth/authorization.ts`
- `src/lib/auth/authorization.test.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/services/ticketService.ts`
- `src/app/tickets/page.tsx`
- `src/app/tickets/create/page.tsx`
- `src/app/tickets/[id]/page.tsx`
- `src/components/features/tickets/TicketList.tsx`
- `src/app/(admin)/dashboard/page.tsx`
- `src/app/(admin)/storms/page.tsx`

### Change Log

- 2026-02-12: Created story artifact from epic definition to unblock Story 1.4 implementation.
- 2026-02-12: Implemented Story 1.4 role-based authorization boundaries; moved status to `review`.
