import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `أنت خبير في قراءة الوثائق الرسمية السعودية (الإقامة، الهوية، الشهادات الصحية، العقود).
استخرج البيانات من الصورة وأرجعها عبر الأداة. اقرأ الأرقام العربية والإنجليزية بدقة.
- doc_type: نوع الوثيقة (iqama / health / contract / other)
- label: اسم الوثيقة بالعربي (مثل "إقامة", "شهادة صحية")
- doc_number: رقم الهوية / الإقامة / الوثيقة (10 أرقام عادة)
- holder_name: اسم صاحب الوثيقة بالعربي
- issue_date: تاريخ الإصدار بصيغة "DD شهر YYYY" بالعربي (مثل "12 مارس 2025")
- expiry_date: تاريخ الانتهاء بنفس الصيغة
- status_variant: success إذا سارية لأكثر من 60 يوم، warning إذا تنتهي خلال 60 يوم، danger إذا منتهية
- status_text: نص يصف المتبقي (مثل "باقي 11 شهر" أو "منتهية منذ شهر")
استخدم تاريخ اليوم: ${new Date().toISOString().slice(0, 10)} للحساب.
إذا الحقل غير واضح، أرجع سلسلة فارغة "".`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "استخرج بيانات هذه الوثيقة" },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_document",
              description: "Return extracted document fields",
              parameters: {
                type: "object",
                properties: {
                  doc_type: { type: "string", enum: ["iqama", "health", "contract", "other"] },
                  label: { type: "string" },
                  doc_number: { type: "string" },
                  holder_name: { type: "string" },
                  issue_date: { type: "string" },
                  expiry_date: { type: "string" },
                  status_variant: { type: "string", enum: ["success", "warning", "danger"] },
                  status_text: { type: "string" },
                },
                required: ["doc_type", "label", "status_variant", "status_text"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_document" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "نفذ رصيد Lovable AI، يرجى إضافة رصيد" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "فشل تحليل الصورة" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "لم يتم استخراج أي بيانات" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-iqama-data error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
