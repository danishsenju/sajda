-- Unique constraint to prevent duplicate log per prayer per day per user
ALTER TABLE public.solat_logs
  ADD CONSTRAINT solat_logs_user_prayer_date_key
  UNIQUE (user_id, prayer, log_date);

-- Allow users to delete their own logs (needed for un-checking a prayer)
CREATE POLICY "Users can delete own solat logs"
  ON public.solat_logs
  FOR DELETE
  USING (auth.uid() = user_id);
