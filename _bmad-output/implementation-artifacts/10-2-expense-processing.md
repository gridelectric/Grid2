# Story 10.2: Expense Processing

Status: review

## Story

As an operations team member and subcontractor,
I want automated mileage/OCR/policy processing with admin review controls,
so that expense approvals are faster, auditable, and policy-compliant.

## Acceptance Criteria

1. **Given** mileage expense entries  
   **When** odometer values are provided  
   **Then** mileage and reimbursement amounts are auto-calculated using configured rate.
2. **Given** receipt images on expense entries  
   **When** expenses are created  
   **Then** Tesseract.js OCR extracts receipt text and stores it with the expense item.
3. **Given** expense policy thresholds and validation rules  
   **When** expenses are created  
   **Then** policy flags and approval requirements are computed and persisted.
4. **Given** admin expense review needs  
   **When** operations users open expense review  
   **Then** they can filter, inspect policy flags, and approve/reject reports (single and batch).

## Tasks / Subtasks

- [x] Implement mileage calculator (AC: 1)
  - [x] Add reusable mileage calculation utility.
  - [x] Wire mileage calculator into expense form UX.
  - [x] Use calculated mileage amount in submission processing.
- [x] Integrate Tesseract.js OCR (AC: 2)
  - [x] Add OCR service wrapper with browser-safe loading.
  - [x] Extract/stash OCR text during expense create processing.
  - [x] Persist `receipt_ocr_text` to remote/local expense items.
- [x] Implement policy validation (AC: 3)
  - [x] Add policy validation utility for receipt threshold, limits, pre-approval, duplicate, and date checks.
  - [x] Persist `policy_flags`, `requires_approval`, `approval_reason`, and `mileage_calculated_amount`.
  - [x] Expand list mapping payloads to include new processing metadata.
- [x] Create expense review UI (admin) (AC: 4)
  - [x] Add `expenseProcessingService` for list/review operations.
  - [x] Add `ExpenseReviewList` with search/filter/summary/single+batch decisions.
  - [x] Add `app/(admin)/expense-review/page.tsx` and admin alias route.
- [x] Add tests and run validations
  - [x] Add utility tests for mileage/policy/OCR parsing.
  - [x] Add service tests for OCR and expense review service.
  - [x] Update submission service tests for mileage validation behavior.
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 10 Task 10.2 only.
- Do not start Week 11 damage assessment form tasks.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 10 Task 10.2)
- `grid-electric-docs/03-WIREFRAMES.md` (AD11 Expense Review context, SC10 mileage fields)
- `grid-electric-docs/05-API-SPECIFICATIONS.md` (Expenses 6.1-6.6)
- `sql/04_time_expense_tables.sql` (expense processing columns)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added mileage/policy/OCR processing utilities and OCR service wrapper.
- 2026-02-12: Extended expense submission service create/list mappings with processing metadata.
- 2026-02-12: Added admin expense review service and review UI routes/components.
- 2026-02-12: Validation passed:
  - `npx vitest run` (38 files, 187 tests)
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Added `src/lib/utils/expenseProcessing.ts` for:
  - mileage calculation (`calculateMileageExpense`)
  - OCR amount parsing (`extractLargestCurrencyAmount`)
  - policy validation (`validateExpensePolicy`)
- Added `src/lib/services/receiptOcrService.ts` to integrate Tesseract.js OCR using dynamic browser-safe loading.
- Updated `src/lib/services/expenseSubmissionService.ts` to:
  - auto-calculate mileage reimbursements
  - run receipt OCR extraction on create
  - compute/persist policy flags and approval metadata
  - include subcontractor and policy metadata in expense list items
- Added `src/lib/services/expenseProcessingService.ts` for admin review decisions on expense reports.
- Added `src/components/features/expenses/ExpenseReviewList.tsx` with:
  - search/status/date filters
  - summary cards
  - policy flag display
  - single and batch approve/reject controls
- Added admin routes:
  - `src/app/(admin)/expense-review/page.tsx`
  - `src/app/(admin)/admin/expense-review/page.tsx`
- Updated expense creation UX:
  - `ExpenseItemForm` shows mileage auto-calculation details
  - `ExpenseForm` enforces mileage-derived amount behavior when applicable

### File List

- `_bmad-output/implementation-artifacts/10-2-expense-processing.md`
- `src/lib/utils/expenseProcessing.ts`
- `src/lib/utils/expenseProcessing.test.ts`
- `src/lib/services/receiptOcrService.ts`
- `src/lib/services/receiptOcrService.test.ts`
- `src/lib/services/expenseSubmissionService.ts`
- `src/lib/services/expenseSubmissionService.test.ts`
- `src/lib/services/expenseProcessingService.ts`
- `src/lib/services/expenseProcessingService.test.ts`
- `src/components/features/expenses/ExpenseReviewList.tsx`
- `src/components/features/expenses/ExpenseItemForm.tsx`
- `src/components/features/expenses/ExpenseForm.tsx`
- `src/components/features/expenses/index.ts`
- `src/app/(admin)/expense-review/page.tsx`
- `src/app/(admin)/admin/expense-review/page.tsx`
- `src/lib/db/dexie.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 10.2 implemented and moved to `review`.
