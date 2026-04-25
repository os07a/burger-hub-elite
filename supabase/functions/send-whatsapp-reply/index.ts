import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function normalizePhone(raw: string): string | null {
  const d = String(raw ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("00966")) return "966" + d.slice(5);
  if (d.startsWith("966")) return d;
  if (d.startsWith("05")) return "966" + d.slice(1);
  if (d.startsWith("5") && d.length === 9) return "966" + d;
  return d;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const admin = createClient(supabaseUrl, serviceKey);

    const { to, message } = await req.json();
    const toPhone = normalizePhone(to);
    if (!toPhone || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: "to and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify 24h window: must have an inbound message from this phone in last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recent, error: recErr } = await admin
      .from("whatsapp_messages")
      .select("id, sent_at")
      .eq("direction", "inbound")
      .eq("from_phone", toPhone)
      .gte("sent_at", since)
      .limit(1);

    if (recErr) throw recErr;
    if (!recent || recent.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "خارج نافذة 24 ساعة من Meta. لا يمكن إرسال رسالة نصية حرة. استخدم قالباً معتمداً.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    if (!accessToken || !phoneId) {
      return new Response(
        JSON.stringify({ error: "WhatsApp credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const metaResp = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: toPhone,
          type: "text",
          text: { body: message.trim() },
        }),
      },
    );

    const metaJson = await metaResp.json();
    if (!metaResp.ok) {
      const errMsg = metaJson?.error?.message ?? "Meta API error";
      await admin.from("whatsapp_messages").insert({
        direction: "outbound",
        to_phone: toPhone,
        body: message.trim(),
        status: "failed",
        error: errMsg,
        sent_by: userId,
      });
      return new Response(
        JSON.stringify({ success: false, error: errMsg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const metaMessageId = metaJson?.messages?.[0]?.id ?? null;
    await admin.from("whatsapp_messages").insert({
      direction: "outbound",
      to_phone: toPhone,
      body: message.trim(),
      status: "sent",
      meta_message_id: metaMessageId,
      sent_by: userId,
    });

    return new Response(
      JSON.stringify({ success: true, to: toPhone, meta_message_id: metaMessageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("send-whatsapp-reply error", e);
    return new Response(
      JSON.stringify({ error: String((e as Error)?.message ?? e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
