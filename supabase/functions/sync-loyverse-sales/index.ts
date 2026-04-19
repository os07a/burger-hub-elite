import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOYVERSE_BASE = "https://api.loyverse.com/v1.0";
const RIYADH_TZ = "Asia/Riyadh";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface LoyversePayment {
  payment_type_id: string;
  money_amount: number;
  name?: string;
  type?: string;
}

interface LoyverseLineItem {
  item_name?: string;
  variant_name?: string;
  quantity?: number;
  total_money?: number;
  gross_total_money?: number;
  cost_total?: number;
  total_discount?: number;
}

interface LoyverseReceipt {
  receipt_number: string;
  created_at: string;
  total_money: number;
  payments?: LoyversePayment[];
  receipt_type?: string;
  total_discount_money?: number;
  discount_money?: number;
  total_tax_money?: number;
  tax_money?: number;
  total_cost_money?: number;
  cost_money?: number;
  line_items?: LoyverseLineItem[];
}

interface PaymentType {
  id: string;
  name: string;
  type: string;
}

interface SyncBody {
  date?: string;
  mode?: "test" | "sync";
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

    const parsedBody = await parseBody(req);
    if (!parsedBody.ok) {
      return json({ error: parsedBody.error }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const loyverseToken = Deno.env.get("LOYVERSE_API_TOKEN");

    if (!loyverseToken) {
      return json({ error: "LOYVERSE_API_TOKEN غير مهيأ" }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub;

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

    const mode = parsedBody.data.mode ?? "sync";
    const targetDate = parsedBody.data.date ?? getRiyadhDate();
    const loyverseHeaders = {
      Authorization: `Bearer ${loyverseToken}`,
      "Content-Type": "application/json",
    };

    if (mode === "test") {
      const merchantRes = await fetch(`${LOYVERSE_BASE}/merchant`, { headers: loyverseHeaders });
      if (!merchantRes.ok) {
        const txt = await merchantRes.text();
        return json({ connected: false, status: merchantRes.status, error: txt }, 200);
      }
      const merchant = await merchantRes.json();
      return json({ connected: true, merchant }, 200);
    }

    const ptRes = await fetch(`${LOYVERSE_BASE}/payment_types`, { headers: loyverseHeaders });
    if (!ptRes.ok) {
      const txt = await ptRes.text();
      return json({ error: "تعذر جلب أنواع الدفع من Loyverse", details: txt }, 502);
    }

    const ptJson = await ptRes.json();
    const paymentTypes: PaymentType[] = ptJson.payment_types ?? [];
    const ptMap = new Map(paymentTypes.map((p) => [p.id, p]));
    const { minIso, maxIso } = getUtcRangeForRiyadhDate(targetDate);
    const receipts = await fetchReceipts(loyverseHeaders, minIso, maxIso);

    console.log("sync target", targetDate, minIso, maxIso);
    console.log("receipts", receipts.length);

    let cash = 0;
    let card = 0;
    const delivery = 0; // Delivery is NOT tracked in Loyverse — manual entry only
    let orders = 0;
    let grossSales = 0;
    let refunds = 0;
    let discounts = 0;
    let cogs = 0;
    let taxes = 0;

    const syncedAt = new Date().toISOString();
    const receiptRows: Array<Record<string, unknown>> = [];
    const itemRows: Array<Record<string, unknown>> = [];

    for (const rec of receipts) {
      const isRefund = (rec.receipt_type ?? "SALE") === "REFUND";
      const absoluteTotal = Number(rec.total_money ?? 0);
      const discount = Number(rec.total_discount_money ?? rec.discount_money ?? 0);
      const tax = Number(rec.total_tax_money ?? rec.tax_money ?? 0);
      const cost = Number(rec.total_cost_money ?? rec.cost_money ?? 0);
      const sign = isRefund ? -1 : 1;

      if (isRefund) {
        refunds += absoluteTotal;
      } else {
        grossSales += absoluteTotal;
        orders += 1;
      }

      discounts += discount;
      taxes += tax;
      cogs += cost;

      let rCash = 0;
      let rCard = 0;
      const rDelivery = 0; // delivery never comes from Loyverse

      for (const pay of rec.payments ?? []) {
        const pt = ptMap.get(pay.payment_type_id);
        const type = (pt?.type ?? pay.type ?? "OTHER").toUpperCase();
        const amount = sign * Number(pay.money_amount ?? 0);

        if (type === "CASH") {
          cash += amount;
          rCash += amount;
        } else {
          // Everything else (CARD, OTHER, custom types like Mada/ApplePay) = Network/Card
          card += amount;
          rCard += amount;
        }
      }

      const recDate = toRiyadhDate(rec.created_at) ?? targetDate;

      if (rec.receipt_number) {
        receiptRows.push({
          receipt_number: rec.receipt_number,
          receipt_date: recDate,
          created_at_pos: rec.created_at,
          receipt_type: rec.receipt_type ?? "SALE",
          total: sign * absoluteTotal,
          cash: rCash,
          card: rCard,
          delivery: rDelivery,
          synced_at: syncedAt,
        });

        for (const li of rec.line_items ?? []) {
          const name = (li.item_name ?? "غير معروف").toString();
          const qty = sign * Number(li.quantity ?? 0);
          const gross = sign * Number(li.gross_total_money ?? li.total_money ?? 0);
          const lineDiscount = Number(li.total_discount ?? 0);
          const net = gross - sign * lineDiscount;
          itemRows.push({
            receipt_number: rec.receipt_number,
            receipt_date: recDate,
            item_name: name,
            variant_name: li.variant_name ?? null,
            quantity: qty,
            gross_total: gross,
            net_total: net,
            cost_total: sign * Number(li.cost_total ?? 0),
          });
        }
      }
    }

    const netSales = grossSales - refunds - discounts;
    const grossProfit = netSales - cogs;
    const margin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

    let receiptsSaved = 0;
    if (receiptRows.length > 0) {
      const { error: recErr, count } = await admin
        .from("pos_receipts")
        .upsert(receiptRows, { onConflict: "receipt_number", count: "exact" });

      if (recErr) {
        console.error("pos_receipts upsert error", recErr);
      } else {
        receiptsSaved = count ?? receiptRows.length;
      }
    }

    if (itemRows.length > 0) {
      // Replace items for the day to keep counts accurate
      const dates = Array.from(new Set(itemRows.map((r) => r.receipt_date as string)));
      await admin.from("pos_receipt_items").delete().in("receipt_date", dates);
      const { error: itemsErr } = await admin.from("pos_receipt_items").insert(itemRows);
      if (itemsErr) console.error("pos_receipt_items insert error", itemsErr);
    }

    // Preserve manual delivery_sales entry (delivery is not synced from Loyverse)
    const { data: existingDay } = await admin
      .from("daily_sales")
      .select("delivery_sales")
      .eq("date", targetDate)
      .maybeSingle();
    const existingDelivery = Number(existingDay?.delivery_sales ?? 0);

    const { error: upsertErr } = await admin.from("daily_sales").upsert(
      {
        date: targetDate,
        cash_sales: cash,
        card_sales: card,
        delivery_sales: existingDelivery,
        total_sales: netSales + existingDelivery,
        orders_count: orders,
        gross_sales: grossSales,
        refunds,
        discounts,
        net_sales: netSales,
        cogs,
        gross_profit: grossProfit,
        margin,
        taxes,
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
      gross_sales: grossSales,
      refunds,
      discounts,
      net_sales: netSales,
      cogs,
      gross_profit: grossProfit,
      margin,
      taxes,
      total: netSales,
      receipts_fetched: receipts.length,
      receipts_saved: receiptsSaved,
    });
  } catch (e) {
    console.error("sync-loyverse-sales error", e);
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

async function parseBody(req: Request): Promise<{ ok: true; data: SyncBody } | { ok: false; error: string }> {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return { ok: true, data: {} };
    }

    const body = (await req.json()) as SyncBody;
    if (body.date && !DATE_RE.test(body.date)) {
      return { ok: false, error: "صيغة التاريخ يجب أن تكون YYYY-MM-DD" };
    }
    if (body.mode && body.mode !== "test" && body.mode !== "sync") {
      return { ok: false, error: "قيمة mode غير صحيحة" };
    }

    return { ok: true, data: body };
  } catch {
    return { ok: false, error: "تعذر قراءة الطلب" };
  }
}

async function fetchReceipts(headers: Record<string, string>, minIso: string, maxIso: string): Promise<LoyverseReceipt[]> {
  let cursor: string | undefined;
  let safety = 0;
  const receipts: LoyverseReceipt[] = [];

  do {
    const url = new URL(`${LOYVERSE_BASE}/receipts`);
    url.searchParams.set("created_at_min", minIso);
    url.searchParams.set("created_at_max", maxIso);
    url.searchParams.set("limit", "250");
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`تعذر جلب الإيصالات من Loyverse: ${txt}`);
    }

    const payload = await res.json();
    receipts.push(...(payload.receipts ?? []));
    cursor = payload.cursor;
    safety += 1;
  } while (cursor && safety < 50);

  return receipts;
}

function getRiyadhDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RIYADH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function toRiyadhDate(value?: string | null) {
  if (!value) return null;
  return getRiyadhDate(new Date(value));
}

function getUtcRangeForRiyadhDate(date: string) {
  const start = new Date(`${date}T00:00:00+03:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return {
    minIso: start.toISOString(),
    maxIso: end.toISOString(),
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
