import type { BatchSummary } from "@/hooks/useInvoiceIntake";
import { fmt } from "@/lib/format";

export type AlertLevel = "success" | "info" | "warning" | "danger";

export interface BatchAlert {
  level: AlertLevel;
  icon: string;
  title: string;
  detail?: string;
  actionLabel?: string;
  actionHref?: string;
}

export const buildBatchAlerts = (s: BatchSummary): BatchAlert[] => {
  const alerts: BatchAlert[] = [];

  // 1. Period comparison
  if (s.vs_last_period?.pct_change != null) {
    const p = s.vs_last_period.pct_change;
    if (p >= 20) {
      alerts.push({
        level: "danger",
        icon: "📈",
        title: `الإنفاق أعلى ${p.toFixed(0)}% من نفس الفترة السابقة`,
        detail: `${fmt(s.vs_last_period.current, { maximumFractionDigits: 2 })} مقابل ${fmt(s.vs_last_period.previous, { maximumFractionDigits: 2 })}`,
      });
    } else if (p >= 10) {
      alerts.push({
        level: "warning",
        icon: "📊",
        title: `الإنفاق أعلى ${p.toFixed(0)}% عن الفترة السابقة`,
      });
    } else if (p <= -10) {
      alerts.push({
        level: "success",
        icon: "📉",
        title: `وفّرت ${Math.abs(p).toFixed(0)}% مقارنة بالفترة السابقة`,
      });
    }
  }

  // 2. Price spikes
  for (const sp of s.price_spikes.slice(0, 3)) {
    alerts.push({
      level: "danger",
      icon: "🔺",
      title: `ارتفع سعر «${sp.item_name}» بنسبة ${sp.pct.toFixed(0)}%`,
      detail: `السعر الحالي ${fmt(sp.current_price, { maximumFractionDigits: 2 })} مقابل متوسط 90 يوم ${fmt(sp.avg_price, { maximumFractionDigits: 2 })}`,
    });
  }

  // 3. Duplicate suspects
  for (const d of s.duplicate_suspects.slice(0, 2)) {
    alerts.push({
      level: "warning",
      icon: "🧾",
      title: `احتمال فاتورة مكررة من ${d.supplier}`,
      detail: `بتاريخ ${d.date} بمبلغ ${fmt(d.amount, { maximumFractionDigits: 2 })} ﷼ — ظهرت ${d.count} مرات`,
      actionLabel: "راجع الأرشيف",
      actionHref: "/archive",
    });
  }

  // 4. Uncategorized
  if (s.uncategorized_pct >= 50 && s.line_items_count > 0) {
    alerts.push({
      level: "warning",
      icon: "📦",
      title: `${s.uncategorized_pct.toFixed(0)}% من المبلغ غير مرتبط بالمخزون`,
      detail: "اربط الأصناف بالمخزون لتحليل دقيق للفئات والاستهلاك",
      actionLabel: "إدارة المخزون",
      actionHref: "/inventory",
    });
  }

  // 5. Outlier invoice
  if (s.largest_invoice && s.avg_invoice > 0) {
    const ratio = s.largest_invoice.amount / s.avg_invoice;
    if (ratio >= 3 && s.invoices_count >= 3) {
      alerts.push({
        level: "info",
        icon: "⭐",
        title: `فاتورة استثنائية: ${fmt(s.largest_invoice.amount, { maximumFractionDigits: 2 })} ﷼`,
        detail: `${s.largest_invoice.supplier ?? "مورد غير معروف"} — ${ratio.toFixed(1)}× المتوسط`,
      });
    }
  }

  if (alerts.length === 0) {
    alerts.push({
      level: "success",
      icon: "✅",
      title: "كل شيء طبيعي — لا توجد ملاحظات على هذه الدفعة",
    });
  }

  return alerts;
};

export const alertStyles: Record<AlertLevel, { bg: string; border: string; text: string }> = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-900 dark:text-emerald-200",
  },
  info: {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-900 dark:text-sky-200",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-900 dark:text-amber-200",
  },
  danger: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-900 dark:text-rose-200",
  },
};