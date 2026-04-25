import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const META_API_VERSION = "v21.0";

const BodySchema = z.object({
  to: z.string().min(8).max(20),
  message: z.string().min(1).max(4096),
  template_name: z.string().max(100).optional().nullable(),
  customer_id: z.string().uuid().optional().nullable(),
});

/** Normalize Saudi numbers to 9665XXXXXXXX format (no +). */
function normalizeSaudiPhone(raw: string): string | null {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;

  let national: string;
  if (digits.startsWith("00966")) national = digits.slice(5);
  else if (digits.startsWith("966")) national = digits.slice(3);
  else if (digits.startsWith("05")) national = digits.slice(1);
  else if (digits.startsWith("5") && digits.length === 9) national = digits;
  else return null;

  if (national.length !== 9 || !national.startsWith("5")) return null;
  return `966${national}`;
}

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
    // 1) Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } =
      await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub as string;

    // 2) Validate input
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        400,
      );
    }
    const { to, message, template_name, customer_id } = parsed.data;

    // 3) Normalize phone
    const normalized = normalizeSaudiPhone(to);
    if (!normalized) {
      return json(
        { error: "رقم الجوال غير صالح. يجب أن يكون رقم سعودي صحيح." },
        400,
      );
    }

    // 4) Check Meta secrets
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    if (!accessToken || !phoneNumberId) {
      return json(
        {
          error:
            "WhatsApp غير مهيأ. الرجاء إضافة WHATSAPP_ACCESS_TOKEN و WHATSAPP_PHONE_NUMBER_ID.",
        },
        500,
      );
    }

    // 5) Send via Meta Graph API
    const metaUrl = `https://graph.facebook.com/${META_API_VERSION}/${phoneNumberId}/messages`;
    const metaPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalized,
      type: "text",
      text: { preview_url: false, body: message },
    };

    const metaRes = await fetch(metaUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metaPayload),
    });

    const metaData = await metaRes.json();
    const admin = createClient(supabaseUrl, serviceKey);

    if (!metaRes.ok) {
      const errMsg =
        metaData?.error?.message ?? `Meta API error [${metaRes.status}]`;
      console.error("Meta API failed", metaRes.status, metaData);

      await admin.from("whatsapp_messages").insert({
        to_phone: normalized,
        body: message,
        template_name: template_name ?? null,
        customer_id: customer_id ?? null,
        sent_by: userId,
        status: "failed",
        error: errMsg,
      });

      return json(
        {
          success: false,
          error: errMsg,
          meta_error: metaData?.error ?? null,
        },
        502,
      );
    }

    const metaMessageId = metaData?.messages?.[0]?.id ?? null;

    // 6) Save success record
    const { data: saved, error: saveErr } = await admin
      .from("whatsapp_messages")
      .insert({
        to_phone: normalized,
        body: message,
        template_name: template_name ?? null,
        customer_id: customer_id ?? null,
        sent_by: userId,
        status: "sent",
        meta_message_id: metaMessageId,
      })
      .select()
      .single();

    if (saveErr) {
      console.error("DB insert error", saveErr);
    }

    return json({
      success: true,
      meta_message_id: metaMessageId,
      record_id: saved?.id ?? null,
      to: normalized,
    });
  } catch (e) {
    console.error("send-whatsapp-message error", e);
    return json(
      { success: false, error: String((e as Error)?.message ?? e) },
      500,
    );
  }
});