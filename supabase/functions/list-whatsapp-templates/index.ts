import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const META_API_VERSION = "v21.0";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } =
      await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }

    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const wabaId = Deno.env.get("WHATSAPP_BUSINESS_ACCOUNT_ID");

    if (!accessToken || !wabaId) {
      return json(
        {
          error:
            "WhatsApp غير مهيأ. الرجاء إضافة WHATSAPP_ACCESS_TOKEN و WHATSAPP_BUSINESS_ACCOUNT_ID.",
          templates: [],
        },
        500,
      );
    }

    const url = `https://graph.facebook.com/${META_API_VERSION}/${wabaId}/message_templates?fields=name,status,category,language,components&limit=100`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (!res.ok) {
      const errMsg = data?.error?.message ?? `Meta API error [${res.status}]`;
      console.error("Meta templates fetch failed", res.status, data);
      return json(
        { error: errMsg, meta_error: data?.error ?? null, templates: [] },
        502,
      );
    }

    const templates = Array.isArray(data?.data) ? data.data : [];
    return json({
      success: true,
      total: templates.length,
      approved: templates.filter((t: { status?: string }) => t.status === "APPROVED").length,
      templates,
    });
  } catch (e) {
    console.error("list-whatsapp-templates error", e);
    return json(
      { error: String((e as Error)?.message ?? e), templates: [] },
      500,
    );
  }
});