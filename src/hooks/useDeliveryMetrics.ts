import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Channel split assumption (until per-channel breakdown column exists)
const CHANNEL_SPLIT = {
  hungerstation: 0.6,
  keeta: 0.4,
} as const;

const AVG_COMMISSION = 0.22; // 22% blended
const AD_SPEND_RATIO = 0.04; // ~4% of revenue (matches reference card)
const COST_RATIO = 0.6; // food+ops cost ~60% of net revenue

export interface DeliveryMetrics {
  revenue: number;
  ordersCount: number;
  avgBasket: number;
  profitMargin: number;
  adSpend: number;
  roas: number;
  // previous period (for delta)
  prev: {
    revenue: number;
    ordersCount: number;
    avgBasket: number;
    profitMargin: number;
    adSpend: number;
    roas: number;
  };
  // per-channel revenue this period
  channels: { key: string; revenue: number; orders: number }[];
}

const monthRange = (offset = 0) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(start), to: fmt(end) };
};

export const useDeliveryMetrics = () =>
  useQuery({
    queryKey: ["delivery-metrics"],
    queryFn: async (): Promise<DeliveryMetrics> => {
      const cur = monthRange(0);
      const prev = monthRange(-1);

      const { data, error } = await supabase
        .from("daily_sales")
        .select("date, delivery_sales, orders_count")
        .gte("date", prev.from)
        .lte("date", cur.to);
      if (error) throw error;

      const aggregate = (from: string, to: string) => {
        const rows = (data ?? []).filter((r) => r.date >= from && r.date <= to);
        const revenue = rows.reduce((s, r) => s + Number(r.delivery_sales || 0), 0);
        // Approximate delivery orders share = delivery_sales / total — fall back to orders_count proportion
        const ordersCount = rows.reduce((s, r) => s + Number(r.orders_count || 0), 0);
        const avgBasket = ordersCount ? revenue / ordersCount : 0;
        const profitMargin = revenue * (1 - COST_RATIO);
        const adSpend = revenue * AD_SPEND_RATIO;
        const roas = adSpend ? revenue / adSpend : 0;
        return { revenue, ordersCount, avgBasket, profitMargin, adSpend, roas };
      };

      const current = aggregate(cur.from, cur.to);
      const previous = aggregate(prev.from, prev.to);

      const channels = [
        { key: "hungerstation", revenue: current.revenue * CHANNEL_SPLIT.hungerstation, orders: Math.round(current.ordersCount * CHANNEL_SPLIT.hungerstation) },
        { key: "keeta", revenue: current.revenue * CHANNEL_SPLIT.keeta, orders: Math.round(current.ordersCount * CHANNEL_SPLIT.keeta) },
      ];

      return { ...current, prev: previous, channels };
    },
  });
