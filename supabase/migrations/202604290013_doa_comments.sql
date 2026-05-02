-- ─── doa_comments ──────────────────────────────────────────────────────────
-- Threaded comments on doa wishes. Soft-deletable, anonymous-capable.
-- Content moderation: is_flagged set by Edge Function (profanity detection).

CREATE TABLE doa_comments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  doa_wish_id  UUID        NOT NULL REFERENCES doa_wishes(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id),
  comment_text TEXT        NOT NULL CHECK (char_length(comment_text) BETWEEN 1 AND 200),
  is_anonymous BOOLEAN     NOT NULL DEFAULT false,
  author_name  TEXT,
  is_flagged   BOOLEAN     NOT NULL DEFAULT false,
  flag_reason  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);

ALTER TABLE doa_comments ENABLE ROW LEVEL SECURITY;

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX doa_comments_wish_created_idx
  ON doa_comments (doa_wish_id, created_at)
  WHERE deleted_at IS NULL;

CREATE INDEX doa_comments_user_idx
  ON doa_comments (user_id);

-- ── RLS Policies ─────────────────────────────────────────────────────────────

-- Authenticated users can read non-deleted comments
-- (users always see their own even if flagged)
CREATE POLICY "Authenticated can read comments"
  ON doa_comments FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (NOT is_flagged OR user_id = auth.uid())
  );

-- Users can post comments
CREATE POLICY "Users can post comments"
  ON doa_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can soft-delete their own comments (set deleted_at)
CREATE POLICY "Users can delete own comments"
  ON doa_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
