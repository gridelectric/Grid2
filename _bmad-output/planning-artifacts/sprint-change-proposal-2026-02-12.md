# Sprint Change Proposal

Date: 2026-02-12  
Trigger: Order-of-operations drift and conflicting progress signals  
Requested by: User (`batch` mode)

## Section 1: Issue Summary

### Problem Statement
Project execution has drifted because planning/tracking artifacts are out of sync with each other and with the actual codebase state. This creates uncertainty about what to implement next.

### Current Position in Order of Operations (Authoritative)
Based on `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` (Section 2, Progress Tracker):
- Overall Progress: 31%
- Current Track: Phase 2, Week 5 complete
- Next Planned Work: Week 6 (`Task 6.1 -> 6.2 -> 6.3`)

### Evidence
- `grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` shows Phase 2 / Week 5 complete and Week 6 not started.
- `AGENTS.md` Quick Status still reports Phase 1 / Week 2 / 8% complete.
- `_bmad-output/implementation-artifacts/sprint-status.yaml` is still example/template content (`project: My Awesome Project`) and has no `backlog` stories available for flow continuation.
- `_bmad-output/implementation-artifacts` story files are not consistently aligned with `sprint-status.yaml` keys.
- Codebase confirms missing Week 6+ feature areas:
  - `src/components/features/map` missing
  - `src/components/features/assessments` missing
  - `src/components/features/time-tracking` missing
  - `src/components/features/expenses` missing
  - `src/components/features/invoices` missing

## Section 2: Impact Analysis

### Epic Impact
- Epic/story planning cannot be progressed reliably through workflow automation because sprint tracking is not in a valid operational state.
- Future epics/stories are effectively blocked by tracker inconsistency, not by implementation constraints.

### Story Impact
- `dev-story` and `create-story` flows halt because no valid next story is discoverable from `sprint-status.yaml`.
- Existing implemented work risks being under-leveraged due to missing/incorrect story sequencing metadata.

### Artifact Conflicts
- Conflict A: `MASTER_BUILD_INSTRUCTIONS.md` vs `AGENTS.md` Quick Status.
- Conflict B: `epics.md` sequencing vs implementation artifact naming/state.
- Conflict C: `sprint-status.yaml` is template/example, not project-real.

### Technical Impact
- Developer time loss from repeated workflow halts.
- Increased chance of duplicate or out-of-order implementation.
- Reduced confidence in status reporting and handoff accuracy.

## Section 3: Recommended Approach

### Evaluated Paths
- Option 1: Direct Adjustment (update trackers and continue) -> Viable (Effort: Medium, Risk: Low)
- Option 2: Potential Rollback -> Not viable (Effort: High, Risk: High)
- Option 3: PRD MVP Review only -> Partially viable (does not unblock tracker state alone)

### Recommended Path
Hybrid of Option 1 + targeted governance clarification:
1. Re-baseline tracking artifacts immediately.
2. Re-establish one execution authority for order-of-operations (`MASTER_BUILD_INSTRUCTIONS.md` Section 2).
3. Resume implementation at Week 6 per phase order.

### Rationale
- Fastest route to restore momentum.
- Lowest technical risk.
- Preserves completed work.
- Clears workflow blocking conditions.

### Effort, Risk, Timeline
- Effort: Moderate (artifact alignment + one next-story bootstrap)
- Risk: Low to Medium (mainly coordination/document consistency)
- Timeline impact: <1 day to re-baseline, then normal development cadence

## Section 4: Detailed Change Proposals

### 4.1 Story / Tracking Changes

#### Proposal S1: Rebuild sprint tracker from current reality
Artifact: `_bmad-output/implementation-artifacts/sprint-status.yaml`

OLD:
```yaml
project: My Awesome Project
development_status:
  epic-1: backlog
  1-1-user-authentication: done
  ...
```

NEW:
```yaml
project: Grid2
development_status:
  # Real project statuses only (no template/example data)
  # Include a valid next story marked ready-for-dev
```

Rationale: Restores workflow discoverability and removes template noise.

#### Proposal S2: Create next executable story aligned to current phase order
Artifact: `_bmad-output/implementation-artifacts/6-1-map-integration.md` (new)

OLD:
```text
No story file exists for current next phase task in Master Build order.
```

NEW:
```text
Story 6.1: Map Integration
Status: ready-for-dev
Tasks mapped to Master Week 6 Task 6.1
```

Rationale: Allows direct `dev-story` execution without ambiguity.

### 4.2 PRD Modification

#### Proposal P1: Add execution-governance note
Artifact: `_bmad-output/planning-artifacts/prd.md`

OLD:
```text
No explicit operational statement defining which file governs day-to-day implementation sequence when artifacts disagree.
```

NEW:
```text
Execution Governance Note:
For implementation sequencing in this repository, the authoritative order-of-operations is
`grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md` Section 2 (Progress Tracker).
Epics/PRD remain requirements authority and traceability source.
```

Rationale: Prevents future process drift and ambiguity.

### 4.3 Architecture Modification

#### Proposal A1: Align structure examples with actual route groups
Artifact: `_bmad-output/planning-artifacts/architecture.md`

OLD:
```text
src/app/(app)/...
```

NEW:
```text
src/app/(subcontractor)/...
```

Rationale: Prevents implementation mistakes due to stale structural examples.

### 4.4 UI/UX Specification Modification

#### Proposal U1: Add MVP execution boundary callout
Artifact: `_bmad-output/planning-artifacts/ux-design-specification.md`

OLD:
```text
Offline-first guidance is presented as core behavior without implementation-phase guardrails.
```

NEW:
```text
Execution Boundary:
Week 6 focuses on map/GPS workflow foundation.
Week 7 focuses on photo capture/storage.
Week 8 introduces offline sync/storage infrastructure.
Do not implement Week 8 offline mechanics while Week 6-7 remain incomplete.
```

Rationale: Keeps implementation aligned to current roadmap sequence.

### 4.5 AGENTS Quick Status Sync

#### Proposal G1: Update stale quick status summary
Artifact: `AGENTS.md`

OLD:
```text
Current Phase: Phase 1 — Foundation (Week 2)
Overall Progress: 8%
```

NEW:
```text
Current Phase: Phase 2 — Core Features (Week 6 next)
Overall Progress: 31%
Week 5: Complete
```

Rationale: Reduces onboarding confusion for every future agent run.

## Section 5: Implementation Handoff

### Scope Classification
Moderate

### Approval Status
Approved by user on 2026-02-12 (`yes`)

### Routing
- Product Owner / Scrum Master workflow owners:
  - approve artifact alignment decisions
  - confirm governance note and sequencing authority
- Development team:
  - execute Week 6 implementation after re-baseline

### Responsibilities
- PM/PO/SM:
  - approve this change proposal
  - approve tracker/schema updates to sprint-status semantics
- Dev:
  - create and execute next ready story
  - keep `MASTER_BUILD_INSTRUCTIONS.md` and `AGENTS.md` synchronized after each completed task

### Success Criteria
- `sprint-status.yaml` no longer contains example/template data.
- A single next story is discoverable as `ready-for-dev`.
- Status summary in `AGENTS.md` matches `MASTER_BUILD_INSTRUCTIONS.md`.
- Week 6 implementation starts with no workflow halt due to tracker ambiguity.

## Checklist Execution Log

### Section 1 - Understand Trigger and Context
- 1.1 Trigger story identified: [x] Done
- 1.2 Core problem defined: [x] Done
- 1.3 Evidence gathered: [x] Done

### Section 2 - Epic Impact Assessment
- 2.1 Current epic assessed: [x] Done
- 2.2 Epic-level changes defined: [x] Done
- 2.3 Future epic impact checked: [x] Done
- 2.4 Invalidated/new epics check: [x] Done (no new product epics required)
- 2.5 Sequence/priority reassessment: [x] Done

### Section 3 - Artifact Conflict Analysis
- 3.1 PRD conflict check: [x] Done
- 3.2 Architecture conflict check: [x] Done
- 3.3 UI/UX conflict check: [x] Done
- 3.4 Secondary artifact impact: [x] Done

### Section 4 - Path Forward Evaluation
- 4.1 Option 1 (Direct Adjustment): [x] Viable
- 4.2 Option 2 (Rollback): [x] Not viable
- 4.3 Option 3 (MVP Review): [x] Viable (partial)
- 4.4 Recommended path selected: [x] Done

### Section 5 - Proposal Components
- 5.1 Issue summary: [x] Done
- 5.2 Epic/artifact impact summary: [x] Done
- 5.3 Recommendation with rationale: [x] Done
- 5.4 MVP impact + action plan: [x] Done
- 5.5 Handoff plan: [x] Done

### Section 6 - Final Review and Handoff (Pending Approval)
- 6.1 Checklist completion review: [x] Done
- 6.2 Proposal accuracy verification: [x] Done
- 6.3 User approval: [x] Done (approved: `yes`)
- 6.4 Sprint-status updates: [x] Done (re-baselined on 2026-02-12)
- 6.5 Final handoff confirmation: [x] Done
