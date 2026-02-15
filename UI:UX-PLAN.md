# Week 14.2 UI/UX Modernization Plan (UI-First Exception Approved)

## Summary
This plan modernizes the core UI/UX using your requested skill stack (`next-best-practices`, `ui-ux-pro-max`, `vercel-react-best-practices`) with a **brand-light storm/lightning direction** and **reactive navigation signals**.  
It targets **core surfaces** first (shell, auth, dashboard, storms, tickets, contractor core pages), keeps implementation dependency-light (CSS + existing stack), and preserves current route architecture.

## Confirmed Decisions
1. Sequence: `UI-First Exception` approved even though Week 14.1 is listed before 14.2.
2. Scope: `Core Surfaces`.
3. Theme: `Brand Light`.
4. Navigation model: `Enhanced Shell`.
5. Motion: `CSS + tw-animate` only.
6. Reactive data: `Real data now`.
7. Auth screens: Included in this pass.

## Implementation Scope (Exact Targets)
1. Shared theme and interaction foundation.
2. Admin + contractor shell/navigation modernization.
3. Core workflow pages: dashboard, storms, tickets, contractor time/expenses/assessment entry.
4. Auth and access-entry screens.
5. Route-level loading/error states per Next App Router conventions.
6. Regression tests and progress tracker updates.

## Planned File Changes
1. Update `/Users/grid/Desktop/Grid2/src/app/globals.css`.
2. Update `/Users/grid/Desktop/Grid2/src/app/layout.tsx`.
3. Add `/Users/grid/Desktop/Grid2/src/components/common/brand/BrandMark.tsx`.
4. Add `/Users/grid/Desktop/Grid2/src/hooks/useNavigationSignals.ts`.
5. Update `/Users/grid/Desktop/Grid2/src/components/common/layout/AppShell.tsx`.
6. Update `/Users/grid/Desktop/Grid2/src/components/common/layout/Sidebar.tsx`.
7. Update `/Users/grid/Desktop/Grid2/src/components/common/layout/TopBar.tsx`.
8. Update `/Users/grid/Desktop/Grid2/src/components/common/layout/BottomNav.tsx`.
9. Update `/Users/grid/Desktop/Grid2/src/components/common/layout/navigationConfig.ts`.
10. Update `/Users/grid/Desktop/Grid2/src/components/common/layout/PageHeader.tsx`.
11. Update `/Users/grid/Desktop/Grid2/src/components/features/dashboard/DashboardMetrics.tsx`.
12. Update `/Users/grid/Desktop/Grid2/src/app/(admin)/dashboard/page.tsx`.
13. Update `/Users/grid/Desktop/Grid2/src/app/(admin)/storms/page.tsx`.
14. Update `/Users/grid/Desktop/Grid2/src/app/(admin)/storms/create/page.tsx`.
15. Update `/Users/grid/Desktop/Grid2/src/app/tickets/page.tsx`.
16. Update `/Users/grid/Desktop/Grid2/src/components/features/tickets/TicketList.tsx`.
17. Update `/Users/grid/Desktop/Grid2/src/components/features/tickets/TicketCard.tsx`.
18. Update `/Users/grid/Desktop/Grid2/src/app/(subcontractor)/time/page.tsx`.
19. Update `/Users/grid/Desktop/Grid2/src/app/(subcontractor)/expenses/page.tsx`.
20. Update `/Users/grid/Desktop/Grid2/src/app/(subcontractor)/assessments/create/page.tsx`.
21. Update `/Users/grid/Desktop/Grid2/src/app/(auth)/layout.tsx`.
22. Update `/Users/grid/Desktop/Grid2/src/app/(auth)/login/page.tsx`.
23. Update `/Users/grid/Desktop/Grid2/src/app/(auth)/forgot-password/page.tsx`.
24. Update `/Users/grid/Desktop/Grid2/src/app/(auth)/reset-password/page.tsx`.
25. Update `/Users/grid/Desktop/Grid2/src/app/(auth)/magic-link/page.tsx`.
26. Update `/Users/grid/Desktop/Grid2/src/app/(auth)/set-password/page.tsx`.
27. Update `/Users/grid/Desktop/Grid2/src/app/forbidden.tsx`.
28. Add `/Users/grid/Desktop/Grid2/src/app/(admin)/loading.tsx`.
29. Add `/Users/grid/Desktop/Grid2/src/app/(admin)/error.tsx`.
30. Add `/Users/grid/Desktop/Grid2/src/app/(subcontractor)/loading.tsx`.
31. Add `/Users/grid/Desktop/Grid2/src/app/(subcontractor)/error.tsx`.
32. Add `/Users/grid/Desktop/Grid2/src/app/tickets/loading.tsx`.
33. Add `/Users/grid/Desktop/Grid2/src/app/tickets/error.tsx`.
34. Add `/Users/grid/Desktop/Grid2/src/app/global-error.tsx`.
35. Add `/Users/grid/Desktop/Grid2/src/app/not-found.tsx`.
36. Update `/Users/grid/Desktop/Grid2/src/components/common/layout/navigationContracts.test.ts`.
37. Add `/Users/grid/Desktop/Grid2/src/hooks/useNavigationSignals.test.ts`.
38. Update `/Users/grid/Desktop/Grid2/grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Section 2 status update after implementation).
39. Update `/Users/grid/Desktop/Grid2/grid-electric-docs/04-DESIGN-SYSTEM.md` (storm/lightning interaction token additions).

## Detailed Build Spec

## 1) Theme + Brand Consistency Layer
1. Normalize visual tokens to remove ad-hoc `blue/slate` drift and map all core surfaces to brand semantic tokens.
2. Add storm/lightning utility classes for accents, status glow, and action emphasis.
3. Define global motion tokens and reusable keyframes (`fade-in`, `slide-in`, subtle pulse).
4. Add reduced-motion fallback with `prefers-reduced-motion`.
5. Add `safe-area` utility classes currently missing (`safe-area-pb` is used but undefined).
6. Keep theme light-first and stable; no dark-toggle delivery in this pass.

## 2) BrandMark Component
1. Create a reusable `BrandMark` component using `/icons/grid-ge-storm-icon-clean.svg`.
2. Support `compact` and `full` variants.
3. Replace all temporary `G` tiles in top bar and auth pages with `BrandMark`.
4. Standardize portal subtitle labels (“Admin Portal”, “Contractor Portal”, “Secure Access”).

## 3) Reactive Navigation Signals
1. Build `useNavigationSignals` as the single source for nav badges.
2. Admin signals source: `dashboardReportingService.getDashboardMetrics()` with interval refresh.
3. Contractor signals source: ticket counts for current contractor + sync snapshot.
4. Universal signals source: `useSync().snapshot` for offline/queue/conflict state.
5. Polling behavior: foreground-only interval, pause on tab hidden, resume on focus.
6. Error behavior: silent fallback to zero-state badges, no runtime overlays.
7. Top bar notification UI becomes data-driven (no static hardcoded count).
8. Sidebar and bottom nav show route-level reactive badge dots/counts where applicable.

## 4) Shell Interaction Upgrade
1. Sidebar: move to navy/brand shell style matching wireframe direction and active-state lightning accent.
2. Top bar: replace static bell count, add concise operational summary popover.
3. Bottom nav: improved active pill, tighter labels, touch target compliance.
4. AppShell spacing: resolve fixed-header and offline-banner overlap with deterministic vertical stacking.
5. Retain existing route structure and legacy alias routes unchanged.

## 5) Core Page UX Polish
1. Dashboard: action rail becomes clearer and priority-ordered; improve hierarchy and status scanability.
2. Dashboard metrics cards: consistent tokens and variants, no hardcoded palette scatter.
3. Storms list/create: improved empty/loading/state clarity and consistent CTA behavior.
4. Tickets list/card: consistent table/card language and status visual semantics.
5. Contractor core pages: consistent page header rhythm and responsive spacing.
6. Auth pages + forbidden page: unified entry visual language and spacing.

## 6) Next.js Route-State Compliance
1. Add `loading.tsx` and `error.tsx` for admin, subcontractor, and tickets segments.
2. Add root `global-error.tsx` and `not-found.tsx`.
3. Keep existing redirect/forbidden behavior intact.
4. Use client error boundaries only where required by Next conventions.

## Important Public API / Interface Changes
1. `NavLinkItem` in `/Users/grid/Desktop/Grid2/src/components/common/layout/navigationConfig.ts` will gain metadata fields for badge wiring and mobile label behavior.
2. `TopBar` props will shift from static notification usage to signal-driven display.
3. New hook API in `/Users/grid/Desktop/Grid2/src/hooks/useNavigationSignals.ts`:
   - `signals`: normalized counts/status flags.
   - `isLoading`: initial fetch state.
   - `refresh()`: manual refresh.
4. `BrandMark` becomes the shared branding interface for shell + auth.
5. No backend schema changes and no API route contract changes in this UI pass.

## Data Flow (Reactive UI)
1. `AuthProvider` provides role/profile context.
2. `useNavigationSignals` derives role-aware metrics + sync state.
3. `TopBar`, `Sidebar`, and `BottomNav` consume one normalized signal source.
4. Signal refresh cadence keeps UI reactive without introducing heavy client state libraries.

## Test Cases and Scenarios

## Unit / Component
1. Navigation config contract still passes required links while supporting new metadata.
2. `useNavigationSignals` handles:
   - admin metrics success,
   - contractor metrics success,
   - service failure fallback,
   - offline state transitions.
3. `TopBar` renders dynamic count badges and zero-state correctly.
4. `BrandMark` variants render consistent accessible labels.
5. `PageHeader` interaction states remain keyboard accessible.

## Integration / UX
1. Auth pages and shell use consistent branding assets and palette.
2. Offline banner does not overlap top bar interaction targets.
3. Sidebar and bottom nav active states match current route including nested routes.
4. Loading and error boundaries appear for segment failures and recover via retry.

## E2E / Responsive
1. Admin flow: login -> dashboard -> storms -> tickets with consistent nav state.
2. Contractor flow: login -> time -> tickets -> expenses with consistent nav behavior.
3. Mobile viewport checks: bottom nav touch targets >= 44px and no clipping on safe-area devices.
4. Reduced-motion preference disables nonessential animation.

## Acceptance Criteria
1. No remaining `G` placeholder branding tiles on core surfaces.
2. Core surfaces no longer rely on scattered hardcoded color utility usage for primary brand semantics.
3. Top bar notification count is real-data based (no static constant).
4. Shell/nav visually consistent across admin, contractor, and auth entry points.
5. New Next.js loading/error boundaries exist and are functional.
6. Existing builds/tests continue to pass for touched areas.
7. Progress tracker updated in master instructions after completion.

## Assumptions and Defaults
1. UI-first sequencing exception is explicitly approved.
2. No new animation/runtime dependency will be added.
3. Theme remains brand-light in this pass.
4. Legacy alias routes under `/admin/admin/*` remain untouched.
5. We will not reintroduce `next/font` right now due prior build stability history; typography consistency will be achieved through tokenized stacks and existing assets.
6. Real-time nav badges will use polling intervals with graceful fallback, not websocket subscriptions, in this pass.
