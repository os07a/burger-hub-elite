-- Drop existing check constraint if any (Postgres allows any text by default; safe no-op if missing)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'social_insights_platform_check'
  ) THEN
    ALTER TABLE public.social_insights DROP CONSTRAINT social_insights_platform_check;
  END IF;
END $$;

-- Add new columns for TikTok-specific metrics
ALTER TABLE public.social_insights
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS total_likes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count integer NOT NULL DEFAULT 0;

-- Add a check constraint to limit allowed platforms
ALTER TABLE public.social_insights
  ADD CONSTRAINT social_insights_platform_check
  CHECK (platform IN ('facebook', 'instagram', 'both', 'tiktok'));

-- Same for posts
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'social_posts_platform_check'
  ) THEN
    ALTER TABLE public.social_posts DROP CONSTRAINT social_posts_platform_check;
  END IF;
END $$;

ALTER TABLE public.social_posts
  ADD CONSTRAINT social_posts_platform_check
  CHECK (platform IN ('facebook', 'instagram', 'tiktok'));