# Story 1.2: User Login with Email/Password Session Controls

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a platform user,
I want to log in with email and password,
so that I can securely access my role-specific portal.

## Acceptance Criteria

1. **Given** my credentials are valid  
   **When** I log in  
   **Then** I am authenticated and redirected to the correct role-based landing area  
   **And** my session is established securely.
2. **Given** my credentials are invalid  
   **When** I attempt login  
   **Then** authentication is rejected  
   **And** I receive a clear error message without exposing sensitive auth details.
3. **Given** I have been inactive for 24 hours  
   **When** I attempt an authenticated action  
   **Then** I am required to re-authenticate  
   **And** the expired session is not accepted.

## Tasks / Subtasks

- [x] Implement role-based login success behavior (AC: 1)
  - [x] Update `src/components/features/auth/LoginForm.tsx` to redirect users to role-appropriate landing routes after successful auth
  - [x] Add a reusable role-to-landing resolver utility in `src/lib/auth/roleLanding.ts`
  - [x] Update `profiles.last_login_at` on successful sign-in

- [x] Implement secure login failure behavior (AC: 2)
  - [x] Ensure login failures show a generic, user-safe message (no sensitive auth internals)
  - [x] Preserve existing field-level validation behavior

- [x] Implement inactivity session control (AC: 3)
  - [x] Add middleware inactivity enforcement in `src/lib/supabase/middleware.ts` using a 24-hour threshold
  - [x] Track authenticated activity timestamp via an HTTP-only cookie and refresh it on valid authenticated requests
  - [x] Force re-authentication by redirecting to `/login` when inactivity threshold is exceeded

- [x] Add automated tests and verification coverage (AC: 1-3)
  - [x] Add unit tests for role-based landing mapping in `src/lib/auth/roleLanding.test.ts`
  - [x] Add unit tests for inactivity timeout behavior in `src/lib/auth/sessionTimeout.test.ts`
  - [x] Run auth and regression tests to verify no breakage

## Dev Notes

### Story Requirements Context

- Story source: `_bmad-output/planning-artifacts/epics.md` under "Story 1.2: User Login with Email/Password Session Controls".
- This story builds on existing auth forms and Supabase client/middleware setup already present in `src/`.

### Technical Requirements

- Use Supabase auth password sign-in (`signInWithPassword`) for credential verification.
- Keep role source-of-truth in `profiles.role`.
- Enforce inactivity expiration at 24 hours for authenticated actions.
- Keep unauthenticated route behavior consistent with existing `/login` redirect paths.

### Architecture Compliance

- Preserve current Next.js App Router structure and `src/`-based import paths.
- Keep middleware flow in `src/middleware.ts` as entry point and implement session policy in `src/lib/supabase/middleware.ts`.
- Avoid adding new auth state systems for this story; extend existing provider/middleware pattern.

### Library / Framework Requirements

- Next.js App Router
- Supabase SSR (`@supabase/ssr`) in middleware/server contexts
- Supabase JS client for browser auth calls
- Existing test stack (Vitest-style tests already present in repository)

### File Structure Requirements

- Modify:
  - `src/components/features/auth/LoginForm.tsx`
  - `src/lib/supabase/middleware.ts`
- Add:
  - `src/lib/auth/roleLanding.ts`
  - `src/lib/auth/roleLanding.test.ts`
  - `src/lib/auth/sessionTimeout.ts`
  - `src/lib/auth/sessionTimeout.test.ts`

### Testing Requirements

- Unit coverage for role landing mapping and fallback behavior.
- Unit coverage for inactivity threshold logic and timestamp parsing edge cases.
- Validate auth flow behavior for:
  - Successful login + role landing redirect
  - Invalid login generic error response
  - 24-hour inactivity forced re-authentication

### Project Structure Notes

- Use repo-relative `src/*` paths and existing alias `@/*`.
- Do not introduce changes in unrelated story files.

### References

- Epic source: `_bmad-output/planning-artifacts/epics.md`
- Auth UI files: `src/app/(auth)/login/page.tsx`, `src/components/features/auth/LoginForm.tsx`
- Auth middleware files: `src/middleware.ts`, `src/lib/supabase/middleware.ts`
- Supabase clients: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Security baseline: `grid-electric-docs/01-TECHNICAL-PRD.md` (authentication/session timeout)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story file bootstrapped from epics because `1-2-account-management.md` was missing in implementation artifacts.
- Red phase validation executed for role landing and session timeout tests before implementation.
- Full regression suite executed after implementation (`npx vitest run`, `npx tsc --noEmit`).

### Implementation Plan

- Implement role-based landing resolver and wire login success redirects to profile role.
- Harden login error messaging to avoid exposing Supabase auth internals.
- Enforce 24-hour inactivity in middleware with HTTP-only activity cookie and forced `/login` redirect.
- Add unit tests for all new pure auth/session utilities and ensure full suite stays green.

### Completion Notes List

- Implemented role-based post-login routing with reusable helper (`/admin/dashboard` for admin-class roles, `/tickets` for contractors).
- Login failures now show safe generic messages; inactive profiles are denied with controlled messaging.
- Added best-effort `profiles.last_login_at` updates on successful login.
- Implemented 24-hour inactivity expiration in middleware via `ges_last_activity_at` HTTP-only cookie.
- Added and passed new unit tests for role landing and inactivity timeout utilities.
- Fixed existing `statusTransitions` test harness imports so regression suite runs in Vitest.
- Validation results:
  - `npx vitest run` -> pass (3 files, 23 tests)
  - `npx tsc --noEmit` -> pass
  - `npx eslint <changed files>` -> pass

### File List

- `_bmad-output/implementation-artifacts/1-2-account-management.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/components/features/auth/LoginForm.tsx`
- `src/lib/auth/roleLanding.ts`
- `src/lib/auth/roleLanding.test.ts`
- `src/lib/auth/sessionTimeout.ts`
- `src/lib/auth/sessionTimeout.test.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/utils/statusTransitions.test.ts`
- `workers/sw.ts`

### Change Log

- 2026-02-12: Created story artifact from epic definition to unblock `dev-story` execution for Story 1.2.
- 2026-02-12: Implemented Story 1.2 login/session controls, added tests, and set status to `review`.
