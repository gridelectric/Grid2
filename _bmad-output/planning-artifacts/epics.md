---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/bmb-creations/architecture.md
  - _bmad-output/bmb-creations/ux-design-specification.md
---

# Grid2 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Grid2, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Super Admin can create user accounts with one of three roles (Super Admin, Admin, Contractor).
FR2: Users can log in with email and password.
FR3: Super Admin can deactivate or reactivate user accounts.
FR4: The system enforces role-based access so Contractors cannot access admin functions.
FR5: Admin can view dashboards, tickets, and assessments but cannot create storm projects, enter tickets, or assign contractors.
FR6: New contractors can complete a fixed onboarding form (name, phone, email, emergency contact).
FR7: Contractors can upload a W-9 document during onboarding.
FR8: Contractors can upload proof of insurance during onboarding.
FR9: Super Admin can view and verify contractor onboarding submissions.
FR10: Contractors cannot access storm project features until onboarding is complete and verified.
FR10.1: The in-app onboarding flow replaces the legacy Adobe Sign process for W-9, Insurance, and NDA documents.
FR10.2: Generated onboarding documents are stored as PDF artifacts for audit compliance.
FR11: Super Admin can create a storm project using the required naming format `YYMMDD + [Customer(3)][Utility(3)][City(3)]`.
FR11.1: The system auto-generates the `YYMMDD` date prefix for storm project names.
FR11.2: The system validates 3-letter codes for Customer, Utility, and City in storm project names.
FR12: Super Admin can set storm project status (Active, On Hold, Closed).
FR13: Super Admin can archive a closed storm project and preserve associated data for at least one year.
FR14: Super Admin can assign contractors to an active storm project.
FR15: Super Admin can manually create tickets with location/address, circuit ID, damage description, and priority.
FR16: Super Admin can edit existing ticket details.
FR17: Super Admin can assign a ticket to one contractor.
FR18: The system logs all ticket assignments with timestamp and acting user.
FR19: Contractors can view only tickets assigned to them.
FR20: Tickets have visible status values (Unassigned, Assigned, In Progress, Assessment Submitted, Under Review, Approved, Rejected).
FR21: Contractors can complete a damage assessment form for an assigned ticket.
FR22: The assessment form captures structured data including damage type, component affected, severity, span count, measurements, and notes.
FR23: Contractors can upload photos as part of a damage assessment.
FR24: Photos automatically capture GPS coordinates and timestamp.
FR25: The assessment form enforces required fields and blocks incomplete submissions.
FR26: Contractors can save a draft assessment and return later.
FR27: Contractors can submit a completed assessment for review.
FR28: Super Admin can view all submitted assessments across a storm project.
FR29: Super Admin can review an individual assessment including photos, structured data, and location.
FR30: Super Admin can approve an assessment.
FR31: Super Admin can reject an assessment with required review notes.
FR32: Contractors receive in-app notification when an assessment is approved or rejected.
FR33: Contractors can revise and resubmit a rejected assessment.
FR34: Super Admin sees a project dashboard with ticket counts grouped by status.
FR35: Super Admin sees all contractors assigned to the active project with current ticket assignments.
FR36: Contractors see a personal dashboard with assigned tickets and submission statuses.
FR37: Super Admin can manually group tickets by location, circuit, or region.

### NonFunctional Requirements

NFR1: Assessment form submission (excluding photo upload) completes within 3 seconds on 4G/LTE, measured by API response telemetry.
NFR2: Photo upload completes within 10 seconds per image on 4G/LTE, measured by client-side browser performance logs.
NFR3: Dashboard and ticket list views load within 2 seconds, measured by Chrome Web Vitals (LCP/FCP).
NFR4: The system supports up to 50 concurrent users without performance degradation, measured by synthetic load testing.
NFR5: User-initiated actions (navigation, form interactions, status changes) respond within 1 second, measured by Chrome Web Vitals.
NFR6: All client-server data transmission is encrypted in transit (TLS 1.2+).
NFR7: All data at rest is encrypted using cloud-provider default encryption standards.
NFR8: Contractor PII (W-9 and insurance documents) is stored in secure storage with restricted access for Super Admin only.
NFR9: Database-level access controls ensure contractors can only access their own data and assigned tickets.
NFR10: Sensitive utility infrastructure data is accessible only to authenticated and authorized users.
NFR11: Session tokens expire after 24 hours of inactivity and require re-authentication.
NFR12: File uploads are restricted to expected formats (PDF, JPEG, PNG, WebP) with server-side validation.
NFR13: The system accommodates growth from 0 to 200+ contractors during storm activation within hours.
NFR14: Database and storage architecture supports multiple concurrent storm projects across utility clients.
NFR15: Photo storage scales elastically for thousands of images per storm event.
NFR16: The system targets 99.5% uptime during active storm projects, measured by cloud SLA monitoring.
NFR17: Submitted ticket data is immediately durable in the database with no data loss on completed submissions.
NFR18: If a browser tab or session is interrupted mid-form, draft data is preserved locally and recoverable.
NFR19: The system provides clear error messages on submission failure with retry guidance.
NFR20: All storm project data is retained for a minimum of 1 year after project close-out.
NFR21: Archived data remains queryable for historical reference and bid projections.

### Additional Requirements

- Starter template decision: no new starter template is required; build on the existing Next.js + Supabase + Dexie codebase.
- Architecture baseline uses TypeScript with shared Zod schemas to enforce isomorphic validation across client and server flows.
- Contractor/offline-capable write operations must use a sync bridge pattern (`useSyncMutation`) and must not call direct inserts from UI components.
- Hybrid API pattern is required: Server Actions for Admin workflows and client-side sync channels for contractor/offline workflows.
- RBAC enforcement must be implemented in depth: Supabase Auth, RLS at the database layer, and server-side role checks in route/layout boundaries.
- Role-isolated application structure is required with separate admin and contractor route groups and bounded feature modules.
- Migrations should follow Supabase CLI workflow and preserve schema compatibility for offline-sync data models.
- Infrastructure/deployment target is Vercel (frontend/edge) with Supabase managed backend and CI/CD auto-deploy on main branch merges.
- Realtime and sync mechanics must include queueing, retry logic, and conflict-handling policy for offline recovery.
- Standardized server mutation contract should return typed `{ data, error }` envelopes for predictable UI handling.
- UX requires mobile-first contractor experience and desktop/tablet admin experience with role-specific navigation patterns.
- Accessibility baseline is WCAG 2.1 AA, with high-contrast field readability goals for outdoor use and no color-only status signaling.
- Responsive support must cover iPad Safari as primary, desktop Safari for admin, and Chrome fallback paths.
- Form UX must prioritize inline validation and progressive disclosure to minimize late-stage error discovery.
- Field interactions require minimum 44px touch ergonomics (48px preferred for primary actions) and bottom-anchored primary actions on mobile.
- Offline reassurance patterns should expose clear sync state indicators and preserve local work before transition.
- UX testing requirements include real-device validation, Lighthouse accessibility/performance checks, and offline-resilience test scenarios.

### FR Coverage Map

FR1: Epic 1 - Super Admin creates role-based user accounts.
FR2: Epic 1 - Users authenticate via email/password.
FR3: Epic 1 - Super Admin activates/deactivates accounts.
FR4: Epic 1 - Role-based access prevents contractor admin access.
FR5: Epic 1 - Admin access is restricted to view-only operational scope.
FR6: Epic 2 - Contractors complete fixed onboarding profile.
FR7: Epic 2 - Contractors upload W-9.
FR8: Epic 2 - Contractors upload insurance proof.
FR9: Epic 2 - Super Admin verifies onboarding submissions.
FR10: Epic 2 - Unverified contractors are blocked from project features.
FR10.1: Epic 2 - Onboarding replaces Adobe Sign process for core compliance docs.
FR10.2: Epic 2 - Onboarding outputs PDF audit artifacts.
FR11: Epic 3 - Super Admin creates storm project with required format.
FR11.1: Epic 3 - System auto-generates date prefix in project name.
FR11.2: Epic 3 - System validates required 3-letter naming codes.
FR12: Epic 3 - Super Admin sets storm status.
FR13: Epic 3 - Super Admin archives closed storms with retention.
FR14: Epic 3 - Super Admin assigns contractors to active storms.
FR15: Epic 4 - Super Admin manually creates tickets.
FR16: Epic 4 - Super Admin edits tickets.
FR17: Epic 4 - Super Admin assigns ticket to one contractor.
FR18: Epic 4 - System audit-logs ticket assignment events.
FR19: Epic 4 - Contractors can only view assigned tickets.
FR20: Epic 4 - Ticket lifecycle status is visible.
FR21: Epic 5 - Contractors complete assessment on assigned ticket.
FR22: Epic 5 - Assessment captures structured damage data.
FR23: Epic 5 - Assessment includes photo evidence upload.
FR24: Epic 5 - Photos capture GPS/timestamp metadata automatically.
FR25: Epic 5 - Required fields block incomplete assessment submission.
FR26: Epic 5 - Contractors save and resume drafts.
FR27: Epic 5 - Contractors submit completed assessments.
FR28: Epic 6 - Super Admin sees all submitted assessments.
FR29: Epic 6 - Super Admin reviews full assessment details.
FR30: Epic 6 - Super Admin approves assessments.
FR31: Epic 6 - Super Admin rejects with required notes.
FR32: Epic 6 - Contractors receive in-app approval/rejection notifications.
FR33: Epic 6 - Contractors revise and resubmit rejected assessments.
FR34: Epic 7 - Super Admin dashboard groups ticket counts by status.
FR35: Epic 7 - Super Admin dashboard shows contractor assignment overview.
FR36: Epic 7 - Contractor dashboard shows personal assignment/submission status.
FR37: Epic 4 - Super Admin manually groups tickets by location/circuit/region.

## Epic List

### Epic 1: Identity, Access, and Role Enforcement
Users can securely authenticate, access role-appropriate functionality, and enforce operational boundaries across Super Admin, Admin, and Contractor roles.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 2: Contractor Onboarding and Compliance Readiness
Contractors can complete onboarding and compliance documentation, and Super Admin can verify readiness before granting project access.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR10.1, FR10.2

### Epic 3: Storm Project Setup and Workforce Activation
Super Admin can create and manage storm projects using enforced naming/retention rules and assign contractors to active operations.
**FRs covered:** FR11, FR11.1, FR11.2, FR12, FR13, FR14

### Epic 4: Ticket Intake, Assignment, and Work Organization
Super Admin can create, edit, assign, track, and group tickets so field teams can execute work with clear ownership and visibility.
**FRs covered:** FR15, FR16, FR17, FR18, FR19, FR20, FR37

### Epic 5: Field Damage Assessment Execution
Contractors can perform structured, validated assessments with photo/GPS evidence, save drafts, and submit complete field reports.
**FRs covered:** FR21, FR22, FR23, FR24, FR25, FR26, FR27

### Epic 6: Assessment Review and Rework Workflow
Super Admin can review, approve, or reject assessments with feedback, and contractors can receive outcomes and resubmit corrected work.
**FRs covered:** FR28, FR29, FR30, FR31, FR32, FR33

### Epic 7: Operational Dashboards and Visibility
Super Admin and contractors can monitor storm operations through role-appropriate dashboards and assignment status views.
**FRs covered:** FR34, FR35, FR36

## Epic 1: Identity, Access, and Role Enforcement

Users can securely authenticate, access role-appropriate functionality, and enforce operational boundaries across Super Admin, Admin, and Contractor roles.

### Story 1.1: Super Admin Creates Role-Based User Accounts

As a Super Admin,
I want to create user accounts with assigned roles,
So that I can onboard operational users with correct permissions.

**Acceptance Criteria:**

**Given** I am authenticated as Super Admin
**When** I submit a new user with required fields and a valid role (Super Admin/Admin/Contractor)
**Then** the system creates the account and stores the selected role
**And** the new user appears in the user management list with active status.

**Given** I am authenticated as a non-Super Admin user
**When** I attempt to create an account
**Then** the action is denied
**And** no user record is created.

### Story 1.2: User Login with Email/Password Session Controls

As a platform user,
I want to log in with email and password,
So that I can securely access my role-specific portal.

**Acceptance Criteria:**

**Given** my credentials are valid
**When** I log in
**Then** I am authenticated and redirected to the correct role-based landing area
**And** my session is established securely.

**Given** my credentials are invalid
**When** I attempt login
**Then** authentication is rejected
**And** I receive a clear error message without exposing sensitive auth details.

**Given** I have been inactive for 24 hours
**When** I attempt an authenticated action
**Then** I am required to re-authenticate
**And** the expired session is not accepted.

### Story 1.3: Super Admin Deactivates and Reactivates User Accounts

As a Super Admin,
I want to deactivate or reactivate user accounts,
So that I can control workforce access during storm operations.

**Acceptance Criteria:**

**Given** I am authenticated as Super Admin
**When** I deactivate an active user
**Then** the user status becomes inactive
**And** that user cannot authenticate or access protected areas.

**Given** I am authenticated as Super Admin
**When** I reactivate an inactive user
**Then** the user status becomes active
**And** the user can authenticate again with valid credentials.

### Story 1.4: Role-Based Authorization and Admin Capability Boundaries

As a system user,
I want strict role-based access enforcement,
So that each role only sees and performs permitted actions.

**Acceptance Criteria:**

**Given** I am logged in as Contractor
**When** I access admin-only routes or actions
**Then** access is denied
**And** protected data is not returned.

**Given** I am logged in as Admin
**When** I access dashboards, tickets, and assessments
**Then** I can view permitted operational data
**And** create/edit actions for storm projects, ticket entry, and contractor assignment are blocked.

**Given** I am logged in as Super Admin
**When** I access admin capabilities
**Then** all role-restricted management actions for this epic are available
**And** authorization checks are enforced server-side and at data-access layer.

## Epic 2: Contractor Onboarding and Compliance Readiness

Contractors can complete onboarding and compliance documentation, and Super Admin can verify readiness before granting project access.

### Story 2.1: Contractor Completes Core Onboarding Profile

As a Contractor,
I want to submit my required onboarding profile information,
So that I can enter the readiness review process.

**Acceptance Criteria:**

**Given** I am an authenticated contractor without verified onboarding
**When** I complete and submit required fields (name, phone, email, emergency contact)
**Then** the onboarding profile is saved
**And** my status is set to pending verification.

**Given** required fields are missing or invalid
**When** I attempt submission
**Then** submission is blocked
**And** field-level validation errors are shown.

### Story 2.2: Contractor Uploads Required Compliance Documents

As a Contractor,
I want to upload required compliance documents,
So that Super Admin can validate my eligibility.

**Acceptance Criteria:**

**Given** I am on onboarding document step
**When** I upload W-9 and insurance files in allowed formats
**Then** files are accepted and linked to my onboarding record
**And** upload status is shown for each required document.

**Given** file type is not allowed or upload fails validation
**When** I attempt upload
**Then** the file is rejected
**And** I receive a clear error indicating accepted formats and requirements.

### Story 2.3: Super Admin Reviews and Verifies Onboarding

As a Super Admin,
I want to review submitted onboarding packages and mark verification decisions,
So that only compliant contractors can access storm project features.

**Acceptance Criteria:**

**Given** a contractor onboarding package is pending
**When** I open the review screen
**Then** I can view profile details and required uploaded documents
**And** I can mark onboarding as verified or not verified.

**Given** contractor is not verified
**When** contractor attempts to access storm project features
**Then** access is denied
**And** the user is directed to complete or resolve onboarding.

### Story 2.4: Onboarding Compliance Artifact Generation

As a Super Admin,
I want onboarding outputs generated as audit-ready PDF artifacts replacing legacy Adobe Sign workflow,
So that compliance records are standardized and retrievable.

**Acceptance Criteria:**

**Given** required onboarding documents and acknowledgments are completed
**When** onboarding package is finalized
**Then** the system generates PDF compliance artifacts for required documents
**And** artifacts are stored with traceable linkage to the contractor record.

**Given** artifact generation or storage fails
**When** finalization is attempted
**Then** finalization is blocked
**And** an actionable error is logged and surfaced for retry or support.

## Epic 3: Storm Project Setup and Workforce Activation

Super Admin can create and manage storm projects using enforced naming and retention rules and assign contractors to active operations.

### Story 3.1: Super Admin Creates Storm Project with Enforced Naming Rules

As a Super Admin,
I want to create a storm project with system-enforced naming format,
So that projects are standardized and traceable.

**Acceptance Criteria:**

**Given** I am authenticated as Super Admin
**When** I create a storm project
**Then** the system auto-generates the `YYMMDD` prefix
**And** validates the `Customer(3)`, `Utility(3)`, and `City(3)` code segments.

**Given** naming inputs do not meet required format rules
**When** I submit project creation
**Then** creation is blocked
**And** I receive clear validation guidance.

### Story 3.2: Super Admin Manages Storm Project Status Lifecycle

As a Super Admin,
I want to set storm status values,
So that operations reflect current execution state.

**Acceptance Criteria:**

**Given** a storm project exists
**When** I update status to Active, On Hold, or Closed
**Then** the new status is persisted
**And** status changes are visible in project management views.

**Given** a non-Super Admin attempts status changes
**When** they submit a status update
**Then** the action is denied
**And** project status remains unchanged.

### Story 3.3: Super Admin Assigns Contractors to Active Storm Projects

As a Super Admin,
I want to assign contractors to active storms,
So that workforce can be mobilized for field execution.

**Acceptance Criteria:**

**Given** a storm project is Active
**When** I assign one or more contractors
**Then** assignments are saved
**And** assigned contractors are linked to that storm context.

**Given** a storm project is On Hold or Closed
**When** I attempt new contractor assignment
**Then** assignment is blocked
**And** I receive a status-based constraint message.

### Story 3.4: Super Admin Archives Closed Storm Projects with Retention Controls

As a Super Admin,
I want to archive closed storm projects while preserving required records,
So that compliance and historical reference needs are met.

**Acceptance Criteria:**

**Given** a storm project is Closed
**When** I archive it
**Then** project data is preserved for at least one year
**And** archived project records remain queryable.

**Given** a storm is not Closed
**When** I attempt to archive it
**Then** archival is blocked
**And** I receive a message requiring Closed status first.

## Epic 4: Ticket Intake, Assignment, and Work Organization

Super Admin can create, edit, assign, track, and group tickets so field teams can execute work with clear ownership and visibility.

### Story 4.1: Super Admin Creates and Edits Tickets

As a Super Admin,
I want to create and edit ticket records with required operational fields,
So that field work can be accurately scoped and tracked.

**Acceptance Criteria:**

**Given** I am authenticated as Super Admin
**When** I create a ticket with required fields (location/address, circuit ID, damage description, priority)
**Then** the ticket is saved
**And** it is visible in the ticket management list.

**Given** an existing ticket
**When** I edit mutable ticket details
**Then** updates are persisted
**And** the latest values are shown in ticket views.

### Story 4.2: Super Admin Assigns Tickets with Audit Logging

As a Super Admin,
I want to assign tickets to individual contractors with assignment history,
So that ownership is clear and assignment actions are traceable.

**Acceptance Criteria:**

**Given** an unassigned or assigned ticket
**When** I assign or reassign it to a contractor
**Then** the assignment is saved
**And** an audit record is written with acting user and timestamp.

**Given** a non-Super Admin attempts assignment mutation
**When** assignment action is submitted
**Then** action is denied
**And** no assignment change is persisted.

### Story 4.3: Contractor Views Assigned Tickets and Statuses

As a Contractor,
I want to view only my assigned tickets and their statuses,
So that I can execute my workload without unrelated operational noise.

**Acceptance Criteria:**

**Given** I am authenticated as Contractor
**When** I open ticket views
**Then** I see only tickets assigned to me
**And** each ticket displays current status.

**Given** ticket status changes in workflow
**When** I refresh or revisit ticket list
**Then** updated statuses are visible
**And** status values conform to allowed lifecycle set.

### Story 4.4: Super Admin Manually Groups Tickets for Work Organization

As a Super Admin,
I want to manually group tickets by location, circuit, or region,
So that deployment can be organized around operational clusters.

**Acceptance Criteria:**

**Given** I am in ticket management
**When** I create or update a manual grouping criterion (location/circuit/region)
**Then** selected tickets are associated with that grouping
**And** grouped views are available for assignment planning.

**Given** grouped tickets are displayed
**When** I review grouping results
**Then** each ticket retains its individual lifecycle status and assignment information
**And** grouping does not overwrite ticket source data.

## Epic 5: Field Damage Assessment Execution

Contractors can perform structured, validated assessments with photo and GPS evidence, save drafts, and submit complete field reports.

### Story 5.1: Contractor Completes Structured Damage Assessment Form

As a Contractor,
I want to complete a structured assessment form for my assigned ticket,
So that damage is captured in a consistent, reviewable format.

**Acceptance Criteria:**

**Given** I am assigned a ticket
**When** I open the assessment form
**Then** I can capture required structured fields (damage type, component, severity, span count, measurements, notes)
**And** the form is bound to the selected ticket.

**Given** I submit a complete valid form payload
**When** submission is processed
**Then** structured assessment data is persisted
**And** the assessment enters submitted-for-review state.

### Story 5.2: Contractor Captures and Attaches Photo Evidence with Metadata

As a Contractor,
I want to upload assessment photos with GPS and timestamp metadata,
So that each submission includes verifiable field evidence.

**Acceptance Criteria:**

**Given** I am completing an assessment
**When** I add one or more photos
**Then** photos are attached to the assessment
**And** each photo record includes captured GPS coordinates and timestamp metadata.

**Given** photo attachment fails validation or upload
**When** I attempt to continue
**Then** I receive clear failure feedback
**And** invalid or failed attachments are not treated as complete evidence.

### Story 5.3: Required-Field Validation and Incomplete Submission Blocking

As a Contractor,
I want inline validation of required fields,
So that incomplete assessments are prevented before submission.

**Acceptance Criteria:**

**Given** required assessment fields are missing
**When** I attempt submit
**Then** submission is blocked
**And** the form highlights missing or invalid fields with actionable messages.

**Given** all required fields and required evidence are present
**When** I submit
**Then** validation passes
**And** submission proceeds without manual rework prompts.

### Story 5.4: Contractor Saves and Resumes Assessment Drafts

As a Contractor,
I want to save an in-progress draft and resume later,
So that interrupted field sessions do not lose work.

**Acceptance Criteria:**

**Given** I have entered partial assessment data
**When** I save draft or leave the form flow
**Then** current draft state is preserved
**And** I can reopen and continue from saved state.

**Given** session interruption occurs mid-form
**When** I return to the assessment
**Then** recoverable draft data is available
**And** previously entered values are restored for completion.

## Epic 6: Assessment Review and Rework Workflow

Super Admin can review, approve, or reject assessments with feedback, and contractors can receive outcomes and resubmit corrected work.

### Story 6.1: Super Admin Views Submitted Assessments Across Storm Project

As a Super Admin,
I want to view all submitted assessments for a storm project,
So that I can triage and manage review workload.

**Acceptance Criteria:**

**Given** assessments have been submitted in a storm project
**When** I open submitted assessments view
**Then** I can see all submitted records for that project
**And** each record displays key context (ticket, contractor, submission timestamp, review state).

**Given** I am not Super Admin
**When** I attempt to access this review list scope
**Then** access is restricted according to role permissions
**And** unauthorized review data is not returned.

### Story 6.2: Super Admin Reviews Full Assessment Detail Package

As a Super Admin,
I want to inspect full assessment details before deciding,
So that decisions are based on complete evidence.

**Acceptance Criteria:**

**Given** I select a submitted assessment
**When** detail view opens
**Then** I can review structured assessment data, associated photos, and location context
**And** data shown matches the submitted artifact set for that ticket.

**Given** required detail components are unavailable due to retrieval error
**When** I load the review detail
**Then** I receive a clear error state
**And** no approval or rejection decision can be finalized on incomplete payload.

### Story 6.3: Super Admin Approves or Rejects with Required Notes on Rejection

As a Super Admin,
I want to approve valid assessments or reject with mandatory review notes,
So that quality control decisions are explicit and actionable.

**Acceptance Criteria:**

**Given** I am reviewing a submitted assessment
**When** I choose Approve
**Then** assessment status transitions to approved
**And** decision metadata (actor and timestamp) is recorded.

**Given** I am reviewing a submitted assessment
**When** I choose Reject without notes
**Then** rejection is blocked
**And** I am prompted to provide required review notes.

**Given** I provide rejection notes
**When** I submit Reject
**Then** assessment status transitions to rejected
**And** rejection notes are stored with decision metadata.

### Story 6.4: Contractor Receives Review Outcome and Can Revise and Resubmit

As a Contractor,
I want to receive review outcomes and resubmit corrected work if rejected,
So that I can close tickets successfully without ambiguity.

**Acceptance Criteria:**

**Given** an assessment decision is made
**When** I open my assignments or notifications
**Then** I see approved or rejected outcome in-app
**And** rejected outcomes include review notes.

**Given** my assessment is rejected
**When** I edit the assessment and resubmit
**Then** a new submitted-for-review cycle starts
**And** prior review history is preserved for traceability.

## Epic 7: Operational Dashboards and Visibility

Super Admin and contractors can monitor storm operations through role-appropriate dashboards and assignment status views.

### Story 7.1: Super Admin Project Status Dashboard

As a Super Admin,
I want a dashboard showing ticket counts grouped by status,
So that I can quickly assess storm progress.

**Acceptance Criteria:**

**Given** I am authenticated as Super Admin
**When** I open dashboard view
**Then** I see ticket counts grouped by allowed status values
**And** counts reflect current persisted workflow state.

**Given** dashboard data retrieval fails
**When** view loads
**Then** I receive a clear error state
**And** no stale or misleading grouped totals are shown as current.

### Story 7.2: Super Admin Contractor Assignment Overview

As a Super Admin,
I want to view all assigned contractors and their current ticket assignments,
So that I can monitor workforce distribution.

**Acceptance Criteria:**

**Given** active project assignments exist
**When** I open contractor assignment overview
**Then** I see each assigned contractor with their current ticket assignment set
**And** assignment view aligns with ticket ownership records.

**Given** assignment state changes
**When** I refresh or revisit dashboard
**Then** overview reflects latest assignment distribution
**And** data remains scoped to selected active project context.

### Story 7.3: Contractor Personal Work Dashboard

As a Contractor,
I want a personal dashboard of my assigned tickets and submission statuses,
So that I can manage my field workload and progress.

**Acceptance Criteria:**

**Given** I am authenticated as Contractor
**When** I open my dashboard
**Then** I see only my assigned tickets
**And** each item includes current submission or status state.

**Given** I have no current assignments
**When** I open dashboard
**Then** I see an empty-state message appropriate to my role
**And** no other users' assignment data is exposed.
