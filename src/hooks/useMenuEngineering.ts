import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MenuQuadrant = "star" | "plowhorse" | "puzzle" | "dog";

export interface MenuItem {
  product_id: string;
  name: string;
  category: string | null;
  loyverse_item_id: string | null;
  price: number;
  cost: number;
  units_sold: number;
  net_revenue: number;
  total_margin: number;
  margin_per_unit: number;
  margin_pct: number;
  popularity_index: number; // 0..1 vs avg
  profitability_index: number; // 0..1 vs avg
  quadrant: MenuQuadrant;
}

export interface MenuEngineeringResult {
  items: MenuItem[];
  avg_units: number;
  avg_margin: number;
  total_units: number;
  total_revenue: number;
  total_margin: number;
  period_days: number;
  date_from: string;
  date_to: string;
  counts: Record<MenuQuadrant, number>;
}

const QUADRANT_ORDER: MenuQuadrant[] = ["star", "plowhorse", "puzzle", "dog"];

export const useMenuEngineering = (days = 30) =>
  useQuery({
    queryKey: ["menu_engineering", days],
    queryFn: async (): Promise<MenuEngineeringResult> => {
      const dateTo = new Date();
      const dateFrom = new Date(Date.now() - days * 86400000);
      const fromStr = dateFrom.toISOString().slice(0, 10);
      const toStr = dateTo.toISOString().slice(0, 10);

      // 1) Active products
      const { data: products, error: pErr } = await supabase
        .from("products")
        .select("id,name,category,price,cost,loyverse_item_id,is_active")
        .eq("is_active", true);
      if (pErr) throw pErr;

      // 2) POS receipt items in window
      const { data: lines, error: lErr } = await supabase
        .from("pos_receipt_items")
        .select("loyverse_item_id,quantity,net_total,cost_total,receipt_date")
        .gte("receipt_date", fromStr)
        .lte("receipt_date", toStr)
        .not("loyverse_item_id", "is", null);
      if (lErr) throw lErr;

      // 3) Aggregate per loyverse_item_id
      const agg = new Map<string, { qty: number; net: number; cost: number }>();
      for (const l of lines ?? []) {
        const id = l.loyverse_item_id as string;
        const cur = agg.get(id) ?? { qty: 0, net: 0, cost: 0 };
        cur.qty += Number(l.quantity || 0);
        cur.net += Number(l.net_total || 0);
        cur.cost += Number(l.cost_total || 0);
        agg.set(id, cur);
      }

      // 4) Build items (only products with sales OR all? include all active)
      const items: MenuItem[] = (products ?? []).map((p) => {
        const a = (p.loyverse_item_id && agg.get(p.loyverse_item_id)) || { qty: 0, net: 0, cost: 0 };
        const price = Number(p.price);
        const cost = Number(p.cost);
        const units_sold = a.qty;
        const net_revenue = a.net;
        // total_margin: prefer derived from line totals (more accurate, matches POS reality)
        const total_margin = a.net - a.cost;
        const margin_per_unit = units_sold > 0 ? total_margin / units_sold : (price - cost);
        const margin_pct = price > 0 ? ((price - cost) / price) * 100 : 0;
        return {
          product_id: p.id,
          name: p.name,
          category: p.category,
          loyverse_item_id: p.loyverse_item_id,
          price,
          cost,
          units_sold,
          net_revenue,
          total_margin,
          margin_per_unit,
          margin_pct,
          popularity_index: 0,
          profitability_index: 0,
          quadrant: "dog" as MenuQuadrant,
        };
      });

      const sold = items.filter((i) => i.units_sold > 0);
      const total_units = sold.reduce((s, i) => s + i.units_sold, 0);
      const total_revenue = sold.reduce((s, i) => s + i.net_revenue, 0);
      const total_margin = sold.reduce((s, i) => s + i.total_margin, 0);
      const avg_units = sold.length ? total_units / sold.length : 0;
      const avg_margin = sold.length ? total_margin / sold.length : 0;

      for (const i of items) {
        i.popularity_index = avg_units > 0 ? i.units_sold / avg_units : 0;
        i.profitability_index = avg_margin > 0 ? i.total_margin / avg_margin : 0;
        const popHi = i.units_sold >= avg_units && avg_units > 0;
        const profHi = i.total_margin >= avg_margin && avg_margin > 0;
        if (popHi && profHi) i.quadrant = "star";
        else if (popHi && !profHi) i.quadrant = "plowhorse";
        else if (!popHi && profHi) i.quadrant = "puzzle";
        else i.quadrant = "dog";
      }

      const counts = QUADRANT_ORDER.reduce<Record<MenuQuadrant, number>>(
        (acc, q) => ({ ...acc, [q]: items.filter((i) => i.quadrant === q).length }),
        { star: 0, plowhorse: 0, puzzle: 0, dog: 0 }
      );

      return {
        items: items.sort((a, b) => b.total_margin - a.total_margin),
        avg_units,
        avg_margin,
        total_units,
        total_revenue,
        total_margin,
        period_days: days,
        date_from: fromStr,
        date_to: toStr,
        counts,
      };
    },
  });

export const QUADRANT_META: Record<MenuQuadrant, { label: string; emoji: string; color: string; description: string; action: string }> = {
  star: {
    label: "النجوم",
    emoji: "⭐",
    color: "hsl(142, 71%, 45%)", // forest green
    description: "شعبية عالية + ربحية عالية",
    action: "حافظ عليها واجعلها أبرز عناصر المنيو",
  },
  plowhorse: {
    label: "الجياد",
    emoji: "🐎",
    color: "hsl(38, 92%, 50%)", // amber
    description: "شعبية عالية + ربحية ضعيفة",
    action: "ارفع السعر تدريجياً أو خفّض التكلفة",
  },
  puzzle: {
    label: "الألغاز",
    emoji: "🧩",
    color: "hsl(217, 91%, 60%)", // blue
    description: "شعبية ضعيفة + ربحية عالية",
    action: "روّج لها أكثر — هامشها يستحق الاستثمار",
  },
  dog: {
    label: "الخاسرات",
    emoji: "🐕",
    color: "hsl(0, 70%, 55%)", // crimson
    description: "شعبية ضعيفة + ربحية ضعيفة",
    action: "فكّر في إزالتها أو إعادة تصميمها",
  },
};
