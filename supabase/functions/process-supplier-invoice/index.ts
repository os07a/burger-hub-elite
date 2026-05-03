import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Source = "camera" | "upload" | "whatsapp" | "zatca_qr";

interface InvokeBody {
  source: Source;
  image_base64?: string;            // for camera/upload (data URI or raw base64)
  image_url?: string;               // existing storage path (whatsapp wrapper passes this)
  mime_type?: string;
  zatca_qr_data?: string;           // raw base64 of TLV
  zatca_parsed?: {
    sellerName: string;
    vatNumber: string;
    timestamp: string;
    total: number;
    vat: number;
  };
  from_phone?: string;
  message_id?: string;
  caption?: string;
}

interface LineItem {
  name: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  total: number;
}

interface Extracted {
  supplier_name?: string;
  supplier_tax_number?: string;
  invoice_number?: string;
  date?: string;
  subtotal?: number;
  vat_amount?: number;
  discount?: number;
  total: number;
  category?: string;
  line_items?: LineItem[];
  confidence: number;
  notes?: string;
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
    if (!body?.source) return json({ error: "source is required" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

    admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 0) intake row
    const { data: intakeRow } = await admin
      .from("whatsapp_invoice_intake")
      .insert({
        source: body.source,
        from_phone: body.from_phone ?? null,
        meta_message_id: body.message_id ?? null,
        media_id: body.message_id ?? `${body.source}-${Date.now()}`,
        caption: body.caption ?? null,
        status: "processing",
      })
      .select("id")
      .single();
    intakeId = (intakeRow as { id: string } | null)?.id ?? null;

    // 1) Resolve image bytes (if any) and store
    let imagePath: string | null = body.image_url ?? null;
    let imageBytes: Uint8Array | null = null;
    let mimeType = body.mime_type ?? "image/jpeg";

    if (body.image_base64) {
      const cleaned = body.image_base64.replace(/^data:[^;]+;base64,/, "");
      const matchMime = body.image_base64.match(/^data:([^;]+);base64,/);
      if (matchMime) mimeType = matchMime[1];
      const bin = atob(cleaned);
      imageBytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) imageBytes[i] = bin.charCodeAt(i);

      const ext = mimeType.includes("png") ? "png" : mimeType.includes("pdf") ? "pdf" : "jpg";
      imagePath = `${body.source}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await admin.storage.from("invoice-images").upload(imagePath, imageBytes, {
        contentType: mimeType,
        upsert: false,
      });
      if (upErr) {
        await markIntake(admin, intakeId, "failed", { error_message: `upload: ${upErr.message}`, processing_time_ms: Date.now() - startTime });
        return json({ error: upErr.message }, 500);
      }
    }

    // 2) Build extracted data depending on source
    let extracted: Extracted = { total: 0, confidence: 0 };

    if (body.source === "zatca_qr" && body.zatca_parsed) {
      const z = body.zatca_parsed;
      extracted = {
        supplier_name: z.sellerName,
        supplier_tax_number: z.vatNumber,
        date: z.timestamp ? z.timestamp.slice(0, 10) : new Date().toISOString().slice(0, 10),
        total: z.total,
        vat_amount: z.vat,
        subtotal: Math.max(0, z.total - z.vat),
        confidence: 1.0, // QR is authoritative
        line_items: [],
      };
    } else if (imageBytes) {
      // 3) Use Lovable AI Vision
      const base64 = arrayBufferToBase64(imageBytes);
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
                "أنت مساعد محاسبة لمطعم برجر هام. تستخرج بيانات الفواتير من الصور. أرجع البيانات حصراً عبر الأداة extract_invoice. الأرقام عشرية بدون فواصل. التواريخ YYYY-MM-DD. لو لم تجد قيمة استخدم 0 أو string فارغة.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: `استخرج بيانات هذه الفاتورة بدقة. التعليق المرفق: ${body.caption ?? "(لا يوجد)"}` },
                { type: "image_url", image_url: { url: dataUri } },
              ],
            },
          ],
          tools: [extractInvoiceTool],
          tool_choice: { type: "function", function: { name: "extract_invoice" } },
        }),
      });

      if (!aiRes.ok) {
        const t = await aiRes.text();
        await markIntake(admin, intakeId, "failed", {
          error_message: `AI ${aiRes.status}: ${t.slice(0, 200)}`,
          image_url: imagePath,
          processing_time_ms: Date.now() - startTime,
        });
        return json({ error: "AI extraction failed", status: aiRes.status, details: t }, aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 502);
      }
      const aiJson = await aiRes.json();
      const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
      try {
        const args = JSON.parse(toolCall?.function?.arguments ?? "{}");
        extracted = {
          supplier_name: (args.supplier_name ?? "").trim() || undefined,
          supplier_tax_number: (args.supplier_tax_number ?? "").trim() || undefined,
          invoice_number: (args.invoice_number ?? "").trim() || undefined,
          date: args.date || new Date().toISOString().slice(0, 10),
          subtotal: Number(args.subtotal) || 0,
          vat_amount: Number(args.vat_amount) || 0,
          discount: Number(args.discount) || 0,
          total: Number(args.total) || 0,
          category: args.category || "أخرى",
          line_items: Array.isArray(args.line_items) ? args.line_items : [],
          confidence: Number(args.confidence) || 0,
          notes: args.notes,
        };
      } catch {
        extracted = { total: 0, confidence: 0 };
      }
    } else {
      await markIntake(admin, intakeId, "failed", { error_message: "no image and no zatca data", processing_time_ms: Date.now() - startTime });
      return json({ error: "Provide image_base64, image_url, or zatca_qr_data" }, 400);
    }

    // 4) Match or create supplier
    let supplierId: string | null = null;
    if (extracted.supplier_name && extracted.supplier_name.length > 1) {
      const name = extracted.supplier_name;
      const tax = extracted.supplier_tax_number;

      // Try by tax number first (most reliable)
      if (tax) {
        const { data: byTax } = await admin
          .from("suppliers")
          .select("id")
          .eq("tax_number", tax)
          .maybeSingle();
        if (byTax) supplierId = (byTax as { id: string }).id;
      }

      // Fallback: by name (case-insensitive)
      if (!supplierId) {
        const { data: byName } = await admin
          .from("suppliers")
          .select("id")
          .ilike("name", name)
          .maybeSingle();
        if (byName) supplierId = (byName as { id: string }).id;
      }

      // Create new
      if (!supplierId) {
        const { data: newSup } = await admin
          .from("suppliers")
          .insert({
            name,
            tax_number: tax ?? null,
            category: extracted.category ?? "أخرى",
            notes: `أُضيف تلقائياً من ${body.source}`,
          })
          .select("id")
          .single();
        supplierId = (newSup as { id: string } | null)?.id ?? null;
      }

      // Update last_invoice_at
      if (supplierId) {
        await admin.from("suppliers").update({ last_invoice_at: new Date().toISOString() }).eq("id", supplierId);
      }
    }

    // 5) Insert invoice
    const needsReview = extracted.confidence < 0.6 || extracted.total === 0;
    const { data: invRow, error: invErr } = await admin
      .from("invoices")
      .insert({
        supplier_id: supplierId,
        supplier_name: extracted.supplier_name ?? null,
        invoice_number: extracted.invoice_number ?? null,
        amount: extracted.total,
        subtotal: extracted.subtotal ?? 0,
        vat_amount: extracted.vat_amount ?? 0,
        discount: extracted.discount ?? 0,
        date: extracted.date ?? new Date().toISOString().slice(0, 10),
        status: "معلقة",
        notes: extracted.notes ?? body.caption ?? null,
        image_url: imagePath,
        source: body.source,
        confidence_score: extracted.confidence,
        needs_review: needsReview,
        whatsapp_from: body.from_phone ?? null,
        ai_extracted: extracted as unknown as Record<string, unknown>,
      })
      .select("id")
      .single();

    if (invErr) {
      await markIntake(admin, intakeId, "failed", {
        error_message: `invoice insert: ${invErr.message}`,
        supplier_name: extracted.supplier_name ?? null,
        amount: extracted.total,
        image_url: imagePath,
        processing_time_ms: Date.now() - startTime,
      });
      return json({ error: invErr.message }, 500);
    }

    const invoiceId = (invRow as { id: string }).id;

    // 6) Insert line items + match inventory
    if (extracted.line_items && extracted.line_items.length > 0) {
      const { data: invItems } = await admin.from("inventory_items").select("id, name");
      const inventoryList = (invItems as { id: string; name: string }[] | null) ?? [];

      const rows = extracted.line_items.map((li) => {
        const matched = findFuzzyMatch(li.name, inventoryList);
        return {
          invoice_id: invoiceId,
          item_name: li.name,
          quantity: Number(li.quantity) || 1,
          unit: li.unit ?? null,
          unit_price: Number(li.unit_price) || 0,
          total: Number(li.total) || 0,
          inventory_item_id: matched?.id ?? null,
          matched_automatically: Boolean(matched),
        };
      });
      if (rows.length > 0) await admin.from("invoice_line_items").insert(rows);
    }

    // 7) Mark intake success
    await markIntake(admin, intakeId, "success", {
      invoice_id: invoiceId,
      supplier_name: extracted.supplier_name ?? null,
      amount: extracted.total,
      image_url: imagePath,
      processing_time_ms: Date.now() - startTime,
    });

    return json({
      ok: true,
      invoice_id: invoiceId,
      supplier_id: supplierId,
      supplier_name: extracted.supplier_name,
      amount: extracted.total,
      confidence: extracted.confidence,
      needs_review: needsReview,
      line_items_count: extracted.line_items?.length ?? 0,
    });
  } catch (e) {
    console.error("process-supplier-invoice error", e);
    if (admin && intakeId) {
      await markIntake(admin, intakeId, "failed", {
        error_message: String((e as Error)?.message ?? e).slice(0, 500),
        processing_time_ms: Date.now() - startTime,
      });
    }
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

const extractInvoiceTool = {
  type: "function",
  function: {
    name: "extract_invoice",
    description: "Extract structured supplier invoice data from an image",
    parameters: {
      type: "object",
      properties: {
        supplier_name: { type: "string", description: "اسم المورد كما يظهر في الفاتورة" },
        supplier_tax_number: { type: "string", description: "الرقم الضريبي للمورد (15 خانة)" },
        invoice_number: { type: "string", description: "رقم الفاتورة" },
        date: { type: "string", description: "تاريخ الفاتورة YYYY-MM-DD" },
        subtotal: { type: "number", description: "المجموع قبل الضريبة" },
        vat_amount: { type: "number", description: "قيمة الضريبة (15%)" },
        discount: { type: "number", description: "الخصم إن وجد" },
        total: { type: "number", description: "الإجمالي شامل الضريبة" },
        category: {
          type: "string",
          enum: ["خضار", "لحوم", "ألبان", "مشروبات", "أصول", "تعبئة", "أخرى"],
        },
        line_items: {
          type: "array",
          description: "كل صنف في الفاتورة على حدة",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              quantity: { type: "number" },
              unit: { type: "string" },
              unit_price: { type: "number" },
              total: { type: "number" },
            },
            required: ["name", "quantity", "total"],
            additionalProperties: false,
          },
        },
        confidence: { type: "number", description: "ثقة الاستخراج 0-1" },
        notes: { type: "string" },
      },
      required: ["total", "confidence"],
      additionalProperties: false,
    },
  },
};

function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function normalizeArabic(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, "") // diacritics
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function findFuzzyMatch(itemName: string, list: { id: string; name: string }[]): { id: string; name: string } | null {
  const target = normalizeArabic(itemName);
  if (!target) return null;
  for (const inv of list) {
    const candidate = normalizeArabic(inv.name);
    if (candidate === target) return inv;
    if (candidate.includes(target) || target.includes(candidate)) {
      const ratio = Math.min(candidate.length, target.length) / Math.max(candidate.length, target.length);
      if (ratio >= 0.6) return inv;
    }
  }
  return null;
}

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