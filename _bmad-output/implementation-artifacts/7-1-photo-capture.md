# Story 7.1: Photo Capture

Status: review

## Story

As a field subcontractor,
I want a photo capture workflow with EXIF/GPS extraction and compression,
so that assessments include required, geo-tagged evidence optimized for upload/storage.

## Acceptance Criteria

1. **Given** a field user captures a photo  
   **When** the file is processed  
   **Then** a reusable `PhotoCapture` component supports camera/file upload capture flows.
2. **Given** captured photos contain EXIF data  
   **When** metadata is extracted  
   **Then** EXIF timestamp/device details are parsed  
   **And** GPS coordinates are read from EXIF tags when available.
3. **Given** high-resolution images are captured  
   **When** processing runs  
   **Then** image compression is applied via reusable utility logic.
4. **Given** multiple captured photos exist  
   **When** reviewing captured evidence  
   **Then** a `PhotoGallery` component renders preview + metadata cards.

## Tasks / Subtasks

- [x] Implement EXIF extraction utility (AC: 2)
  - [x] Add EXIF parsing utility for GPS/timestamp/device metadata.
  - [x] Add pure helper tests for timestamp parsing + GPS extraction.
- [x] Implement image compression utility (AC: 3)
  - [x] Add reusable compression utility with app-config defaults.
  - [x] Add deterministic tests for option normalization.
- [x] Implement assessment photo workflow utilities (AC: 1, 2, 3)
  - [x] Add captured photo preparation logic with file validation + EXIF + compression.
  - [x] Add photo-type counting and missing-required-type helpers.
  - [x] Add utility tests for required-type coverage.
- [x] Create assessment photo components (AC: 1, 4)
  - [x] Add `PhotoCapture` component with type selection, camera/file picker, and required-type progress.
  - [x] Add `PhotoGallery` component with metadata overlays and remove actions.
  - [x] Export components via `components/features/assessments/index.ts`.
- [x] Run validations and update trackers
  - [x] Run targeted `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 7 Task 7.1 only.
- Do not implement storage upload pipeline/thumbnail queue (Task 7.2).
- Do not implement checksum/duplicate detection enforcement (Task 7.3).

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 7 Task 7.1)
- `grid-electric-docs/10-IMPLEMENTATION-CHECKLIST.md` (Photo capture system)
- `grid-electric-docs/09-DATA-FLOW-ANALYSIS.md` (EXIF + GPS extraction expectations)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Implemented EXIF extraction utility with GPS/timestamp/device parsing.
- 2026-02-12: Implemented reusable image compression utility with app-config defaults.
- 2026-02-12: Implemented assessment photo processing workflow and required-type helpers.
- 2026-02-12: Added `PhotoCapture` and `PhotoGallery` feature components.
- 2026-02-12: Validation passed:
  - `npx vitest run src/lib/utils/exif.test.ts src/lib/utils/imageCompression.test.ts src/lib/utils/assessmentPhotos.test.ts`
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Added EXIF metadata utility in `src/lib/utils/exif.ts`.
- Added image compression utility in `src/lib/utils/imageCompression.ts`.
- Added photo workflow utility module in `src/lib/utils/assessmentPhotos.ts`.
- Added assessment feature components:
  - `src/components/features/assessments/PhotoCapture.tsx`
  - `src/components/features/assessments/PhotoGallery.tsx`
  - `src/components/features/assessments/index.ts`
- Added unit coverage for EXIF, compression options, and required photo-type logic.
- Added assessment photo types to `src/types/index.ts`.

### File List

- `_bmad-output/implementation-artifacts/7-1-photo-capture.md`
- `src/lib/utils/exif.ts`
- `src/lib/utils/exif.test.ts`
- `src/lib/utils/imageCompression.ts`
- `src/lib/utils/imageCompression.test.ts`
- `src/lib/utils/assessmentPhotos.ts`
- `src/lib/utils/assessmentPhotos.test.ts`
- `src/components/features/assessments/PhotoCapture.tsx`
- `src/components/features/assessments/PhotoGallery.tsx`
- `src/components/features/assessments/index.ts`
- `src/types/index.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 7.1 implemented and moved to `review`.
