-- ROLLBACK: DROP TABLE IF EXISTS public.masjid CASCADE;

-- ---------------------------------------------------------------------------
-- masjid — mosque profiles, subscription state, theme config
-- Tenant root: every mosque-scoped table references this via mosque_id.
-- ---------------------------------------------------------------------------

CREATE TABLE public.masjid (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name                      TEXT NOT NULL,
  slug                      TEXT NOT NULL UNIQUE,          -- URL-safe identifier, e.g. "masjid-al-bukhary-kl"
  address                   TEXT,
  zone_code                 TEXT,                          -- JAKIM zone (e.g. WLY01). Never exact coordinates (PDPA).
  phone                     TEXT,
  email                     TEXT,
  website                   TEXT,

  -- Subscription
  tier                      public.mosque_tier NOT NULL DEFAULT 'surau',
  status                    public.mosque_status NOT NULL DEFAULT 'trial',
  trial_ends_at             TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '14 days'),
  subscription_ref          TEXT,                          -- Billplz subscription / recurring ID

  -- Theme (only used on Kariah+ tier)
  theme                     JSONB NOT NULL DEFAULT '{
    "primary": "#1a6b45",
    "accent":  "#d4a017",
    "logo_url": null
  }'::jsonb,

  -- Feature flags (override per-mosque if needed, falls back to tier defaults)
  features                  JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Denormalised counters (maintained by triggers / Edge Functions)
  jemaah_count              INT NOT NULL DEFAULT 0,
  announcements_this_month  INT NOT NULL DEFAULT 0,        -- reset monthly; cap 5 for Surau tier

  -- Soft delete
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at                TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_masjid_slug       ON public.masjid (slug)       WHERE deleted_at IS NULL;
CREATE INDEX idx_masjid_zone_code  ON public.masjid (zone_code)  WHERE deleted_at IS NULL;
CREATE INDEX idx_masjid_status     ON public.masjid (status)     WHERE deleted_at IS NULL;

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.masjid
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.masjid ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read non-deleted mosques — needed for landing page / search
CREATE POLICY "Public can read active mosques"
  ON public.masjid FOR SELECT
  USING (deleted_at IS NULL);

-- NOTE: The UPDATE policy referencing mosque_admins is intentionally deferred.
-- It is added in migration 202604140004 after mosque_admins is created.

-- Only service role (Edge Functions / backend) can insert or delete
-- No direct INSERT policy = only service_role key can create mosques (via onboarding function)
