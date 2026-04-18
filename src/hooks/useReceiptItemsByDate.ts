import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AggregatedItem {
  item_name: string;
  quantity: number;
  net_total: number;
  share: number; // % of day net
}

export const useReceiptItemsByDate = (date: string | null) =>
  useQuery({
    queryKey: ["pos_receipt_items_agg", date],
    enabled: !!date,
    queryFn: async (): Promise<AggregatedItem[]> => {
      const { data, error } = await supabase
        .from("pos_receipt_items" as never)
        .select("item_name,quantity,net_total")
        .eq("receipt_date", date as string);
      if (error) throw error;
      const rows = (data ?? []) as Array<{ item_name: string; quantity: number; net_total: number }>;
      const map = new Map<string, { quantity: number; net_total: number }>();
      for (const r of rows) {
        const k = r.item_name || "غير معروف";
        const cur = map.get(k) ?? { quantity: 0, net_total: 0 };
        cur.quantity += Number(r.quantity || 0);
        cur.net_total += Number(r.net_total || 0);
        map.set(k, cur);
      }
      const totalNet = Array.from(map.values()).reduce((s, x) => s + x.net_total, 0) || 1;
      return Array.from(map.entries())
        .map(([item_name, v]) => ({
          item_name,
          quantity: v.quantity,
          net_total: v.net_total,
          share: (v.net_total / totalNet) * 100,
        }))
        .sort((a, b) => b.quantity - a.quantity);
    },
  });
