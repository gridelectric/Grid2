# Story 1.3: Role-Based Navigation Shells

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want a navigation interface optimized for my device and role,
so that I can work efficiently in my environment (Office vs Field).

## Acceptance Criteria

1. Given an authenticated session, when a Contractor accesses the app on mobile, then a bottom navigation bar shows exactly: `Tickets`, `Map`, and `Profile`.
2. Given an authenticated session, when an Admin/Super Admin accesses the app on desktop, then a persistent sidebar shows at least: `Dashboard`, `Users`, and `Storms`.
3. Any attempt to access the other role's URL group returns a forbidden experience (403 behavior).
4. Unauthenticated users are still redirected to `/login` (do not regress Story 1.2 behavior).

## Tasks / Subtasks

- [x] Implement a shared portal-access contract (AC: 3, 4)
- [x] Add `src/lib/auth/portalAccess.ts` with explicit mappings:
  - [x] `SUPER_ADMIN`, `ADMIN`, `TEAM_LEAD`, `READ_ONLY` -> `admin`
  - [x] `CONTRACTOR` -> `subcontractor`
  - [x] Helpers: `getPortalRole(role)` and `isPortalPathAllowed(pathname, portalRole)`
- [x] Add unit tests for mapping and path checks in `src/lib/auth/portalAccess.test.ts`

- [x] Enforce role isolation at request boundary (AC: 3, 4)
- [x] Update `src/lib/supabase/middleware.ts` to:
  - [x] Keep existing session refresh flow
  - [x] Fetch authenticated user with `supabase.auth.getUser()`
  - [x] Resolve profile role from `profiles`
  - [x] Return forbidden response for cross-portal paths (`/admin/*` vs `/subcontractor/*`)
- [x] Keep `src/middleware.ts` as the entry point; only adjust matcher if needed for route coverage

- [x] Enforce role isolation in route layouts as defense-in-depth (AC: 3)
- [x] Update `src/app/(admin)/layout.tsx` to verify role before rendering shell
- [x] Update `src/app/(subcontractor)/layout.tsx` to verify role before rendering shell
- [x] Add `src/app/forbidden.tsx` for consistent forbidden UI

- [x] Align Contractor mobile navigation to story contract (AC: 1)
- [x] Update `src/components/common/layout/BottomNav.tsx` contractor items to exactly:
  - [x] `/tickets` -> `Tickets`
  - [x] `/subcontractor/map` -> `Map`
  - [x] `/subcontractor/profile` -> `Profile`
- [x] Preserve existing `lg:hidden` behavior (mobile-only)

- [x] Align Admin desktop navigation to story contract (AC: 2)
- [x] Update `src/components/common/layout/Sidebar.tsx` admin primary items to include:
  - [x] `/admin/dashboard` -> `Dashboard`
  - [x] `/admin/subcontractors` -> `Users`
  - [x] `/admin/storms` -> `Storms`
- [x] Preserve existing desktop persistent sidebar behavior (`hidden lg:block` + fixed positioning)

- [x] Prevent regression from mixed auth sources (AC: 1-4)
- [x] Do not introduce new auth stores for role checks in layout/middleware paths
- [x] Keep role truth from Supabase profile and existing AuthProvider/session model

- [x] Validate behavior with automated and manual checks (AC: 1-4)
- [x] Component tests for nav labels/links by role
- [x] Unit tests for route access matrix
- [x] Manual test matrix for mobile contractor, desktop admin, cross-role URL attempts, logged-out access

## Dev Notes

### Story Requirements Context

- Epic source confirms this story is navigation-shell isolation for role/device context and explicit forbidden behavior on cross-role routes.
- Current code already has foundational shells and role-aware components, but navigation labels/routes do not yet match Story 1.3 acceptance criteria exactly.
- This story should be implemented as an incremental hardening task on top of existing `src/` structure, not a route architecture rewrite.

### Technical Requirements

- Keep role source-of-truth as `profiles.role` (uppercase enum in `src/types/index.ts` and `src/types/database.ts`).
- Enforce route access for portal groups:
  - Admin portal: `/admin/*`
  - Contractor portal: `/subcontractor/*`
- For cross-role attempts, return forbidden behavior (403) and render a dedicated forbidden experience.
- Preserve unauthenticated redirect behavior to `/login`.
- Keep existing shared route(s) such as `/tickets` functional; do not block them unless explicitly cross-portal.

### Architecture Compliance

- Use existing shell components and patterns:
  - `src/components/common/layout/AppShell.tsx`
  - `src/components/common/layout/Sidebar.tsx`
  - `src/components/common/layout/BottomNav.tsx`
- Use existing Supabase SSR middleware entry and refresh pattern:
  - `src/middleware.ts`
  - `src/lib/supabase/middleware.ts`
- Maintain `src/`-first pathing and `@/*` alias imports established in Story 1.1.
- Do not reintroduce legacy root-level `app/`, `components/`, `lib/`, `types/` paths.

### Library / Framework Requirements

- Next.js App Router remains the implementation model (project currently pinned to `next@16.1.6`).
- Middleware/proxy note: Next.js 16 documents the middleware-to-proxy naming shift; keep current `middleware.ts` flow stable in this story and avoid scope creep migration.
- Supabase SSR auth guidance: keep request-path auth checks based on `getUser()` and middleware cookie refresh model.

### File Structure Requirements

- Modify only story-relevant implementation files:
  - `src/lib/supabase/middleware.ts`
  - `src/middleware.ts` (only if matcher tuning is necessary)
  - `src/app/(admin)/layout.tsx`
  - `src/app/(subcontractor)/layout.tsx`
  - `src/components/common/layout/BottomNav.tsx`
  - `src/components/common/layout/Sidebar.tsx`
- Add only focused new files:
  - `src/lib/auth/portalAccess.ts`
  - `src/lib/auth/portalAccess.test.ts`
  - `src/app/forbidden.tsx`

### Testing Requirements

- Unit tests:
  - `getPortalRole` mappings for all roles
  - `isPortalPathAllowed` matrix for allowed/forbidden paths
- Component-level tests:
  - Contractor bottom nav labels are exactly `Tickets`, `Map`, `Profile`
  - Admin sidebar includes `Dashboard`, `Users`, `Storms`
- Route guard verification:
  - Contractor user on `/admin/*` gets forbidden
  - Admin user on `/subcontractor/*` gets forbidden
  - Logged-out user on protected routes is redirected to `/login`
- Manual viewport checks:
  - Mobile: bottom nav visible, sidebar hidden
  - Desktop: sidebar persistent, bottom nav not primary

### Previous Story Intelligence

- Previous story file for `1-2-*` is not present in `_bmad-output/implementation-artifacts/`; direct previous-story notes are unavailable.
- Story 1.1 implementation notes still provide actionable constraints:
  - Project moved to `src/`
  - Supabase SSR middleware is already in place
  - Role/profile table and types are already defined

### Git Intelligence Summary

- Recent commits indicate strong reliance on existing shell components and route layouts, with ongoing transitions to `src/` paths.
- Navigation-related work already exists in:
  - `src/components/common/layout/Sidebar.tsx`
  - `src/components/common/layout/BottomNav.tsx`
  - `src/components/common/layout/AppShell.tsx`
- Story 1.3 should extend these files instead of creating duplicate shell/navigation components.

### Latest Technical Information

- Next.js 16.1 release notes (official) highlight React 19.2 support and middleware Node.js runtime improvements; this story should remain compatible with App Router + current middleware pattern.
- Next.js file-conventions docs note middleware naming evolution to proxy in v16 context; migration is not required for this story but should be tracked as future debt.
- Next.js security advisories in late 2025 include middleware/proxy CVE patches; keep `next` on a current 16.1.x patch during implementation.
- Supabase official Next.js troubleshooting guidance emphasizes server-validated auth (`getUser()`) and middleware cookie/session correctness; this aligns with enforcing role checks in middleware.

### Project Context Reference

- `project-context.md` was not found in this repository during workflow discovery.
- Story context derived from available planning + architecture + UX artifacts and current source tree.

### Project Structure Notes

- This repo currently uses `src/app/(admin)` and `src/app/(subcontractor)` route groups, plus shared `/tickets` routes.
- Architecture artifact mentions `(admin)` and `(app)`; for this story, keep existing `(subcontractor)` naming to avoid broad route churn.
- Any `(app)` renaming should be a separate refactor story.

### References

- Epic story definition: `_bmad-output/bmb-creations/epics.md` (Story 1.3 section)
- PRD role-routing context: `_bmad-output/planning-artifacts/prd.md`
- Architecture route-shell constraints: `_bmad-output/bmb-creations/architecture.md`
- UX navigation model: `_bmad-output/bmb-creations/ux-design-specification.md`
- Existing shell files: `src/components/common/layout/AppShell.tsx`, `src/components/common/layout/Sidebar.tsx`, `src/components/common/layout/BottomNav.tsx`
- Existing auth/session files: `src/lib/supabase/middleware.ts`, `src/middleware.ts`, `src/components/providers/AuthProvider.tsx`
- Next.js 16.1 release notes: https://nextjs.org/blog/next-16-1
- Next.js middleware/proxy docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Next.js security advisory: https://nextjs.org/blog/cve-2025-29927
- Supabase Next.js SSR/auth troubleshooting: https://supabase.com/docs/guides/troubleshooting/how-do-you-troubleshoot-nextjs---supabase-auth-issues-riMCZV

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Previous story file lookup attempted: `_bmad-output/implementation-artifacts/1-2-*.md` (not found)
- Sprint status parsed from: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Added red-phase tests first for portal access matrix and navigation contracts.
- Implemented middleware-level portal isolation while preserving Supabase SSR refresh and Story 1.2 inactivity timeout.
- Added server-layout defense-in-depth role checks and root forbidden experience.

### Completion Notes List

- Implemented shared portal access contract in `src/lib/auth/portalAccess.ts`.
- Enforced unauthenticated redirect-to-login behavior at middleware boundary for non-public routes.
- Enforced cross-portal forbidden behavior for `/admin/*` and `/subcontractor/*` with 403 rewrite to `/forbidden`.
- Added role checks in both portal layouts using Supabase profile role as source-of-truth.
- Updated Contractor bottom nav to exactly `Tickets`, `Map`, `Profile`.
- Updated Admin sidebar to include required `Dashboard`, `Users`, `Storms` items while preserving desktop shell behavior.
- Added automated tests:
  - `portalAccess` mapping/path matrix tests
  - navigation contract tests for sidebar/bottom-nav role labels and links
- Validation executed:
  - `npx vitest run` passed (5 files, 33 tests)
  - `npx tsc --noEmit` passed
  - `npx eslint` on changed files passed
- Manual validation matrix (to run in browser):
  - Mobile contractor: bottom nav visible with `Tickets/Map/Profile`, sidebar hidden
  - Desktop admin: persistent sidebar includes `Dashboard/Users/Storms`
  - Contractor accessing `/admin/*` receives forbidden experience
  - Admin accessing `/subcontractor/*` receives forbidden experience
  - Logged-out user requesting protected routes redirects to `/login`

### File List

- `_bmad-output/implementation-artifacts/1-3-plant-data-model.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/lib/auth/portalAccess.ts`
- `src/lib/auth/portalAccess.test.ts`
- `src/components/common/layout/navigationConfig.ts`
- `src/components/common/layout/navigationContracts.test.ts`
- `src/components/common/layout/BottomNav.tsx`
- `src/components/common/layout/Sidebar.tsx`
- `src/lib/supabase/middleware.ts`
- `src/app/(admin)/layout.tsx`
- `src/app/(subcontractor)/layout.tsx`
- `src/app/forbidden.tsx`

### Change Log

- 2026-02-12: Implemented Story 1.3 role-based navigation shells, portal route isolation, and contract tests; status moved to `review`.
