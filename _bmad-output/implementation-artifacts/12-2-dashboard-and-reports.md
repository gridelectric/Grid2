# Story 12.2: Dashboard & Reports

Status: review

## Story

As an operations admin,
I want live dashboard metrics and a reporting workspace with visualizations and exports,
so that I can monitor throughput and produce audit-ready outputs for operations and billing.

## Acceptance Criteria

1. **Given** operational data across tickets, time, expenses, and invoices  
   **When** an admin opens the dashboard  
   **Then** a `DashboardMetrics` component shows live KPI cards and status breakdowns.
2. **Given** analytics/reporting needs for date-bounded operational review  
   **When** an admin opens reports  
   **Then** a reports interface supports date range + grouping controls and data refresh.
3. **Given** trend analysis requirements  
   **When** report data is loaded  
   **Then** data visualizations render period-based financial activity and subcontractor breakdowns.
4. **Given** downstream accounting/compliance workflows  
   **When** an admin exports report results  
   **Then** export functions generate CSV, Excel-compatible, and PDF artifacts.

## Tasks / Subtasks

- [x] Complete `DashboardMetrics` component (AC: 1)
  - [x] Add dashboard reporting service KPI aggregation (`tickets`, `time_entries`, `expense_reports`, `damage_assessments`, `subcontractor_invoices`).
  - [x] Replace dashboard mock metrics with live metric cards and refresh behavior.
- [x] Create reports interface (AC: 2)
  - [x] Add `ReportsDashboard` with date range, grouping selector (`day/week/month`), and refresh flow.
  - [x] Add dedicated reports pages/routes for admin access.
- [x] Implement data visualization (AC: 3)
  - [x] Add grouped bar visualization for approved time/expense/invoiced series.
  - [x] Add subcontractor performance breakdown table.
- [x] Create export functions (CSV/Excel/PDF) (AC: 4)
  - [x] Add report export artifact generator for CSV, Excel-compatible TSV, and PDF.
  - [x] Wire export buttons to download generated artifacts.
- [x] Add tests and validations
  - [x] Add `dashboardReportingService` tests.
  - [x] Run `npx vitest run src/lib/services/dashboardReportingService.test.ts`.
  - [x] Run full `npx vitest run` regression.
  - [x] Run `npx tsc --noEmit`.
  - [x] Run targeted `npx eslint` on changed files.

## Dev Notes

### Scope Boundaries

- Implement Week 12 Task 12.2 only.
- Preserve existing Week 12 Task 12.1 invoice foundations.

### References

- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Week 12 Task 12.2)
- `grid-electric-docs/08-PROJECT-ROADMAP.md` (Week 12 reporting deliverables)
- `grid-electric-docs/03-WIREFRAMES.md` (AD1 dashboard context, AD15 reports dashboard listing)
- `sql/03_ticket_tables.sql`, `sql/04_time_expense_tables.sql`, `sql/06_financial_tables.sql`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-02-12: Added dashboard/report aggregation service with KPI and grouped report builders.
- 2026-02-12: Added admin report interface, visualization, and CSV/Excel/PDF exports.
- 2026-02-12: Updated admin dashboard and navigation to surface reports entry points.
- 2026-02-12: Validation passed:
  - `npx vitest run src/lib/services/dashboardReportingService.test.ts`
  - `npx vitest run` (43 files, 206 tests)
  - `npx tsc --noEmit`
  - targeted `npx eslint` on changed files

### Completion Notes List

- Added `src/lib/services/dashboardReportingService.ts`:
  - dashboard KPI aggregation (`buildDashboardMetrics`)
  - report dataset builder (`buildDashboardReport`)
  - export artifact generator (`buildReportExportArtifact`) for CSV/Excel/PDF
  - runtime service (`dashboardReportingService`) for dashboard and reports pages
- Added `src/components/features/dashboard/DashboardMetrics.tsx` for live dashboard KPI cards.
- Added `src/components/features/dashboard/ReportsDashboard.tsx` for report controls, charting, breakdowns, and exports.
- Added route surfaces:
  - `src/app/(admin)/reports/page.tsx`
  - `src/app/(admin)/admin/reports/page.tsx`
- Updated admin dashboard + navigation:
  - `src/app/(admin)/dashboard/page.tsx`
  - `src/components/common/layout/navigationConfig.ts`
  - `src/components/common/layout/Sidebar.tsx`

### File List

- `_bmad-output/implementation-artifacts/12-2-dashboard-and-reports.md`
- `src/lib/services/dashboardReportingService.ts`
- `src/lib/services/dashboardReportingService.test.ts`
- `src/components/features/dashboard/DashboardMetrics.tsx`
- `src/components/features/dashboard/ReportsDashboard.tsx`
- `src/components/features/dashboard/index.ts`
- `src/app/(admin)/dashboard/page.tsx`
- `src/app/(admin)/reports/page.tsx`
- `src/app/(admin)/admin/reports/page.tsx`
- `src/components/common/layout/navigationConfig.ts`
- `src/components/common/layout/Sidebar.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`
- `AGENTS.md`

## Change Log

- 2026-02-12: Story 12.2 implemented and moved to `review`.
