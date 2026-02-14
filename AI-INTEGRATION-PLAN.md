# Private AI Copilot + Admin Action Agent (Feasible)

## Summary
- Yes, this is possible in this codebase.
- We will implement a private-hosted AI copilot with a floating action button and chat dialog for all roles.
- We will use RAG-first knowledge (company docs, app code context, authorized business data) instead of immediate full model fine-tuning.
- We will enforce approval-gated write actions for ADMIN/SUPER_ADMIN using a two-step confirmation flow.
- “Create/change features” will be implemented as GitHub PR proposal generation, not autonomous deploys.

## Roadmap Alignment (No Conflict)
- Current tracker shows Week 13 complete and Week 14 not started in `/Users/grid/.codex/worktrees/cb81/Grid2/grid-electric-docs/MASTER_BUILD_INSTRUCTIONS.md`.
- We will keep phase order by executing Week 14.1 background sync first, then add new tasks:
1. Task 14.3: AI Assistant Foundation.
2. Task 14.4: AI Admin Action Guardrails.
3. Task 14.5: AI Dev Proposal (GitHub PR) Flow.
- We will update Section 2 progress entries after each task implementation.

## Public Interfaces and API Changes
- New UI entrypoint in `/Users/grid/.codex/worktrees/cb81/Grid2/src/components/common/layout/AppShell.tsx`: mount `AssistantFab` for authenticated routes.
- New components under `/Users/grid/.codex/worktrees/cb81/Grid2/src/components/features/ai/`:
1. `AssistantFab.tsx`.
2. `AssistantDialog.tsx`.
3. `ApprovalPromptCard.tsx`.
4. `CitationsPanel.tsx`.
- New provider in `/Users/grid/.codex/worktrees/cb81/Grid2/src/components/providers/AssistantProvider.tsx` with session state, streaming lifecycle, and offline fallback hooks.
- New API routes under `/Users/grid/.codex/worktrees/cb81/Grid2/src/app/api/ai/`:
1. `POST /api/ai/chat` for streamed assistant responses and tool intents.
2. `POST /api/ai/action/approve` for two-step confirmation execution.
3. `GET /api/ai/sessions` and `POST /api/ai/sessions` for chat history.
4. `POST /api/ai/dev/proposal` for SUPER_ADMIN GitHub PR proposal generation.
- New server modules under `/Users/grid/.codex/worktrees/cb81/Grid2/src/lib/ai/`:
1. `orchestrator.ts` for model/tool routing.
2. `policy.ts` for role and capability enforcement.
3. `tools.ts` for whitelisted action executors.
4. `rag.ts` for retrieval pipeline.
5. `prompting.ts` for system prompts and safe templates.

## Database and Type Changes
- Add SQL migration(s) in `/Users/grid/.codex/worktrees/cb81/Grid2/sql/` for:
1. `ai_sessions` table.
2. `ai_messages` table.
3. `ai_action_requests` table with status lifecycle (`PENDING_APPROVAL`, `APPROVED`, `EXECUTED`, `REJECTED`, `FAILED`).
4. `ai_action_logs` immutable table for AI action audit trail.
5. `ai_knowledge_documents` and `ai_knowledge_chunks` with embeddings column (`vector`) and metadata.
6. `CREATE EXTENSION IF NOT EXISTS vector;`.
- Add RLS policies so users can read only their sessions/messages and admins can read org-scoped items.
- Add security-definer function(s) for controlled log writes and approval transitions so action logging cannot be bypassed.
- Extend `/Users/grid/.codex/worktrees/cb81/Grid2/src/types/index.ts` with AI session/message/request/action log types and role capability enums.

## Permission and Safety Model
- Model never gets direct SQL or unrestricted Supabase access.
- All mutations run through deterministic tools using `/Users/grid/.codex/worktrees/cb81/Grid2/src/lib/supabase/admin.ts` server-side only.
- Tool allowlist for v1 writes:
1. Tickets.
2. Time reviews.
3. Expense reviews.
4. Assessment reviews.
5. User/profile admin operations.
- Two-step approval flow:
1. Assistant proposes action with diff/impact summary.
2. Super admin confirms via explicit confirmation token.
3. Backend re-validates role, scope, and stale-state hash before execute.
- Every action writes immutable audit entries including user id, role, action, before/after snapshot, timestamp, IP, and user-agent.

## Knowledge Strategy (RAG First)
- Build ingestion job to index:
1. Company docs from `/Users/grid/.codex/worktrees/cb81/Grid2/grid-electric-docs/`.
2. App metadata and route/help context from `src/`.
3. Approved operational data snapshots from Supabase with role-aware retrieval filters.
- Return citation metadata with every answer so users can verify source.
- Defer fine-tuning to post-launch after collecting approved, sanitized interaction data.

## “Create New Features” Flow (Super Admin)
- `/api/ai/dev/proposal` generates:
1. Implementation plan.
2. Proposed file diff(s).
3. Risk/test checklist.
4. GitHub PR draft on `codex/*` branch.
- Merge/deploy remains human-reviewed through existing CI and release process.
- No autonomous direct production deploys.

## UX and Offline Behavior
- FAB appears for authenticated users in admin and contractor shells; hidden on auth pages.
- Dialog supports streaming, citations, suggested actions, and approval cards for privileged operations.
- Offline behavior uses existing connectivity patterns (`SyncProvider`); assistant shows unavailable state and supports queued prompt retry plus static help fallback.

## Implementation Phases
1. Phase A: Architecture scaffolding and policy engine in `src/lib/ai`, plus base types and feature flags.
2. Phase B: SQL migrations, RLS, and audit immutability functions.
3. Phase C: RAG ingestion/indexing and retrieval API.
4. Phase D: FAB/dialog UI and session/message persistence.
5. Phase E: Approval-gated action tools for Ops + User Admin domains.
6. Phase F: Super-admin GitHub PR proposal workflow and governance controls.
7. Phase G: Full test matrix, hardening, and documentation/progress tracker updates.

## Test Cases and Scenarios
1. Role visibility: FAB available to authenticated users only, hidden on login/reset paths.
2. Capability gating: contractor cannot invoke admin tools; admin cannot invoke super-admin-only tools.
3. Approval enforcement: write action never executes without valid second-step confirmation token.
4. Audit completeness: every executed AI mutation has immutable log with before/after payload and request context.
5. RLS containment: users only retrieve authorized records in chat context and session history.
6. Prompt-injection resilience: malicious prompt cannot trigger non-whitelisted tool execution.
7. Offline behavior: assistant degrades gracefully and recovers on reconnect without state corruption.
8. Dev proposal path: super-admin request creates a GitHub PR draft with generated diff and test checklist.
9. Regression checks: existing auth, middleware route protection, and sync workflows continue passing current test suites.

## Acceptance Criteria
- Assistant responses stream successfully with citation payloads.
- Unauthorized tool calls are blocked 100% in integration tests.
- Approval-gated writes require explicit confirmation and are replay-safe.
- Audit trail coverage for AI mutations is 100%.
- Existing Week 13 test gates remain green after integration.
- Week 14/AI tasks are recorded in progress tracker with completion dates and agent IDs.

## Assumptions and Defaults Chosen
- Model host: private internal AI server.
- Knowledge method: RAG-first; no immediate full fine-tune.
- User scope: all roles, strictly scoped by role.
- Write scope v1: operations + user admin only, approval-gated.
- Approval UX: two-step explicit confirmation.
- Offline AI: online-first with clear fallback.
- Dev workflow: GitHub PR proposals.
- Existing Week 14.1 background sync work lands before AI write automation features touch sync-related surfaces.
