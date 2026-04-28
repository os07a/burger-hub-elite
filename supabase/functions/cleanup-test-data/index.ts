import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results: Record<string, unknown> = {};

  // 3) رد الكميات
  const items = [
    { id: "b68a7bdc-ac4f-4364-8016-113e599ee06f", delta: 0.3675 },
    { id: "b748bd2f-bdc2-4e57-83a7-67141d58f2fb", delta: 3 },
    { id: "c51a08f8-bf13-4acc-94f9-b1d5794d8dae", delta: 0.05 },
    { id: "903fcf02-8120-4396-82e3-804044004265", delta: 0.03 },
  ];
  for (const it of items) {
    const { data: cur } = await supabase.from("inventory_items").select("quantity").eq("id", it.id).maybeSingle();
    if (cur) {
      await supabase.from("inventory_items").update({ quantity: Number(cur.quantity) + it.delta, updated_at: new Date().toISOString() }).eq("id", it.id);
    }
  }
  results.step3_quantity_restored = true;

  // 4) حذف unmatched_sales
  const { error: e4, count: c4 } = await supabase
    .from("unmatched_sales")
    .delete({ count: "exact" })
    .in("id", [
      "e1e3d9a7-e3f5-4603-b334-a1d3df5439e9",
      "5d1572c5-796b-49d4-8e2b-95865362828c",
      "4e956321-140c-4952-b0b8-cb3448a8dedb",
    ]);
  results.step4_unmatched_deleted = { count: c4, error: e4?.message };

  // 5) إقفال الوصفات
  const { error: e5, count: c5 } = await supabase
    .from("product_recipes")
    .update({ valid_to: new Date().toISOString() }, { count: "exact" })
    .is("valid_to", null)
    .in("product_id", [
      "73de83be-9bf2-4c0b-83c4-4e096f4eb40f",
      "d7aab97d-c9ec-4897-b92f-448f2c923e78",
      "3a3fe7f6-c2a9-485c-ba72-915658178933",
    ]);
  results.step5_recipes_closed = { count: c5, error: e5?.message };

  // 7) أرشفة المنتجات
  const { error: e7, count: c7 } = await supabase
    .from("products")
    .update({ is_active: false, updated_at: new Date().toISOString() }, { count: "exact" })
    .in("loyverse_item_id", ["TEST-001", "TEST-NORMAL", "TEST-NORECIPE"]);
  results.step7_products_archived = { count: c7, error: e7?.message };

  // 8) حذف مكوّن الجبنة
  const { error: e8, count: c8 } = await supabase
    .from("inventory_items")
    .delete({ count: "exact" })
    .eq("id", "903fcf02-8120-4396-82e3-804044004265");
  results.step8_cheese_deleted = { count: c8, error: e8?.message };

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
