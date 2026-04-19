import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductMovementRow {
  item_name: string;
  quantity: number;
  net_total: number;
  cost_total: number;
  profit: number;
  margin: number;
}

export const useProductMovement = (days = 30) =>
  useQuery({
    queryKey: ["product_movement", days],
    queryFn: async (): Promise<ProductMovementRow[]> => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("pos_receipt_items")
        .select("item_name,quantity,net_total,cost_total")
        .gte("receipt_date", sinceStr);
      if (error) throw error;

      const map = new Map<string, { quantity: number; net_total: number; cost_total: number }>();
      for (const r of (data ?? []) as Array<{ item_name: string; quantity: number; net_total: number; cost_total: number }>) {
        const k = r.item_name || "غير معروف";
        const cur = map.get(k) ?? { quantity: 0, net_total: 0, cost_total: 0 };
        cur.quantity += Number(r.quantity || 0);
        cur.net_total += Number(r.net_total || 0);
        cur.cost_total += Number(r.cost_total || 0);
        map.set(k, cur);
      }
      return Array.from(map.entries())
        .map(([item_name, v]) => {
          const profit = v.net_total - v.cost_total;
          const margin = v.net_total > 0 ? (profit / v.net_total) * 100 : 0;
          return { item_name, ...v, profit, margin };
        })
        .sort((a, b) => b.quantity - a.quantity);
    },
  });
