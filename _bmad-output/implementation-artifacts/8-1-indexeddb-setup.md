# Story 8.1: IndexedDB Setup

Status: review

## Story

As a field operations user,
I want reliable offline IndexedDB storage for ticket cache and sync queues,
so that ticket updates, time entries, and photo uploads are resilient when connectivity is intermittent.

## Acceptance Criteria

1. **Given** the offline storage layer  
   **When** the IndexedDB schema is initialized or upgraded  
   **Then** Dexie tables and indexes support ticket caching and queue-first sync flows.
2. **Given** ticket data is loaded from the server  
   **When** tickets are cached locally  
   **Then** cached ticket records can be queried by assignee/status for offline views.
3. **Given** field users create/update time entries while offline  
   **When** time entries are queued  
   **Then** entries are persisted locally with pending sync metadata and retry tracking.
4. **Given** field users capture photos while offline  
   **When** photos are queued  
   **Then** photo records persist upload state, retry metadata, and sync queue context.

## Tasks / Subtasks

- [x] Verify and harden Dexie schema (AC: 1)
  - [x] Add schema v2 with queue-oriented indexes and migration normalization.
  - [x] Add sync queue status model (`pending`, `processing`, `synced`, `failed`).
- [x] Implement ticket caching APIs (AC: 2)
  - [x] Add ticket cache helpers (`cacheTicket`, `replaceTicketCache`, filtered `getCachedTickets`).
  - [x] Add queued ticket update helper with sync queue linkage.
- [x] Implement time entry queue APIs (AC: 3)
  - [x] Add time entry queue/lookup/count helpers.
  - [x] Add synced/failed state transitions with retry metadata.
- [x] Implement photo queue improvements (AC: 4)
  - [x] Normalize photo queue metadata (`retry_count`, timestamps, last error).
  - [x] Add failure helper and wire `PhotoUploadQueue` to use it.
- [x] Add tests and validations
  - [x] Add `dexie` unit tests for cache/queue operations.
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 8 Task 8.1 only.
- Do not implement service worker caching/sync registration (Task 8.2) or sync UI (Task 8.3) in this story.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 8 Task 8.1)
- `grid-electric-docs/07-OFFLINE-PWA-STRATEGY.md` (IndexedDB schema + queue strategy)
- `grid-electric-docs/10-IMPLEMENTATION-CHECKLIST.md` (offline sync queue guidance)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added Dexie schema v2 migration and queue-oriented indexes.
- 2026-02-12: Implemented ticket caching helpers and queued ticket update path.
- 2026-02-12: Implemented dedicated time entry queue and retry-aware status updates.
- 2026-02-12: Implemented photo queue retry/error helpers and updated `PhotoUploadQueue` failure handling.
- 2026-02-12: Added `dexie` unit tests and validated:
  - `npx vitest run` (27 files, 131 tests)
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Upgraded `src/lib/db/dexie.ts` with schema versioning, migration normalization, and expanded queue metadata.
- Added explicit ticket cache operations for save/replace/filter/query/update-queue workflows.
- Added explicit time entry queue operations for queueing, pending retrieval/count, and success/failure transitions.
- Added explicit photo queue failure handling with retry count and sync queue state propagation.
- Updated `src/lib/sync/photoUploadQueue.ts` to use the new `markPhotoUploadFailed` helper.
- Added `src/lib/db/dexie.test.ts` covering ticket caching, time entry queueing, photo queueing, and failure handling.

### File List

- `_bmad-output/implementation-artifacts/8-1-indexeddb-setup.md`
- `src/lib/db/dexie.ts`
- `src/lib/db/dexie.test.ts`
- `src/lib/sync/photoUploadQueue.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 8.1 implemented and moved to `review`.
