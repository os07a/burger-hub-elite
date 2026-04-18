import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOYVERSE_BASE = "https://api.loyverse.com/v1.0";

interface LoyverseCustomer {
  id: string;
  name?: string;
  email?: string;
  phone_number?: string;
  total_visits?: number;
  total_points?: number;
  total_spent?: number;
  first_visit?: string;
  last_visit?: string;
}

function tierFor(visits: number): string {
  if (visits >= 10) return "gold";
  if (visits >= 5) return "silver";
  return "regular";
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

    const loyverseHeaders = {
      Authorization: `Bearer ${loyverseToken}`,
      "Content-Type": "application/json",
    };

    // Fetch customers with pagination
    let cursor: string | undefined = undefined;
    const customers: LoyverseCustomer[] = [];
    let safety = 0;

    do {
      const url = new URL(`${LOYVERSE_BASE}/customers`);
      url.searchParams.set("limit", "250");
      if (cursor) url.searchParams.set("cursor", cursor);

      const r = await fetch(url.toString(), { headers: loyverseHeaders });
      if (!r.ok) {
        const txt = await r.text();
        return json(
          { error: "تعذر جلب العملاء من Loyverse", details: txt },
          502,
        );
      }
      const j = await r.json();
      customers.push(...(j.customers ?? []));
      cursor = j.cursor;
      safety++;
    } while (cursor && safety < 100);

    console.log("customers fetched", customers.length);

    let gold = 0;
    let silver = 0;
    let regular = 0;

    const rows = customers.map((c) => {
      const visits = Number(c.total_visits ?? 0);
      const tier = tierFor(visits);
      if (tier === "gold") gold++;
      else if (tier === "silver") silver++;
      else regular++;

      return {
        loyverse_customer_id: c.id,
        name: c.name ?? null,
        phone: c.phone_number ?? null,
        email: c.email ?? null,
        total_visits: visits,
        total_points: Number(c.total_points ?? 0),
        total_spent: Number(c.total_spent ?? 0),
        tier,
        first_visit: c.first_visit ?? null,
        last_visit: c.last_visit ?? null,
        synced_at: new Date().toISOString(),
      };
    });

    let saved = 0;
    if (rows.length > 0) {
      // upsert in chunks of 500
      for (let i = 0; i < rows.length; i += 500) {
        const chunk = rows.slice(i, i + 500);
        const { error, count } = await admin
          .from("loyalty_customers")
          .upsert(chunk, {
            onConflict: "loyverse_customer_id",
            count: "exact",
          });
        if (error) {
          console.error("loyalty_customers upsert error", error);
          return json(
            { error: "فشل حفظ العملاء", details: error.message },
            500,
          );
        }
        saved += count ?? chunk.length;
      }
    }

    return json({
      ok: true,
      customers_fetched: customers.length,
      customers_synced: saved,
      gold,
      silver,
      regular,
    });
  } catch (e) {
    console.error("sync-loyverse-customers error", e);
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
