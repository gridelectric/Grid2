# Story 7.2: Photo Storage

Status: review

## Story

As a field operations user,
I want captured photos queued and uploaded through Supabase Storage with thumbnails,
so that assessment media is reliably persisted with metadata for review and auditing.

## Acceptance Criteria

1. **Given** captured assessment photos  
   **When** storage upload is executed  
   **Then** photos are uploaded to Supabase Storage through a reusable upload pipeline.
2. **Given** uploaded assessment photos  
   **When** metadata is persisted  
   **Then** media records include storage paths/URLs and relevant capture metadata.
3. **Given** photo previews are needed for admin/field views  
   **When** photo assets are processed  
   **Then** thumbnail generation is available through reusable utility logic.
4. **Given** offline-first field workflows  
   **When** connectivity is intermittent  
   **Then** a `PhotoUploadQueue` service supports `add`, `process`, and `getPendingCount`.

## Tasks / Subtasks

- [x] Integrate Supabase Storage upload service (AC: 1, 2)
  - [x] Add `photoStorageService` with user-context resolution and upload orchestration.
  - [x] Upload original and thumbnail assets to bucket paths.
  - [x] Persist media metadata records after upload.
- [x] Create reusable thumbnail generation utility (AC: 3)
  - [x] Add thumbnail dimension calculation helpers.
  - [x] Add browser-safe thumbnail generation with fallback.
  - [x] Add unit tests for deterministic sizing behavior.
- [x] Create PhotoUploadQueue service (AC: 4)
  - [x] Implement queue `add` backed by Dexie photo table.
  - [x] Implement queue `process` with success/failure tracking.
  - [x] Implement queue `getPendingCount`.
  - [x] Add dependency-injected unit tests for queue behavior.
- [x] Wire queue usage into photo capture flow (AC: 4)
  - [x] Add optional queue-on-capture behavior in `PhotoCapture`.
- [x] Run validations and update trackers
  - [x] Run targeted `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 7 Task 7.2 only.
- Do not implement duplicate-detection policy or SHA-256 enforcement (Task 7.3).

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 7 Task 7.2)
- `grid-electric-docs/10-IMPLEMENTATION-CHECKLIST.md` (Photo upload queue)
- `sql/07_media_audit_tables.sql` (media metadata schema)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added Supabase photo storage pipeline with original + thumbnail upload and media metadata insert.
- 2026-02-12: Added reusable thumbnail utility and deterministic tests.
- 2026-02-12: Added queue service for add/process/pending count over Dexie photo records.
- 2026-02-12: Added queue service unit tests using dependency-injected mocks.
- 2026-02-12: Validation passed:
  - `npx vitest run src/lib/utils/thumbnail.test.ts src/lib/services/photoStorageService.test.ts src/lib/sync/photoUploadQueue.test.ts`
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Added `src/lib/services/photoStorageService.ts` for Supabase upload + metadata persistence.
- Added `src/lib/utils/thumbnail.ts` for thumbnail generation and sizing helpers.
- Added `src/lib/sync/photoUploadQueue.ts` with queue add/process/count API.
- Added optional queue integration to `src/components/features/assessments/PhotoCapture.tsx`.
- Added unit tests:
  - `src/lib/services/photoStorageService.test.ts`
  - `src/lib/utils/thumbnail.test.ts`
  - `src/lib/sync/photoUploadQueue.test.ts`

### File List

- `_bmad-output/implementation-artifacts/7-2-photo-storage.md`
- `src/lib/services/photoStorageService.ts`
- `src/lib/services/photoStorageService.test.ts`
- `src/lib/utils/thumbnail.ts`
- `src/lib/utils/thumbnail.test.ts`
- `src/lib/sync/photoUploadQueue.ts`
- `src/lib/sync/photoUploadQueue.test.ts`
- `src/components/features/assessments/PhotoCapture.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 7.2 implemented and moved to `review`.
