-- Auth and role migration for onboarding decommission + contractor terminology rollout
-- 1) Add first-login password reset flag
-- 2) Migrate roles to SUPER_ADMIN / ADMIN / CONTRACTOR
-- 3) Enforce single SUPER_ADMIN profile
-- 4) Add contractor compatibility aliases

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles
SET role = 'ADMIN'::user_role
WHERE role::text IN ('TEAM_LEAD', 'READ_ONLY');

DO $$
DECLARE
  role_column RECORD;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'user_role_new'
  ) THEN
    DROP TYPE user_role_new;
  END IF;

  CREATE TYPE user_role_new AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CONTRACTOR');

  FOR role_column IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      a.attname AS column_name
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_type t ON t.oid = a.atttypid
    WHERE t.typname = 'user_role'
      AND a.attnum > 0
      AND NOT a.attisdropped
      AND c.relkind IN ('r', 'p')
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER TABLE %I.%I ALTER COLUMN %I DROP DEFAULT',
        role_column.schema_name,
        role_column.table_name,
        role_column.column_name
      );
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;

    EXECUTE format(
      'ALTER TABLE %I.%I ALTER COLUMN %I TYPE user_role_new USING (
        CASE
          WHEN %I::text IN (''TEAM_LEAD'', ''READ_ONLY'') THEN ''ADMIN''::user_role_new
          ELSE %I::text::user_role_new
        END
      )',
      role_column.schema_name,
      role_column.table_name,
      role_column.column_name,
      role_column.column_name,
      role_column.column_name
    );
  END LOOP;
END $$;

DROP TYPE IF EXISTS user_role;
ALTER TYPE user_role_new RENAME TO user_role;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'CONTRACTOR'::user_role;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'SUPER_ADMIN'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role TEXT;
BEGIN
  SELECT p.role::text
  INTO current_role
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;

  RETURN current_role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon;

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND (
      public.current_user_role() = 'SUPER_ADMIN'
      OR role::text = public.current_user_role()
    )
  );

DROP POLICY IF EXISTS profiles_insert_admin ON public.profiles;
CREATE POLICY profiles_insert_admin ON public.profiles
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    AND (
      role <> 'SUPER_ADMIN'
      OR public.is_super_admin()
    )
  );

DO $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM public.profiles
    WHERE role = 'SUPER_ADMIN'
  ) > 1 THEN
    RAISE EXCEPTION 'Cannot enforce single SUPER_ADMIN index: more than one SUPER_ADMIN profile already exists.';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_single_super_admin
  ON public.profiles (role)
  WHERE role = 'SUPER_ADMIN';

CREATE OR REPLACE VIEW public.contractors AS
SELECT *
FROM public.contractors;

CREATE OR REPLACE VIEW public.contractor_rates AS
SELECT *
FROM public.contractor_rates;

CREATE OR REPLACE VIEW public.contractor_banking AS
SELECT *
FROM public.contractor_banking;

CREATE OR REPLACE VIEW public.contractor_invoices AS
SELECT *
FROM public.contractor_invoices;

CREATE OR REPLACE FUNCTION public.get_contractor_id(profile_uuid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id
  FROM public.contractors s
  WHERE s.profile_id = profile_uuid
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_contractor_profile_id(contractor_uuid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.profile_id
  FROM public.contractors s
  WHERE s.id = contractor_uuid
  LIMIT 1;
$$;
