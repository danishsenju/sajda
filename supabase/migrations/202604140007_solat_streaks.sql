-- ROLLBACK: DROP TABLE IF EXISTS public.solat_streaks CASCADE;

-- ---------------------------------------------------------------------------
-- solat_streaks — private per-user prayer streak tracker
--
-- Privacy rules (PDPA + brand):
--   - Never publicly visible
--   - Never aggregated without consent
--   - Streak reset logic: application-layer concern (runs at Fajr time per zone)
--
-- Schema stores state only. Reset logic lives in an Edge Function
-- that runs on a JAKIM-zone-aware schedule.
-- ---------------------------------------------------------------------------

CREATE TABLE public.solat_streaks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,

  current_streak  INT NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak  INT NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),

  -- Timestamp of the most recent solat log entry (any prayer)
  last_logged_at  TIMESTAMPTZ,

  -- When the streak was last reset to 0
  last_reset_at   TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
  -- No deleted_at: deleted with the user account (CASCADE from auth.users)
);

CREATE INDEX idx_solat_streaks_user_id ON public.solat_streaks (user_id);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.solat_streaks
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- solat_logs — immutable record of each individual prayer logged
-- Kept separate so streaks can be recomputed from source truth if needed.
-- ---------------------------------------------------------------------------

CREATE TABLE public.solat_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

  -- Which prayer (Subuh / Zohor / Asar / Maghrib / Isyak)
  prayer      TEXT NOT NULL CHECK (prayer IN ('subuh', 'zohor', 'asar', 'maghrib', 'isyak')),

  -- Was it prayed in jemaah (congregation)?
  is_jemaah   BOOLEAN NOT NULL DEFAULT false,

  -- Actual wall-clock time user logged it (not necessarily prayer time)
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Date in Asia/Kuala_Lumpur for keyset pagination and streak computation
  log_date    DATE NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Kuala_Lumpur')::DATE
);

CREATE INDEX idx_solat_logs_user_id   ON public.solat_logs (user_id, log_date DESC);
CREATE INDEX idx_solat_logs_log_date  ON public.solat_logs (log_date);

-- ---------------------------------------------------------------------------
-- RLS — solat_streaks (completely private)
-- ---------------------------------------------------------------------------
ALTER TABLE public.solat_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User sees only own streak"
  ON public.solat_streaks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "User can create own streak record"
  ON public.solat_streaks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update own streak"
  ON public.solat_streaks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS — solat_logs (completely private)
-- ---------------------------------------------------------------------------
ALTER TABLE public.solat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User sees only own solat logs"
  ON public.solat_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "User can log own solat"
  ON public.solat_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
