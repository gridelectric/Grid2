-- Add first-login reset flag if missing, then set it for a target user.
-- Run in Supabase SQL editor.

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles
SET
  must_reset_password = true,
  updated_at = NOW()
WHERE lower(email) = lower('dmccarty@gridelectriccorp.com');

COMMIT;
