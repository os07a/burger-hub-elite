ALTER TABLE public.social_insights
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS link_clicks integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS content_interactions integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reach_change_pct numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_change_pct numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS visits_change_pct numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interactions_change_pct numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS link_clicks_change_pct numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS period_end date;