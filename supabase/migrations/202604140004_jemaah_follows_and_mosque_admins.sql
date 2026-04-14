-- ROLLBACK:
--   DROP POLICY IF EXISTS "Mosque admin can update their mosque" ON public.masjid;
--   DROP POLICY IF EXISTS "Mosque admin can read follower profiles" ON public.jemaah_profiles;
--   DROP TABLE IF EXISTS public.jemaah_follows CASCADE;
--   DROP TABLE IF EXISTS public.mosque_admins CASCADE;
--   DROP FUNCTION IF EXISTS increment_jemaah_count() CASCADE;
--   DROP FUNCTION IF EXISTS decrement_jemaah_count() CASCADE;

-- ---------------------------------------------------------------------------
-- mosque_admins — who can manage a mosque and at what role level
-- Created before jemaah_follows because masjid RLS references this table.
-- ---------------------------------------------------------------------------

CREATE TABLE public.mosque_admins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id   UUID NOT NULL REFERENCES public.masjid (id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role        public.admin_role NOT NULL DEFAULT 'admin',
  invited_by  UUID REFERENCES auth.users (id),

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (mosque_id, user_id)
);

CREATE INDEX idx_mosque_admins_mosque_id ON public.mosque_admins (mosque_id);
CREATE INDEX idx_mosque_admins_user_id   ON public.mosque_admins (user_id);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.mosque_admins
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS for mosque_admins
ALTER TABLE public.mosque_admins ENABLE ROW LEVEL SECURITY;

-- Any admin can see who else administers their mosque
CREATE POLICY "Mosque admin can view co-admins"
  ON public.mosque_admins FOR SELECT
  TO authenticated
  USING (
    mosque_id IN (
      SELECT mosque_id FROM public.mosque_admins WHERE user_id = auth.uid()
    )
  );

-- Only owners can add or update admin entries
CREATE POLICY "Mosque owner can manage admins"
  ON public.mosque_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    mosque_id IN (
      SELECT mosque_id FROM public.mosque_admins
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Mosque owner can update admin roles"
  ON public.mosque_admins FOR UPDATE
  TO authenticated
  USING (
    mosque_id IN (
      SELECT mosque_id FROM public.mosque_admins
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Mosque owner can remove admins"
  ON public.mosque_admins FOR DELETE
  TO authenticated
  USING (
    mosque_id IN (
      SELECT mosque_id FROM public.mosque_admins
      WHERE user_id = auth.uid() AND role = 'owner'
    )
    -- Owners cannot remove themselves (prevents lockout)
    AND user_id <> auth.uid()
  );

-- ---------------------------------------------------------------------------
-- jemaah_follows — junction: jemaah ↔ masjid (many-to-many)
-- Jemaah can follow unlimited mosques. One can be marked primary.
-- ---------------------------------------------------------------------------

CREATE TABLE public.jemaah_follows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  mosque_id   UUID NOT NULL REFERENCES public.masjid (id) ON DELETE CASCADE,

  -- Jemaah's "home mosque" — only one per user (enforced by partial unique index)
  is_primary  BOOLEAN NOT NULL DEFAULT false,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, mosque_id)
);

-- Only one primary mosque per user
CREATE UNIQUE INDEX idx_jemaah_follows_one_primary
  ON public.jemaah_follows (user_id)
  WHERE is_primary = true;

CREATE INDEX idx_jemaah_follows_user_id   ON public.jemaah_follows (user_id);
CREATE INDEX idx_jemaah_follows_mosque_id ON public.jemaah_follows (mosque_id);

-- ---------------------------------------------------------------------------
-- Trigger: maintain masjid.jemaah_count denormalised counter
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_jemaah_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.masjid
  SET jemaah_count = jemaah_count + 1
  WHERE id = NEW.mosque_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_jemaah_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.masjid
  SET jemaah_count = GREATEST(jemaah_count - 1, 0)
  WHERE id = OLD.mosque_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_follow_increment
  AFTER INSERT ON public.jemaah_follows
  FOR EACH ROW EXECUTE FUNCTION increment_jemaah_count();

CREATE TRIGGER trg_follow_decrement
  AFTER DELETE ON public.jemaah_follows
  FOR EACH ROW EXECUTE FUNCTION decrement_jemaah_count();

-- RLS for jemaah_follows
ALTER TABLE public.jemaah_follows ENABLE ROW LEVEL SECURITY;

-- Users manage their own follows
CREATE POLICY "User can read own follows"
  ON public.jemaah_follows FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "User can follow a mosque"
  ON public.jemaah_follows FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update own follow (e.g. set primary)"
  ON public.jemaah_follows FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "User can unfollow"
  ON public.jemaah_follows FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Mosque admins can see who follows their mosque (for analytics / janaiz list)
CREATE POLICY "Mosque admin can read follower list"
  ON public.jemaah_follows FOR SELECT
  TO authenticated
  USING (
    mosque_id IN (
      SELECT mosque_id FROM public.mosque_admins WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Deferred: masjid UPDATE policy (requires mosque_admins to exist first)
-- ---------------------------------------------------------------------------
CREATE POLICY "Mosque admin can update their mosque"
  ON public.masjid FOR UPDATE
  USING (
    id IN (
      SELECT mosque_id FROM public.mosque_admins
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ---------------------------------------------------------------------------
-- Deferred: jemaah_profiles admin-read policy (requires both tables to exist)
-- ---------------------------------------------------------------------------
CREATE POLICY "Mosque admin can read follower profiles"
  ON public.jemaah_profiles FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT jf.user_id
      FROM public.jemaah_follows jf
      WHERE jf.mosque_id IN (
        SELECT mosque_id FROM public.mosque_admins WHERE user_id = auth.uid()
      )
    )
  );
