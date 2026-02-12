---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete', 'step-e-01-discovery', 'step-e-02-review', 'step-e-03-edit']
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-Grid2-2026-02-10.md
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
workflowType: 'prd'
workflow: 'edit'
classification:
  projectType: web_app
  domain: energy
  complexity: high
  projectContext: greenfield
lastEdited: '2026-02-11'
editHistory:
  - date: '2026-02-11'
    changes: 'Added FR37 for ticket grouping, updated NFRs with measurement methods (Chrome Web Vitals, API telemetry), and removed vendor leakage.'
---

# Product Requirements Document - Grid2

**Author:** GOD
**Date:** 2026-02-10

## Executive Summary

**Product:** Grid2 — A Progressive Web App for utility damage assessment contractors.

**Vision:** Replace the fragmented chaos of paper forms, Excel spreadsheets, and phone calls with a single, purpose-built digital platform that enforces data quality at the point of entry.

**Differentiator:** Grid2 is not a generic field service app. It is built for the specific operational reality of utility damage assessment contracting — chaotic ticket intake, seasonal workforce activation, hazardous field conditions, and strict utility client data requirements. Quality is enforced at source, not corrected after submission.

**Target Users:**

- **Super Admin (Jeanie)** — Business owner. Creates storm projects, enters tickets, assigns contractors, reviews assessments, manages operations.
- **Admin (Marcus)** — Seasonal field manager. Reviews submissions, trains contractors, handles logistics. Cannot create projects or assignments.
- **Contractor (DeShawn)** — 1099 field worker. Onboards, receives ticket assignments, completes damage assessments, submits for review.

**Technology:** PWA (SPA) on Supabase (Auth, Database, Storage, Row-Level Security). Online-only for MVP Phase 1.

**MVP Timeline:** 30 days. Solo non-developer using AI-assisted development.

## Success Criteria

### User Success

- **Super Admin (Jeanie):** Trusts the dashboard data implicitly (no manual Excel checks). Spends < 2 hours/week on ticket corrections.
- **Admin (Marcus):** Can re-onboard and be productive within **30 minutes** of seasonal return.
- **Contractor (DeShawn):** Completes onboarding wizard in **< 15 minutes** without calling support. Validates "app just works" offline with no data anxiety.

### Business Success

- **Operational Efficiency:** Reduce Admin hours per storm day by **50%**.
- **Data Quality:** Achieve **< 5%** ticket rejection/rework rate (Quality First).
- **Financial:** Reduce unrecovered costs by **20%** via better tracking.

### Technical Success

- **Data Integrity:** Zero data loss due to application error; submitted data confirmed durable on server.
- **Perceived Performance:** User-initiated actions respond within 1 second.
- **Auth Reliability:** < 1% login failure rate via Supabase Auth (email/password).
- **Observability:** Critical errors logged to Supabase/monitoring immediately.

### Measurable Outcomes

- **Onboarding Speed:** Average time to complete wizard < 15 mins.
- **Admin Latency:** Dashboard load time < 2s for active storm views.

## Product Scope

### MVP — "One Storm" (Phase 1 — 30 Days)

The minimum product that lets Grid Electric run a single storm project through Grid2 instead of Excel/paper/chaos. Online-only. See **Project Scoping & Phased Development** for full feature breakdown.

- **Authentication:** Supabase Auth (email/password), role-based access (Super Admin, Admin, Contractor).
- **Onboarding:** Fixed-form wizard (Profile, W-9, Insurance).
- **Storm Operations:** Create project → Enter tickets → Assign contractors → Damage assessment → Review/Approve.
- **Dashboard:** Ticket status overview, contractor assignments.

### Growth — "Battle Tested" (Phase 2 — Post-First Storm)

- **Offline Mode:** Dexie.js + service worker for field operation without connectivity.
- **Configurable Forms:** Assessment templates, JSA/incident/accident forms.
- **Environmental Hazard Reporting:** Priority notification chain.
- **SMS Notifications:** Twilio integration for ticket dispatch.
- **Photo Optimization:** Client-side compression, WebP format.

### Vision (Phase 3+)

- **Phase 3:** Time/expense tracking, invoicing, analytics, Microsoft Graph integration.
- **Phase 4+:** Contractor marketplace, route optimization, white-label for other utilities.

## User Journeys

### Journey 1: Jeanie — Storm Activation to Project Close-Out (Super Admin)

> ⚠️ **TODO: Detailed SOP Required** — David will provide the comprehensive end-to-end SOP document from work. The journey below is a generalized framework that will be refined with exact operational steps once the SOP is available.

**Opening Scene:** Jeanie gets the call — a utility has storm damage and needs assessment crews deployed. She's at home, it's 9 PM, and she needs to spin up operations *now.* She opens Grid2 on her laptop.

**Rising Action:**

1. **Activate Admins** — Contacts Marcus and support staff. They confirm availability. She marks them active in Grid2, assigns permission groups based on this storm's needs.
2. **Onboard/Recall Contractors** — Reviews the Contractor Readiness Dashboard. Some contractors are pre-approved from last storm, others need fresh onboarding. She sends sign-up links to new hires via SMS.
3. **Receive Utility Tickets** — The utility issues trouble tickets. Jeanie imports them into Grid2.
4. **Group by Location** — Clusters tickets by geography/division/region to minimize contractor drive time. Jeanie manually creates groups and assigns ticket batches to them. *(Manual in Phase 1 → algorithmic in Phase 2+.)*
5. **Assign to Crews** — Assigns ticket groups to contractor teams.
6. **Monitor Progress** — Watches real-time submission status. System-validated tickets flow through; flagged tickets queue for review.
7. **Review & Approve** — Reviews time entries, expenses. Approves or kicks back.
8. **Invoice & Close** — Generates invoices from approved data. Closes project. Pulls analytics for future bid projections.

**Climax:** Jeanie opens the dashboard during an active storm and *trusts* what she sees. No manual Excel cross-referencing. No frantic phone calls asking "did you submit that ticket?" The data is clean because the system enforced it at point-of-entry.

**Resolution:** Project closes in days, not weeks. Historical data compounds. Next bid is sharper. The system remembers what people forget.

**Capabilities Revealed:** Dashboard, user management, permission groups, contractor readiness view, ticket import/assignment/grouping, submission review, time/expense approval, invoicing, analytics.

---

### Journey 2: Marcus — The 3-Month Return (Admin Re-Activation)

**Opening Scene:** Marcus hasn't logged into Grid2 in 3 months. Severe weather is forecast. His phone buzzes — it's a notification from Jeanie: *"Storm mobilizing. You're in. Here are the details."*

**Rising Action:**

1. **Confirm Availability** — Marcus responds to Jeanie confirming he's available. *(If unavailable, Jeanie marks him as such and moves on.)*
2. **Re-Activate** — Marcus logs in via Entra ID. Grid2 detects his account has been dormant. The system prompts him with:
   - A **"Welcome Back" summary** of what's changed since his last session (new features, updated SOPs, system changes).
   - **Pre-prompted questions** to verify his profile is current (address, certifications, emergency contact).
   - If significant app updates occurred since last activity, **established questions** to confirm understanding.
3. **Receive Assignment** — Grid2 displays his immediate context: **the utility name, storm location, and assigned role** set by Jeanie. No hunting for information — it's front and center.
4. **Execute Pre-Storm Checklist** — Jeanie has created a checklist. Marcus sees his tasks: book flights for incoming contractors, prepare PPE/inventory kits, verify utility agreements.
5. **Storm Active** — During the storm, Marcus reviews contractor ticket submissions for completeness. He can see readiness status across all assigned contractors. He trains new contractors on correct submission procedures. He enforces SOP — but the *system* does the heavy lifting on validation.
6. **Post-Storm** — Marcus handles close-out: inventory check-in, rental returns, flight logistics.

**Climax:** Marcus logs in after 3 months and is productive within **30 minutes**. He doesn't need to call Jeanie to ask "what do I do?" — the system tells him.

**Resolution:** The dormancy problem disappears. Re-onboarding is built into the UX, not dependent on institutional memory.

**Capabilities Revealed:** Dormant account re-activation flow, "Welcome Back" UX with change summary, pre-prompted profile update questions, storm context display (utility, location, role), pre-storm checklists, contractor readiness dashboard, ticket validation tools, post-storm close-out workflows.

---

### Journey 3: DeShawn — First Storm, First Day (Contractor Onboarding → Field Work)

**Opening Scene:** DeShawn gets a text from Jeanie: *"Storm work available. Click here to sign up."* He taps the link on his phone. He's never used Grid2 before.

**Rising Action:**

1. **Onboarding Wizard** — Link opens the PWA. DeShawn creates his account and enters the onboarding wizard:
   - **Profile** — Name, contact, certifications, emergency contact.
   - **Documents** — Uploads or signs required documents (W-9, NDA, insurance).
   - **PPE Acknowledgment** — Reviews and acknowledges required safety gear.
   - **Training** — Completes required training modules, watches safety videos.
   - **Acknowledgments** — Signs off on SOPs, code of conduct.
2. **Approval** — Admins (Marcus) verify his paperwork. Status moves from "Pending" to "Approved" on the Contractor Readiness Dashboard.
3. **Storm Day — Morning Brief** — DeShawn arrives on-site. He's assigned to a team and paired with Ray (driver). Issued PPE and tooling — tracked in the system. Assigned to a team lead (Admin).
4. **Additional Utility-Specific Training** — If the utility requires specialized training, handled via 3rd-party integration *(separate from Grid2)*.
5. **Receive Tickets** — Jeanie groups and assigns tickets. DeShawn receives his batch via SMS notification. Opens Grid2 and sees assigned tickets with addresses and scope.
6. **Drive → Assess → Submit** — Ray drives. DeShawn opens the assessment form:
   - **Top-down conditional flow:** Pole → Primary → Secondary → Service/Neutral → Weatherhead/Meter.
   - Each element: "Any damage?" → **No** = collapse, next element (fastest path). → **Yes** = photo (required) + description + dropdown selections + follow-up conditionals.
   - Tab validates before advancing. No incomplete submissions possible.
7. **End of Day** — Logs time, submits expenses. *(3rd-party integration for payment/invoicing.)*

**Climax:** DeShawn completes his first damage assessment correctly on the first attempt. No callback from Jeanie. No "go back and re-do it." The form *guided* him through the process — conditional logic showed only what was relevant, validation caught errors before submission.

**Resolution:** DeShawn tells his buddy: *"This app just works. No confusion. I knew exactly what to fill out."* First-attempt acceptance rate > 95%.

**Capabilities Revealed:** SMS-driven onboarding link, mobile-first onboarding wizard (profile, docs, PPE, training, acknowledgments), contractor readiness status tracking, team/crew assignment, PPE/tooling issuance tracking, ticket assignment via SMS, conditional assessment form with validation, photo capture, offline-capable submission, time/expense logging.

---

### Journey 4: Utility Client (Indirect / Secondary User)

**Opening Scene:** The utility's operations manager reviews Grid Electric's assessment submissions. They're comparing Grid Electric's data quality against three other contractors working the same storm.

**Resolution:** Grid Electric's submissions are consistently complete — GPS coordinates, photos, equipment IDs, accurate damage descriptions. Other contractors submit partial data requiring callbacks. The utility notices. Grid Electric wins the next contract.

**Capabilities Revealed:** Data quality enforcement, complete assessment data, photo documentation, GPS capture, exportable/reportable assessment data.

---

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
| --- | --- |
| **Jeanie (Super Admin)** | Dashboard, user CRUD, permission groups, contractor readiness, ticket import/assign/group, submission review, time/expense approval, invoicing, analytics |
| **Marcus (Admin Re-Activation)** | Dormant re-activation UX, "Welcome Back" summary, profile update prompts, storm context display, pre-storm checklists, ticket validation |
| **DeShawn (Contractor)** | SMS onboarding link, mobile-first wizard, readiness tracking, team assignment, PPE tracking, SMS ticket dispatch, conditional assessment form, photo capture, offline sync, time/expense logging |
| **Utility Client (Indirect)** | Data quality, complete submissions, exportable reports |

> ⚠️ **Action Item:** Jeanie's journey needs refinement once David provides the **comprehensive SOP document** from work. The current narrative is a generalized framework.

## Domain-Specific Requirements

**Domain:** Energy — Utility Damage Assessment Contracting | **Complexity:** High

### Data Archival & Retention

- All storm project data archived upon project close-out. Retention requirements defined in NFR20–NFR21.
- **Configurable retention per project** — utility contracts may specify longer periods (e.g., 3 years).
- Environmental hazard reports flagged for **extended retention** — contamination claims can surface years later.
- Archive must remain **queryable** — historical data feeds bid projections and analytics. Archive ≠ cold storage.

### Safety & Compliance Documentation

- **Job Safety Analyses (JSAs)** integrated into the app — daily safety briefing documentation captured per team/crew.
- **Accident Reports** — standardized form within Grid2, triggerable from any active storm session.
- **Incident Reports** — standardized form for near-misses and safety concerns, separate from accident reports.
- Additional safety/compliance forms to be integrated as specified by Super Admin.
- All safety documentation tied to specific project, date, crew, and location for audit trail.
- Safety and incident forms are **emergency-context UX** — always accessible ("panic button"), minimal taps, auto-capture of GPS/timestamp/user context. Not buried in menus.

### Environmental Hazard Reporting

- **Immediate notification chain** when environmental hazard identified (e.g., leaking transformer, PCB exposure).
- Specific reporting format enforced by structured form — not free-text. Dropdown for hazard type, required photo, auto-captured GPS + timestamp.
- **Escalation path:** Contractor submits → Team Lead/Admin notified immediately → Super Admin notified → Utility notified per their protocol.
- Environmental reports **flagged separately** from standard damage assessments — cannot be buried in batch submissions.
- **Priority sync channel:** Environmental reports jump the offline sync queue. When connectivity is available, these push first before routine assessments.

### Assessment Form Variability

- **Core damage taxonomy is universal** — a broken pole is a broken pole regardless of utility or geography.
- **Form structure and entry process may vary by utility** — field labels, required fields, submission format, conditional logic paths.
- Architecture must support **configurable form templates** — Super Admin creates/modifies assessment templates per utility client.
- Data model decouples **form schema** (template) from **assessment data** (instance). Same underlying damage taxonomy, different presentation.
- Super Admin template configuration UX must be **visual and preview-able** — Jeanie sees exactly what DeShawn will see before deploying.
- **Forms engine architecture:** Assessment forms, safety forms, incident forms share one configurable structured data capture engine with different schemas.

### Ticket Intake & Data Exchange (Core Problem Domain)

- **Ticket intake is inherently chaotic** — utilities deliver work orders via:
  - Paper handoff (hand-to-hand in the field)
  - Email (forwarded ticket data)
  - Utility customer portals (varies by utility)
  - Photos of computer screens showing auto-generated tickets
  - Verbal dispatch from troubleshooters/engineers
- Grid2 must support **manual ticket entry** as the Phase 1 baseline — Admin/Super Admin normalizes tickets from any source into a single format.
- **Ticket provenance tracking:** Every ticket records source format, ingestion method, ingested-by user, and original timestamp for traceability.
- **Source quality flagging:** Tickets entered from poor-quality sources (e.g., photo-of-screen) flagged for reviewer double-check.
- **Duplicate detection** — system flags potential duplicate tickets (same address, same circuit, same timeframe).
- **Assignment tracking** — clear, real-time ownership of who is working what ticket to prevent crews working on top of each other.
- **Communication audit trail** — all ticket assignments, re-assignments, and status changes logged with timestamp and user.
- Future: structured import (CSV, email parsing, API integration with utility portals) to reduce manual entry.

### Contractor Compliance (1099)

- W-9 collection during onboarding — stored securely, encrypted at rest and in transit.
- Insurance verification — proof of coverage captured and tracked per contractor.
- Certification/license tracking — expiration dates monitored, alerts when approaching expiry.
- All contractor PII subject to standard data protection practices.

### Utility Client Requirements

- Each utility project may impose unique requirements for training, submission format, or operational procedures.
- Utility-specific training handled via **3rd-party integration** (separate from Grid2).
- Grid2 must support **project-level configuration** — different active projects may have different form requirements simultaneously.

### Future Domain Considerations

- **Weather data integration** — NWS alerts, storm track shifts impacting crew safety and ticket prioritization.
- **Structured ticket import** — CSV upload, email parsing, utility portal API connectors.
- **Route optimization** — minimizing contractor drive time across ticket clusters.
- **Real-time location tracking** — crew positioning for safety and dispatch optimization.

## Web App (PWA) Specific Requirements

### Project-Type Overview

Grid2 is a **Progressive Web App (PWA)** built as a **Single Page Application (SPA)**. Two distinct interfaces share a common Supabase backend:

- **Admin Portal** — Full-featured SPA for Super Admin (Jeanie) and Admin (Marcus). Optimized for iPad and macOS desktop.
- **Contractor Portal** — Streamlined, mobile-first SPA for field contractors (DeShawn). Optimized for iPad with phone fallback.
- **Architecture:** Single codebase with role-based routing. Admin and contractor paths cleanly separated at the route level for potential future split into independent apps.

### Browser & Platform Matrix

| Platform | Browser | User | Priority |
| --- | --- | --- | --- |
| iPadOS 17+ (iPad) | Safari 17+ | Contractors, Admins | **Primary** |
| macOS (laptop/desktop) | Safari | Jeanie (Super Admin) | **Primary** |
| Android phones | Chrome | Contractors (personal devices) | Secondary |
| Windows desktop | Chrome/Edge | Occasional admin use | Tertiary |

- **Not supported:** Internet Explorer, legacy browsers.
- **Minimum Safari version:** Safari 17+ (iPadOS 17+) required for reliable Web Push, service worker stability, and modern PWA features.
- **PWA installation:** Home screen install on iPad (Safari) and macOS (Safari). Chrome PWA install as fallback.
- **PWA manifest:** `display: standalone` — preserves status bar (clock, battery) visibility for field workers.

### Platform Constraints (Safari/iPadOS)

- **Background Sync API is not supported in Safari.** Sync is **foreground-triggered** — fires when the app is open and online, not when the tab/app is closed.
- **Camera access:** `<input type="file" accept="image/*" capture="environment">` is the primary method (most reliable on Safari). `getUserMedia` as progressive enhancement only.
- **Push notifications:** Require iPadOS 17+ and explicit user permission grant.

### Responsive Design

- **iPad landscape (1024×768+):** Primary design target. Dashboards, assessment forms, and configuration UX optimized for this viewport.
- **iPad portrait (768×1024):** Supported for field use — forms, ticket lists, assessments.
- **Desktop (1280×800+):** Full-width layouts for Jeanie's dashboard and reporting views.
- **Phone (375×667+):** Contractor portal supports phone-sized screens for basic ticket viewing and assessment submission. Not the primary target.
- **Touch targets:** 48×48pt minimum for primary field actions (forms, submit buttons, navigation). 44×44pt minimum for secondary actions. Designed for gloved operation in wet/stressful conditions.

### Field Usability & Accessibility

- **Baseline:** WCAG 2.1 Level AA.
- **Field UI contrast:** Target **7:1 contrast ratio (WCAG AAA)** for all critical field elements — form labels, error messages, status indicators, action buttons.
- **Sunlight readability:** Light background with dark text performs better in direct sunlight than dark mode. Consider a **"Field Mode" toggle** — maximum contrast, stripped-down UI, optimized for outdoor conditions.
- **Color-blind safe:** Status indicators use **icon + color + position** — never rely on color alone. ~8% of male field workers may be color-blind.
- **Screen reader support** for administrative interfaces.

### Performance Targets

| Metric | Target | Context |
| --- | --- | --- |
| First Contentful Paint | < 2s | On 4G/LTE connection (field conditions) |
| Time to Interactive | < 4s | Critical for field workers opening tickets |
| Offline assessment completion | Zero network dependency | Must work with no connectivity at all |
| Local queue depth | Unlimited | Assessments queue locally until connectivity restored |
| Sync resume | Automatic | No user action required when connectivity returns |
| Offline-to-online sync | < 30s | After connectivity restoration (foreground) |
| Environmental alert sync | < 5s | Priority channel, immediate push when online |
| Photo upload (per image) | < 10s | On 4G/LTE, after client-side compression |
| Assessment form load | < 1s | From local Dexie.js cache |

### Photo Handling

- **Client-side compression before upload:** Target 800KB max per image.
- **Format:** WebP preferred (better compression at equivalent quality). JPEG fallback for older devices.
- **Resolution cap:** 2048px on longest edge — sufficient for damage documentation, dramatically reduces file size.
- **Metadata capture:** GPS coordinates, timestamp, and device info embedded automatically.

### SEO Strategy

- **Not applicable.** Internal operational tool. No public-facing content requiring search indexing.

### Implementation Considerations

- **Service Worker caching strategy:**
  - **Cache-First** for app shell (HTML, CSS, JS).
  - **Network-First** for data API calls.
  - **Stale-While-Revalidate** for static assets (icons, images).
- **Dexie.js:** IndexedDB wrapper for structured offline storage. **Schema versioning and migration strategy required from day one** — form templates will change between storms. Conflict resolution policy for offline edits vs. server-side template updates is an architecture decision.
- **No App Store deployment.** Distribution via direct URL, QR code, SMS link, or pre-configured on company-issued iPads.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** "One Storm" — The minimum product that lets Grid Electric run a single storm project through Grid2 instead of Excel/paper/chaos.

**Builder Profile:** Solo non-developer using AI-assisted development (Gemini/BMAD). Leveraging Supabase (Auth, Database, Storage, Row-Level Security) to minimize custom backend code. PWA built with modern framework.

**30-Day Target:** Achievable only with ruthlessly constrained scope.

### MVP Feature Set — Phase 1 (30 Days)

**Core Journeys Supported:**

- Jeanie activates a storm project, enters tickets, assigns contractors, reviews assessments.
- DeShawn onboards, receives assignment, completes assessment, submits.
- Marcus operates with same capabilities as Jeanie in MVP (no separate admin layer).

**Must-Have Capabilities:**

| # | Feature | Why It's a Must | Complexity |
| --- | --- | --- | --- |
| 1 | **Auth + 3 Roles** | Can't do anything without login. Supabase Auth handles 90%. | Low |
| 2 | **Simple Onboarding** | Name, phone, email, W-9 upload, insurance upload. One fixed form. | Low |
| 3 | **Create Storm Project** | Jeanie creates a project (utility name, storm name, location). | Low |
| 4 | **Manual Ticket Entry** | Jeanie enters tickets from whatever format she receives. Fixed fields. | Medium |
| 5 | **Ticket Assignment** | Assign ticket to contractor. Clear ownership. One contractor per ticket. | Low |
| 6 | **Damage Assessment Form** | One fixed assessment form. Hard-coded fields. Photo upload (simple). | Medium |
| 7 | **Assessment Review** | Jeanie views submitted assessments, approves/rejects with notes. | Medium |
| 8 | **Basic Dashboard** | Ticket counts by status. Assignment overview. | Low |

### Deliberately Cut from MVP

| Cut Feature | Reason | Returns In |
| --- | --- | --- |
| Offline mode | Most complex feature. Online-only for Phase 1. | Phase 2 |
| Configurable form templates | Hard-code the assessment form. | Phase 2 |
| JSA / Incident / Accident forms | Use paper for safety forms in first storm. | Phase 2 |
| Environmental hazard alerts | Call utility directly (existing process). | Phase 2 |
| SMS notifications | Jeanie texts contractors manually (existing process). | Phase 2 |
| Duplicate ticket detection | Manual de-duplication (existing process). | Phase 2 |
| Photo compression / WebP | Simple upload, raw size. Optimize later. | Phase 2 |
| Time/expense tracking | Separate spreadsheet (existing process). | Phase 3 |
| Invoicing | Existing process continues. | Phase 3 |
| Analytics / Reporting | Supabase dashboard for raw data. | Phase 3 |
| Microsoft Graph | No email integration. | Phase 3 |
| Contractor marketplace | Future vision. | Phase 4+ |
| Route optimization | Future vision. | Phase 4+ |

### Phase 2 — "Battle Tested" (Post-First Storm)

After running one storm through Grid2, real-world feedback drives priorities:

- Offline mode (Dexie.js + service worker)
- Configurable assessment form templates
- JSA / incident / accident forms
- Environmental hazard reporting with priority chain
- SMS notifications (Twilio or similar)
- Duplicate ticket detection
- Photo compression & optimization

### Phase 3 — "Operational Nervous System"

- Time/expense tracking
- Invoicing workflow
- Utility client portal
- Analytics & reporting dashboards
- Microsoft Graph email integration

### Phase 4 — "Market Expansion"

- Contractor marketplace
- Route optimization
- White-label for other utilities
- Public API for utility integrations

### Risk Mitigation Strategy

| Risk | Mitigation |
| --- | --- |
| **Technical: Overscoping** | The feature cut list above IS the mitigation. If it's not in the 8 features, it doesn't exist in Phase 1. |
| **Technical: PWA complexity** | Phase 1 is online-only. No service workers, no offline. Add in Phase 2 after core works. |
| **Technical: Learning curve** | AI-assisted development + Supabase handles auth/DB/storage. Focus on UX, not infrastructure. |
| **Market: Adoption** | Jeanie is the product owner. Build the 8 features, hand her the iPad, iterate from real feedback. |
| **Resource: Solo burnout** | 30 days = 2 features per week. If behind by week 2, cut dashboard (#8) — least essential. |

## Functional Requirements (MVP Phase 1)

### User Management

- **FR1:** Super Admin can create user accounts with one of three roles (Super Admin, Admin, Contractor).
- **FR2:** Users can log in with email and password.
- **FR3:** Super Admin can deactivate or reactivate user accounts.
- **FR4:** The system enforces role-based access — Contractors cannot access admin functions.
- **FR5:** Admin can view dashboards, tickets, and assessments but cannot create storm projects, enter tickets, or assign contractors. Only Super Admin has those capabilities.

### Contractor Onboarding

- **FR6:** New contractors can complete a fixed onboarding form (name, phone, email, emergency contact).
- **FR7:** Contractors can upload a W-9 document during onboarding.
- **FR8:** Contractors can upload proof of insurance during onboarding.
- **FR9:** Super Admin can view and verify contractor onboarding submissions.
- **FR10:** Contractors cannot access storm project features until onboarding is complete and verified.
- **FR10.1:** The in-app onboarding flow effectively REPLACES the legacy Adobe Sign process for these specific documents (W-9, Insurance, NDA).
- **FR10.2:** Generated documents are stored as PDF artifacts for audit compliance.

### Storm Project Management

- **FR11:** Super Admin can create a storm project using the REQUIRED naming format: `YYMMDD + [Customer(3)][Utility(3)][City(3)]` (e.g., `250717QUAONCDFW`).
- **FR11.1:** System auto-generates the date prefix `YYMMDD`.
- **FR11.2:** System validates the 3-letter codes for Customer, Utility, and City.
- **FR12:** Super Admin can set a storm project status (Active, On Hold, Closed).
- **FR13:** Super Admin can archive a closed storm project, preserving all associated data for a minimum of one year.
- **FR14:** Super Admin can assign contractors to an active storm project.

### Ticket Management

- **FR15:** Super Admin can manually create tickets within a storm project (location/address, circuit ID, damage description, priority level).
- **FR16:** Super Admin can edit existing ticket details.
- **FR17:** Super Admin can assign a ticket to one contractor.
- **FR18:** The system logs all ticket assignments with timestamp and acting user.
- **FR19:** Contractors can view only tickets assigned to them.
- **FR20:** Tickets have a visible status (Unassigned, Assigned, In Progress, Assessment Submitted, Under Review, Approved, Rejected).

### Damage Assessment

- **FR21:** Contractors can complete a damage assessment form for an assigned ticket.
- **FR22:** The assessment form captures structured data (damage type, component affected, severity, span count, measurements, notes).
- **FR23:** Contractors can upload photos as part of a damage assessment.
- **FR24:** Photos automatically capture GPS coordinates and timestamp.
- **FR25:** The assessment form enforces required fields — incomplete submissions are blocked.
- **FR26:** Contractors can save a draft assessment and return to it later.
- **FR27:** Contractors can submit a completed assessment for review.

### Assessment Review

- **FR28:** Super Admin can view all submitted assessments across a storm project.
- **FR29:** Super Admin can review an individual assessment with all photos, data, and location.
- **FR30:** Super Admin can approve an assessment.
- **FR31:** Super Admin can reject an assessment with required review notes explaining the reason.
- **FR32:** Contractors receive in-app notification that their assessment was approved or rejected.
- **FR33:** Contractors can revise and resubmit a rejected assessment.

### Dashboard & Overview

- **FR34:** Super Admin sees a project dashboard showing ticket counts grouped by status.
- **FR35:** Super Admin sees a list of all contractors assigned to the active project with their current ticket assignments.
- **FR36:** Contractors see a personal dashboard showing their assigned tickets and submission statuses.
- **FR37:** Super Admin can manually group tickets by location, circuit, or region.

### Future Functional Requirements (Tracked, Not in MVP)

- **FFR1:** System operates offline and syncs when connectivity returns. (Phase 2)
- **FFR2:** Super Admin can create and modify assessment form templates. (Phase 2)
- **FFR3:** Contractors can complete JSA, incident, and accident report forms. (Phase 2)
- **FFR4:** Environmental hazard reports trigger immediate priority notification chain. (Phase 2)
- **FFR5:** System sends SMS notifications for ticket assignments and status changes. (Phase 2)
- **FFR6:** System detects and flags potential duplicate tickets. (Phase 2)
- **FFR7:** Contractors can log time entries and expenses against tickets. (Phase 3)
- **FFR8:** Super Admin can generate and submit invoices to utility clients. (Phase 3)
- **FFR9:** Super Admin can view analytics and reporting dashboards. (Phase 3)

## Non-Functional Requirements (MVP Phase 1)

### Performance

- **NFR1:** Assessment form submission (excluding photo upload) completes within 3 seconds on a 4G/LTE connection, as measured by standardized API response telemetry.
- **NFR2:** Photo upload completes within 10 seconds per image on a 4G/LTE connection, as measured by client-side browser performance logs.
- **NFR3:** Dashboard and ticket list views load within 2 seconds, as measured by Chrome Web Vitals (LCP/FCP).
- **NFR4:** System supports up to 50 concurrent users without performance degradation, as measured by synthetic load testing.
- **NFR5:** All user-initiated actions (navigation, form interactions, status changes) respond within 1 second, as measured by Chrome Web Vitals.

### Security

- **NFR6:** All data transmitted between client and server is encrypted in transit (TLS 1.2+).
- **NFR7:** All data at rest is encrypted using cloud provider default encryption standards.
- **NFR8:** Contractor PII (W-9 documents, insurance documents) is stored in a secured storage bucket with restricted access — only Super Admin can view.
- **NFR9:** Database-level access controls enforced — contractors can only access their own data and assigned tickets.
- **NFR10:** Sensitive utility infrastructure data (circuit IDs, substation references, service territory details) is accessible only to authenticated, authorized users.
- **NFR11:** Session tokens expire after 24 hours of inactivity, requiring re-authentication.
- **NFR12:** File uploads are restricted to expected formats (PDF, JPEG, PNG, WebP) with server-side validation to prevent malicious uploads.

### Scalability

- **NFR13:** System accommodates rapid user growth from 0 to 200+ contractors during storm activation within hours.
- **NFR14:** Database and storage architecture supports multiple concurrent storm projects across different utility clients.
- **NFR15:** Photo storage scales elastically — storm projects may generate thousands of images per event.

### Reliability

- **NFR16:** System targets 99.5% uptime during active storm projects, as measured by cloud provider SLA monitoring.
- **NFR17:** Data written to the database on each ticket submission is immediately durable — no data loss on completed submissions.
- **NFR18:** If a browser tab or session is interrupted mid-form, draft data (FR26) is preserved locally and recoverable.
- **NFR19:** System provides clear error messages when submission fails, with guidance to retry.

### Data Retention

- **NFR20:** All storm project data (tickets, assessments, photos, contractor records) is retained for a minimum of 1 year after project close-out.
- **NFR21:** Archived data remains queryable for historical reference and bid projections.
