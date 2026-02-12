# Story 10.1: Expense Submission

Status: review

## Story

As a field subcontractor,  
I want an expense submission workflow with receipt capture and list visibility,  
so that I can submit reimbursable field costs with audit-ready evidence.

## Acceptance Criteria

1. **Given** subcontractors need expense visibility  
   **When** they open expenses  
   **Then** an `ExpenseList` page shows submitted items, statuses, and monthly totals.
2. **Given** subcontractors need to add new expenses  
   **When** they open create expense  
   **Then** an `ExpenseCreate` page and `ExpenseForm` are available.
3. **Given** expense details vary by category  
   **When** users complete entry details  
   **Then** `ExpenseItemForm` captures category, amount, date, optional mileage fields, related ticket, and billable flag.
4. **Given** receipt evidence is required for many expenses  
   **When** users attach receipt images  
   **Then** a `ReceiptCapture` component supports camera/upload, preview, validation, and removal.

## Tasks / Subtasks

- [x] Create ExpenseList page (AC: 1)
  - [x] Add `app/(subcontractor)/expenses/page.tsx`.
  - [x] Add list-level filtering/search/status controls.
  - [x] Add monthly and status summary cards.
- [x] Create ExpenseCreate page (AC: 2)
  - [x] Add `app/(subcontractor)/expenses/create/page.tsx`.
  - [x] Wire save callback to return to expenses list.
- [x] Create ExpenseForm component (AC: 2)
  - [x] Add form orchestration and submit handling.
  - [x] Load related ticket options for subcontractor assignment context.
  - [x] Submit via expense submission service with online/local fallback.
- [x] Create ExpenseItemForm component (AC: 3)
  - [x] Add category/date/description/amount fields.
  - [x] Add optional mileage + location fields for mileage entries.
  - [x] Add related ticket and billable-to-client controls.
- [x] Create ReceiptCapture component (AC: 4)
  - [x] Add camera/upload actions and file validation.
  - [x] Add image preview and remove control.
- [x] Add expense service and utility support
  - [x] Add `expenseSubmissionService` for list/create with online/local fallback.
  - [x] Add expense summary utility calculations.
  - [x] Extend Dexie local expense types for additional expense metadata.
- [x] Add tests and run validations
  - [x] Add service tests for list/create behavior and fallback paths.
  - [x] Add utility tests for expense summary calculations.
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 10 Task 10.1 only.
- Do not implement Week 10 Task 10.2 processing features (mileage calculator, OCR, policy validation, admin review).

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 10 Task 10.1)
- `grid-electric-docs/03-WIREFRAMES.md` (SC9/SC10 expense screens)
- `grid-electric-docs/05-API-SPECIFICATIONS.md` (Expenses 6.1-6.4)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added expense submission service with online-first and local fallback create/list flows.
- 2026-02-12: Added expense feature components and subcontractor expense routes.
- 2026-02-12: Added expense summary utility and test coverage.
- 2026-02-12: Validation passed:
  - `npx vitest run` (35 files, 174 tests)
  - `npx tsc --noEmit`
  - Targeted `npx eslint` on changed files

### Completion Notes List

- Added `src/lib/services/expenseSubmissionService.ts` for:
  - expense list retrieval with status/date filters
  - remote Supabase list/create support
  - local fallback list/create behavior with sync queue entries
  - receipt upload path handling for remote create flow
- Added `src/components/features/expenses/ExpenseList.tsx` with:
  - search + status filter controls
  - monthly/status summary cards
  - desktop table and mobile card rendering
- Added `src/components/features/expenses/ExpenseForm.tsx` and `ExpenseItemForm.tsx` for:
  - category/date/description/amount entry
  - optional mileage/location/ticket linkage
  - billable flag and receipt attachment flow
- Added `src/components/features/expenses/ReceiptCapture.tsx` for validated image attach/preview/remove interactions.
- Added subcontractor expense routes:
  - `src/app/(subcontractor)/expenses/page.tsx`
  - `src/app/(subcontractor)/expenses/create/page.tsx`
  - portal-prefixed aliases for navigation compatibility
- Extended local Dexie expense interfaces to support richer payload fields used in Week 10 workflows.
- Added `src/lib/utils/expenses.ts` summary helper and tests.

### File List

- `_bmad-output/implementation-artifacts/10-1-expense-submission.md`
- `src/lib/services/expenseSubmissionService.ts`
- `src/lib/services/expenseSubmissionService.test.ts`
- `src/lib/utils/expenses.ts`
- `src/lib/utils/expenses.test.ts`
- `src/components/features/expenses/ExpenseList.tsx`
- `src/components/features/expenses/ExpenseForm.tsx`
- `src/components/features/expenses/ExpenseItemForm.tsx`
- `src/components/features/expenses/ReceiptCapture.tsx`
- `src/components/features/expenses/index.ts`
- `src/app/(subcontractor)/expenses/page.tsx`
- `src/app/(subcontractor)/expenses/create/page.tsx`
- `src/app/(subcontractor)/subcontractor/expenses/page.tsx`
- `src/app/(subcontractor)/subcontractor/expenses/create/page.tsx`
- `src/lib/db/dexie.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 10.1 implemented and moved to `review`.
