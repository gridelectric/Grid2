# Story 12.1: Invoice Generation

Status: review

## Story

As an operations admin and subcontractor,
I want invoice generation and visibility tooling tied to approved work,
so that payments and 1099 tracking are accurate and auditable.

## Acceptance Criteria

1. **Given** approved time entries and approved expense reports in a billing period  
   **When** admins generate invoices  
   **Then** an `InvoiceGenerator` component supports selection, summarization, and invoice creation.
2. **Given** approved billable records  
   **When** invoice generation executes  
   **Then** invoices are auto-generated with line items and linked source records.
3. **Given** invoice detail viewing needs  
   **When** users open invoice details  
   **Then** an `InvoicePDFViewer` component provides PDF/open link behavior and line-item preview fallback.
4. **Given** tax compliance requirements for independent contractors  
   **When** invoice and payment totals change  
   **Then** a 1099 tracking display is available and fed by `tax_1099_tracking` updates.

## Tasks / Subtasks

- [x] Create `InvoiceGenerator` component (AC: 1)
  - [x] Add billing period selection and candidate loading.
  - [x] Add subcontractor selection, summaries, and generate action.
- [x] Implement auto-generation from approved entries (AC: 2)
  - [x] Add `invoiceGenerationService` with candidate discovery from approved `time_entries` and `expense_reports`.
  - [x] Create `subcontractor_invoices` + `invoice_line_items` records.
  - [x] Link source records via `invoice_id` updates.
- [x] Create `InvoicePDFViewer` component (AC: 3)
  - [x] Add invoice detail loading and line-item preview rendering.
  - [x] Add PDF URL open/link support when `pdf_url` exists.
- [x] Create 1099 tracking display (AC: 4)
  - [x] Add `Tax1099TrackingDisplay` component.
  - [x] Add tax tracking upsert logic (`tax_1099_tracking`) during generation.
- [x] Add invoice list surfaces
  - [x] Add `InvoiceList` component for subcontractor invoice history.
  - [x] Add admin and subcontractor invoice pages/routes.
- [x] Add tests and validations
  - [x] Add `invoiceGenerationService` tests.
  - [x] Run `npx vitest run`.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 12 Task 12.1 only.
- Leave Task 12.2 dashboard/reports work for next step.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 12 Task 12.1)
- `grid-electric-docs/03-WIREFRAMES.md` (AD13 Invoice Generation, SC13 Invoice List)
- `grid-electric-docs/05-API-SPECIFICATIONS.md` (Section 8 Invoices)
- `sql/06_financial_tables.sql` (`subcontractor_invoices`, `invoice_line_items`, `tax_1099_tracking`)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added invoice generation service for candidate discovery, invoice creation, line item creation, record linkage, and 1099 upsert.
- 2026-02-12: Added invoice feature components (`InvoiceGenerator`, `InvoiceList`, `InvoicePDFViewer`, `Tax1099TrackingDisplay`).
- 2026-02-12: Added admin and subcontractor invoice pages.
- 2026-02-12: Validation passed:
  - `npx vitest run` (42 files, 202 tests)
  - `npx tsc --noEmit`
  - targeted `npx eslint` on changed files

### Completion Notes List

- Added `src/lib/services/invoiceGenerationService.ts`:
  - list generation candidates from approved, un-invoiced `time_entries` and `expense_reports`
  - generate invoices with line items
  - link source records to generated invoice
  - update and expose 1099 tax tracking summaries
  - list invoice history and load invoice details
- Added `src/components/features/invoices/InvoiceGenerator.tsx` for admin generation flow.
- Added `src/components/features/invoices/InvoicePDFViewer.tsx` for invoice detail/PDF preview.
- Added `src/components/features/invoices/Tax1099TrackingDisplay.tsx` for year-based compliance tracking.
- Added `src/components/features/invoices/InvoiceList.tsx` for subcontractor invoice history and PDF viewing.
- Added invoice routes:
  - `src/app/(admin)/invoice-generation/page.tsx`
  - `src/app/(admin)/admin/invoice-generation/page.tsx`
  - `src/app/(subcontractor)/invoices/page.tsx`
  - `src/app/(subcontractor)/subcontractor/invoices/page.tsx`

### File List

- `_bmad-output/implementation-artifacts/12-1-invoice-generation.md`
- `src/lib/services/invoiceGenerationService.ts`
- `src/lib/services/invoiceGenerationService.test.ts`
- `src/components/features/invoices/InvoiceGenerator.tsx`
- `src/components/features/invoices/InvoiceList.tsx`
- `src/components/features/invoices/InvoicePDFViewer.tsx`
- `src/components/features/invoices/Tax1099TrackingDisplay.tsx`
- `src/components/features/invoices/index.ts`
- `src/app/(admin)/invoice-generation/page.tsx`
- `src/app/(admin)/admin/invoice-generation/page.tsx`
- `src/app/(subcontractor)/invoices/page.tsx`
- `src/app/(subcontractor)/subcontractor/invoices/page.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 12.1 implemented and moved to `review`.
