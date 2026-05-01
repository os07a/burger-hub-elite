import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_CONTEXT = `
أنت مستشار ريادة أعمال خبير ومتخصص في المطاعم والمشاريع الصغيرة في السعودية.
اسم المشروع: برجرهم (BURGERHUM) — مطعم برجر في المدينة المنورة. بدأ التشغيل: ديسمبر 2025.

═══ تعليمات المستشار ═══
- تكلم بالعامية السعودية بأسلوب ودود ومباشر
- كن صريح — إذا المشروع ماشي غلط قول بصراحة
- قدم نصائح عملية قابلة للتنفيذ مبنية على البيانات الحقيقية المعطاة لك
- إذا أُرفق صورة (فاتورة، إيصال، شاشة) — حلّلها واستخرج الأرقام والمعلومات
- إذا أُرفق PDF أو ملف نصي — اقرأه واستفد منه في الإجابة
- إذا أُرسل تسجيل صوتي مفرّغ — تعامل معه كسؤال عادي
- ركز على: السيولة، النمو، التكاليف، استرداد رأس المال، نقاط الضعف
- استخدم إيموجي بشكل معتدل
`;

async function buildLiveSnapshot(supabase: any): Promise<string> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const d30 = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

    const [receipts, employees, attendance, inventory, suppliers, products, distributions, shares, dailySales] = await Promise.all([
      supabase.from("pos_receipts").select("receipt_date,total,cash,card,delivery").gte("receipt_date", d30),
      supabase.from("employees").select("name,role,salary,basic_salary,status"),
      supabase.from("attendance").select("date,status,late_minutes,overtime_minutes").gte("date", d30),
      supabase.from("inventory_items").select("name,quantity,min_quantity,unit,cost_per_unit"),
      supabase.from("suppliers").select("name,category,rating"),
      supabase.from("products").select("name,price,cost,is_active"),
      supabase.from("monthly_distributions").select("month,total_revenue,shares_generated,per_share_amount").order("month", { ascending: false }).limit(6),
      supabase.from("partner_shares").select("partner_name,shares_count,share_value,category"),
      supabase.from("daily_sales").select("date,net_sales,cash_sales,card_sales,delivery_sales,discounts").gte("date", d30),
    ]);

    const r = receipts.data ?? [];
    const totalRev30 = r.reduce((s: number, x: any) => s + Number(x.total || 0), 0);
    const cash30 = r.reduce((s: number, x: any) => s + Number(x.cash || 0), 0);
    const card30 = r.reduce((s: number, x: any) => s + Number(x.card || 0), 0);
    const delivery30 = r.reduce((s: number, x: any) => s + Number(x.delivery || 0), 0);
    const days = new Set(r.map((x: any) => x.receipt_date)).size || 1;

    const emp = employees.data ?? [];
    const totalSalaries = emp.reduce((s: number, x: any) => s + Number(x.salary || x.basic_salary || 0), 0);

    const att = attendance.data ?? [];
    const lateCount = att.filter((x: any) => Number(x.late_minutes) > 0).length;
    const absentCount = att.filter((x: any) => x.status === "غائب" || x.status === "absent").length;

    const inv = inventory.data ?? [];
    const lowStock = inv.filter((x: any) => Number(x.quantity) <= Number(x.min_quantity));

    const prod = products.data ?? [];
    const activeProducts = prod.filter((x: any) => x.is_active);
    const avgMargin = activeProducts.length
      ? activeProducts.reduce((s: number, x: any) => s + (Number(x.price) - Number(x.cost)), 0) / activeProducts.length
      : 0;

    const dist = distributions.data ?? [];
    const sh = shares.data ?? [];
    const totalShares = sh.reduce((s: number, x: any) => s + Number(x.shares_count || 0), 0);

    return `
═══ بيانات حية (آخر 30 يوم — حتى ${today}) ═══

📊 المبيعات (POS):
- إجمالي الإيرادات: ${totalRev30.toFixed(0)} ر.س عبر ${days} يوم
- متوسط يومي: ${(totalRev30 / days).toFixed(0)} ر.س
- نقدي: ${cash30.toFixed(0)} | شبكة: ${card30.toFixed(0)} | توصيل: ${delivery30.toFixed(0)}
- عدد الإيصالات: ${r.length}

👥 الموظفون (${emp.length}):
- إجمالي الرواتب الشهرية: ${totalSalaries.toFixed(0)} ر.س
- نسبة العمالة من الإيرادات: ${totalRev30 > 0 ? ((totalSalaries / totalRev30) * 100).toFixed(1) : "—"}%

⏰ الحضور (آخر 30 يوم):
- عدد سجلات: ${att.length} | تأخيرات: ${lateCount} | غياب: ${absentCount}

📦 المخزون (${inv.length} صنف):
- نواقص حرجة (${lowStock.length}): ${lowStock.slice(0, 5).map((x: any) => `${x.name} (${x.quantity}${x.unit})`).join(", ") || "لا يوجد"}

🍔 المنتجات (${activeProducts.length} نشط):
- متوسط هامش الربح: ${avgMargin.toFixed(2)} ر.س للمنتج

🏭 الموردون: ${suppliers.data?.length ?? 0}

💰 توزيعات الأسهم (آخر ${dist.length} شهور):
${dist.slice(0, 3).map((x: any) => `- ${x.month}: إيراد ${Number(x.total_revenue).toFixed(0)} | أسهم ${x.shares_generated} | للسهم ${Number(x.per_share_amount).toFixed(0)}`).join("\n") || "لا يوجد"}
- إجمالي الأسهم الموزعة: ${totalShares} / 200

📅 المبيعات اليومية المسجلة: ${dailySales.data?.length ?? 0} يوم
`;
  } catch (e) {
    console.error("snapshot error", e);
    return "\n(تعذر جلب البيانات الحية حالياً)\n";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── Auth check (OWASP A01) ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Input validation (OWASP A03) ──
    const BodySchema = z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.union([z.string().max(20000), z.array(z.any()).max(20)]),
      })).min(1).max(50),
      attachments: z.array(z.object({
        type: z.enum(["image", "text"]),
        name: z.string().max(255).optional(),
        text: z.string().max(50000).optional(),
        dataUrl: z.string().max(15_000_000).optional(), // ~10MB base64
      })).max(5).optional(),
    });
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "مدخلات غير صالحة" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { messages, attachments } = parsed.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const liveData = await buildLiveSnapshot(supabase);
    const systemContent = BASE_CONTEXT + liveData;

    // Build last user message with multimodal content if attachments exist
    const msgs = [...messages];
    if (attachments && Array.isArray(attachments) && attachments.length > 0 && msgs.length > 0) {
      const last = msgs[msgs.length - 1];
      const parts: any[] = [{ type: "text", text: last.content || "حلل المرفقات" }];
      for (const a of attachments) {
        if (a.type === "image" && a.dataUrl) {
          parts.push({ type: "image_url", image_url: { url: a.dataUrl } });
        } else if (a.type === "text" && a.text) {
          parts.push({ type: "text", text: `\n\n[محتوى ملف ${a.name || ""}]:\n${a.text}` });
        }
      }
      msgs[msgs.length - 1] = { role: "user", content: parts };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemContent }, ...msgs],
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
    return new Response(JSON.stringify({ error: "حدث خطأ، حاول لاحقاً" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
