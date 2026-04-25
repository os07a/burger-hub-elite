import { useMemo } from "react";
import { useDailySalesSummary, type DailySalesSummaryRow } from "./useDailySalesSummary";
import {
  ARABIC_MONTH_NAMES,
  ARABIC_WEEKDAY_NAMES,
  formatArabicDayMonth,
  getArabicMonth,
} from "@/lib/format";

export interface MonthlyBreakdown {
  key: string; // YYYY-MM
  month: string; // Arabic month name (with year if multiple)
  gross: number;
  net: number;
  discounts: number;
  days: number;
  avg: number;
  discPct: number;
  rating: "ممتاز" | "جيد" | "ضعيف" | "حرج";
  ratingVariant: "success" | "info" | "warning" | "danger";
}

export interface DayPoint {
  date: string;
  label: string;
  value: number;
}

export interface WeekdayAvg {
  day: string;
  avg: number;
}

export interface ForecastItem {
  title: string;
  value: string;
  desc: string;
  trend: "up" | "target" | "warning";
}

export type SalesReadinessLevel = "insufficient" | "early" | "preliminary" | "ready" | "deep";

export interface SalesNarrativeItem {
  emoji: string;
  text: string;
  tone: "success" | "warning" | "info" | "danger" | "neutral";
}

export interface SalesReadiness {
  level: SalesReadinessLevel;
  message: string;
  daysCount: number;
  progressTo14: number;
  progressTo28: number;
  progressTo30: number;
}

const ratingFor = (avg: number): Pick<MonthlyBreakdown, "rating" | "ratingVariant"> => {
  if (avg >= 800) return { rating: "ممتاز", ratingVariant: "success" };
  if (avg >= 600) return { rating: "جيد", ratingVariant: "info" };
  if (avg >= 400) return { rating: "ضعيف", ratingVariant: "warning" };
  return { rating: "حرج", ratingVariant: "danger" };
};

export interface UseSalesIndicatorOptions {
  fromDate?: string;
  toDate?: string;
}

export const useSalesIndicator = ({ fromDate, toDate }: UseSalesIndicatorOptions = {}) => {
  const query = useDailySalesSummary({ fromDate, toDate, limit: 1000 });
  const rows: DailySalesSummaryRow[] = query.data ?? [];

  const computed = useMemo(() => {
    if (!rows.length) return null;

    const sorted = [...rows].sort((a, b) => (a.date < b.date ? -1 : 1));
    const totalGross = sorted.reduce((s, r) => s + Number(r.gross_sales || 0), 0);
    const totalNet = sorted.reduce((s, r) => s + Number(r.net_sales || 0), 0);
    const totalDiscounts = sorted.reduce((s, r) => s + Number(r.discounts || 0), 0);
    const dailyAvg = totalGross / sorted.length;

    // Monthly breakdown
    const monthMap = new Map<string, { gross: number; net: number; discounts: number; days: number }>();
    for (const r of sorted) {
      const key = r.date.slice(0, 7); // YYYY-MM
      const cur = monthMap.get(key) ?? { gross: 0, net: 0, discounts: 0, days: 0 };
      cur.gross += Number(r.gross_sales || 0);
      cur.net += Number(r.net_sales || 0);
      cur.discounts += Number(r.discounts || 0);
      cur.days += 1;
      monthMap.set(key, cur);
    }
    const monthKeys = Array.from(monthMap.keys()).sort();
    const yearsSeen = new Set(monthKeys.map((k) => k.slice(0, 4)));
    const showYear = yearsSeen.size > 1;
    const monthlyBreakdown: MonthlyBreakdown[] = monthKeys.map((key) => {
      const v = monthMap.get(key)!;
      const avg = v.days ? v.gross / v.days : 0;
      const discPct = v.gross ? (v.discounts / v.gross) * 100 : 0;
      const monthName = ARABIC_MONTH_NAMES[Number(key.slice(5, 7)) - 1];
      return {
        key,
        month: showYear ? `${monthName} ${key.slice(0, 4)}` : monthName,
        gross: v.gross,
        net: v.net,
        discounts: v.discounts,
        days: v.days,
        avg,
        discPct,
        ...ratingFor(avg),
      };
    });

    // Best & worst days
    const dayPoints: DayPoint[] = sorted.map((r) => ({
      date: r.date,
      label: formatArabicDayMonth(r.date),
      value: Number(r.gross_sales || 0),
    }));
    const bestDays = [...dayPoints].sort((a, b) => b.value - a.value).slice(0, 5);
    const worstDays = [...dayPoints].filter((d) => d.value > 0).sort((a, b) => a.value - b.value).slice(0, 5);

    const bestDay = bestDays[0]?.value ?? 0;
    const worstDayActual = worstDays[0]?.value ?? 0;
    const bestDayInfo = bestDays[0];
    const worstDayInfo = worstDays[0];
    const discountPct = totalGross ? (totalDiscounts / totalGross) * 100 : 0;

    // Worst-month note
    const worstMonthCount = new Map<string, number>();
    for (const d of worstDays) {
      const m = getArabicMonth(d.date);
      worstMonthCount.set(m, (worstMonthCount.get(m) ?? 0) + 1);
    }
    const worstMonthEntry = Array.from(worstMonthCount.entries()).sort((a, b) => b[1] - a[1])[0];
    const worstMonthNote = worstMonthEntry && worstMonthEntry[1] >= 3
      ? `أغلب الأيام الضعيفة في ${worstMonthEntry[0]} — يحتاج تحقيق: هل بسبب الطقس أو نقص مواد أو قلة الطلب؟`
      : "راجع الأيام الضعيفة وحدد السبب: مواسم، طقس، نقص مواد، أو ضعف تسويق.";

    // Weekday averages
    const weekdayBuckets: { sum: number; count: number }[] = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));
    for (const r of sorted) {
      const [y, m, d] = r.date.split("-").map(Number);
      const dow = new Date(y, m - 1, d).getDay();
      weekdayBuckets[dow].sum += Number(r.gross_sales || 0);
      weekdayBuckets[dow].count += 1;
    }
    const weekdayAverages: WeekdayAvg[] = weekdayBuckets
      .map((b, i) => ({ day: ARABIC_WEEKDAY_NAMES[i], avg: b.count ? Math.round(b.sum / b.count) : 0 }))
      .filter((w) => w.avg > 0)
      .sort((a, b) => b.avg - a.avg);

    // Weakest weekdays note
    const weakest = [...weekdayAverages].sort((a, b) => a.avg - b.avg).slice(0, 2).map((w) => w.day);
    const weekdayTip = weakest.length >= 2
      ? `ركّز التسويق على ${weakest[0]} و${weakest[1]} — فرصة رفع 15-20% بعروض بسيطة.`
      : "نوّع العروض على الأيام الأضعف لرفع المتوسط اليومي.";

    // Forecasts
    const lastMonthKey = monthKeys[monthKeys.length - 1];
    const lastMonth = monthlyBreakdown[monthlyBreakdown.length - 1];
    const [ly, lm] = lastMonthKey.split("-").map(Number);
    const daysInLastMonth = new Date(ly, lm, 0).getDate();
    const lastMonthForecast = (lastMonth?.avg ?? dailyAvg) * daysInLastMonth;
    const targetPlus15 = dailyAvg * 1.15 * 30;
    const annualPath = dailyAvg * 276;

    const forecasts: ForecastItem[] = [
      {
        title: `توقع ${ARABIC_MONTH_NAMES[lm - 1]} الكامل`,
        value: `~${Math.round(lastMonthForecast).toLocaleString("en-US")} ر.س`,
        desc: `بمعدل ${Math.round(lastMonth?.avg ?? dailyAvg).toLocaleString("en-US")} ر.س/يوم × ${daysInLastMonth} يوم`,
        trend: "up",
      },
      {
        title: "هدف الشهر القادم (تحسين 15%)",
        value: `~${Math.round(targetPlus15).toLocaleString("en-US")} ر.س`,
        desc: `${Math.round(dailyAvg * 1.15).toLocaleString("en-US")} ر.س/يوم — محقق إذا تحسّنت الأيام الضعيفة`,
        trend: "up",
      },
      {
        title: "الهدف: 1,000 ر.س/يوم",
        value: "30,000 ر.س/شهر",
        desc: dailyAvg > 0
          ? `يحتاج رفع المتوسط ${Math.max(0, Math.round((1000 / dailyAvg - 1) * 100))}% عن الحالي`
          : "ابدأ بتسجيل المبيعات لقياس الفجوة",
        trend: "target",
      },
      {
        title: "نقطة التعادل الشهرية",
        value: "~16,500 ر.س",
        desc: "بناءً على معدل حرق 16,541 ر.س/شهر",
        trend: "warning",
      },
      {
        title: "المسار الحالي (سنوي)",
        value: `~${Math.round(annualPath).toLocaleString("en-US")} ر.س`,
        desc: `بمتوسط ${Math.round(dailyAvg).toLocaleString("en-US")} ر.س × 276 يوم عمل`,
        trend: "up",
      },
    ];

    const minDate = sorted[0].date;
    const maxDate = sorted[sorted.length - 1].date;
    const subtitle = `تقرير الكاشير · ${sorted.length} يوم · ${formatArabicDayMonth(minDate)} – ${formatArabicDayMonth(maxDate)}`;

    return {
      kpis: {
        totalGross,
        totalNet,
        dailyAvg,
        bestDay,
        worstDay: worstDayActual,
        totalDiscounts,
        bestDayLabel: bestDayInfo?.label ?? "—",
        bestDayDate: bestDayInfo?.date ?? "",
        worstDayLabel: worstDayInfo?.label ?? "—",
        worstDayDate: worstDayInfo?.date ?? "",
        discountPct,
      },
      monthlyBreakdown,
      bestDays,
      worstDays,
      worstMonthNote,
      weekdayAverages,
      weekdayTip,
      forecasts,
      subtitle,
      daysCount: sorted.length,
      readiness,
      narratives,
    };
  }, [rows]);

  return {
    isLoading: query.isLoading,
    error: query.error as Error | null,
    data: computed,
  };
};