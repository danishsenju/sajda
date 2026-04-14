-- ROLLBACK: DROP TABLE IF EXISTS public.jemaah_profiles CASCADE;

-- ---------------------------------------------------------------------------
-- jemaah_profiles — one row per auth.users row; created on first sign-in.
-- Personal data handled per PDPA Malaysia: location = zone code only, never coords.
-- ---------------------------------------------------------------------------

CREATE TABLE public.jemaah_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,

  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,

  -- JAKIM zone code for prayer time personalisation (e.g. WLY01, SGR01)
  -- Stored as zone only — never exact coordinates (PDPA compliance)
  zone_code     TEXT,

  -- Whether this profile is visible to other jemaah
  is_public     BOOLEAN NOT NULL DEFAULT false,

  -- Soft delete (PDPA right-to-erasure: zero out PII, set deleted_at)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_jemaah_profiles_user_id ON public.jemaah_profiles (user_id);

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.jemaah_profiles
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.jemaah_profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read public profiles
CREATE POLICY "Authenticated can read public profiles"
  ON public.jemaah_profiles FOR SELECT
  TO authenticated
  USING (is_public = true AND deleted_at IS NULL);

-- Users can always read their own profile (even if private)
CREATE POLICY "User can read own profile"
  ON public.jemaah_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own profile (once, enforced by UNIQUE on user_id)
CREATE POLICY "User can create own profile"
  ON public.jemaah_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "User can update own profile"
  ON public.jemaah_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- NOTE: "Mosque admin can read follower profiles" policy is deferred to
-- migration 202604140004 where both jemaah_follows and mosque_admins exist.
