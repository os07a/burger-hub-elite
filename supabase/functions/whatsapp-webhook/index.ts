import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
};

/** Verify Meta webhook signature using app secret. */
function verifySignature(
  body: string,
  signatureHeader: string | null,
  appSecret: string,
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret)
    .update(body)
    .digest("hex");
  const provided = signatureHeader.slice(7);
  // Constant-time compare
  if (expected.length !== provided.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
  const appSecret = Deno.env.get("WHATSAPP_APP_SECRET");

  // ===== GET: Webhook verification (Meta calls this once on setup) =====
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (!verifyToken) {
      return new Response("WHATSAPP_VERIFY_TOKEN not configured", {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (mode === "subscribe" && token === verifyToken && challenge) {
      return new Response(challenge, { status: 200, headers: corsHeaders });
    }
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  // ===== POST: Status updates from Meta =====
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const rawBody = await req.text();

    // Verify signature if app secret is configured
    if (appSecret) {
      const sig = req.headers.get("x-hub-signature-256");
      if (!verifySignature(rawBody, sig, appSecret)) {
        console.warn("Invalid webhook signature");
        return new Response("Invalid signature", {
          status: 401,
          headers: corsHeaders,
        });
      }
    }

    const payload = JSON.parse(rawBody);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Helper: normalize a Meta phone (E.164 without +) to match our stored format
    const normalize = (p: string | undefined | null) => {
      if (!p) return null;
      const d = String(p).replace(/\D/g, "");
      return d || null;
    };

    // Process status updates AND inbound messages
    const entries = payload?.entry ?? [];
    for (const entry of entries) {
      const changes = entry?.changes ?? [];
      for (const change of changes) {
        const value = change?.value ?? {};
        const businessPhoneId: string | undefined =
          value?.metadata?.phone_number_id;

        // ===== Inbound messages =====
        const messages = value?.messages ?? [];
        for (const msg of messages) {
          const metaMessageId = msg?.id;
          const fromPhone = normalize(msg?.from);
          const type = msg?.type ?? "text";
          const ts = msg?.timestamp
            ? new Date(Number(msg.timestamp) * 1000).toISOString()
            : new Date().toISOString();

          let body = "";
          let mediaType: string | null = null;
          if (type === "text") {
            body = msg?.text?.body ?? "";
          } else if (type === "image") {
            body = msg?.image?.caption ?? "[صورة]";
            mediaType = "image";
          } else if (type === "audio") {
            body = "[رسالة صوتية]";
            mediaType = "audio";
          } else if (type === "video") {
            body = msg?.video?.caption ?? "[فيديو]";
            mediaType = "video";
          } else if (type === "document") {
            body = msg?.document?.filename ?? "[مستند]";
            mediaType = "document";
          } else if (type === "button") {
            body = msg?.button?.text ?? "[زر]";
          } else if (type === "interactive") {
            body =
              msg?.interactive?.button_reply?.title ??
              msg?.interactive?.list_reply?.title ??
              "[تفاعل]";
          } else {
            body = `[${type}]`;
          }

          if (!fromPhone || !metaMessageId) continue;

          // Try to match a known customer by phone
          let customerId: string | null = null;
          try {
            const { data: cust } = await admin
              .from("loyalty_customers")
              .select("id, phone")
              .limit(2000);
            const match = (cust ?? []).find((c) => {
              const cp = String(c.phone ?? "").replace(/\D/g, "");
              return cp && (cp === fromPhone || cp.endsWith(fromPhone) || fromPhone.endsWith(cp));
            });
            if (match) customerId = match.id;
          } catch (_) {
            // ignore matching errors
          }

          const { error: insErr } = await admin
            .from("whatsapp_messages")
            .insert({
              direction: "inbound",
              from_phone: fromPhone,
              to_phone: businessPhoneId ?? "business",
              body,
              media_type: mediaType,
              meta_message_id: metaMessageId,
              status: "received",
              customer_id: customerId,
              sent_at: ts,
            });

          if (insErr) {
            console.error("Failed to insert inbound message", insErr);
          }
        }

        // ===== Status updates =====
        const statuses = change?.value?.statuses ?? [];
        for (const st of statuses) {
          const metaMessageId = st?.id;
          const status = st?.status; // sent | delivered | read | failed
          const timestamp = st?.timestamp
            ? new Date(Number(st.timestamp) * 1000).toISOString()
            : new Date().toISOString();

          if (!metaMessageId || !status) continue;

          const updateData: Record<string, unknown> = { status };
          if (status === "delivered") updateData.delivered_at = timestamp;
          if (status === "read") updateData.read_at = timestamp;
          if (status === "failed") {
            updateData.error =
              st?.errors?.[0]?.title ?? "Delivery failed";
          }

          const { error } = await admin
            .from("whatsapp_messages")
            .update(updateData)
            .eq("meta_message_id", metaMessageId);

          if (error) {
            console.error("Failed to update message status", error);
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("whatsapp-webhook error", e);
    return new Response(
      JSON.stringify({ error: String((e as Error)?.message ?? e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});