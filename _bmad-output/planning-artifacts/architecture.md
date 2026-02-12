---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-11'
project_name: 'Grid2'
user_name: 'GOD'
date: '2026-02-11'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Core Critical Path:** Offline Field Assessments & Data Synchronization.
- **Workflows:** Ticket lifecycle (Dispatch -> Field -> Resolve), User Management.
- **Assessment Engine:** Hierarchical, conditional logic forms (Pole -> Equipment).
- **Role-Based Interfaces:** Distinct "Command Center" (Admin/Desktop) vs "Field Mode" (Contractor/Mobile).

**Non-Functional Requirements:**
- **Offline Integrity:** Zero-data-loss guaranteed via local-first write path (Dexie.js).
- **Session Persistence:** robust draft saving for complex forms.
- **Platform Constraints:** Must operate within iOS/Safari background processing limits.
- **Performance:** Instant interaction (<100ms) for field data entry.

**Scale & Complexity:**
- **Complexity Level:** **HIGH** (comparable to localized ERP).
- **Primary Domain:** Local-First PWA w/ Serverless Sync.
- **Critical Risk:** Sync conflict management & relational integrity in offline creation.

### Technical Constraints & Dependencies
- **Timeline:** 30-day MVP (Requires aggressive scope management).
- **Mobile Hardware:** High-reliability GPS & Camera integration required.
- **Infrastructure:** Supabase (Auth, DB, Safe Storage).
- **Client ID Gen:** UUIDv4 required for all offline entities.

### Cross-Cutting Concerns Identified
1.  **Sync Engine:** Custom "Store-and-Forward" queue with retry logic.
2.  **Schema Architecture:** Isomorphic validation (Zod) shared between Client/Edge.
3.  **Conflict Resolution:** Last-write-wins (MVP) -> Operational Transform (Future).
4.  **Role Abstraction:** Shared data layer, divergent UI presentations.

## Technology Stack Ratification

### Primary Technology Domain
**Existing Application** (Progressive Web App - Local First)

### Ratified Stack: Next.js + Supabase + Dexie

**Rationale for Ratification:**
The existing codebase matches the architectural requirements perfectly. `package.json` confirms a modern, type-safe stack optimized for the "Offline-First" and "Mobile Field Ops" requirements. No new starter template is needed; we are building upon this established foundation.

**Core Technology Decisions:**

**Language & Runtime:**
- **TypeScript 5+:** Enforced strict typing for shared schemas (Zod).
- **Next.js 16.1 (App Router):** Server Actions for secure mutations; leveraging React Server Components for Admin dashboard performance.
- **React 19:** Bleeding edge adoption for performance gains.

**Data & State Architecture:**
- **Supabase (@supabase/ssr):** Auth, Database, and Realtime sync backend.
- **Dexie.js (IDB):** **CRITICAL**. Local-first database for offline storage.
- **React Query:** Managing server state and synchronization status.
- **Zustand:** Client-only global state (UI session, drafts).

**UI & Design System:**
- **Tailwind CSS v4:** Zero-runtime styling.
- **Shadcn/UI:** Component library foundation.
- **Lucide React:** Iconography.
- **Mapbox GL:** Geospatial visualization (cached for offline).

**Field Operations Toolkit:**
- **React Hook Form:** Performance-optimized form handling.
- **Zod:** Schema validation (Shared Client/Server).
- **React Signature Canvas:** Evidence capture.
- **Tesseract.js:** *Performance Risk Flag* - OCR capabilities to be evaluated for edge vs client execution.

**Testing:**
- **Vitest:** Unit and Integration testing.
- **React Testing Library:** Component testing.

**Note:** This stack is already initialized. The "Implementation" phase will focus on feature development, not scaffolding.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **RBAC Strategy:** Database Lookup (RLS) via `public.profiles`.
- **Sync/API Pattern:** Hybrid (Server Actions for Admin + Direct Client for Offline Sync).
- **Validation:** Centralized Zod Schemas in `src/lib/schemas`.

**Important Decisions (Shape Architecture):**
- **Hosting:** Vercel (Production) + Supabase (Backend).

### Data Architecture

**Database Choice:** Supabase (PostgreSQL) + Dexie.js (Local IDB).
**Schema Strategy:**
- **Primary:** Defined in Supabase (SQL). Includes `crews` table for pairing logic.
- **Local:** Defined in Dexie (`db.ts`). Syncs assigned `crews` configuration.
- **Validation:** Zod schemas in `src/lib/schemas` shared by Client forms and Server Actions.
**Migration:** Supabase CLI migrations (`supabase db diff`).

### Authentication & Security

**Auth Method:** Supabase Auth (SSR).
**Authorization (RBAC):**
- **Role Source:** `public.profiles` table linked to `auth.users`.
- **Entity Model:**
    - **User:** Individual actor (Admin, Contractor).
    - **Crew:** A grouping of Contractors (Driver + Passenger).
    - **Assignment:** Tickets are assigned to a **Crew** (primary) or **User** (fallback).
- **Enforcement:**
    - **Database:** RLS Policies (Row Level Security).
    - **UI:** Server-side role checks in Layouts/Page Loaders.
    - **API:** Role checks in Server Actions.

### API & Communication Patterns

**Hybrid Strategy:**
1.  **Admin Portal (Online-First):** Uses **Server Actions** for direct, type-safe mutations and data fetching.
2.  **Contractor Portal (Offline-First):** Uses **Supabase Client** directly for:
    - `pull`: Syncing assigned tickets to Dexie.
    - `push`: Syncing completed assessments from Dexie to Server.
    - *Reasoning:* Direct client access is required for granular sync control and background processing logic that Server Actions don't support well.

### Frontend Architecture

**State Management:**
- **Server State:** React Query (managing Sync Status and Optimistic Updates).
- **Local State:** Zustand (Session data, UI triggers).
**Component Architecture:**
- **Atomic Design:** `components/ui` (Atoms), `components/features` (Organisms).
- **Layouts:** Distinct `(admin)` and `(contractor)` route groups to enforce role separation.

### Infrastructure & Deployment

**Hosting:** Vercel (Frontend/Edge).
**Backend:** Supabase Managed.
**CI/CD:** Vercel GitHub Integration (Auto-deploy on merge to main).
**Environment:** `.env.local` for secrets, strictly separated for Admin vs App.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
4 areas where AI agents could make different choices (Database, Sync, Components, Errors).

### Naming Patterns

**Database Naming Conventions:**
- **Tables:** `snake_case` (e.g., `user_tickets`). No namespacing in `public` schema.
- **Columns:** `snake_case` (e.g., `is_active`, `ticket_id`).
- **IDs:** `UUIDv4` primary keys always.

**Code Naming Conventions:**
- **Zod Schemas:** `camelCase` + Schema suffix (e.g., `userTicketsSchema`).
- **TypeScript Types:** `PascalCase` (e.g., `UserTicket`). inferred from Zod.
- **Components:** `PascalCase` (e.g., `TicketCard.tsx`).
- **Functions:** `camelCase` (e.g., `submitAssessment`).

### Structure Patterns

**Component Organization:**
- **UI Primitives:** `@/components/ui` (derived from Shadcn).
- **Feature Components:** `@/components/features/{feature_domain}/{component_name}.tsx`.
- **Layouts:** `app/(role)/layout.tsx` enforces distinct role-based shells.

### Communication Patterns

**Offline-Sync State Pattern (CRITICAL):**
- **Rule:** AI Agents are **FORBIDDEN** from calling `supabase.from().insert()` directly in UI components for offline-capable features.
- **Pattern:** All mutations for field data MUST go through the custom hook: `useSyncMutation(action, payload)`.
- **Reasoning:** Ensures data is captured in Dexie first, then synced. Bypassing this causes data loss.

**Error Handling:**
- **Server Actions:** Return standardized object: `{ data: T | null, error: string | null }`.
- **UI Feedback:** Use `sonner` for all user-facing success/error toasts.

### Enforcement Guidelines

**All AI Agents MUST:**
1.  Check for existing Zod schemas in `@/lib/schemas` before creating new ones.
2.  Use `useSyncMutation` for any write operation in the Contractor Portal.
3.  Never use raw Tailwind for buttons/inputs; use `components/ui` primitives.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
src/
├── app/
│   ├── (admin)/            # Online-Only Command Center (Server Actions)
│   │   ├── layout.tsx      # Admin Role Check
│   │   └── page.tsx
│   ├── (app)/              # Offline-First Contractor Portal (Client + Dexie)
│   │   ├── layout.tsx      # Auth Check
│   │   └── page.tsx
│   ├── api/                # Hybrid API Routes (Webhooks, Auth Callbacks)
│   ├── globals.css
│   └── layout.tsx          # Root Layout
├── components/
│   ├── features/           # Feature Modules
│   │   ├── tickets/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── schema.ts   # Shared Zod Schema
│   │   │   ├── types.ts
│   │   │   └── actions.ts  # Server Actions (Admin)
│   │   └── users/
│   ├── ui/                 # Shadcn Primitives (Button, Input, etc.)
│   └── layout/             # Shared Layout Components (Sidebar, Navbar)
├── lib/
│   ├── sync/               # The "Sync Bridge"
│   │   ├── engine.ts       # Background Sync Loop
│   │   ├── queue.ts        # Mutation Queue (Dexie)
│   │   └── conflict.ts     # Resolution Strategy
│   ├── db.ts               # Dexie Database Definition
│   ├── supabase.ts         # Supabase Client
│   └── schemas/            # Centralized/Shared Functionality
├── hooks/                  # Global Hooks (useOnlineStatus)
└── types/                  # Global Types
```

### Architectural Boundaries

**API Boundaries:**
- **Admin Portal:** Communicates via **Server Actions** (`actions.ts`). strictly typed.
- **Contractor App:** Communicates via **Sync Engine** (`engine.ts` -> Supabase Client).
- **Public API:** Minimal usage, primarily for Webhooks (e.g., Auth emails).

**Component Boundaries:**
- **Global:** `components/ui` are dumb presentation components.
- **Features:** `components/features/*` are smart, domain-aware components.
- **Role Isolation:** `(admin)` and `(app)` directories strictly separate the two distinct applications.

**Data Boundaries:**
- **Source of Truth:** Supabase (PostgreSQL).
- **Local Cache:** Dexie (IndexedDB).
- **Draft State:** Zustand (Memory/Local Storage).

### Requirements to Structure Mapping

**Features -> Directory:**
- **Ticket Management:** `src/components/features/tickets`
- **User Management:** `src/components/features/users`
- **Assessment Forms:** `src/components/features/assessments`
- **Map Visualization:** `src/components/features/map`

**Cross-Cutting Concerns:**
- **Offline Sync:** `src/lib/sync/`
- **Authentication:** `src/lib/auth/` & `src/middleware.ts`
- **Role Enforcement:** `src/app/(admin)/layout.tsx`

### Integration Points

**Internal Communication:**
- **State:** React Query manages Server State (sync status).
- **Events:** `mitt` or Custom Events for "Sync Completed" notifications.

**External Integrations:**
- **Mapbox:** Integrated via `react-map-gl` in `features/map`.
- ### Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
The **Hybrid API Strategy** (Server Actions for Admin, Client Sync for App) perfectly aligns with the **Role Isolation** pattern. The **Offline-First** requirement is robustly supported by the **Dexie + Sync Bridge** architecture, ensuring no data loss during connectivity gaps.

**Pattern Consistency:**
The **Naming Conventions** (Snake/Pascal/Camel) are well-defined. The **"Forbidden Direct Insert"** rule is a critical consistency enforcement mechanism that prevents "Sync Leakage".

**Structure Alignment:**
The project structure (`src/lib/sync`, `contracts`, `features`) directly supports the architectural separation of concerns.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
- **Field Assessments:** Fully supported by `components/features/assessments` with shared Zod schemas.
- **Offline Operations:** Handled by the dedicated `src/lib/sync` bridge.
- **Role Management:** Enforced by distinct `(admin)` and `(app)` route groups.

**Functional Requirements Coverage:**
- **Data Integrity:** Ensured by shared validation schemas and strict synchronization loops.
- **Performance:** Addressed by Local-First (Dexie) reads for the Contractor Portal.

**Non-Functional Requirements Coverage:**
- **Scalability:** Serverless backend (Supabase) handles load; Local-First frontend reduces read pressure.
- **Security:** RLS policies protect the API; Layout checks protect the UI.

### Implementation Readiness Validation ✅

**Decision Completeness:**
All critical decisions (Auth, DB, Sync, State) are documented with specific technology choices.

**Structure Completeness:**
The file tree is explicit and comprehensive, covering all key modules.

**Pattern Completeness:**
Critical patterns for Naming, Sync, and Components are defined with "Must/Must Not" rules.

### Gap Analysis Results

**Minor Gaps:**
- **Testing Strategy:** Specific patterns for mocking Dexie/IndexedDB in Vitest are not explicitly detailed. This should be addressed during the `src/lib/sync` implementation.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- **Robust Offline Strategy:** The Sync Bridge + Forbidden Direct Insert rule is a solid foundation.
- **Role Isolation:** The directory structure enforces security by design.
- **Efficiency:** Shared schemas prevent validation drift.

**Areas for Future Enhancement:**
- **Testing Patterns:** Formalizing the specific mocks for the offline database.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
Initialize the **Sync Bridge** (`src/lib/sync/engine.ts`) and **Dexie Schema** (`src/lib/db.ts`) to establish the offline foundation.
