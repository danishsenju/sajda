-- Fix 1: Infinite recursion in mosque_admins RLS policies
-- Fix 2: doa_wishes SELECT policy — open to all authenticated users (not just mosque followers)
--
-- Root cause of recursion: all 4 mosque_admins policies query mosque_admins from within
-- mosque_admins policies. When posting doa with RETURNING *, Postgres evaluates SELECT
-- policies on doa_wishes which reference mosque_admins, triggering the loop.
--
-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.is_mosque_admin(uuid) CASCADE;
--   DROP FUNCTION IF EXISTS public.is_mosque_owner(uuid) CASCADE;
--   (then manually recreate original policies)

-- ---------------------------------------------------------------------------
-- Part A: mosque_admins — fix infinite recursion
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER runs as postgres (function owner), bypassing RLS entirely
CREATE OR REPLACE FUNCTION public.is_mosque_admin(mosque_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mosque_admins
    WHERE mosque_id = mosque_uuid
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_mosque_owner(mosque_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mosque_admins
    WHERE mosque_id = mosque_uuid
      AND user_id = auth.uid()
      AND role = 'owner'
  );
$$;

-- Drop all recursive policies
DROP POLICY IF EXISTS "Mosque admin can view co-admins"      ON public.mosque_admins;
DROP POLICY IF EXISTS "Mosque owner can manage admins"       ON public.mosque_admins;
DROP POLICY IF EXISTS "Mosque owner can update admin roles"  ON public.mosque_admins;
DROP POLICY IF EXISTS "Mosque owner can remove admins"       ON public.mosque_admins;
-- Drop any leftover from previous fix attempts
DROP POLICY IF EXISTS "mosque_admins_select"                 ON public.mosque_admins;

-- Recreate without self-referencing subqueries
CREATE POLICY "Mosque admin can view co-admins"
  ON public.mosque_admins FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()         -- own row always visible
    OR is_mosque_admin(mosque_id) -- co-admins via SECURITY DEFINER (no recursion)
  );

CREATE POLICY "Mosque owner can manage admins"
  ON public.mosque_admins FOR INSERT
  TO authenticated
  WITH CHECK (is_mosque_owner(mosque_id));

CREATE POLICY "Mosque owner can update admin roles"
  ON public.mosque_admins FOR UPDATE
  TO authenticated
  USING (is_mosque_owner(mosque_id));

CREATE POLICY "Mosque owner can remove admins"
  ON public.mosque_admins FOR DELETE
  TO authenticated
  USING (
    is_mosque_owner(mosque_id)
    AND user_id <> auth.uid() -- owners cannot remove themselves (lockout prevention)
  );

-- ---------------------------------------------------------------------------
-- Part B: doa_wishes — open read to all authenticated users
-- ---------------------------------------------------------------------------

-- Remove the old policy that restricted reads to mosque followers only
DROP POLICY IF EXISTS "Jemaah reads followed mosque doa" ON public.doa_wishes;

-- All authenticated users can read any non-flagged, non-deleted doa
CREATE POLICY "Authenticated can read doa wishes"
  ON public.doa_wishes FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL AND is_flagged = false);
