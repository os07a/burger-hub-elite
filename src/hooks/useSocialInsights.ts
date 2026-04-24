import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Platform = "facebook" | "instagram" | "both";

export interface SocialInsight {
  id: string;
  week_start: string;
  platform: Platform;
  reach: number;
  impressions: number;
  profile_visits: number;
  new_followers: number;
  total_followers: number;
  engagement_rate: number;
  posts_count: number;
  best_post_time: string | null;
  ai_summary: string | null;
  ai_suggestions: string[];
  sales_correlation: { week_sales?: number; week_orders?: number; sar_per_1000_reach?: number };
  source: "manual" | "meta_api";
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  insight_id: string;
  platform: "facebook" | "instagram";
  post_text: string | null;
  post_url: string | null;
  post_type: string;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement_score: number;
  ai_analysis: string | null;
  posted_at: string | null;
}

export const useSocialInsights = (platform?: Platform) => {
  return useQuery({
    queryKey: ["social_insights", platform ?? "all"],
    queryFn: async () => {
      let q = supabase.from("social_insights").select("*").order("week_start", { ascending: false });
      if (platform) q = q.eq("platform", platform);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as SocialInsight[];
    },
  });
};

export const useLatestInsight = (platform: Platform = "both") => {
  return useQuery({
    queryKey: ["social_insights", "latest", platform],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_insights")
        .select("*")
        .eq("platform", platform)
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as SocialInsight | null;
    },
  });
};

export const useInsightPosts = (insightId: string | undefined) => {
  return useQuery({
    queryKey: ["social_posts", insightId],
    enabled: !!insightId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .eq("insight_id", insightId!)
        .order("engagement_score", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SocialPost[];
    },
  });
};

export const useAnalyzeInsight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.functions.invoke("analyze-social-insights", {
        body: payload,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social_insights"] });
      qc.invalidateQueries({ queryKey: ["social_posts"] });
      toast.success("تم تحليل بيانات الأسبوع بنجاح");
    },
    onError: (e: any) => {
      toast.error(e.message || "فشل التحليل");
    },
  });
};