import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── Auth check ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: cErr } = await userClient.auth.getClaims(token);
    if (cErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Input validation ──
    const BodySchema = z.object({
      items: z.array(z.object({
        name: z.string().max(300),
        units_sold: z.number().finite(),
        total_margin: z.number().finite(),
        margin_pct: z.number().finite(),
        quadrant: z.enum(["star", "plowhorse", "puzzle", "dog"]),
        units_change_pct: z.number().nullable().optional(),
        margin_change_pct: z.number().nullable().optional(),
      })).max(500),
      period_days: z.number().int().min(1).max(365),
      counts: z.object({
        star: z.number().int().min(0),
        plowhorse: z.number().int().min(0),
        puzzle: z.number().int().min(0),
        dog: z.number().int().min(0),
      }),
      total_revenue: z.number().finite(),
      total_margin: z.number().finite(),
      avg_units: z.number().finite(),
      avg_margin: z.number().finite(),
      prev_total_revenue: z.number().finite().optional(),
      prev_total_margin: z.number().finite().optional(),
      revenue_change_pct: z.number().nullable().optional(),
      margin_change_pct: z.number().nullable().optional(),
    });
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "مدخلات غير صالحة" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const {
      items, period_days, counts, total_revenue, total_margin, avg_units, avg_margin,
      prev_total_revenue, prev_total_margin, revenue_change_pct, margin_change_pct,
    } = parsed.data;

    if (items.length === 0) {
      return new Response(
        JSON.stringify({
          summary: "ما عندنا بيانات مبيعات كافية بعد لإجراء تحليل هندسة المنيو. شغّل المزامنة من Loyverse وارجع بعد ما يدخل بيع لمدة أسبوع على الأقل.",
          recommendations: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const top = (q: string) =>
      items
        .filter((i: any) => i.quadrant === q)
        .sort((a: any, b: any) => b.total_margin - a.total_margin)
        .slice(0, 5)
        .map((i: any) => {
          const trend = (i.units_change_pct === null || i.units_change_pct === undefined)
            ? ""
            : `، اتجاه ${i.units_change_pct > 0 ? "+" : ""}${Number(i.units_change_pct).toFixed(0)}%`;
          return `- ${i.name} (${i.units_sold} وحدة، هامش ${i.total_margin.toFixed(0)} ريال، ${i.margin_pct.toFixed(0)}%${trend})`;
        })
        .join("\n") || "(لا يوجد)";

    const fmtChange = (v: number | null | undefined) =>
      (v === null || v === undefined) ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(0)}%`;

    const comparisonBlock = (prev_total_revenue !== undefined || prev_total_margin !== undefined)
      ? `\n[مقارنة بالفترة السابقة]
- تغير الإيراد: ${fmtChange(revenue_change_pct ?? null)} (سابق: ${(prev_total_revenue ?? 0).toFixed(0)} ريال)
- تغير الهامش: ${fmtChange(margin_change_pct ?? null)} (سابق: ${(prev_total_margin ?? 0).toFixed(0)} ريال)
`
      : "";

    const prompt = `أنت مستشار هندسة منيو خبير في مطاعم البرجر السعودية. تكلم بالعامية السعودية المباشرة، بدون أي إيموجي أو رموز تعبيرية.

[بيانات تحليل المنيو لآخر ${period_days} يوم]
- إجمالي الإيراد: ${total_revenue.toFixed(0)} ريال
- إجمالي الهامش: ${total_margin.toFixed(0)} ريال
- متوسط الوحدات المباعة لكل صنف: ${avg_units.toFixed(1)}
- متوسط هامش الصنف: ${avg_margin.toFixed(0)} ريال
${comparisonBlock}
[التوزيع]
- النجوم: ${counts.star} صنف (شعبية + ربحية)
- الجياد: ${counts.plowhorse} صنف (شعبية لكن هامش ضعيف)
- الألغاز: ${counts.puzzle} صنف (هامش حلو لكن مبيعات ضعيفة)
- الخاسرات: ${counts.dog} صنف (لا شعبية ولا هامش)

[أبرز النجوم]
${top("star")}

[أبرز الجياد]
${top("plowhorse")}

[أبرز الألغاز]
${top("puzzle")}

[أبرز الخاسرات]
${top("dog")}

[المطلوب]
أعطني:
1. ملخص في سطرين عن صحة المنيو واتجاهه مقارنة بالفترة السابقة (summary)
2. قائمة 4-6 توصيات تنفيذية مرتبة بالأولوية (recommendations) — كل توصية: عنوان قصير + سبب من البيانات (استخدم الأرقام والاتجاهات) + خطوة عملية واضحة

مهم: لا تستخدم أي إيموجي أو رموز تعبيرية في الرد.

ردّ بـ JSON فقط بهذا الشكل:
{
  "summary": "...",
  "recommendations": [
    { "priority": "high|medium|low", "title": "...", "reason": "...", "action": "..." }
  ]
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "أنت مستشار هندسة منيو محترف. ردك يجب أن يكون JSON صالح فقط، بلا أي نص خارجي." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI gateway failed:", aiRes.status, txt);
      return new Response(JSON.stringify({ error: "فشل توليد التوصيات" }), {
        status: aiRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    let content: string = data.choices?.[0]?.message?.content ?? "{}";
    // strip code fences if present
    content = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    let parsed: any;
    try { parsed = JSON.parse(content); }
    catch { parsed = { summary: content, recommendations: [] }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("menu-engineering-advice error:", e);
    return new Response(JSON.stringify({ error: "حدث خطأ، حاول لاحقاً" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
