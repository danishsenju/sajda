-- ROLLBACK: DROP TABLE IF EXISTS public.pahala_checklist CASCADE;

-- ---------------------------------------------------------------------------
-- pahala_checklist — daily ibadah tracker, one row per user per checklist-day
--
-- "Day" resets at Fajr time (not midnight) per JAKIM zone — this is enforced
-- by the application layer when computing `checklist_date`. The DB stores
-- whatever date the app sends; it does NOT derive dates itself.
--
-- Core columns = the five daily prayers + Quran + Zikir.
-- `extra` JSONB holds any custom items mosques add (Komuniti tier feature).
-- ---------------------------------------------------------------------------

CREATE TABLE public.pahala_checklist (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

  -- Fajr-anchored date in Asia/Kuala_Lumpur, set by the client/Edge Function
  checklist_date   DATE NOT NULL,

  -- Five pillars of daily prayer
  subuh_done       BOOLEAN NOT NULL DEFAULT false,
  zohor_done       BOOLEAN NOT NULL DEFAULT false,
  asar_done        BOOLEAN NOT NULL DEFAULT false,
  maghrib_done     BOOLEAN NOT NULL DEFAULT false,
  isyak_done       BOOLEAN NOT NULL DEFAULT false,

  -- Additional daily ibadah
  quran_done       BOOLEAN NOT NULL DEFAULT false,
  zikir_done       BOOLEAN NOT NULL DEFAULT false,

  -- Komuniti-tier: mosque can push custom daily tasks (e.g. "Baca Yasin Jumaat")
  -- Schema: { "<task_id>": { "label": "...", "done": false } }
  extra            JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, checklist_date)
);

CREATE INDEX idx_pahala_checklist_user_date
  ON public.pahala_checklist (user_id, checklist_date DESC);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.pahala_checklist
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- RLS — completely private (PDPA)
-- ---------------------------------------------------------------------------
ALTER TABLE public.pahala_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can read own checklist"
  ON public.pahala_checklist FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "User can create own checklist entry"
  ON public.pahala_checklist FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPSERT pattern: ON CONFLICT (user_id, checklist_date) DO UPDATE
CREATE POLICY "User can update own checklist"
  ON public.pahala_checklist FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
