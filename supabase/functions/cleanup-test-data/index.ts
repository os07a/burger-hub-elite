import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // إعادة تسمية مكوّن الجبنة (أرشفة) لأن FK يمنع الحذف
  const { data, error } = await supabase
    .from("inventory_items")
    .update({
      name: "[مؤرشف] جبنة موزاريلا (اختبار)",
      min_quantity: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "903fcf02-8120-4396-82e3-804044004265")
    .select();

  return new Response(JSON.stringify({ updated: data, error: error?.message }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
