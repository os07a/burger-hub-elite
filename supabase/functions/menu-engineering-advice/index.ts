import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { items, period_days, counts, total_revenue, total_margin, avg_units, avg_margin } = body;

    if (!Array.isArray(items)) {
      return new Response(JSON.stringify({ error: "items required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
        .map((i: any) => `- ${i.name} (${i.units_sold} وحدة، هامش ${i.total_margin.toFixed(0)} ريال، ${i.margin_pct.toFixed(0)}%)`)
        .join("\n") || "(لا يوجد)";

    const prompt = `أنت مستشار هندسة منيو خبير في مطاعم البرجر السعودية. تكلم بالعامية السعودية المباشرة.

═══ بيانات تحليل المنيو لآخر ${period_days} يوم ═══
- إجمالي الإيراد: ${total_revenue.toFixed(0)} ريال
- إجمالي الهامش: ${total_margin.toFixed(0)} ريال
- متوسط الوحدات المباعة لكل صنف: ${avg_units.toFixed(1)}
- متوسط هامش الصنف: ${avg_margin.toFixed(0)} ريال

═══ التوزيع ═══
- ⭐ النجوم: ${counts.star} صنف (شعبية + ربحية)
- 🐎 الجياد: ${counts.plowhorse} صنف (شعبية لكن هامش ضعيف)
- 🧩 الألغاز: ${counts.puzzle} صنف (هامش حلو لكن مبيعات ضعيفة)
- 🐕 الخاسرات: ${counts.dog} صنف (لا شعبية ولا هامش)

═══ أبرز النجوم ⭐ ═══
${top("star")}

═══ أبرز الجياد 🐎 ═══
${top("plowhorse")}

═══ أبرز الألغاز 🧩 ═══
${top("puzzle")}

═══ أبرز الخاسرات 🐕 ═══
${top("dog")}

═══ المطلوب ═══
أعطني:
1. ملخص في سطرين عن صحة المنيو (summary)
2. قائمة 4-6 توصيات تنفيذية مرتبة بالأولوية (recommendations) — كل توصية: عنوان قصير + سبب من البيانات + خطوة عملية واضحة

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
      return new Response(JSON.stringify({ error: "AI gateway failed", details: txt }), {
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
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
