# Story 7.3: Photo Validation

Status: review

## Story

As a field operations user,
I want strict photo validation with GPS, size, checksums, and duplicate detection,
so that submitted assessment media meets compliance and review integrity requirements.

## Acceptance Criteria

1. **Given** a captured assessment photo  
   **When** validation runs  
   **Then** GPS presence is required and missing GPS is rejected.
2. **Given** uploaded assessment photos  
   **When** validation runs  
   **Then** file size limits are enforced (max 10MB) after processing.
3. **Given** each captured photo  
   **When** validation runs  
   **Then** a SHA-256 checksum is calculated and stored for downstream processing.
4. **Given** multiple photos are captured  
   **When** a checksum matches prior captures  
   **Then** the photo is flagged as duplicate for review context.

## Tasks / Subtasks

- [x] Implement hashing utility (AC: 3)
  - [x] Add reusable SHA-256 helper for blob/file hashing.
  - [x] Add deterministic hash unit tests.
- [x] Implement photo validation module (AC: 1, 2, 3, 4)
  - [x] Add validation logic for GPS presence and max file size.
  - [x] Integrate checksum generation into validation result.
  - [x] Add duplicate detection using checksum comparison.
  - [x] Add validation unit tests for GPS, size, and duplicate scenarios.
- [x] Integrate validation into capture pipeline (AC: 1, 2, 3, 4)
  - [x] Wire validation into `prepareCapturedPhoto`.
  - [x] Persist checksum + duplicate flag metadata in captured photo model.
  - [x] Surface duplicate flag messaging in capture/gallery UI.
- [x] Propagate checksum to upload queue (AC: 3, 4)
  - [x] Ensure local queue records store checksum for upload pipeline.
- [x] Run validations and update trackers
  - [x] Run targeted `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 7 Task 7.3 only.
- Do not implement GPS spoofing cross-checks against device-vs-EXIF deltas in this story.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 7 Task 7.3)
- `grid-electric-docs/10-IMPLEMENTATION-CHECKLIST.md` (photo validation flow)
- `grid-electric-docs/09-DATA-FLOW-ANALYSIS.md` (EXIF/GPS validation expectations)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added SHA-256 utility and tests.
- 2026-02-12: Added dedicated assessment photo validation module (GPS, size, duplicate checks).
- 2026-02-12: Integrated validation into capture pipeline and UI duplicate indicators.
- 2026-02-12: Propagated checksum into local photo upload queue records.
- 2026-02-12: Validation passed:
  - `npx vitest run src/lib/utils/hash.test.ts src/lib/validation/photoValidation.test.ts src/lib/sync/photoUploadQueue.test.ts src/lib/utils/assessmentPhotos.test.ts`
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Added `src/lib/utils/hash.ts` and `src/lib/utils/hash.test.ts`.
- Added `src/lib/validation/photoValidation.ts` and `src/lib/validation/photoValidation.test.ts`.
- Updated `src/lib/utils/assessmentPhotos.ts` to enforce GPS + size validation, checksum generation, and duplicate flagging.
- Updated captured photo type model in `src/types/index.ts` to carry checksum and duplicate metadata.
- Updated `src/components/features/assessments/PhotoCapture.tsx` to pass existing checksums and show duplicate warnings.
- Updated `src/components/features/assessments/PhotoGallery.tsx` to display duplicate indicators.
- Updated `src/lib/sync/photoUploadQueue.ts` to store checksum in queued records.

### File List

- `_bmad-output/implementation-artifacts/7-3-photo-validation.md`
- `src/lib/utils/hash.ts`
- `src/lib/utils/hash.test.ts`
- `src/lib/validation/photoValidation.ts`
- `src/lib/validation/photoValidation.test.ts`
- `src/lib/utils/assessmentPhotos.ts`
- `src/components/features/assessments/PhotoCapture.tsx`
- `src/components/features/assessments/PhotoGallery.tsx`
- `src/lib/sync/photoUploadQueue.ts`
- `src/lib/sync/photoUploadQueue.test.ts`
- `src/types/index.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 7.3 implemented and moved to `review`.
