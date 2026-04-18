import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOYVERSE_BASE = "https://api.loyverse.com/v1.0";

interface LoyversePayment {
  payment_type_id: string;
  money_amount: number;
  name?: string;
  type?: string;
}

interface LoyverseReceipt {
  receipt_number: string;
  created_at: string;
  total_money: number;
  payments: LoyversePayment[];
  receipt_type: string; // SALE | REFUND
}

interface PaymentType {
  id: string;
  name: string;
  type: string; // CASH | CARD | OTHER
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const loyverseToken = Deno.env.get("LOYVERSE_API_TOKEN");

    if (!loyverseToken) {
      return json({ error: "LOYVERSE_API_TOKEN غير مهيأ" }, 500);
    }

    // Auth check
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } =
      await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub;

    // Admin check via service role
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return json({ error: "صلاحية المدير مطلوبة" }, 403);
    }

    // Parse body for optional date (YYYY-MM-DD)
    let targetDate = new Date().toISOString().split("T")[0];
    let mode: "test" | "sync" = "sync";
    try {
      const body = await req.json();
      if (body?.date) targetDate = body.date;
      if (body?.mode === "test") mode = "test";
    } catch {
      // empty body is fine
    }

    const loyverseHeaders = {
      Authorization: `Bearer ${loyverseToken}`,
      "Content-Type": "application/json",
    };

    // Test mode: just check connectivity
    if (mode === "test") {
      const merchantRes = await fetch(`${LOYVERSE_BASE}/merchant`, {
        headers: loyverseHeaders,
      });
      if (!merchantRes.ok) {
        const txt = await merchantRes.text();
        return json(
          { connected: false, status: merchantRes.status, error: txt },
          200,
        );
      }
      const merchant = await merchantRes.json();
      return json({ connected: true, merchant }, 200);
    }

    // 1) Fetch payment types to map ids -> CASH/CARD/OTHER
    const ptRes = await fetch(`${LOYVERSE_BASE}/payment_types`, {
      headers: loyverseHeaders,
    });
    if (!ptRes.ok) {
      const txt = await ptRes.text();
      return json(
        { error: "تعذر جلب أنواع الدفع من Loyverse", details: txt },
        502,
      );
    }
    const ptJson = await ptRes.json();
    const paymentTypes: PaymentType[] = ptJson.payment_types ?? [];
    const ptMap = new Map(paymentTypes.map((p) => [p.id, p]));

    // 2) Fetch receipts for the target date (UTC range)
    const minIso = `${targetDate}T00:00:00.000Z`;
    const max = new Date(`${targetDate}T00:00:00.000Z`);
    max.setUTCDate(max.getUTCDate() + 1);
    const maxIso = max.toISOString();

    let cursor: string | undefined = undefined;
    const receipts: LoyverseReceipt[] = [];
    let safety = 0;

    do {
      const url = new URL(`${LOYVERSE_BASE}/receipts`);
      url.searchParams.set("created_at_min", minIso);
      url.searchParams.set("created_at_max", maxIso);
      url.searchParams.set("limit", "250");
      if (cursor) url.searchParams.set("cursor", cursor);

      const r = await fetch(url.toString(), { headers: loyverseHeaders });
      if (!r.ok) {
        const txt = await r.text();
        return json(
          { error: "تعذر جلب الإيصالات من Loyverse", details: txt },
          502,
        );
      }
      const j = await r.json();
      receipts.push(...(j.receipts ?? []));
      cursor = j.cursor;
      safety++;
    } while (cursor && safety < 50);

    // 3) Aggregate
    let cash = 0;
    let card = 0;
    let delivery = 0;
    let orders = 0;

    for (const rec of receipts) {
      const sign = rec.receipt_type === "REFUND" ? -1 : 1;
      if (rec.receipt_type !== "REFUND") orders += 1;
      for (const pay of rec.payments ?? []) {
        const pt = ptMap.get(pay.payment_type_id);
        const type = (pt?.type ?? "OTHER").toUpperCase();
        const amount = sign * Number(pay.money_amount ?? 0);
        if (type === "CASH") cash += amount;
        else if (type === "CARD") card += amount;
        else delivery += amount;
      }
    }

    const total = cash + card + delivery;

    // 4) Upsert daily_sales by date
    const { error: upsertErr } = await admin
      .from("daily_sales")
      .upsert(
        {
          date: targetDate,
          cash_sales: cash,
          card_sales: card,
          delivery_sales: delivery,
          total_sales: total,
          orders_count: orders,
        },
        { onConflict: "date" },
      );

    if (upsertErr) {
      return json({ error: "فشل حفظ المبيعات", details: upsertErr.message }, 500);
    }

    return json({
      ok: true,
      date: targetDate,
      orders,
      cash,
      card,
      delivery,
      total,
      receipts_fetched: receipts.length,
    });
  } catch (e) {
    console.error("sync-loyverse-sales error", e);
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
