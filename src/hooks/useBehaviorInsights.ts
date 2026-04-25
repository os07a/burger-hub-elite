import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ARABIC_WEEKDAY_NAMES } from "@/lib/format";

export interface BehaviorOptions {
  fromDate?: string;
  toDate?: string;
}

interface ReceiptRow {
  receipt_number: string;
  receipt_date: string;
  total: number;
  created_at_pos: string | null;
}
interface ItemRow {
  receipt_date: string;
  item_name: string;
  quantity: number;
  gross_total: number;
}

const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]; // 10ص → 9م
export const HOUR_LABELS = ["10ص", "11ص", "12م", "1م", "2م", "3م", "4م", "5م", "6م", "7م", "8م", "9م"];
// Riyadh order: Saturday → Friday
export const ORDERED_WEEKDAYS_INDEX = [6, 0, 1, 2, 3, 4, 5];
export const ORDERED_WEEKDAYS_LABEL = ORDERED_WEEKDAYS_INDEX.map((i) => ARABIC_WEEKDAY_NAMES[i]);

const parseLocalDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** Extract Riyadh hour from a UTC timestamp using Asia/Riyadh = UTC+3 (no DST). */
const riyadhHour = (iso: string | null): number | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return (d.getUTCHours() + 3) % 24;
};

export type ReadinessLevel = "insufficient" | "preliminary" | "ready";

export const useBehaviorInsights = ({ fromDate, toDate }: BehaviorOptions = {}) => {
  const query = useQuery({
    queryKey: ["behavior-insights", fromDate ?? null, toDate ?? null],
    queryFn: async () => {
      let receiptsQ = supabase
        .from("pos_receipts")
        .select("receipt_number,receipt_date,total,created_at_pos")
        .eq("receipt_type", "SALE")
        .order("receipt_date", { ascending: true })
        .limit(10000);
      let itemsQ = supabase
        .from("pos_receipt_items")
        .select("receipt_date,item_name,quantity,gross_total")
        .order("receipt_date", { ascending: true })
        .limit(20000);
      if (fromDate) { receiptsQ = receiptsQ.gte("receipt_date", fromDate); itemsQ = itemsQ.gte("receipt_date", fromDate); }
      if (toDate) { receiptsQ = receiptsQ.lte("receipt_date", toDate); itemsQ = itemsQ.lte("receipt_date", toDate); }
      const [{ data: receipts, error: e1 }, { data: items, error: e2 }] = await Promise.all([receiptsQ, itemsQ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return {
        receipts: (receipts ?? []) as ReceiptRow[],
        items: (items ?? []) as ItemRow[],
      };
    },
  });

  const computed = useMemo(() => {
    const receipts = query.data?.receipts ?? [];
    const items = query.data?.items ?? [];

    const distinctDates = Array.from(new Set(receipts.map((r) => r.receipt_date))).sort();
    const daysCount = distinctDates.length;
    const minDate = distinctDates[0];
    const maxDate = distinctDates[distinctDates.length - 1];

    // Item ranking
    const itemMap = new Map<string, { qty: number; gross: number }>();
    for (const it of items) {
      const cur = itemMap.get(it.item_name) ?? { qty: 0, gross: 0 };
      cur.qty += Number(it.quantity || 0);
      cur.gross += Number(it.gross_total || 0);
      itemMap.set(it.item_name, cur);
    }
    const totalQty = Array.from(itemMap.values()).reduce((s, v) => s + v.qty, 0);
    const itemRanking = Array.from(itemMap.entries())
      .map(([name, v]) => ({
        name,
        qty: v.qty,
        gross: v.gross,
        pct: totalQty ? (v.qty / totalQty) * 100 : 0,
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);

    // Weekday averages (revenue per day, then averaged across calendar days of that weekday)
    const dayTotals = new Map<string, number>(); // date → total
    for (const r of receipts) {
      dayTotals.set(r.receipt_date, (dayTotals.get(r.receipt_date) ?? 0) + Number(r.total || 0));
    }
    const weekdayBuckets: { sum: number; count: number }[] = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));
    for (const [date, tot] of dayTotals.entries()) {
      const dow = parseLocalDate(date).getDay();
      weekdayBuckets[dow].sum += tot;
      weekdayBuckets[dow].count += 1;
    }
    const weekdayAverages = ORDERED_WEEKDAYS_INDEX.map((dow) => {
      const b = weekdayBuckets[dow];
      return {
        day: ARABIC_WEEKDAY_NAMES[dow],
        avg: b.count ? Math.round(b.sum / b.count) : 0,
        sampleDays: b.count,
      };
    });

    // Heatmap: avg revenue per (weekday, hourSlot) — averaged over distinct calendar dates seen for that weekday
    // Build raw cell sums
    const cellSum: Record<string, number> = {}; // key dow_hr -> sum
    const cellDates: Record<string, Set<string>> = {}; // key dow_hr -> set of distinct dates
    for (const r of receipts) {
      const hr = riyadhHour(r.created_at_pos);
      if (hr === null) continue;
      const slot = HOURS.indexOf(hr);
      if (slot === -1) continue;
      const dow = parseLocalDate(r.receipt_date).getDay();
      const k = `${dow}_${slot}`;
      cellSum[k] = (cellSum[k] ?? 0) + Number(r.total || 0);
      if (!cellDates[k]) cellDates[k] = new Set();
      cellDates[k].add(r.receipt_date);
    }
    const heatmap = ORDERED_WEEKDAYS_INDEX.map((dow) =>
      HOURS.map((_, slot) => {
        const k = `${dow}_${slot}`;
        const sum = cellSum[k] ?? 0;
        const sampleDays = cellDates[k]?.size ?? 0;
        const avg = sampleDays ? Math.round(sum / sampleDays) : 0;
        return { avg, sampleDays };
      }),
    );
    const heatMax = Math.max(1, ...heatmap.flat().map((c) => c.avg));

    // Peak day & hour
    let peakRow = -1, peakCol = -1, peakVal = -1, peakSamples = 0;
    heatmap.forEach((row, ri) => row.forEach((c, ci) => {
      if (c.avg > peakVal) { peakVal = c.avg; peakRow = ri; peakCol = ci; peakSamples = c.sampleDays; }
    }));

    // Strongest / weakest weekday
    const dayWithSamples = weekdayAverages.filter((d) => d.sampleDays > 0);
    const sortedByAvg = [...dayWithSamples].sort((a, b) => b.avg - a.avg);
    const strongestDay = sortedByAvg[0];
    const weakestDay = sortedByAvg[sortedByAvg.length - 1];
    const dailyAvg = daysCount ? Math.round(Array.from(dayTotals.values()).reduce((s, v) => s + v, 0) / daysCount) : 0;

    // Readiness
    let level: ReadinessLevel = "insufficient";
    let message = "نحتاج بيانات أكثر — استمر بمزامنة الكاشير لاكتشاف الذروة بدقة.";
    if (daysCount >= 28) {
      level = "ready";
      message = `بيانات كافية (${daysCount} يوم) — التحليل موثوق.`;
    } else if (daysCount >= 14) {
      level = "preliminary";
      message = `بيانات أولية (${daysCount} يوم) — اعتبر النتائج تقريبية حتى تصل 28 يوم.`;
    } else {
      message = `بيانات غير كافية (${daysCount} يوم فقط) — نحتاج 14 يوم على الأقل لعرض الذروة، و28 لاعتمادها.`;
    }

    return {
      kpis: {
        peakDay: peakRow >= 0 ? ORDERED_WEEKDAYS_LABEL[peakRow] : "—",
        peakHour: peakCol >= 0 ? HOUR_LABELS[peakCol] : "—",
        peakValue: peakVal > 0 ? peakVal : 0,
        peakSamples,
        topItem: itemRanking[0]?.name ?? "—",
        topItemPct: itemRanking[0]?.pct ?? 0,
        weakestDay: weakestDay?.day ?? "—",
        weakestDayAvg: weakestDay?.avg ?? 0,
        strongestDay: strongestDay?.day ?? "—",
        strongestDayAvg: strongestDay?.avg ?? 0,
        dailyAvg,
      },
      itemRanking,
      weekdayAverages,
      heatmap,
      heatMax,
      readiness: { daysCount, level, message },
      dateRange: { minDate, maxDate, totalDays: daysCount },
    };
  }, [query.data]);

  return {
    isLoading: query.isLoading,
    error: query.error as Error | null,
    data: computed,
    isEmpty: !query.isLoading && (query.data?.receipts.length ?? 0) === 0,
  };
};