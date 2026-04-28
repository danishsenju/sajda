-- ROLLBACK:
--   ALTER TABLE public.doa_wishes DROP COLUMN IF EXISTS author_name;

-- Add author_name column that was referenced in code but missing from schema.
-- Stores the display name of the poster (null when is_anonymous = true).
ALTER TABLE public.doa_wishes
  ADD COLUMN IF NOT EXISTS author_name TEXT;
