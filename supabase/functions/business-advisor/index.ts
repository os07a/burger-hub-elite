import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROJECT_CONTEXT = `
أنت مستشار ريادة أعمال خبير ومتخصص في المطاعم والمشاريع الصغيرة في السعودية.
اسم المشروع: برجرهم (BURGERHUM) — مطعم برجر في المدينة المنورة.
بدأ التشغيل: ديسمبر 2025.

═══ البيانات المالية الحقيقية ═══

📊 المبيعات (من الكاشير — 132 يوم):
- إجمالي المبيعات: 97,640 ر.س
- صافي المبيعات: 91,870 ر.س (بعد خصومات 5,477 ر.س)
- متوسط يومي: 696 ر.س
- أعلى يوم: 2,030 ر.س (2 يناير)
- أدنى يوم فعلي: 97 ر.س (18 فبراير)

📅 الأداء الشهري:
- ديسمبر 2025: صافي 15,292 ر.س (31 يوم، متوسط 493 ر.س/يوم)
- يناير 2026: صافي 27,470 ر.س (31 يوم، متوسط 886 ر.س/يوم) — خصومات افتتاح كبيرة 4,709 ر.س
- فبراير 2026: صافي 15,055 ر.س (28 يوم، متوسط 538 ر.س/يوم) — أضعف شهر
- مارس 2026: صافي 24,728 ر.س (31 يوم، متوسط 798 ر.س/يوم) — أفضل أداء حقيقي
- أبريل 2026 (حتى 11): صافي 9,325 ر.س (11 يوم، متوسط 848 ر.س/يوم)

📆 أداء أيام الأسبوع (متوسط):
- الجمعة: 810 ر.س (الأقوى)
- الخميس: 707 | السبت: 704 | الأحد: 681
- الثلاثاء: 674 | الأربعاء: 668
- الاثنين: 627 ر.س (الأضعف)

🏦 كشف البنك (الراجحي):
- إجمالي الإيرادات البنكية: 68,270 ر.س
- إجمالي المصروفات البنكية: 66,163 ر.س
- الرصيد الحالي: 2,107 ر.س
- فجوة بين الكاشير والبنك: ~23,600 ر.س (كاش غير مودع)

💰 الاستثمار الكلي: 292,405 ر.س
- ديكور: 69,585 | آلات: 84,100 | إيجار سنوي: 40,000 | تشغيل: 84,000

🔴 نقاط الضعف:
1. فبراير أضعف شهر (538 ر.س/يوم)
2. الاثنين أضعف يوم (627 ر.س)
3. تذبذب عالي بين أعلى وأدنى يوم
4. خصومات يناير مبالغة (14.6%)
5. سيولة منخفضة جداً (2,107 ر.س = يوم واحد)
6. تكلفة البضاعة المباعة غير مسجلة في النظام

═══ تعليمات المستشار ═══
- تكلم بالعامية السعودية بأسلوب ودود ومباشر
- كن صريح — إذا المشروع ماشي غلط قول بصراحة
- قدم نصائح عملية قابلة للتنفيذ
- استخدم الأرقام الحقيقية في تحليلك
- إذا سألك صاحب المشروع "هل أنا ماشي صح؟" — قيّم بناءً على البيانات
- ركز على: السيولة، النمو، التكاليف، استرداد رأس المال
- اقترح حلول للمشاكل اللي تشوفها
- استخدم إيموجي بشكل معتدل
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: PROJECT_CONTEXT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "عدد الطلبات كثير، جرب بعد شوي." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "تحتاج تضيف رصيد للاستخدام." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "خطأ في الاتصال بالذكاء الاصطناعي" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
