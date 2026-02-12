# Story 8.3: Sync Status UI

Status: review

## Story

As a field operations user,
I want clear sync status visibility with queue management and conflict resolution actions,
so that I can understand offline sync state and recover failed operations without losing data.

## Acceptance Criteria

1. **Given** sync-capable workflows  
   **When** the app is running  
   **Then** a `SyncStatus` component shows online/offline state, pending/failed counts, and last sync context.
2. **Given** shared offline sync state  
   **When** UI and services need synchronization details  
   **Then** a `SyncProvider` context exposes queue snapshots and sync actions.
3. **Given** queued operations  
   **When** users inspect sync details  
   **Then** queue items are visible with retry and escalation actions for failed items.
4. **Given** unresolved sync conflicts  
   **When** users open sync details  
   **Then** conflicts can be reviewed and resolved with explicit local/server decisions.

## Tasks / Subtasks

- [x] Create SyncProvider context (AC: 2)
  - [x] Add `SyncProvider` with online status tracking and periodic queue refresh.
  - [x] Expose sync actions (`syncNow`, `retryItem`, conflict actions) through context.
  - [x] Integrate provider at root layout level.
- [x] Create SyncStatus component (AC: 1, 3, 4)
  - [x] Add fixed `SyncStatus` summary card with connectivity and queue counts.
  - [x] Add details dialog with queue list and retry/escalation controls.
  - [x] Add conflict resolution UI with local/server resolution actions.
- [x] Extend Dexie for conflict workflow support (AC: 3, 4)
  - [x] Add `conflicts` table and model in Dexie schema.
  - [x] Add helper APIs for conflict creation, query, resolution, and queue retry handling.
- [x] Add tests and validations
  - [x] Extend Dexie unit tests for conflict workflows and retry behavior.
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 8 Task 8.3 only.
- Do not implement Week 9 time-tracking feature pages/components in this story.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 8 Task 8.3)
- `grid-electric-docs/07-OFFLINE-PWA-STRATEGY.md` (sync status/conflict handling patterns)
- `grid-electric-docs/10-IMPLEMENTATION-CHECKLIST.md` (offline sync requirements)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added sync provider context and root integration for queue/conflict snapshots.
- 2026-02-12: Added `SyncStatus` UI with queue panel and conflict resolution actions.
- 2026-02-12: Extended Dexie schema with conflict table and helper APIs.
- 2026-02-12: Extended Dexie tests and validated:
  - `npx vitest run` (29 files, 146 tests)
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Added `src/components/providers/SyncProvider.tsx` with shared sync state, polling refresh, manual sync trigger, retry support, and conflict actions.
- Added `src/components/common/feedback/SyncStatus.tsx` to surface sync state and provide queue/conflict management UI.
- Integrated sync context + UI globally in `src/app/layout.tsx`.
- Updated `src/lib/db/dexie.ts` with:
  - conflict model (`LocalSyncConflict`)
  - `conflicts` table (schema v3)
  - queue retry helpers and conflict create/resolve helpers
- Expanded `src/lib/db/dexie.test.ts` coverage for retry and conflict lifecycle behavior.

### File List

- `_bmad-output/implementation-artifacts/8-3-sync-status-ui.md`
- `src/components/providers/SyncProvider.tsx`
- `src/components/common/feedback/SyncStatus.tsx`
- `src/app/layout.tsx`
- `src/lib/db/dexie.ts`
- `src/lib/db/dexie.test.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 8.3 implemented and moved to `review`.
