import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PostInput {
  post_text?: string;
  post_url?: string;
  post_type?: string;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  posted_at?: string;
  platform?: string;
}

interface RequestBody {
  week_start: string;
  platform: "facebook" | "instagram" | "both";
  reach: number;
  impressions: number;
  profile_visits?: number;
  new_followers: number;
  total_followers: number;
  engagement_rate: number;
  posts_count: number;
  best_post_time?: string;
  posts?: PostInput[];
}

function calcEngagementScore(p: PostInput): number {
  const reach = Number(p.reach || 0);
  const interactions = Number(p.likes || 0) + Number(p.comments || 0) * 2 + Number(p.shares || 0) * 3 + Number(p.saves || 0) * 2;
  if (reach === 0) return 0;
  return Number(((interactions / reach) * 100).toFixed(2));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify JWT
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RequestBody = await req.json();
    if (!body.week_start || !body.platform) {
      return new Response(JSON.stringify({ error: "week_start and platform required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch sales for that week (week_start to +6 days)
    const weekStart = body.week_start;
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEnd = weekEndDate.toISOString().slice(0, 10);

    const { data: salesRows } = await supabase
      .from("daily_sales")
      .select("date, net_sales, total_sales, orders_count")
      .gte("date", weekStart)
      .lte("date", weekEnd);

    const totalSales = (salesRows ?? []).reduce((s, r: any) => s + Number(r.net_sales || r.total_sales || 0), 0);
    const totalOrders = (salesRows ?? []).reduce((s, r: any) => s + Number(r.orders_count || 0), 0);
    const reachToSalesRatio = body.reach > 0 ? Number((totalSales / body.reach * 1000).toFixed(2)) : 0;

    const sales_correlation = {
      week_sales: totalSales,
      week_orders: totalOrders,
      sar_per_1000_reach: reachToSalesRatio,
    };

    // Build prompt for Lovable AI
    const platformName = body.platform === "facebook" ? "فيسبوك" : body.platform === "instagram" ? "Instagram" : "فيسبوك و Instagram";
    const postsJson = (body.posts ?? []).map(p => ({
      ...p,
      engagement_score: calcEngagementScore(p),
    }));

    const prompt = `أنت خبير سوشل ميديا متخصص في مطاعم البرجر. حلل بيانات أسبوع المطعم على ${platformName} وأعطني:

بيانات الأسبوع (${weekStart} إلى ${weekEnd}):
- الوصول (Reach): ${body.reach}
- الانطباعات: ${body.impressions}
- متابعون جدد: ${body.new_followers}
- إجمالي المتابعين: ${body.total_followers}
- نسبة التفاعل: ${body.engagement_rate}%
- عدد المنشورات: ${body.posts_count}
- أفضل وقت نشر: ${body.best_post_time || "غير محدد"}

المبيعات في نفس الأسبوع:
- مبيعات الأسبوع: ${totalSales} ريال
- عدد الطلبات: ${totalOrders}
- كل 1000 وصول = ${reachToSalesRatio} ريال مبيعات

المنشورات:
${JSON.stringify(postsJson, null, 2)}

أرجع JSON فقط بهذا الشكل بالضبط (بدون أي نص قبله أو بعده):
{
  "ai_summary": "جملة واحدة باللهجة السعودية تلخص أداء الأسبوع وتربطه بالمبيعات (مثلاً: 'وصلت لـ 12 ألف شخص هذا الأسبوع، وزيادتك 124 متابع — والمبيعات ارتفعت معاها 18%').",
  "ai_suggestions": ["اقتراح 1 قابل للتنفيذ", "اقتراح 2", "اقتراح 3", "اقتراح 4"],
  "posts_analysis": [
    { "index": 0, "analysis": "نجح/فشل لأن... بالعامية السعودية" }
  ]
}

الاقتراحات يجب أن تشمل:
1. اقتراح وقت نشر مثالي
2. اقتراح نوع محتوى للأسبوع القادم
3. تحليل ربط الأداء بالمبيعات
4. اقتراح تحسين منشور ضعيف`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "أنت خبير سوشل ميديا للمطاعم، أرجع JSON صالح فقط." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      return new Response(JSON.stringify({ error: "AI request failed", details: errText }), {
        status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const rawContent = aiJson.choices?.[0]?.message?.content ?? "{}";
    const cleaned = rawContent.replace(/```json\s*|\s*```/g, "").trim();
    let parsed: any = { ai_summary: "", ai_suggestions: [], posts_analysis: [] };
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI JSON:", cleaned);
    }

    // Upsert insight
    const { data: insight, error: upErr } = await supabase
      .from("social_insights")
      .upsert({
        week_start: body.week_start,
        platform: body.platform,
        reach: body.reach,
        impressions: body.impressions,
        profile_visits: body.profile_visits ?? 0,
        new_followers: body.new_followers,
        total_followers: body.total_followers,
        engagement_rate: body.engagement_rate,
        posts_count: body.posts_count,
        best_post_time: body.best_post_time,
        ai_summary: parsed.ai_summary || "",
        ai_suggestions: parsed.ai_suggestions || [],
        sales_correlation,
        source: "manual",
      }, { onConflict: "week_start,platform" })
      .select()
      .single();

    if (upErr) {
      console.error("Upsert error:", upErr);
      return new Response(JSON.stringify({ error: upErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Replace posts for this insight
    if (insight && body.posts && body.posts.length > 0) {
      await supabase.from("social_posts").delete().eq("insight_id", insight.id);
      const postsToInsert = body.posts.map((p, i) => ({
        insight_id: insight.id,
        platform: p.platform || (body.platform === "instagram" ? "instagram" : "facebook"),
        post_text: p.post_text,
        post_url: p.post_url,
        post_type: p.post_type || "image",
        reach: p.reach || 0,
        likes: p.likes || 0,
        comments: p.comments || 0,
        shares: p.shares || 0,
        saves: p.saves || 0,
        engagement_score: calcEngagementScore(p),
        ai_analysis: parsed.posts_analysis?.find((a: any) => a.index === i)?.analysis || "",
        posted_at: p.posted_at || null,
      }));
      await supabase.from("social_posts").insert(postsToInsert);
    }

    return new Response(JSON.stringify({ success: true, insight, ai: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("analyze-social-insights error:", e);
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});