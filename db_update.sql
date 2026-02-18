-- 20260218_10_storm_event_utility_template_preload.sql
-- Enforce: storm_event.utility_client -> preloaded ticket template (no matching)
-- Enforce: tickets.template_key always matches storm_event.ticket_template_key
-- Add: storm_events.config_snapshot for environment freeze

BEGIN;

-- ---------------------------------------------------------------------
-- 1) Ticket Templates master table (one default per utility_client)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ticket_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Must match storm_events.utility_client exactly (you already enforce supported values elsewhere)
  utility_client text NOT NULL,

  -- The key that gets copied into storm_events.ticket_template_key and tickets.template_key
  template_key text NOT NULL,

  name text NOT NULL,
  description text,

  -- JSON definition of fields (use now or later)
  -- Example:
  -- [
  --   {"key":"incident_number","label":"Incident Number","type":"text","required":true},
  --   {"key":"feeder","label":"Feeder","type":"text","required":false}
  -- ]
  field_definitions jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- One “active” template per utility; the one storms will preload
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT true,

  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT ticket_templates_unique_utility_key UNIQUE (utility_client, template_key)
);

-- Ensure only one default per utility_client
-- (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS ux_ticket_templates_one_default_per_utility
  ON public.ticket_templates (utility_client)
  WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_ticket_templates_utility_client
  ON public.ticket_templates (utility_client);

-- ---------------------------------------------------------------------
-- 2) Add storm_event columns: ticket_template_key + config_snapshot
-- ---------------------------------------------------------------------
ALTER TABLE public.storm_events
  ADD COLUMN IF NOT EXISTS ticket_template_key text,
  ADD COLUMN IF NOT EXISTS config_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_storm_events_ticket_template_key
  ON public.storm_events (ticket_template_key);

-- ---------------------------------------------------------------------
-- 3) Backfill / seed some defaults (edit these later as needed)
-- ---------------------------------------------------------------------
-- Seed minimal template rows (safe upsert-ish approach).
-- You can expand field_definitions later without migrations (just UPDATE jsonb).

INSERT INTO public.ticket_templates (utility_client, template_key, name, description, field_definitions, is_active, is_default)
VALUES
  ('ENTERGY',     'entergy_default_v1',     'Entergy Default v1',     'Default Entergy ticket fields',     '[]'::jsonb, true, true),
  ('DUKE',        'duke_default_v1',        'Duke Default v1',        'Default Duke ticket fields',        '[]'::jsonb, true, true),
  ('CENTERPOINT', 'centerpoint_default_v1', 'CenterPoint Default v1', 'Default CenterPoint ticket fields', '[]'::jsonb, true, true),
  ('ONCOR',       'oncor_default_v1',       'Oncor Default v1',       'Default Oncor ticket fields',       '[]'::jsonb, true, true),
  ('FPL',         'fpl_default_v1',         'FPL Default v1',         'Default FPL ticket fields',         '[]'::jsonb, true, true),
  ('TECO',        'teco_default_v1',        'TECO Default v1',        'Default TECO ticket fields',        '[]'::jsonb, true, true)
ON CONFLICT (utility_client, template_key) DO NOTHING;

-- If you also store utility_client as 'Entergy' / 'Duke Energy' variants,
-- you can add additional rows here OR normalize utility_client in storm_events.

-- ---------------------------------------------------------------------
-- 4) Functions + triggers
--    - On storm event insert/update: preload ticket_template_key from ticket_templates
--    - On ticket insert/update: preload template_key from storm_events.ticket_template_key
--    - Enforce strict match: ticket.template_key == storm_event.ticket_template_key
-- ---------------------------------------------------------------------

-- 4a) Preload storm event template key based on utility_client
CREATE OR REPLACE FUNCTION public.set_storm_event_ticket_template_key()
RETURNS trigger AS $$
DECLARE
  default_key text;
BEGIN
  -- If already set explicitly, respect it (but validate it exists + is default/active)
  IF NEW.ticket_template_key IS NOT NULL THEN
    PERFORM 1
    FROM public.ticket_templates tt
    WHERE tt.utility_client = NEW.utility_client
      AND tt.template_key = NEW.ticket_template_key
      AND tt.is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid ticket_template_key % for utility_client %', NEW.ticket_template_key, NEW.utility_client;
    END IF;

  ELSE
    SELECT tt.template_key INTO default_key
    FROM public.ticket_templates tt
    WHERE tt.utility_client = NEW.utility_client
      AND tt.is_default = true
      AND tt.is_active = true
    LIMIT 1;

    IF default_key IS NULL THEN
      RAISE EXCEPTION 'No default ticket template configured for utility_client %', NEW.utility_client;
    END IF;

    NEW.ticket_template_key := default_key;
  END IF;

  -- Freeze key settings in config_snapshot (safe merge)
  NEW.config_snapshot :=
    COALESCE(NEW.config_snapshot, '{}'::jsonb)
    || jsonb_build_object(
      'utility_client', NEW.utility_client,
      'ticket_template_key', NEW.ticket_template_key
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_storm_event_ticket_template_key ON public.storm_events;
CREATE TRIGGER tr_set_storm_event_ticket_template_key
BEFORE INSERT OR UPDATE OF utility_client, ticket_template_key
ON public.storm_events
FOR EACH ROW
EXECUTE FUNCTION public.set_storm_event_ticket_template_key();


-- 4b) Inherit ticket.template_key from storm_event.ticket_template_key
CREATE OR REPLACE FUNCTION public.inherit_ticket_template_key_from_storm_event()
RETURNS trigger AS $$
DECLARE
  storm_key text;
BEGIN
  SELECT se.ticket_template_key INTO storm_key
  FROM public.storm_events se
  WHERE se.id = NEW.storm_event_id;

  IF storm_key IS NULL THEN
    RAISE EXCEPTION 'storm_event_id % does not exist or has no ticket_template_key', NEW.storm_event_id;
  END IF;

  IF NEW.template_key IS NULL THEN
    NEW.template_key := storm_key;
  END IF;

  -- Strict enforcement: must match storm event
  IF NEW.template_key <> storm_key THEN
    RAISE EXCEPTION 'tickets.template_key (%) must match storm_events.ticket_template_key (%)', NEW.template_key, storm_key;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_inherit_ticket_template_key ON public.tickets;
CREATE TRIGGER tr_inherit_ticket_template_key
BEFORE INSERT OR UPDATE OF storm_event_id, template_key
ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.inherit_ticket_template_key_from_storm_event();


-- ---------------------------------------------------------------------
-- 5) Backfill existing rows (storms + tickets)
-- ---------------------------------------------------------------------

-- Backfill storm_events.ticket_template_key for existing events
UPDATE public.storm_events se
SET ticket_template_key = tt.template_key,
    config_snapshot = COALESCE(se.config_snapshot, '{}'::jsonb)
      || jsonb_build_object('utility_client', se.utility_client, 'ticket_template_key', tt.template_key)
FROM public.ticket_templates tt
WHERE se.ticket_template_key IS NULL
  AND tt.utility_client = se.utility_client
  AND tt.is_default = true
  AND tt.is_active = true;

-- Backfill tickets.template_key from storm_events.ticket_template_key
UPDATE public.tickets t
SET template_key = se.ticket_template_key
FROM public.storm_events se
WHERE t.template_key IS NULL
  AND t.storm_event_id = se.id
  AND se.ticket_template_key IS NOT NULL;

-- ---------------------------------------------------------------------
-- 6) Optional: Add NOT NULL constraint on storm_events.ticket_template_key
--     (only if all your storm_events.utility_client values have defaults)
-- ---------------------------------------------------------------------
-- If you have historical storms with weird utility_client strings, this could fail.
-- After you normalize those utilities, you can enforce NOT NULL safely.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.storm_events WHERE ticket_template_key IS NULL) THEN
    -- leave nullable for now
    NULL;
  ELSE
    ALTER TABLE public.storm_events
      ALTER COLUMN ticket_template_key SET NOT NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 7) RLS for ticket_templates (Admins read, Super Admin writes)
-- ---------------------------------------------------------------------
ALTER TABLE public.ticket_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ticket_templates_select_admin ON public.ticket_templates;
CREATE POLICY ticket_templates_select_admin ON public.ticket_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS ticket_templates_write_super_admin ON public.ticket_templates;
CREATE POLICY ticket_templates_write_super_admin ON public.ticket_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN'
    )
  );

COMMIT;