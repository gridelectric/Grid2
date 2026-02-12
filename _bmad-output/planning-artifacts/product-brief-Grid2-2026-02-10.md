---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - grid-electric-docs/01-TECHNICAL-PRD.md
  - grid-electric-docs/02-DATABASE-SCHEMA.md
  - grid-electric-docs/03-WIREFRAMES.md
  - grid-electric-docs/04-DESIGN-SYSTEM.md
  - grid-electric-docs/05-API-SPECIFICATIONS.md
  - grid-electric-docs/06-COMPONENT-ARCHITECTURE.md
  - grid-electric-docs/07-OFFLINE-PWA-STRATEGY.md
  - grid-electric-docs/08-PROJECT-ROADMAP.md
  - grid-electric-docs/09-DATA-FLOW-ANALYSIS.md
  - grid-electric-docs/10-IMPLEMENTATION-CHECKLIST.md
  - grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md
  - grid-electric-docs/README.md
date: 2026-02-10
author: GOD
---

# Product Brief: Grid2

## Executive Summary

**Grid2** is an internal Progressive Web Application (PWA) designed to serve as the centralized operational command center for Grid Electric Corp — a utility damage assessment and storm restoration contractor. The platform replaces a fragmented ecosystem of 12+ disconnected tools (Microsoft 365, Timesheet.com, Text-Em-All, Life360, Adobe Sign, Excel workbooks, paper forms) with a single, purpose-built system that enforces data quality at the point of entry, automates administrative workflows, and provides real-time operational visibility across all storm operations.

The application serves three distinct user roles — **Super Admin** (owner), **Admin** (configurable support staff), and **Contractor** (field assessors) — each with purpose-built interfaces tailored to their context, permissions, and workflows. Admin capabilities are controlled through **permission groups** (e.g., Billing, Tickets, Users, Inventory, Reports) set by the Super Admin — features outside a user's permissions are hidden entirely, not disabled, maintaining a clean and intuitive experience.

By moving storm operations from people-dependent oversight to system-driven execution, Grid2 eliminates the manual correction cycles that currently consume an estimated **15+ hours/week** of leadership bandwidth, reduce margins through unrecovered costs, and erode customer confidence.

**Beyond operational efficiency, Grid2 is a competitive moat.** Historical project data compounds into institutional knowledge — enabling more accurate bids, smarter resource allocation, and a level of operational precision that larger, better-capitalized competitors cannot match through headcount alone.

---

## Core Vision

### Problem Statement

Grid Electric Corp's storm operations suffer from **loss of operational control and productivity at scale.** As operations grow, the company relies heavily on the owner (Jeanie) and a small team of experienced leads to manually manage and correct nearly every aspect of deployments — rosters, field reporting, job tickets, expenses, rentals, and billing. There is no enforcement of standards at the point of work, no automated validation, and no centralized visibility.

**The result:**
- Field tickets are submitted partially filled — missing start/stop times, no GPS, wrong circuit references, no equipment IDs, vague restoration descriptions
- Team leads discover errors *after the fact* — often the next morning — forcing either contractor callbacks (hours/next-day delay) or costly re-dispatches (duplicate fuel, time, manpower)
- Roster gaps (no-shows, backouts) aren't escalated in real time — crews deploy short, replacements are rushed and expensive
- Rental vehicles go untracked — unclear insurance coverage, unclear assignment, overbilled days after demobilization
- Work *appears* complete but is not usable; productivity is difficult to measure; unrecovered costs are absorbed silently
- Leadership time is consumed policing work instead of leading operations

### Problem Impact

**Financial:** Unrecovered costs from ticket rework, duplicate dispatches, rental overbilling, and correction cycles directly reduce margins on every project. Manual tracking creates gaps where billable work falls through the cracks.

**Operational:** Jeanie absorbs the operational, financial, and reputational risk when the system breaks. Office admins and field contractors experience frustration and inefficiency, but the owner carries the weight of every failure.

**Growth ceiling:** Without system-driven operations, growth = more chaos. Every new contractor, every new project, every new storm adds manual overhead. The current model doesn't scale.

### Why Existing Solutions Fall Short

**Internal tool fragmentation (12+ tools, zero integration):**

| Category | Current Tools | Gap |
|----------|--------------|-----|
| **Central Hub** | SharePoint, OneNote, Excel | No validation, no automation, data siloed |
| **Communication** | Text-Em-All, Email, Phone/SMS | No audit trail, no escalation logic |
| **Safety & Tracking** | Life360, Daily JSAs, Team Forms | Disconnected from ticket/billing data |
| **Onboarding & HR** | Adobe Sign, Document Templates, SharePoint | Manual, no status tracking, no testing verification |
| **Logistics** | Corporate travel portals, Enterprise/National | Tracked in spreadsheets and texts |
| **Time & Billing** | Timesheet.com, Excel workbooks, ACH | Manual reconciliation, no ticket linkage |

**External competitors** (OSR, Utility Power, Storm Services, Titan Engineering, TechServ) operate at larger scale with deeper capital reserves and more headcount — but compete on size, not technology. **No purpose-built software platform exists for this niche.** Grid2 is the opportunity to win through operational efficiency rather than raw capital.

> ⚠️ *Competitor tech capabilities should be validated during market research to confirm no emerging platforms exist in this space.*

### Proposed Solution

Grid2 consolidates all storm operations into a single PWA, built in phases:

**Phase 1 — Foundation (Auth, Roles, Onboarding, Dashboard Shell):**
- Role-based access: Super Admin / Admin / Contractor
- Authentication via **Microsoft Entra ID (Azure AD)** for SSO with existing M365 tenant, with Supabase for data layer
- Permission groups (not granular toggles): Billing, Tickets, Users, Inventory, Reports — set by Super Admin per Admin user
- Contractor onboarding wizard — separate mobile-first flow (sign-up, docs, PPE, training, acknowledgments)
- Admin/Super Admin dashboard shell with navigation

**Phase 2 — Core Operations (Tickets, Assessments, Routing):**
- Ticket lifecycle management (create, assign, route, complete, review)
- Comprehensive assessment forms with validation at point-of-entry
- Route optimization based on ticket addresses
- SMS notifications (Twilio)

**Phase 3 — Financial & Analytics:**
- Billing/invoicing linked to validated time entries and expenses
- Third-party payment integration (candidate TBD — Timesheet.com continuation or alternative)
- Historical project analytics for future bid projections
- Inventory and fleet tracking tied to people, dates, and projects

**Future — Advanced Capabilities:**
- Microsoft Graph API integration for full M365 data continuity
- Real-time mapping, routing, and GPS location tracking
- Advanced analytics and reporting

### Key Differentiators

1. **Niche specificity** — Purpose-built for utility damage assessment contractors, not a generic PM tool adapted to fit
2. **Data integrity by design** — Validation at point-of-entry eliminates the "fix it after" cycle; dropdowns and enums locked to Super Admin only
3. **Permission groups, not complexity** — Admins see a clean dashboard with only their authorized features visible — no "access denied" walls
4. **Contractor-resilient mobile UX** — A separate, simplified flow designed for field conditions: big buttons, offline-first, zero ambiguity, rain or shine
5. **Institutional knowledge engine** — Historical project data feeds forward into better bids, better training, and better decisions — knowledge stays when people leave
6. **Competitive moat** — Operational efficiency per crew enables underbidding competitors while maintaining margins; technology advantage vs. capital advantage
7. **Built from the trenches** — Designed by someone who has lived the pain, not by a vendor guessing at requirements

### Success Metrics (MVP)

| Metric | Current State | Target |
|--------|--------------|--------|
| Ticket error rate (incomplete/incorrect) | ~40%+ (estimated) | < 5% |
| Contractor onboarding time | Days (manual) | < 30 minutes |
| Admin ticket correction hours | 15+ hrs/week | < 2 hrs/week |
| Roster readiness visibility | End-of-day (manual check) | Real-time |
| Invoice generation from approved entries | Hours (manual) | < 10 minutes |
| Time from ticket creation to assignment | Variable | < 2 minutes |

---

## Target Users

### Primary Users

#### 🔑 Persona 1: Jeanie — Super Admin (Owner)

**Bio:** Owner of Grid Electric Corp. Responsible for end-to-end storm operations — from winning contracts to closing out projects. The final decision-maker and last line of defense.

**Environment:** Everywhere, all the time. Office, home, truck, field, kitchen, bed. Storm operations don't have office hours.

**Current pain:**
- 15+ hrs/week manually correcting contractor submissions, cleaning rosters, reconciling billing
- No real-time visibility — discovers problems after the fact
- Cannot rest during active storms because the system depends on her personally
- Growth limited by how many plates she can personally spin

**What success looks like:**
- Opens the dashboard and *trusts* what she sees — complete, validated, real-time
- Assigns grouped tickets by location/region to minimize contractor drive time
- Reviews contractor tickets that are already system-validated
- Pulls historical data to build better bids
- Sleeps during a storm because the system enforces SOP, not her

**Device usage:** Desktop (admin work), Phone (constant — monitoring, approvals, SMS alerts), Tablet (field visits)

**Key design implications:**
- Responsive design across all breakpoints is mandatory
- Dashboard must load fast and convey status at a glance
- **Ticket grouping by location/division/region is a first-class feature** — start manual, evolve to algorithmic clustering

---

#### 👤 Persona 2: Marcus — Admin (Seasonal Support Staff)

**Bio:** Experienced storm operations coordinator. Called in before forecasted severe weather. Works alongside 1-2 other admins during active storms. May go dormant for months between events.

**Scaling model:** 2-3 admins when storms are active. Zero during quiet periods. Admin accounts remain in the system but may be dormant — **re-activation must be frictionless.**

**Responsibilities by storm phase:**

| Phase | Tasks |
|-------|-------|
| **Pre-Storm** | Book flights & rental cars, prepare & issue inventory (tooling, PPE, equipment), review contracts & scope of work, verify utility agreements, assist contractors with onboarding, verify all paperwork complete |
| **During Storm** | Day-to-day ops support, address contractor needs, enforce SOP, verify & validate ticket submissions, train contractors on correct submission |
| **Post-Storm** | Check in returned inventory, manage rental returns & flight logistics, assist close-out |

**Current pain:**
- Re-learns the system every time she's called back after months away
- Manually verifying contractor paperwork completeness is tedious
- No standardized way to validate submissions — must know rules from memory
- Logistics tracking scattered across emails and spreadsheets

**What success looks like:**
- Logs in after 3 months away and is guided by **re-onboarding UX** (contextual tooltips, "Welcome Back" summary)
- Sees only authorized features — clean, uncluttered, no confusion
- Uses a **contractor readiness dashboard** showing every contractor's onboarding status at a glance
- Executes **pre-storm checklists** created by Jeanie — trackable, sequential, visible to leadership

**Key design implications:**
- **Design for re-onboarding, not just onboarding** — contextual guidance after dormancy
- **Pre-storm checklists as a feature** — Jeanie creates, Admins execute, progress visible
- **Contractor readiness dashboard** — aggregated view of paperwork, training, PPE status
- Auth: Admin accounts stay active but dormant, clear re-activation flow

---

#### 🔧 Persona 3: Ray & DeShawn — Contractor Crew (Driver + Assessor)

**Bio:** Independent 1099 subcontractors. Ray drives; DeShawn assesses and submits. Two-person crew dispatched daily during active storms. May be local or flown in.

**Tech literacy:** Moderate — can handle email, videos, forms. App must reduce learning curve.

**Typical day:**
1. Morning safety meeting / job brief
2. Jeanie receives and groups trouble tickets by location
3. Crew receives grouped tickets → Ray drives → DeShawn assesses and submits
4. Repeat until shift ends

**Assessment data complexity (the heart of the product):**

| Category | Data Points |
|----------|------------|
| **Pole** | Size, class, condition (broken/leaning/damaged) |
| **Wire** | Type (primary/secondary/service/neutral), size, # of spans down |
| **Equipment** | Type (transformer/switch/fuse/insulator), condition, leaking? |
| **Safety** | Energized? Public accessible? Environmental hazard? |
| **Service** | Customer weatherhead intact? Reconnectable? |
| **Restoration** | Specific materials needed, crew type required, priority level |
| **Photos** | Damage, overview, equipment close-up, safety context (min 4) |

> ⚠️ **The damage assessment form is the single most critical feature in Grid2.** It deserves a **dedicated design sprint** with field testing and iteration.

**Form design principles:**
- **Conditional logic** — show relevant fields based on damage type selection
- **Tabbed sections** — Safety → Equipment → Damage → Restoration → Photos → Review & Submit
- **Each tab validates before advancing** — prevents incomplete submissions at the source
- **48px minimum touch targets** — one hand, rain, gloves
- **Minimize keyboard** — dropdowns, radio buttons, photo capture
- **Single-column vertical layout** — no horizontal scrolling
- **Instant feedback** — real-time validation, not "error after submit"

**Field conditions:** Rain, heat, freezing cold, poor cell service, proximity to downed power lines. **Offline-first is foundational from Day 1** — local-first database (Dexie.js), photo queuing, conflict resolution.

**Device usage:** Smartphone only (assessor). Driver has no active app interaction in MVP.

**Future:** Navigator view for driver; session transfer if assessor's phone dies.

---

### Secondary Users

#### 🏢 Utility Client (Indirect)
Ultimate consumer of Grid2 data. Assessment quality directly impacts contract reputation and future bids.

#### 📊 Future: Auditor / Compliance (Post-MVP)
Read-only access to audit trails, time records, assessment data. Architecture should not preclude this.

---

### User Journeys

#### Super Admin Journey (Jeanie)
```
Storm Forecast → Activate Admins → Onboard/Recall Contractors → Receive Utility Tickets
→ Group by Location → Assign to Crews → Monitor Progress → Review Submissions
→ Approve Time/Expenses → Invoice → Close Project → Analyze for Future Bids
```

#### Admin Journey (Marcus)
```
Get Called Back → Log In (re-onboarding) → Execute Pre-Storm Checklist
→ Storm Active (validate, support, enforce SOP) → Post-Storm (close-out) → Go Dormant
```

#### Contractor Journey (Ray & DeShawn)
```
Sign Up → Onboarding Wizard → Get Approved → Storm Activated → Morning Brief
→ Receive Tickets → Drive → Assess (tabbed form) → Submit (offline-capable)
→ Next Ticket → End of Day → Time/Expenses → Invoice → Get Paid
```

**Data flywheel:** Every submission feeds → analytics → better training → fewer errors → faster assessments → better bids → more contracts → more data.

---

## Success Metrics

### Product Identity

Grid2 is not a SaaS tool — it is an **operational nervous system.** Every feature, metric, and design decision serves a single principle: replace people-dependent oversight with system-driven execution, compounding operational intelligence with every use.

### North Star Metrics

| # | North Star | What It Proves | Target |
|---|-----------|---------------|--------|
| ⭐ | **Ticket First-Attempt Acceptance Rate** | Form design, training, data quality working | > 95% |
| ⭐ | **Admin Hours Per Storm Day** | System replacing manual oversight | 50% reduction from baseline |
| ⭐ | **Project Close-Out Time** | Post-storm pipeline is efficient | 40% reduction from baseline |

### Baseline Capture (Pre-Launch Requirement)

> ⚠️ Before Grid2 launches, baselines must be established from Jeanie's last 3 storms.

| Baseline Metric | Method |
|----------------|--------|
| Tickets per storm (total, rework %) | Jeanie estimate + historical records |
| Admin hours per storm day | Jeanie estimate |
| Project close-out time | Historical |
| Contractor onboarding time | Jeanie estimate |
| Inventory loss/shrinkage rate | Estimate |
| Go-back rate | Estimate |

### User Success Metrics

| Persona | Success Indicator | Measurement |
|---------|------------------|-------------|
| **Jeanie** | Trusts dashboard — no manual corrections | Ticket error rate < 5% |
| **Jeanie** | Leads operations, doesn't police them | Admin correction hours < 2 hrs/week |
| **Jeanie** | Better bids from data | Bid accuracy improves over 3+ projects |
| **Marcus** | Productive within 30 min of re-activation | Time from login → first completed task |
| **Marcus** | Contractor readiness visible at a glance | 100% real-time onboarding status |
| **DeShawn** | Submits complete tickets on first attempt | First-attempt rate > 95% |
| **DeShawn** | Understands form without training | Support questions per storm trending down |
| **DeShawn** | 'No Damage' path takes < 60 seconds | Fastest path optimized |

### Business Objectives

**Quality first, speed later.** Accuracy and completeness are primary. Efficiency follows from getting data right the first time.

**Financial Targets:**

| Objective | Target | Measured |
|-----------|--------|----------|
| Reduce lost/unrecovered costs | 20% reduction | Per-project vs. baseline |
| Reduce unused rental charges | Track & flag unreturned vehicles | From fleet tracking launch |
| Reduce inventory shrinkage | Measurable reduction from baseline | Per-storm vs. baseline |
| Reduce admin staffing hours | Fewer admin hours per storm day | Per-storm vs. baseline |
| Eliminate go-backs | < 5% ticket rework rate | From assessment form launch |

**Strategic Flywheel:**

| Stage | Metric | Effect |
|-------|--------|--------|
| Better tools | Form completion rate, error rate | Attracts better contractors |
| Better people | Contractor retention, referral rate | Higher quality output |
| Better output | Ticket accuracy, utility satisfaction | Stronger reputation |
| Better reputation | Contract win rate, repeat clients | More work, more data |
| More data | Assessment patterns, bid accuracy | Smarter tools → cycle repeats |

> Storm work is sporadic. Metrics are measured **per-storm and per-project**, not on a fixed calendar.

### Key Performance Indicators

**Operational KPIs:**

| KPI | Measures | Why It Matters |
|-----|---------|----------------|
| Ticket error rate | % requiring correction | Core quality — #1 indicator |
| First-attempt submission rate | % accepted without rework | Proves form design works |
| Contractor readiness rate | % fully onboarded pre-deployment | Prevents pre-storm scramble |
| Inventory reconciliation rate | % items returned/accounted for | Tracks shrinkage |
| Project close-out time | Days from last field day → invoice | Post-storm efficiency |

**Efficiency KPIs:**

| KPI | Measures | Why It Matters |
|-----|---------|----------------|
| Invoicing cycle time | Days from approved entries → invoice | Cash flow acceleration |
| Admin hours per storm day | Total admin labor per active day | Operational leverage |
| Communication breakage rate | Missed alerts, unacknowledged assignments | System reliability |

**Future KPIs (Phase 2+):**

| KPI | Depends On |
|-----|------------|
| Drive-to-assess ratio | GPS tracking, route data |
| Auto-grouping accuracy | Mapping integration |

**Pre-Launch Testable (between storms):**

| What | How |
|------|-----|
| Onboarding completion rate | Beta testers run wizard with dummy data |
| Form usability | Mock damage scenarios, measure completion + errors |
| Form comprehension | Can testers complete without guidance? |

### Assessment Form Architecture

**Top-down conditional flow mirroring physical infrastructure:**

```
🔌 Pole → ⚡ Primary → ⚡ Secondary → 🔌 Service/Neutral → 🏠 Weatherhead/Meter
```

**Per element:**
1. **"Any damage?"** → Yes / No
2. If **No** → collapse to ✅, next element (fastest path)
3. If **Yes** → 📸 Photo (required) + 📝 Description (required) + 📋 Dropdown selections (enum values) + ❓ Follow-up conditionals
4. Collapse to summary → next element

**Design principles:**
- Visual indicator showing current infrastructure element (pole diagram with highlight)
- Progress indicator: "Step 3 of 6"
- Completed sections collapse to green checkmark summary
- **'No Damage' = fastest path** — optimized for common case
- Enum values **database-driven**, editable by Super Admin
- Conditional logic **configurable** (rules table, not hard-coded)
- **Photo retention policy** TBD (compliance requirement — 1yr? 5yr?)

---

## MVP Scope

### Core Features (Phase 1 — Foundation)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Authentication** | Microsoft Entra ID (Azure AD) SSO with existing M365 tenant; Supabase for data layer |
| 2 | **Role System** | Super Admin, Admin, Contractor — three distinct roles with separate flows |
| 3 | **Permission Groups** | Admin capabilities controlled via groups (Billing, Tickets, Users, Inventory, Reports); features hidden, not disabled |
| 4 | **Super Admin Dashboard** | Command center shell — navigation, layout, KPI placeholders, user management |
| 5 | **Admin Dashboard** | Same shell, filtered by assigned permission groups; re-onboarding UX for dormant admins |
| 6 | **Contractor Onboarding Wizard** | Mobile-first flow: sign-up → documents → PPE acknowledgment → training → acknowledgments |
| 7 | **Contractor Readiness Dashboard** | Aggregated view for Admins/Super Admin: onboarding status, missing items, per-contractor |
| 8 | **User Management (CRUD)** | Super Admin creates/edits Admins, sets permissions; views/manages Contractors |
| 9 | **Enum/Dropdown Management** | Super Admin-controlled database-driven values (pole classes, wire sizes, etc.) for future assessment forms |
| 10 | **PWA Shell** | Installable, offline-ready scaffold — Dexie.js, service worker, background sync foundation |

**Phase 1 delivers:** A working authentication system with role-based access, a functional dashboard shell, and a complete contractor onboarding pipeline — the foundational infrastructure everything else is built on.

### Phase 2 — Core Operations

| # | Feature |
|---|---------|
| 1 | **Damage Assessment Form** (dedicated design sprint — conditional, tabbed, validated, offline-capable) |
| 2 | **Ticket Lifecycle Management** (create, assign, route, complete, review) |
| 3 | **Ticket Grouping by Location** (manual grouping, map view) |
| 4 | **SMS Notifications** (Twilio — assignment alerts, escalations) |
| 5 | **Microsoft Graph API Integration** (M365 document access, SharePoint/OneDrive bridge) ⚠️ *Pending Jeanie confirmation* |
| 6 | **Pre-Storm Checklists** (Jeanie creates, Admins execute, progress visible) |

### Phase 3 — Financial & Analytics

| # | Feature |
|---|---------|
| 1 | Billing/invoicing linked to validated time entries |
| 2 | Time tracking & expense management |
| 3 | Third-party payment integration (candidate TBD) |
| 4 | Inventory & fleet tracking |
| 5 | Historical project analytics for bid projections |

### Future — Advanced Capabilities

| Feature | Notes |
|---------|-------|
| Real-time GPS / location tracking | Requires significant infrastructure |
| Algorithmic ticket auto-grouping | Evolves from manual grouping |
| Driver "Navigator" view | Mapping integration needed |
| Advanced analytics & reporting | Requires data accumulation |
| Session transfer (crew device failover) | Edge case, low priority |
| Auditor/compliance read-only access | Architecture ready, feature deferred |

### Out of Scope for MVP — Explicit Boundaries

| What | Why Not Now |
|------|-----------|
| Damage assessment form | Phase 2 — deserves dedicated design sprint with field testing |
| Ticket management | Phase 2 — depends on assessment form |
| Billing, invoicing, time tracking | Phase 3 — depends on validated ticket data |
| SMS / push notifications | Phase 2 — current methods (Text-Em-All, calls) sufficient for Phase 1 |
| Inventory / fleet tracking | Phase 3 — post-onboarding feature |
| GPS / real-time location | Future — significant infrastructure requirement |
| Any external integrations (except Entra ID) | Phased — Graph API in Phase 2, others later |

### MVP Success Criteria

**Phase 1 is successful when:**

| Criteria | Validation |
|----------|-----------|
| All three roles can authenticate via Entra ID | Functional test |
| Super Admin can create Admins with permission groups | Functional test |
| Admin sees only authorized features (hidden, not disabled) | UX validation |
| Contractor completes onboarding wizard < 30 min | Beta test with 5 testers |
| Contractor readiness dashboard shows real-time status | Functional test |
| Super Admin can manage enum/dropdown values | Functional test |
| PWA is installable, service worker active | Technical validation |
| Dormant Admin re-activation is frictionless | UX validation |

**Decision point to proceed to Phase 2:** Phase 1 deployed, stable, tested; at least 3 beta testers complete onboarding flow successfully; Super Admin confirms dashboard meets expectations.

### Future Vision (2-3 Years)

If Grid2 is wildly successful, it becomes:

1. **The industry-standard operational platform** for utility damage assessment contractors — not just Grid Electric's internal tool
2. **A data-powered bidding engine** — historical patterns predict crew needs, timelines, and costs for new contracts with increasing accuracy
3. **A contractor marketplace** — vetted assessors with track records, skill ratings, and availability visible to multiple companies
4. **An API for utilities** — direct data pipeline from Grid Electric's assessments into utility work management systems, eliminating the paper/email handoff

> 💡 Architecture decisions in Phase 1 should not preclude any of the above. Multi-tenancy, data isolation, and API-first design keep doors open.
