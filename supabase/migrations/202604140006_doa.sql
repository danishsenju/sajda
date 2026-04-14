-- ROLLBACK:
--   DROP TABLE IF EXISTS public.doa_aamiin CASCADE;
--   DROP TABLE IF EXISTS public.doa_wishes CASCADE;
--   DROP FUNCTION IF EXISTS sync_aamiin_count() CASCADE;

-- ---------------------------------------------------------------------------
-- doa_wishes — community doa requests
--
-- mosque_id nullable: NULL = global feed, set = mosque-scoped.
-- is_anonymous: hides display_name in UI but user_id stored for moderation.
-- is_flagged: auto-set by Edge Function if phone/URL/profanity detected.
-- ---------------------------------------------------------------------------

CREATE TABLE public.doa_wishes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

  -- NULL = global doa feed. Set = scoped to that mosque's feed.
  mosque_id     UUID REFERENCES public.masjid (id) ON DELETE CASCADE,

  doa_text      TEXT NOT NULL CHECK (char_length(doa_text) BETWEEN 10 AND 500),

  is_anonymous  BOOLEAN NOT NULL DEFAULT false,

  -- Content moderation: set by Edge Function (URL / phone / profanity detection)
  is_flagged    BOOLEAN NOT NULL DEFAULT false,
  flag_reason   TEXT,

  -- Denormalised aamiin counter — maintained by trigger on doa_aamiin
  aamiin_count  INT NOT NULL DEFAULT 0 CHECK (aamiin_count >= 0),

  -- Soft delete
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_doa_wishes_user_id    ON public.doa_wishes (user_id)    WHERE deleted_at IS NULL;
CREATE INDEX idx_doa_wishes_mosque_id  ON public.doa_wishes (mosque_id)  WHERE deleted_at IS NULL;
CREATE INDEX idx_doa_wishes_created_at ON public.doa_wishes (created_at DESC) WHERE deleted_at IS NULL;
-- Partial index for global feed queries
CREATE INDEX idx_doa_wishes_global     ON public.doa_wishes (created_at DESC)
  WHERE mosque_id IS NULL AND deleted_at IS NULL AND is_flagged = false;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.doa_wishes
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- doa_aamiin — one aamiin per user per doa (like a reaction, not a counter)
-- ---------------------------------------------------------------------------

CREATE TABLE public.doa_aamiin (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doa_wish_id  UUID NOT NULL REFERENCES public.doa_wishes (id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (doa_wish_id, user_id)
);

CREATE INDEX idx_doa_aamiin_doa_wish_id ON public.doa_aamiin (doa_wish_id);
CREATE INDEX idx_doa_aamiin_user_id     ON public.doa_aamiin (user_id);

-- ---------------------------------------------------------------------------
-- Trigger: keep doa_wishes.aamiin_count in sync
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION sync_aamiin_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.doa_wishes
    SET aamiin_count = aamiin_count + 1
    WHERE id = NEW.doa_wish_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.doa_wishes
    SET aamiin_count = GREATEST(aamiin_count - 1, 0)
    WHERE id = OLD.doa_wish_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER trg_aamiin_count_increment
  AFTER INSERT ON public.doa_aamiin
  FOR EACH ROW EXECUTE FUNCTION sync_aamiin_count();

CREATE TRIGGER trg_aamiin_count_decrement
  AFTER DELETE ON public.doa_aamiin
  FOR EACH ROW EXECUTE FUNCTION sync_aamiin_count();

-- ---------------------------------------------------------------------------
-- RLS — doa_wishes
-- ---------------------------------------------------------------------------
ALTER TABLE public.doa_wishes ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read non-flagged, non-deleted wishes from mosques they follow
CREATE POLICY "Jemaah reads followed mosque doa"
  ON public.doa_wishes FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND is_flagged = false
    AND (
      -- Mosque-scoped: user follows that mosque
      mosque_id IN (
        SELECT mosque_id FROM public.jemaah_follows WHERE user_id = auth.uid()
      )
      -- Global feed (no mosque)
      OR mosque_id IS NULL
    )
  );

-- Users can always read their own doa (flagged or not)
CREATE POLICY "User can read own doa wishes"
  ON public.doa_wishes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can submit doa
CREATE POLICY "Authenticated can create doa wish"
  ON public.doa_wishes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update or soft-delete their own doa
CREATE POLICY "User can update own doa wish"
  ON public.doa_wishes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Mosque admins can read flagged doa in their mosque (for moderation)
CREATE POLICY "Mosque admin can read flagged doa"
  ON public.doa_wishes FOR SELECT
  TO authenticated
  USING (
    mosque_id IN (
      SELECT mosque_id FROM public.mosque_admins WHERE user_id = auth.uid()
    )
  );

-- Mosque admins can update flag status (approve / reject) in their mosque
CREATE POLICY "Mosque admin can moderate doa"
  ON public.doa_wishes FOR UPDATE
  TO authenticated
  USING (
    mosque_id IN (
      SELECT mosque_id FROM public.mosque_admins WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — doa_aamiin
-- ---------------------------------------------------------------------------
ALTER TABLE public.doa_aamiin ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can see who aamiin'd (used to check current user's state)
CREATE POLICY "Authenticated can read aamiin"
  ON public.doa_aamiin FOR SELECT
  TO authenticated
  USING (true);

-- Users submit their own aamiin
CREATE POLICY "User can aamiin a doa"
  ON public.doa_aamiin FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can remove their own aamiin
CREATE POLICY "User can remove own aamiin"
  ON public.doa_aamiin FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
