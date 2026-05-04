CREATE TABLE public.quran_bookmarks (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL UNIQUE,
  page_number integer NOT NULL CHECK (page_number >= 1 AND page_number <= 604),
  verse_key   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quran_bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT quran_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

ALTER TABLE public.quran_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookmark"
  ON public.quran_bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmark"
  ON public.quran_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmark"
  ON public.quran_bookmarks FOR UPDATE USING (auth.uid() = user_id);
