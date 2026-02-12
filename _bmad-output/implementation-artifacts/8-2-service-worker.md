# Story 8.2: Service Worker

Status: review

## Story

As a field operations user,
I want a registered service worker with offline cache behavior and background sync hooks,
so that the app remains usable in low-connectivity environments and queued work can resume automatically.

## Acceptance Criteria

1. **Given** the PWA runtime  
   **When** the app loads in a browser supporting service workers  
   **Then** a root-scoped worker is registered successfully.
2. **Given** navigation/assets/API/image requests  
   **When** network conditions vary  
   **Then** cache strategies handle static assets, API responses, and offline fallbacks predictably.
3. **Given** offline queue workflows  
   **When** connectivity is restored or background sync fires  
   **Then** sync tags are registered and worker messages trigger sync handling paths.
4. **Given** end users lose connectivity  
   **When** the app is offline  
   **Then** an offline banner is shown clearly in the UI.

## Tasks / Subtasks

- [x] Implement production-served service worker (AC: 1, 2, 3)
  - [x] Add `public/sw.js` with install/activate/fetch handlers.
  - [x] Implement cache strategies: cache-first, stale-while-revalidate, network-first.
  - [x] Add background sync tag dispatch for tickets/time/assessments/expenses/photos.
- [x] Implement service worker registration + sync bootstrap (AC: 1, 3)
  - [x] Add PWA registration helpers in `src/lib/pwa/serviceWorker.ts`.
  - [x] Add `ServiceWorkerProvider` to register worker and sync tags.
  - [x] Wire provider into app root layout.
- [x] Implement offline banner component (AC: 4)
  - [x] Add `OfflineBanner` in `components/common/feedback`.
  - [x] Wire banner into root layout for global visibility.
- [x] Add tests and run validations
  - [x] Add tests for service worker helper logic.
  - [x] Add tests for offline banner visibility helpers.
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 8 Task 8.2 only.
- Do not implement sync queue UI/conflict UI (Task 8.3) in this story.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 8 Task 8.2)
- `grid-electric-docs/07-OFFLINE-PWA-STRATEGY.md` (service worker + sync)
- `grid-electric-docs/10-IMPLEMENTATION-CHECKLIST.md` (offline sync guidance)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added runtime service worker at `public/sw.js` with cache strategies and offline fallback.
- 2026-02-12: Added PWA registration/sync helpers and provider integration.
- 2026-02-12: Added global offline banner component and root layout integration.
- 2026-02-12: Added helper tests and validated:
  - `npx vitest run` (29 files, 141 tests)
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Added `public/sw.js` with cache-first, stale-while-revalidate, and network-first request strategies.
- Implemented background sync message hooks for `sync-tickets`, `sync-time-entries`, `sync-assessments`, `sync-expenses`, and `sync-photos`.
- Added `src/lib/pwa/serviceWorker.ts` for service worker support checks, registration, and sync tag registration.
- Added `src/components/providers/ServiceWorkerProvider.tsx` to register worker and refresh sync tags when network returns.
- Added `src/components/common/feedback/OfflineBanner.tsx` and wired it globally in root layout.
- Added tests:
  - `src/lib/pwa/serviceWorker.test.ts`
  - `src/components/common/feedback/OfflineBanner.test.ts`

### File List

- `_bmad-output/implementation-artifacts/8-2-service-worker.md`
- `public/sw.js`
- `src/lib/pwa/serviceWorker.ts`
- `src/lib/pwa/serviceWorker.test.ts`
- `src/components/providers/ServiceWorkerProvider.tsx`
- `src/components/common/feedback/OfflineBanner.tsx`
- `src/components/common/feedback/OfflineBanner.test.ts`
- `src/app/layout.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 8.2 implemented and moved to `review`.
