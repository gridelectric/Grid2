# Grid Electric Services — AI Agent Guide

---

## Pre-Work Checklist

Before taking action on this project:

1. Review project documentation as needed for your task
2. Check current implementation status to avoid duplicated work
3. Follow phase order when executing roadmap tasks
4. Keep task tracking documentation current when relevant

---

## Quick Status Overview

| Metric | Value |
|--------|-------|
| **Current Phase** | Phase 4 — Polish & Launch (Week 13 ready) |
| **Overall Progress** | 84% Complete |
| **Weeks 1-5 Status** | ✅ Complete |
| **Week 6 Status** | ✅ Complete (Tasks 6.1-6.3 complete) |
| **Week 7 Status** | ✅ Complete (Tasks 7.1-7.3 complete) |
| **Week 8 Status** | ✅ Complete (Tasks 8.1-8.3 complete) |
| **Week 9 Status** | ✅ Complete (Tasks 9.1-9.2 complete) |
| **Week 10 Status** | ✅ Complete (Tasks 10.1-10.2 complete) |
| **Week 11 Status** | ✅ Complete (Tasks 11.1-11.2 complete) |
| **Week 12 Status** | ✅ Complete (Tasks 12.1-12.2 complete) |

### Completed So Far

- ✅ Project initialization (Next.js 14 + TypeScript + Tailwind)
- ✅ shadcn/ui components installed (24 components)
- ✅ Dependencies installed (80+ packages)
- ✅ TypeScript type definitions
- ✅ Configuration files (appConfig.ts, Supabase clients, Dexie.js)
- ✅ Database SQL files (01-10)
- ✅ PWA manifest
- ✅ Zustand auth store
- ✅ Utility functions (formatters, validators)
- ✅ Authentication screens and auth components
- ✅ Onboarding flow (12 screens + forms)
- ✅ Admin setup and subcontractor management
- ✅ Ticket system (CRUD, components, status management)
- ✅ Map integration primitives (`MapView`, `TicketMarkers`, `RouteOverlay`, `GeofenceCircle`)
- ✅ GPS workflow foundations (`useGPSValidation`, geofence checks, route optimization + route view)
- ✅ GPS-validated 3-status field flow (`In Route -> On Site -> Complete`) with full-screen mobile map mode
- ✅ Photo capture foundation (`PhotoCapture`, `PhotoGallery`, EXIF/GPS extraction, image compression)
- ✅ Photo storage foundation (Supabase upload pipeline, thumbnail generation, `PhotoUploadQueue`)
- ✅ Photo validation foundation (GPS + size validation, SHA-256 checksums, duplicate detection flags)
- ✅ Offline storage foundation start (Dexie schema v2, ticket cache helpers, time entry/photo queue hardening)
- ✅ Service worker foundation (`public/sw.js` cache strategies + background sync hooks + registration provider)
- ✅ Global offline connectivity banner (`OfflineBanner`)
- ✅ Sync status foundation (`SyncProvider`, `SyncStatus`, queue management + conflict resolution UI)
- ✅ Time clock foundation (`TimeClock`, `ActiveTimer`, `WorkTypeSelector`, GPS-verified clock in/out flow)
- ✅ Time entry management (`TimeEntryList`, `TimeEntryCard`, calculation summaries, admin batch review interface)
- ✅ Expense submission foundation (`ExpenseList`, `ExpenseForm`, `ExpenseItemForm`, `ReceiptCapture`, subcontractor expense pages)
- ✅ Expense processing foundation (mileage auto-calculator, Tesseract OCR integration, policy validation, admin expense review UI)
- ✅ Assessment form foundation (`AssessmentForm`, `SafetyChecklist`, `EquipmentAssessment`, `DamageClassification`, `PhotoGallery`, subcontractor assessment create page)
- ✅ Equipment catalog + assessment review foundation (`EquipmentSelect`, `WireSizeSelect`, DB-backed catalog service, admin assessment review UI)
- ✅ Invoice generation foundation (`InvoiceGenerator`, `InvoicePDFViewer`, 1099 tracking display, auto-generation service + invoice list pages)
- ✅ Dashboard and reporting foundation (`DashboardMetrics`, `ReportsDashboard`, operational visualization, CSV/Excel/PDF exports)

### Next Tasks (Week 13)

- ⏳ Task 13.1: Testing suite (unit, integration, E2E, offline, security, cross-browser, mobile)

---

## Project Overview

**Grid Electric Services Damage Assessment Platform** — A Progressive Web Application (PWA) for managing independent 1099 subcontractor crews performing utility damage assessments for government contracts.

### Business Context

| Aspect | Details |
|--------|---------|
| **Prime Contractor** | Grid Electric Services |
| **Workforce Model** | Independent 1099 subcontractors (not employees) |
| **Client Base** | Power utility companies with government contracts |
| **Compliance Level** | FISMA/FedRAMP moderate |

### Core Purpose

Enable efficient dispatch, tracking, and billing of damage assessment crews while maintaining strict compliance with government contract standards and independent contractor legal requirements.

---

## Technology Stack

### Frontend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 14+ (App Router) |
| Language | TypeScript | 5.x |
| UI Library | React | 19 |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui | 24+ components |
| State Management | Zustand | Latest |
| Server State | TanStack Query | Latest |
| Offline Storage | Dexie.js (IndexedDB) | Latest |
| Maps | Mapbox GL JS | Latest |

### Backend

| Component | Technology |
|-----------|------------|
| BaaS | Supabase |
| Database | PostgreSQL 15+ |
| Auth | Supabase Auth (email/password, magic link) |
| Storage | Supabase Storage |
| Real-time | Supabase Realtime |
| Security | Row-Level Security (RLS) |

### External Services

| Service | Purpose |
|---------|---------|
| Mapbox | Maps, routing, geocoding |
| OSRM (self-hosted) | Free unlimited routing |
| Web Push API | PWA notifications |
| Supabase Storage | Photos, documents, PDFs |

---

## Project Structure

```
Grid2/
├── app/                          # Next.js application
│   ├── (auth)/                   # Auth routes (login, forgot-password, etc.)
│   ├── (onboarding)/             # 12-step onboarding flow
│   ├── (admin)/                  # Admin portal (18 screens)
│   ├── (subcontractor)/          # Subcontractor portal (16 screens)
│   └── api/                      # API routes
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── common/                   # Shared components
│   │   ├── layout/               # AppShell, Sidebar, BottomNav, TopBar
│   │   ├── feedback/             # LoadingSpinner, ErrorBoundary, OfflineBanner
│   │   ├── data-display/         # DataTable, StatusBadge, MetricCard
│   │   └── forms/                # FormField, ImageUpload, SignaturePad
│   ├── features/                 # Feature-specific components
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── tickets/
│   │   ├── time-tracking/
│   │   ├── expenses/
│   │   ├── assessments/
│   │   ├── invoices/
│   │   ├── map/
│   │   └── dashboard/
│   └── providers/                # Context providers
│
├── hooks/                        # Custom React hooks
├── lib/                          # Utilities & configuration
│   ├── config/appConfig.ts       # App constants & enums
│   ├── supabase/                 # Supabase clients
│   ├── db/dexie.ts               # IndexedDB offline storage
│   ├── services/                 # External services (Mapbox, etc.)
│   ├── utils/                    # Utility functions
│   └── constants/                # App constants
│
├── stores/                       # Zustand stores
├── types/                        # TypeScript type definitions
├── sql/                          # Database SQL files (01-10)
├── public/                       # Static assets
│
└── grid-electric-docs/           # 📚 TECHNICAL DOCUMENTATION
    ├── MASTER_BUILD_INSTRUCTIONS.md
    ├── README.md                     Documentation index
    ├── 01-TECHNICAL-PRD.md           Product requirements
    ├── 02-DATABASE-SCHEMA.md         Database schema
    ├── 03-WIREFRAMES.md              UI designs (52 screens)
    ├── 04-DESIGN-SYSTEM.md           Colors, typography
    ├── 05-API-SPECIFICATIONS.md      API documentation
    ├── 06-COMPONENT-ARCHITECTURE.md  React structure
    ├── 07-OFFLINE-PWA-STRATEGY.md    Service worker, IndexedDB
    ├── 08-PROJECT-ROADMAP.md         16-week timeline
    ├── 09-DATA-FLOW-ANALYSIS.md      Ticket lifecycle
    └── 10-IMPLEMENTATION-CHECKLIST.md Build checklist
```

---

## Key Documentation Reference

### Before Any Work, Read These Files in Order

1. **Technical Specifications (as needed):**

   | Topic | Document | When to Reference |
   |-------|----------|-------------------|
   | Requirements | `01-TECHNICAL-PRD.md` | Feature planning |
   | Database | `02-DATABASE-SCHEMA.md` | Database work |
   | UI/UX | `03-WIREFRAMES.md` | UI implementation |
   | Styling | `04-DESIGN-SYSTEM.md` | Styling, theming |
   | API | `05-API-SPECIFICATIONS.md` | Backend integration |
   | Architecture | `06-COMPONENT-ARCHITECTURE.md` | Component development |
   | Offline | `07-OFFLINE-PWA-STRATEGY.md` | Offline functionality |
   | Roadmap | `08-PROJECT-ROADMAP.md` | Planning, tracking |
   | Data Flow | `09-DATA-FLOW-ANALYSIS.md` | Data flow implementation |
   | Checklist | `10-IMPLEMENTATION-CHECKLIST.md` | Daily task reference |

---

## Core Features & Requirements

### 1. User Roles

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | Full system access |
| ADMIN | Tickets, assignments, approvals |
| TEAM_LEAD | Own tickets, time, expenses only |
| CONTRACTOR | Read-only access to all data |

### 2. Ticket Lifecycle (13 Statuses)

```
DRAFT → ASSIGNED → IN_ROUTE → ON_SITE → IN_PROGRESS → COMPLETE → 
PENDING_REVIEW → APPROVED/NEEDS_REWORK → CLOSED
```

### 3. GPS Requirements

- **Accuracy threshold:** < 100 meters
- **Geofence radius:** 500 meters (configurable)
- **Clock-in photo:** Required with GPS verification
- **Update frequency:** 30s (IN_ROUTE), 5min (ON_SITE)

### 4. Photo Requirements

- **Minimum per assessment:** 4 photos
- **Mandatory types:** Overview, Equipment, Damage, Safety
- **GPS tagging:** Required (extracted from EXIF)
- **Minimum resolution:** 1920×1080
- **Maximum file size:** 10MB per photo
- **Format:** JPEG (quality: 85%)
- **Integrity:** SHA-256 checksum on upload

### 5. Time Tracking Rules

- **Max duration:** 12 hours per entry
- **Warning threshold:** 8 hours
- **GPS verification:** Required at clock in/out
- **Photo verification:** Required at clock in/out
- **Work types:** STANDARD_ASSESSMENT, EMERGENCY_RESPONSE, TRAVEL, STANDBY, ADMIN, TRAINING

---

## Code Style Guidelines

### File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Pages | `page.tsx` | `app/(admin)/dashboard/page.tsx` |
| Layouts | `layout.tsx` | `app/(admin)/layout.tsx` |
| Components | PascalCase | `TicketList.tsx`, `TimeClock.tsx` |
| Hooks | camelCase with `use` prefix | `useTickets.ts`, `useGeolocation.ts` |
| Utilities | camelCase | `formatters.ts`, `validators.ts` |
| Types | PascalCase | `Ticket.ts`, `TimeEntry.ts` |
| Constants | SCREAMING_SNAKE_CASE | `TICKET_STATUSES`, `WORK_TYPES` |

### Import Order

1. React/Next.js imports
2. Third-party library imports
3. shadcn/ui components (`@/components/ui/*`)
4. Custom components (`@/components/*`)
5. Hooks (`@/hooks/*`)
6. Utilities (`@/lib/*`)
7. Types (`@/types/*`)
8. Constants (`@/lib/constants/*`)

### Component Structure Template

```typescript
// 1. Imports (ordered per above)
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils/formatters';
import { Ticket } from '@/types/ticket';

// 2. Type definitions
interface TicketCardProps {
  ticket: Ticket;
  onStatusChange?: (id: string, status: string) => void;
}

// 3. Component
export function TicketCard({ ticket, onStatusChange }: TicketCardProps) {
  // Implementation
}

// 4. Default export (if needed)
export default TicketCard;
```

---

## Build and Development Commands

### Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

### Environment Variables

Create `.env.local` with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_TIME_ENTRY_HOURS=12
NEXT_PUBLIC_GEOFENCE_RADIUS_METERS=500
NEXT_PUBLIC_MAX_PHOTO_SIZE_MB=10
NEXT_PUBLIC_MIN_PHOTOS_REQUIRED=4
```

---

## Development Rules

### ✅ DO

- Check what's already completed in Section 2
- Follow the phase order (1 → 2 → 3 → 4)
- Use existing components from `components/ui/`
- Follow the design system (`04-DESIGN-SYSTEM.md`)
- Test offline functionality when building features
- Make minimal changes to achieve the goal
- Follow existing code patterns

### ❌ DON'T

- Skip reading the master instructions
- Duplicate work already completed
- Skip phases or jump ahead
- Create new components that already exist in shadcn/ui
- Ignore the design system colors/typography
- Forget to handle offline scenarios
- Bypass GPS checks or photo requirements
- Run git operations without user confirmation

---

## Offline-First Architecture

### Storage Hierarchy

| Layer | Technology | Purpose |
|-------|------------|---------|
| React State | useState/useReducer | UI state (session only) |
| Zustand Store | Zustand | App state (memory + partial persist) |
| React Query Cache | TanStack Query | Server state (memory + cache) |
| IndexedDB | Dexie.js | Local database (persistent) |
| Cache API | Service Worker | Static assets (persistent) |

### Sync Strategy

1. **Optimistic UI updates** — UI updates immediately
2. **Local-first data** — All data originates in IndexedDB
3. **Background sync** — Queue operations for when connectivity returns
4. **Conflict resolution** — Server timestamp priority with user prompts

---

## Security Considerations

### Authentication

- Password policy: 12+ chars, complexity requirements
- Failed login lockout: 5 attempts = 15 min lockout
- Session timeout: 8 hours idle, 24 hours max
- MFA: Optional for MVP, required for admins post-MVP

### Data Encryption

| Layer | Method |
|-------|--------|
| Data at rest | AES-256 (Supabase default) |
| Data in transit | TLS 1.3 |
| Sensitive fields | Column-level encryption |
| File storage | Server-side encryption |

### Audit Logging

All actions logged with:

- User ID
- Timestamp (UTC)
- Action type
- IP address
- Device fingerprint
- Before/after values (for changes)

---

## Testing Instructions

### Critical Test Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Contractor clocks in outside geofence | Error: "Must be within 500m of site" |
| Photo without GPS | Error: "Enable location services" |
| Submit assessment with 3 photos | Error: "Minimum 4 photos required" |
| Time entry > 12 hours | Auto-clock out + admin flag |
| Duplicate photo uploaded | Flag for admin review |
| GPS spoofing detected | Flag for admin review |
| Offline assessment submission | Queued for sync |

### Performance Targets

- Page load (initial): < 2s
- Page load (subsequent): < 1s
- API response: < 200ms
- Photo upload: < 5s per MB
- Map initialization: < 3s

---

## Need Help?

### Documentation by Topic

| Topic | Primary Doc | Secondary Doc |
|-------|-------------|---------------|
| Requirements | `01-TECHNICAL-PRD.md` | `08-PROJECT-ROADMAP.md` |
| Database | `02-DATABASE-SCHEMA.md` | `09-DATA-FLOW-ANALYSIS.md` |
| UI/UX | `03-WIREFRAMES.md` | `04-DESIGN-SYSTEM.md` |
| API | `05-API-SPECIFICATIONS.md` | `06-COMPONENT-ARCHITECTURE.md` |
| Offline | `07-OFFLINE-PWA-STRATEGY.md` | `10-IMPLEMENTATION-CHECKLIST.md` |

### External References

- **Next.js 14:** <https://nextjs.org/docs>
- **shadcn/ui:** <https://ui.shadcn.com>
- **Supabase:** <https://supabase.com/docs>
- **TanStack Query:** <https://tanstack.com/query/latest>
- **Zustand:** <https://docs.pmnd.rs/zustand>
- **Dexie.js:** <https://dexie.org/docs>
- **Mapbox GL JS:** <https://docs.mapbox.com/mapbox-gl-js>
- **Tailwind CSS:** <https://tailwindcss.com/docs>

---

## Summary

**This is a documentation package, not a working application.** The actual code needs to be implemented following these specifications.

**Compliance is critical.** All changes must maintain FISMA/FedRAMP moderate compliance requirements, especially:

- Audit logging
- Data encryption
- Access controls (RLS)
- 1099 tracking accuracy

**Offline-first is a core requirement.** Field subcontractors work in areas with poor cellular coverage. Always implement features with offline capability in mind.

**GPS validation is mandatory.** All time entries and photos require GPS verification. Never disable or bypass GPS checks.

---

**Last Updated:** February 9, 2026  
**Documentation Version:** 1.1  
**Next Milestone:** Supabase Project Setup & Authentication Screens

---

*Use project documentation that best fits the task at hand.*


---

## Skill Selection Rule (Use the Most Relevant Skill)

When assigned a task, **choose the most applicable built-in skill/workflow first** (e.g., docs, pdfs, spreadsheets, web research, code generation, image editing).  
If multiple skills apply, **use the one that best reduces risk and increases correctness** (example: for a DB schema change, prioritize schema-first reasoning + migration output + type updates, then UI).

**Default skill selection by task type:**
- **UI work (screens/components/layout/styling):** docs + code review workflow + design system tokens
- **Database / RLS / migrations:** schema-first workflow + migration + relationship audit
- **Offline/sync/Dexie:** offline-first workflow + queue/engine invariants review
- **PDF/form extraction:** pdf workflow (tables/fields) + form modeling
- **Exports (CSV/Excel/PDF):** spreadsheets/pdfs workflow
- **Architecture / refactors:** docs + dependency/impact mapping

---

## Mandatory Recursive Impact Review (Two-Pass)

Every change must include a **recursive impact review** so we don’t break hidden dependencies.

### Pass A — Primary Implementation (Do the work)
Implement the requested change using existing patterns, existing components, and the correct architectural boundary:
- **Admin portal:** Server Actions
- **Contractor app:** Local-first (Dexie) + `useSyncMutation` (never direct inserts in UI)

### Pass B — Verifier Review (Second Agent / Self-Review)
After implementation, run a **Verifier pass** (can be a sub-agent or a second pass by you) that answers:

1. **What else could this change affect?** (UI, types, DB, sync, policies, tests, docs)
2. **What must be updated to keep consistency?**
3. **What might silently break?** (RLS, foreign keys, indexes, offline queue, form validation, exports)

**Deliverable:** a short “Impact Report” section in your response/PR notes:
- **Touched:** files, tables, endpoints/actions
- **Also checked:** related screens/components, types/schemas, RLS, tests
- **Risks:** what to watch
- **Backout:** how to revert safely

---

## Change Impact Map (Use This Checklist Every Time)

### 1) UI / UX Changes (Screens, Components, Styling)
If you change **anything on screen**, confirm:
- **Component reuse:** does a shared component affect other screens?
- **Design system tokens:** are colors, radius, borders, shadows, spacing consistent with `04-DESIGN-SYSTEM.md`?
- **Global styles:** if adding a border/radius/spacing rule, should it be a **token** or shared class utility?
- **Mobile + desktop:** verify breakpoints and touch targets (44px+).
- **Accessibility:** focus states, contrast, aria labels, error messages.

**Styling consistency rule:**  
If you add a new visual rule (e.g., border around cards), decide whether it is:
- a) **Local to one screen**, or  
- b) a **system rule** → then update the shared component (or design token) and apply consistently across all screens that use that component.

### 2) Data Model / Database Changes (Supabase Postgres)
If you add/rename/remove a field or entity, confirm:
- **Supabase migration:** SQL file updated (new columns, FKs, indexes).
- **Relationships:** foreign keys, join tables, cascades, uniqueness constraints.
- **RLS policies:** read/write policies still correct for all roles.
- **Audit logging:** action/changes still captured if applicable.
- **Storm event scoping:** ensure records are scoped by `storm_event_id` (use **“storm event”** terminology only).

### 3) Shared Types & Validation (Zod + TypeScript)
If schema changes:
- Update **Zod schemas** in `src/lib/schemas` (or feature schema files).
- Update inferred **TypeScript types** used by components/actions.
- Update **form defaults** + validation messages.
- Update any **transform/mapping** logic (imports/exports, adapters).

### 4) API / Server Actions / Services
If mutation/query changes:
- Update server actions signatures and return types.
- Confirm error handling format `{ data, error }`.
- Update any client hooks calling these actions.

### 5) Offline / Dexie / Sync Engine (Contractor Portal)
If it touches offline-capable data:
- Update Dexie schema + version bump + migration path.
- Confirm queue payload compatibility (old queued items must not brick sync).
- Confirm `useSyncMutation` path still writes to Dexie first.
- Confirm conflict rules (last-write-wins MVP) still hold.

### 6) Reporting / Exports / PDFs
If a data field changes:
- Update exports (CSV/Excel/PDF templates).
- Update any “print” views or invoice generation.

### 7) Tests
If behavior changes:
- Update/extend unit tests (schemas, services).
- Update/extend integration/E2E tests for critical paths (tickets, assessments, time/expenses).

### 8) Docs / Wireframes / Roadmap (When Relevant)
If it changes user flow or data meaning:
- Update docs references in `grid-electric-docs/` as needed.
- Note any roadmap shifts.

---

## “Do Not Break” Invariants (Hard Rules)

1. **Everything is scoped under `storm_event_id`.** The storm event is the environment.  
2. **Contractor writes are local-first.** No direct `supabase.from().insert()` inside contractor UI components. Use `useSyncMutation`.  
3. **Naming convention is mandatory** where applicable: `YYMMDD + [Customer(3)][Utility(3)][City(3)]`.  
4. **RLS is not optional.** Any new table/column must be reviewed for policies.  
5. **Design system consistency.** Prefer tokens/shared components over one-off styling hacks.

---

## PR / Task Output Template (Always Use)

When you complete a task, end with:

### Implementation Notes
- What you changed (1–5 bullets)

### Impact Report (Verifier Pass)
- **UI:** screens/components impacted
- **DB:** tables/columns/policies impacted
- **Types:** schemas/types updated
- **Offline/Sync:** queue/Dexie changes (if any)
- **Tests:** added/updated
- **Docs:** updated (if any)
- **Risks & Backout:** quick notes

