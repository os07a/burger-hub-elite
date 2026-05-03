import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvokeBody {
  media_id: string;
  from_phone: string;
  message_id: string;
  caption?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const startTime = Date.now();
  let intakeId: string | null = null;
  let admin: ReturnType<typeof createClient> | null = null;

  try {
    const body = (await req.json()) as InvokeBody;
    if (!body?.media_id || !body?.from_phone) {
      return json({ error: "media_id and from_phone are required" }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const WA_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN")!;
    const WA_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

    if (!WA_TOKEN || !WA_PHONE_ID || !LOVABLE_API_KEY) {
      return json({ error: "Missing required env vars" }, 500);
    }

    admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 0) Create intake tracking row (status = processing)
    const { data: intakeRow } = await admin
      .from("whatsapp_invoice_intake")
      .insert({
        from_phone: body.from_phone,
        meta_message_id: body.message_id,
        media_id: body.media_id,
        caption: body.caption ?? null,
        status: "processing",
      })
      .select("id")
      .single();
    intakeId = intakeRow?.id ?? null;

    // 1) Resolve media URL from Meta
    const mediaMetaRes = await fetch(`https://graph.facebook.com/v20.0/${body.media_id}`, {
      headers: { Authorization: `Bearer ${WA_TOKEN}` },
    });
    if (!mediaMetaRes.ok) {
      const t = await mediaMetaRes.text();
      console.error("media meta failed", t);
      await markIntake(admin, intakeId, "failed", { error_message: `media meta failed: ${t.slice(0, 300)}`, processing_time_ms: Date.now() - startTime });
      return json({ error: "media meta failed", details: t }, 502);
    }
    const mediaMeta = await mediaMetaRes.json();
    const mediaUrl: string = mediaMeta.url;
    const mimeType: string = mediaMeta.mime_type ?? "image/jpeg";

    // 2) Download binary
    const binRes = await fetch(mediaUrl, { headers: { Authorization: `Bearer ${WA_TOKEN}` } });
    if (!binRes.ok) {
      await markIntake(admin, intakeId, "failed", { error_message: "media download failed", processing_time_ms: Date.now() - startTime });
      return json({ error: "media download failed" }, 502);
    }
    const bytes = new Uint8Array(await binRes.arrayBuffer());

    // 3) Upload to invoice-images bucket
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const filePath = `whatsapp/${new Date().toISOString().slice(0, 10)}/${body.message_id}.${ext}`;
    const { error: upErr } = await admin.storage.from("invoice-images").upload(filePath, bytes, {
      contentType: mimeType,
      upsert: true,
    });
    if (upErr) {
      console.error("upload failed", upErr);
      await markIntake(admin, intakeId, "failed", { error_message: `upload failed: ${upErr.message}`, processing_time_ms: Date.now() - startTime });
      return json({ error: "upload failed", details: upErr.message }, 500);
    }
    await markIntake(admin, intakeId, "processing", { image_url: filePath });

    // 4) Call Lovable AI to extract invoice fields (vision via image_url with base64)
    const base64 = btoa(String.fromCharCode(...bytes));
    const dataUri = `data:${mimeType};base64,${base64}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "أنت مساعد محاسبة لمطعم برجر هام. تستخرج بيانات الفواتير من صور WhatsApp. أرجع البيانات حصراً عبر الأداة extract_invoice. الأرقام بصيغة عشرية بدون فواصل. التواريخ بصيغة YYYY-MM-DD.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: `استخرج بيانات هذه الفاتورة. التعليق المرفق: ${body.caption ?? "(لا يوجد)"}` },
              { type: "image_url", image_url: { url: dataUri } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_invoice",
              description: "Extract invoice data from a supplier invoice image",
              parameters: {
                type: "object",
                properties: {
                  supplier_name: { type: "string", description: "اسم المورد كما يظهر في الفاتورة" },
                  invoice_number: { type: "string", description: "رقم الفاتورة" },
                  amount: { type: "number", description: "الإجمالي شامل الضريبة بالريال" },
                  date: { type: "string", description: "تاريخ الفاتورة YYYY-MM-DD" },
                  category: {
                    type: "string",
                    enum: ["خضار", "لحوم", "ألبان", "مشروبات", "أصول", "تعبئة", "أخرى"],
                    description: "تصنيف المورد",
                  },
                  confidence: { type: "number", description: "ثقة الاستخراج 0-1" },
                  notes: { type: "string", description: "أي ملاحظات إضافية" },
                },
                required: ["amount", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_invoice" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI extraction failed", aiRes.status, t);
      // Save invoice as needs_review with no extraction
      const { data: failedInv } = await admin.from("invoices").insert({
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
        status: "معلقة",
        notes: `فشل تحليل AI: ${t.slice(0, 200)}`,
        image_url: filePath,
        source: "whatsapp",
        needs_review: true,
        whatsapp_from: body.from_phone,
      }).select("id").single();
      await markIntake(admin, intakeId, "failed", {
        error_message: `AI extraction failed (${aiRes.status}): ${t.slice(0, 200)}`,
        invoice_id: failedInv?.id ?? null,
        image_url: filePath,
        processing_time_ms: Date.now() - startTime,
      });
      await sendWa(WA_TOKEN, WA_PHONE_ID, body.from_phone, "📄 وصلت الصورة وحفظناها، لكن تعذر التحليل التلقائي. تمت إضافتها لقائمة المراجعة.");
      return json({ ok: true, needs_review: true });
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    let extracted: Record<string, unknown> = {};
    try {
      extracted = JSON.parse(toolCall?.function?.arguments ?? "{}");
    } catch (e) {
      console.error("parse extracted failed", e);
    }

    const supplierName = (extracted.supplier_name as string | undefined)?.trim();
    const invoiceNumber = (extracted.invoice_number as string | undefined)?.trim();
    const amount = Number(extracted.amount) || 0;
    const dateStr = (extracted.date as string | undefined) ?? new Date().toISOString().slice(0, 10);
    const category = (extracted.category as string | undefined) ?? "أخرى";
    const confidence = Number(extracted.confidence) || 0;

    // 5) Auto-create supplier if needed
    let supplierId: string | null = null;
    if (supplierName && supplierName.length > 1) {
      const { data: existing } = await admin
        .from("suppliers")
        .select("id, name")
        .ilike("name", supplierName)
        .maybeSingle();
      if (existing) {
        supplierId = existing.id;
      } else {
        const { data: newSup, error: supErr } = await admin
          .from("suppliers")
          .insert({ name: supplierName, category, notes: "أُضيف تلقائياً من واتساب" })
          .select("id")
          .single();
        if (!supErr && newSup) supplierId = newSup.id;
      }
    }

    // 6) Insert invoice (needs_review = true always for AI-imported)
    const { data: invRow, error: invErr } = await admin.from("invoices").insert({
      supplier_id: supplierId,
      supplier_name: supplierName ?? null,
      invoice_number: invoiceNumber ?? null,
      amount,
      date: dateStr,
      status: "معلقة",
      notes: (extracted.notes as string | undefined) ?? body.caption ?? null,
      image_url: filePath,
      source: "whatsapp",
      needs_review: true,
      whatsapp_from: body.from_phone,
      ai_extracted: extracted,
    }).select("id").single();

    if (invErr) {
      console.error("invoice insert failed", invErr);
      await markIntake(admin, intakeId, "failed", {
        error_message: `invoice insert failed: ${invErr.message}`,
        supplier_name: supplierName ?? null,
        amount,
        image_url: filePath,
        processing_time_ms: Date.now() - startTime,
      });
      return json({ error: "invoice insert failed", details: invErr.message }, 500);
    }

    // Mark intake as success
    await markIntake(admin, intakeId, "success", {
      invoice_id: invRow?.id ?? null,
      supplier_name: supplierName ?? null,
      amount,
      image_url: filePath,
      processing_time_ms: Date.now() - startTime,
    });

    // 7) WhatsApp confirmation reply
    const confEmoji = confidence >= 0.8 ? "✅" : "⚠️";
    const reply =
      `${confEmoji} تم حفظ الفاتورة\n` +
      `🏷️ المورد: ${supplierName ?? "غير محدد"}\n` +
      `💰 المبلغ: ${amount.toFixed(2)} ر.س\n` +
      `📅 التاريخ: ${dateStr}\n` +
      `📂 التصنيف: ${category}\n` +
      (confidence < 0.8 ? "\n⚠️ تحتاج مراجعة في الأرشيف" : "");
    await sendWa(WA_TOKEN, WA_PHONE_ID, body.from_phone, reply);

    return json({ ok: true, supplier_id: supplierId, amount, confidence });
  } catch (e) {
    console.error("process-whatsapp-invoice error", e);
    if (admin && intakeId) {
      await markIntake(admin, intakeId, "failed", {
        error_message: String((e as Error)?.message ?? e).slice(0, 500),
        processing_time_ms: Date.now() - startTime,
      });
    }
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

async function markIntake(
  admin: ReturnType<typeof createClient>,
  id: string | null,
  status: string,
  patch: Record<string, unknown>,
) {
  if (!id) return;
  try {
    await admin.from("whatsapp_invoice_intake").update({ status, ...patch }).eq("id", id);
  } catch (e) {
    console.error("markIntake failed", e);
  }
}

async function sendWa(token: string, phoneId: string, to: string, text: string) {
  try {
    await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });
  } catch (e) {
    console.error("sendWa failed", e);
  }
}
