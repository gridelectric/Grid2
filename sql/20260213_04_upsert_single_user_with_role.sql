-- Upsert a single user profile with explicit role and contractor ID metadata.
-- Run in Supabase SQL editor.
--
-- Spreadsheet header model:
-- first_name,last_name,email,role,contractor_id
--
-- Example:
-- David,McCarty,dmccarty@gridelectriccorp.com,SUPER_ADMIN,DM1

DO $$
DECLARE
  v_first_name TEXT := 'David';
  v_last_name TEXT := 'McCarty';
  v_email TEXT := 'dmccarty@gridelectriccorp.com';
  v_role TEXT := 'SUPER_ADMIN';
  v_contractor_id TEXT := 'DM1';
  v_username TEXT := split_part(lower(v_email), '@', 1);
  v_auth_user_id UUID;
BEGIN
  IF upper(v_contractor_id) !~ '^[A-Z]{2}[0-9]+$' THEN
    RAISE EXCEPTION 'Invalid contractor_id: %. Expected two letters followed by digits (e.g. DM1, DM01).', v_contractor_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role'
      AND e.enumlabel = upper(v_role)
  ) THEN
    RAISE EXCEPTION 'Role % is not present in enum user_role in this database.', v_role;
  END IF;

  SELECT u.id
  INTO v_auth_user_id
  FROM auth.users u
  WHERE lower(u.email) = lower(v_email)
  LIMIT 1;

  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth.users record exists for email %. Create auth user first.', v_email;
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'username', v_username,
    'first_name', v_first_name,
    'last_name', v_last_name,
    'contractor_code', upper(v_contractor_id)
  )
  WHERE id = v_auth_user_id;

  ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN NOT NULL DEFAULT false;

  UPDATE public.profiles
  SET
    first_name = v_first_name,
    last_name = v_last_name,
    role = upper(v_role)::user_role,
    is_active = true,
    is_email_verified = true,
    must_reset_password = true,
    updated_at = now()
  WHERE id = v_auth_user_id;
END $$;
