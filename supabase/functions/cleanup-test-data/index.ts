import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const rows = [
    { inventory_item_id: "b68a7bdc-ac4f-4364-8016-113e599ee06f", movement_type: "adjustment", quantity: 0.3675, cost_at_movement: 42, notes: "تصحيح بيانات اختبار - عكس حركة بيع تجريبية 2026-04-28" },
    { inventory_item_id: "b748bd2f-bdc2-4e57-83a7-67141d58f2fb", movement_type: "adjustment", quantity: 3,      cost_at_movement: 0.22, notes: "تصحيح بيانات اختبار - عكس حركة بيع تجريبية 2026-04-28" },
    { inventory_item_id: "c51a08f8-bf13-4acc-94f9-b1d5794d8dae", movement_type: "adjustment", quantity: 0.05,   cost_at_movement: 14, notes: "تصحيح بيانات اختبار - عكس حركة بيع تجريبية 2026-04-28" },
    { inventory_item_id: "903fcf02-8120-4396-82e3-804044004265", movement_type: "adjustment", quantity: 0.03,   cost_at_movement: 30, notes: "تصحيح بيانات اختبار - عكس حركة بيع تجريبية 2026-04-28" },
  ];
  const { data, error, count } = await supabase.from("inventory_movements").insert(rows).select();
  return new Response(JSON.stringify({ inserted_count: data?.length ?? count, error: error?.message }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
