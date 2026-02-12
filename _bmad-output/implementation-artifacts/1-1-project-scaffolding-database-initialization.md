# Story 1.1: Project Scaffolding & Database Initialization

Status: review

## Story

As a Developer,
I want to initialize the project repository and core Supabase schema,
so that I have a stable foundation for role-based development.

## Acceptance Criteria

1. Next.js 16.1 App Router project is created. [x]
2. Supabase project is connected with a `profiles` table. [x]
3. The `profiles` table contains `id` (UUID), `role` (enum: super_admin, admin, contractor), and `is_active` (boolean). [x]
4. Row Level Security (RLS) is enabled on all tables. [x]
5. Project structure follows established patterns (src/app, src/lib, etc.). [x]

## Tasks / Subtasks

- [x] Initialize Next.js project with Tailwind v4 and Shadcn/UI (AC: 1, 5)
- [x] Configure Supabase client and SSR Auth package (AC: 2)
- [x] Create `profiles` table migration with role enum (AC: 3)
- [x] Implement initial RLS policies for `profiles` (AC: 4)
- [x] Setup folder structure based on Architecture (src/components/features, src/lib/sync, etc.) (AC: 5)

## Dev Notes

- **Tech Stack:** Next.js 16.1.6 (App Router), Supabase (@supabase/ssr), Tailwind CSS v4, Shadcn/UI.
- **Project Structure:** Migrated core directories (`app`, `components`, `lib`, `types`, `stores`) to `src/` for better organization and path alias consistency.
- **Database Schema:** Consolidated initial enums and `profiles` table into a single idempotent migration script `sql/20260211_01_init_profiles.sql`.
- **Authentication:** Implemented Supabase SSR middleware in `src/middleware.ts` and `src/lib/supabase/middleware.ts` to handle session refreshing.
- **Path Aliases:** Updated `tsconfig.json` to map `@/*` to `./src/*`.

## Dev Agent Record

### Agent Model Used

Antigravity v1.0

### Debug Log References

- Encountered issues with relative paths after `src/` migration; resolved by updating `tsconfig.json` and middleware imports.
- Consolidated disparate SQL files into a single, clean initialization script for Story 1.1.

### Completion Notes List

- Successfully scaffolded the project structure following the BMad Architecture.
- Integrated Supabase SSR for robust authentication handling.
- Defined the core `user_role` enum and `profiles` table with RLS.
- Created `.env.local.example` for environment parity.

### File List

- `src/middleware.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/types/database.ts`
- `sql/20260211_01_init_profiles.sql`
- `tsconfig.json`
- `.env.local.example`
