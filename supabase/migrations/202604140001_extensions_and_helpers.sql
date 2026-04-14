-- ROLLBACK: DROP EXTENSION IF EXISTS moddatetime; DROP FUNCTION IF EXISTS set_updated_at();

-- Enable moddatetime for automatic updated_at maintenance
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- Shared trigger function: keeps updated_at current on every row update.
-- Usage: EXECUTE FUNCTION extensions.moddatetime(updated_at)
-- ---------------------------------------------------------------------------

-- Enum types used across tables
CREATE TYPE public.mosque_tier   AS ENUM ('surau', 'kariah', 'komuniti');
CREATE TYPE public.mosque_status AS ENUM ('trial', 'active', 'suspended', 'cancelled');
CREATE TYPE public.admin_role    AS ENUM ('owner', 'admin', 'moderator');
