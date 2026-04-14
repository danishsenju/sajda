-- ROLLBACK:
--   DROP TABLE IF EXISTS public.announcements CASCADE;
--   DROP FUNCTION IF EXISTS increment_announcements_this_month() CASCADE;

-- ---------------------------------------------------------------------------
-- announcements — mosque broadcasts to their jemaah
--
-- Surau tier cap: 5 per calendar month (tracked on masjid.announcements_this_month).
-- A monthly Edge Function cron resets announcements_this_month to 0.
-- ---------------------------------------------------------------------------

CREATE TABLE public.announcements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id     UUID NOT NULL REFERENCES public.masjid (id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES auth.users (id),

  title         TEXT NOT NULL,
  body          TEXT NOT NULL,

  -- Optional: pin to top of feed
  is_pinned     BOOLEAN NOT NULL DEFAULT false,

  -- Scheduled publishing (null = published immediately)
  published_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Soft delete
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_announcements_mosque_id    ON public.announcements (mosque_id)   WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_published_at ON public.announcements (published_at DESC) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- Trigger: increment masjid.announcements_this_month on insert
-- Application layer must check this counter BEFORE inserting for Surau tier.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_announcements_this_month()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.masjid
  SET announcements_this_month = announcements_this_month + 1
  WHERE id = NEW.mosque_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_announcement_counter
  AFTER INSERT ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION increment_announcements_this_month();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Jemaah can read announcements of mosques they follow (published, not deleted)
CREATE POLICY "Jemaah reads followed mosque announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND published_at <= now()
    AND mosque_id IN (
      SELECT mosque_id FROM public.jemaah_follows WHERE user_id = auth.uid()
    )
  );

-- Mosque admins can see all announcements for their mosque (incl. scheduled / deleted)
CREATE POLICY "Mosque admin full access to announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (
    mosque_id IN (
      SELECT mosque_id FROM public.mosque_admins WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    mosque_id IN (
      SELECT mosque_id FROM public.mosque_admins WHERE user_id = auth.uid()
    )
  );
