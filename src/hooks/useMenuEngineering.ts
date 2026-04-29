import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Zap, Puzzle, TrendingDown, type LucideIcon } from "lucide-react";

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
  popularity_index: number;
  profitability_index: number;
  quadrant: MenuQuadrant;
  // comparison vs previous period
  prev_units_sold: number;
  prev_net_revenue: number;
  prev_total_margin: number;
  units_change_pct: number | null;
  margin_change_pct: number | null;
}

export interface MenuEngineeringResult {
  items: MenuItem[];
  avg_units: number;
  avg_margin: number;
  total_units: number;
  total_revenue: number;
  total_margin: number;
  prev_total_revenue: number;
  prev_total_margin: number;
  prev_total_units: number;
  revenue_change_pct: number | null;
  margin_change_pct: number | null;
  units_change_pct: number | null;
  period_days: number;
  date_from: string;
  date_to: string;
  prev_date_from: string;
  prev_date_to: string;
  counts: Record<MenuQuadrant, number>;
}

const QUADRANT_ORDER: MenuQuadrant[] = ["star", "plowhorse", "puzzle", "dog"];

const pct = (cur: number, prev: number): number | null => {
  if (!prev || prev === 0) return cur > 0 ? 100 : null;
  return ((cur - prev) / Math.abs(prev)) * 100;
};

async function fetchLines(fromStr: string, toStr: string) {
  const { data, error } = await supabase
    .from("pos_receipt_items")
    .select("loyverse_item_id,quantity,net_total,cost_total,receipt_date")
    .gte("receipt_date", fromStr)
    .lte("receipt_date", toStr)
    .not("loyverse_item_id", "is", null);
  if (error) throw error;
  return data ?? [];
}

function aggregate(lines: { loyverse_item_id: string | null; quantity: number; net_total: number; cost_total: number }[]) {
  const agg = new Map<string, { qty: number; net: number; cost: number }>();
  for (const l of lines) {
    const id = l.loyverse_item_id as string;
    const cur = agg.get(id) ?? { qty: 0, net: 0, cost: 0 };
    cur.qty += Number(l.quantity || 0);
    cur.net += Number(l.net_total || 0);
    cur.cost += Number(l.cost_total || 0);
    agg.set(id, cur);
  }
  return agg;
}

export const useMenuEngineering = (days = 30) => {
  const qc = useQueryClient();

  // Realtime: refresh on any new POS line
  useEffect(() => {
    const ch = supabase
      .channel("menu_eng_pos_items")
      .on("postgres_changes", { event: "*", schema: "public", table: "pos_receipt_items" }, () => {
        qc.invalidateQueries({ queryKey: ["menu_engineering"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["menu_engineering", days],
    refetchInterval: 120_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<MenuEngineeringResult> => {
      const now = Date.now();
      const dayMs = 86_400_000;
      const dateTo = new Date(now);
      const dateFrom = new Date(now - days * dayMs);
      const prevDateTo = new Date(now - days * dayMs - 1);
      const prevDateFrom = new Date(now - 2 * days * dayMs);

      const fromStr = dateFrom.toISOString().slice(0, 10);
      const toStr = dateTo.toISOString().slice(0, 10);
      const prevFromStr = prevDateFrom.toISOString().slice(0, 10);
      const prevToStr = prevDateTo.toISOString().slice(0, 10);

      const [{ data: products, error: pErr }, curLines, prevLines] = await Promise.all([
        supabase.from("products").select("id,name,category,price,cost,loyverse_item_id,is_active").eq("is_active", true),
        fetchLines(fromStr, toStr),
        fetchLines(prevFromStr, prevToStr),
      ]);
      if (pErr) throw pErr;

      const aggCur = aggregate(curLines);
      const aggPrev = aggregate(prevLines);

      const items: MenuItem[] = (products ?? []).map((p) => {
        const a = (p.loyverse_item_id && aggCur.get(p.loyverse_item_id)) || { qty: 0, net: 0, cost: 0 };
        const pv = (p.loyverse_item_id && aggPrev.get(p.loyverse_item_id)) || { qty: 0, net: 0, cost: 0 };
        const price = Number(p.price);
        const cost = Number(p.cost);
        const units_sold = a.qty;
        const net_revenue = a.net;
        const total_margin = a.net - a.cost;
        const prev_total_margin = pv.net - pv.cost;
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
          prev_units_sold: pv.qty,
          prev_net_revenue: pv.net,
          prev_total_margin,
          units_change_pct: pct(units_sold, pv.qty),
          margin_change_pct: pct(total_margin, prev_total_margin),
        };
      });

      const sold = items.filter((i) => i.units_sold > 0);
      const total_units = sold.reduce((s, i) => s + i.units_sold, 0);
      const total_revenue = sold.reduce((s, i) => s + i.net_revenue, 0);
      const total_margin = sold.reduce((s, i) => s + i.total_margin, 0);
      const avg_units = sold.length ? total_units / sold.length : 0;
      const avg_margin = sold.length ? total_margin / sold.length : 0;

      const prev_total_units = items.reduce((s, i) => s + i.prev_units_sold, 0);
      const prev_total_revenue = items.reduce((s, i) => s + i.prev_net_revenue, 0);
      const prev_total_margin = items.reduce((s, i) => s + i.prev_total_margin, 0);

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
        prev_total_revenue,
        prev_total_margin,
        prev_total_units,
        revenue_change_pct: pct(total_revenue, prev_total_revenue),
        margin_change_pct: pct(total_margin, prev_total_margin),
        units_change_pct: pct(total_units, prev_total_units),
        period_days: days,
        date_from: fromStr,
        date_to: toStr,
        prev_date_from: prevFromStr,
        prev_date_to: prevToStr,
        counts,
      };
    },
  });
};

export const QUADRANT_META: Record<MenuQuadrant, { label: string; icon: LucideIcon; color: string; description: string; action: string }> = {
  star: {
    label: "النجوم",
    icon: Star,
    color: "hsl(142, 71%, 45%)",
    description: "شعبية عالية + ربحية عالية",
    action: "حافظ عليها واجعلها أبرز عناصر المنيو",
  },
  plowhorse: {
    label: "الجياد",
    icon: Zap,
    color: "hsl(38, 92%, 50%)",
    description: "شعبية عالية + ربحية ضعيفة",
    action: "ارفع السعر تدريجياً أو خفّض التكلفة",
  },
  puzzle: {
    label: "الألغاز",
    icon: Puzzle,
    color: "hsl(217, 91%, 60%)",
    description: "شعبية ضعيفة + ربحية عالية",
    action: "روّج لها أكثر — هامشها يستحق الاستثمار",
  },
  dog: {
    label: "الخاسرات",
    icon: TrendingDown,
    color: "hsl(0, 70%, 55%)",
    description: "شعبية ضعيفة + ربحية ضعيفة",
    action: "فكّر في إزالتها أو إعادة تصميمها",
  },
};
