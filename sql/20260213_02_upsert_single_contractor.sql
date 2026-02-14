-- Upsert a single contractor profile + contractor record by email.
-- NOTE:
-- - This script expects an auth.users row to already exist for the email.
-- - Contractor ID format follows: <first initial><last initial><number...> (example: DM01).
-- - Role is explicit and should be one of your enum values.
-- - Since subcontractors.id is UUID in this schema, we map contractor_id to a deterministic UUID.

DO $$
DECLARE
  v_first_name TEXT := 'David';
  v_last_name TEXT := 'McCarty';
  v_email TEXT := 'dmccarty@gridelectriccorp.com';
  v_role TEXT := 'SUPER_ADMIN';
  v_contractor_id TEXT := 'DM01';
  v_username TEXT := split_part(lower(v_email), '@', 1);
  v_hash TEXT := md5('contractor:' || upper(v_contractor_id));
  v_contractor_uuid UUID := (
    substr(v_hash, 1, 8) || '-' ||
    substr(v_hash, 9, 4) || '-' ||
    substr(v_hash, 13, 4) || '-' ||
    substr(v_hash, 17, 4) || '-' ||
    substr(v_hash, 21, 12)
  )::UUID;
  v_auth_user_id UUID;
  v_has_contractor_code_column BOOLEAN;
BEGIN
  IF upper(v_contractor_id) !~ '^[A-Z]{2}[0-9]+$' THEN
    RAISE EXCEPTION 'Invalid contractor ID format: % (expected two letters followed by digits, e.g. DM01).', v_contractor_id;
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

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role'
      AND e.enumlabel = upper(v_role)
  ) THEN
    RAISE EXCEPTION 'Role % is not present in enum user_role in this database.', v_role;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    is_email_verified,
    must_reset_password
  ) VALUES (
    v_auth_user_id,
    lower(v_email),
    v_first_name,
    v_last_name,
    upper(v_role)::user_role,
    true,
    true,
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    role = upper(v_role)::user_role,
    is_active = true,
    is_email_verified = true,
    must_reset_password = true,
    updated_at = now();

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subcontractors'
      AND column_name = 'contractor_code'
  )
  INTO v_has_contractor_code_column;

  IF v_has_contractor_code_column THEN
    EXECUTE $sql$
      INSERT INTO public.subcontractors (
        id,
        profile_id,
        business_name,
        business_email,
        onboarding_status,
        is_eligible_for_assignment,
        eligibility_reason,
        contractor_code
      ) VALUES ($1, $2, $3, $4, 'APPROVED', true, null, $5)
      ON CONFLICT (profile_id) DO UPDATE
      SET
        business_name = excluded.business_name,
        business_email = excluded.business_email,
        onboarding_status = 'APPROVED',
        is_eligible_for_assignment = true,
        eligibility_reason = null,
        contractor_code = excluded.contractor_code,
        updated_at = now();
    $sql$
    USING
      v_contractor_uuid,
      v_auth_user_id,
      trim(v_first_name || ' ' || v_last_name),
      lower(v_email),
      upper(v_contractor_id);
  ELSE
    INSERT INTO public.subcontractors (
      id,
      profile_id,
      business_name,
      business_email,
      onboarding_status,
      is_eligible_for_assignment,
      eligibility_reason
    ) VALUES (
      v_contractor_uuid,
      v_auth_user_id,
      trim(v_first_name || ' ' || v_last_name),
      lower(v_email),
      'APPROVED',
      true,
      null
    )
    ON CONFLICT (profile_id) DO UPDATE
    SET
      business_name = excluded.business_name,
      business_email = excluded.business_email,
      onboarding_status = 'APPROVED',
      is_eligible_for_assignment = true,
      eligibility_reason = null,
      updated_at = now();
  END IF;
END $$;
