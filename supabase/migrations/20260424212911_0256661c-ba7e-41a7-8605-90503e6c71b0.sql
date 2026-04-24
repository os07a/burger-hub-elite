
-- Create social_insights table (weekly metrics per platform)
CREATE TABLE public.social_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL,
  platform TEXT NOT NULL DEFAULT 'both' CHECK (platform IN ('facebook', 'instagram', 'both')),
  reach INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  profile_visits INTEGER NOT NULL DEFAULT 0,
  new_followers INTEGER NOT NULL DEFAULT 0,
  total_followers INTEGER NOT NULL DEFAULT 0,
  engagement_rate NUMERIC NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  best_post_time TEXT,
  ai_summary TEXT,
  ai_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  sales_correlation JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'meta_api')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(week_start, platform)
);

ALTER TABLE public.social_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view social_insights" ON public.social_insights
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert social_insights" ON public.social_insights
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update social_insights" ON public.social_insights
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete social_insights" ON public.social_insights
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_social_insights_updated_at
  BEFORE UPDATE ON public.social_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create social_posts table (individual post performance)
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_id UUID REFERENCES public.social_insights(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'facebook' CHECK (platform IN ('facebook', 'instagram')),
  post_text TEXT,
  post_url TEXT,
  post_type TEXT NOT NULL DEFAULT 'image' CHECK (post_type IN ('image', 'video', 'reel', 'story', 'carousel')),
  reach INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  engagement_score NUMERIC NOT NULL DEFAULT 0,
  ai_analysis TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view social_posts" ON public.social_posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert social_posts" ON public.social_posts
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update social_posts" ON public.social_posts
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete social_posts" ON public.social_posts
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create meta_connection table (future API readiness)
CREATE TABLE public.meta_connection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fb_page_id TEXT,
  ig_business_id TEXT,
  access_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.meta_connection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view meta_connection" ON public.meta_connection
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert meta_connection" ON public.meta_connection
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update meta_connection" ON public.meta_connection
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete meta_connection" ON public.meta_connection
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_meta_connection_updated_at
  BEFORE UPDATE ON public.meta_connection
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_social_insights_week ON public.social_insights(week_start DESC);
CREATE INDEX idx_social_insights_platform ON public.social_insights(platform);
CREATE INDEX idx_social_posts_insight ON public.social_posts(insight_id);
CREATE INDEX idx_social_posts_engagement ON public.social_posts(engagement_score DESC);
