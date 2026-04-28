import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UnmatchedSale {
  id: string;
  pos_receipt_item_id: string | null;
  loyverse_item_id: string | null;
  item_name: string;
  quantity: number;
  reason: string;
  details: Record<string, unknown>;
  created_at: string;
}

export const useUnmatchedSales = (limit = 50) =>
  useQuery({
    queryKey: ["unmatched_sales", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unmatched_sales")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as UnmatchedSale[];
    },
  });

export const REASON_LABELS: Record<string, string> = {
  no_loyverse_id: "بدون معرّف Loyverse",
  product_not_found: "المنتج غير موجود",
  no_active_recipe: "لا توجد وصفة نشطة",
  missing_ingredient: "مكوّن ناقص في المخزون",
  error: "خطأ تقني",
};
