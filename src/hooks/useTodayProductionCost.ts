import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// تكلفة الإنتاج اليومية = مجموع تكلفة المكوّنات المخصومة من حركات البيع اليوم
export const useTodayProductionCost = () =>
  useQuery({
    queryKey: ["today_production_cost"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("inventory_movements")
        .select("quantity, cost_at_movement")
        .eq("movement_type", "sale")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (error) throw error;

      let total = 0;
      let count = 0;
      for (const row of data ?? []) {
        // quantity is negative for sales (deductions)
        total += Math.abs(Number(row.quantity)) * Number(row.cost_at_movement);
        count += 1;
      }
      return { total, movementsCount: count };
    },
  });
