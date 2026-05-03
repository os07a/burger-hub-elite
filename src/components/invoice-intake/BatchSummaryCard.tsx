import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { useBatchInvoiceSummary } from "@/hooks/useInvoiceIntake";
import { Loader2, X, FileText, Calendar, Store, Trophy, Users, TrendingUp, ExternalLink } from "lucide-react";
import { fmt, formatArabicDayMonth } from "@/lib/format";
import { buildBatchAlerts, alertStyles } from "@/lib/batchAlerts";
import { useNavigate } from "react-router-dom";

interface Props {
  invoiceIds: string[];
  failedCount: number;
  onClose: () => void;
}

const money = (n: number) => fmt(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d: string | null) => (d ? formatArabicDayMonth(d) : "—");

// Distinct hues (HSL) for stacked category bar — kept theme-agnostic
const CATEGORY_HUES = [350, 25, 142, 200, 270]; // crimson, gold, green, blue, purple

const BatchSummaryCard = ({ invoiceIds, failedCount, onClose }: Props) => {
  const { data, isLoading } = useBatchInvoiceSummary(invoiceIds);
  const navigate = useNavigate();

  const heroChange = data?.vs_last_period?.pct_change ?? null;
  const heroTone =
    heroChange == null
      ? "text-foreground"
      : heroChange >= 20
      ? "text-rose-700 dark:text-rose-400"
      : heroChange <= -10
      ? "text-emerald-700 dark:text-emerald-400"
      : "text-foreground";

  return (
    <Card className="p-5 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-base font-bold">ملخص الدفعة الذكي</h3>
            <p className="text-xs text-muted-foreground">
              تم حفظ {fmt(invoiceIds.length)} فاتورة{failedCount > 0 ? ` · فشل ${fmt(failedCount)}` : ""}
            </p>
          </div>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm"><X size={16} /></Button>
      </div>

      {isLoading || !data ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">جاري حساب الملخص...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Hero insight line */}
          <div className={`rounded-xl border bg-card p-3 text-sm font-medium leading-relaxed ${heroTone}`}>
            دفعة <span className="font-bold">{fmt(data.invoices_count)}</span> فاتورة بقيمة{" "}
            <span className="font-bold inline-flex items-center gap-1">{money(data.total_amount)} <RiyalIcon size={12} /></span>
            {heroChange != null && (
              <>
                {" "}— {heroChange >= 0 ? "أعلى" : "أقل"} بنسبة{" "}
                <span className="font-bold">{Math.abs(heroChange).toFixed(0)}%</span>{" "}
                من الفترة السابقة {heroChange >= 20 ? "⚠️" : heroChange <= -10 ? "✅" : ""}
              </>
            )}
          </div>

          {/* KPI Strip - 4 cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <KpiTile icon={<Calendar size={14} />} label="الفترة" value={
              data.date_from === data.date_to
                ? fmtDate(data.date_from)
                : `${fmtDate(data.date_from)} → ${fmtDate(data.date_to)}`
            } small />
            <KpiTile icon={<RiyalIcon size={14} className="text-primary" />} label="الإجمالي" value={money(data.total_amount)} highlight />
            <KpiTile icon={<TrendingUp size={14} />} label="متوسط الفاتورة" value={`${money(data.avg_invoice)}`} />
            <KpiTile icon={<Users size={14} />} label="الموردون" value={fmt(data.suppliers_count)} sub={`${fmt(data.line_items_count)} صنف`} />
          </div>

          {/* Smart Alerts */}
          <AlertsSection alerts={buildBatchAlerts(data)} navigate={navigate} />

          {/* Categories - stacked bar OR empty state */}
          {data.uncategorized_pct >= 99 || data.categories.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-center space-y-2">
              <div className="text-2xl">📦</div>
              <div className="text-sm font-semibold">الأصناف لم تُربط بالمخزون بعد</div>
              <div className="text-xs text-muted-foreground">
                لتحليل الفئات (لحوم، زيوت، خضار...) اربط أصناف الفواتير بعناصر المخزون
              </div>
              <div className="flex justify-center gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => navigate("/inventory")}>
                  إدارة المخزون
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate("/archive")}>
                  مراجعة الفواتير
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <span>🔥</span><span>توزيع الإنفاق على الفئات</span>
              </div>
              {/* Stacked bar */}
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                {data.categories.map((c, idx) => (
                  <div
                    key={c.category}
                    className="h-full transition-all"
                    style={{
                      width: `${c.pct}%`,
                      backgroundColor: `hsl(${CATEGORY_HUES[idx % CATEGORY_HUES.length]} 70% 55%)`,
                    }}
                    title={`${c.category} ${c.pct.toFixed(0)}%`}
                  />
                ))}
              </div>
              {/* Legend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {data.categories.map((c, idx) => (
                  <div key={c.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: `hsl(${CATEGORY_HUES[idx % CATEGORY_HUES.length]} 70% 55%)` }}
                      />
                      <span className="truncate">{c.category}</span>
                    </div>
                    <span className="font-semibold tabular-nums">
                      {money(c.total)} <span className="text-muted-foreground">({c.pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top supplier + Top items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
            {data.top_supplier && (
              <div className="rounded-xl bg-card border p-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Store size={14} className="text-primary" /> أعلى مورد
                </div>
                <div className="text-sm font-semibold truncate">{data.top_supplier.name}</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {fmt(data.top_supplier.count)} فاتورة · {money(data.top_supplier.total)} ﷼
                  {data.total_amount > 0 && (
                    <span className="text-primary font-medium">
                      {" "}· {((data.top_supplier.total / data.total_amount) * 100).toFixed(0)}% من الدفعة
                    </span>
                  )}
                </div>
              </div>
            )}
            {data.top_items.length > 0 && (
              <div className="rounded-xl bg-card border p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Trophy size={14} className="text-primary" /> أعلى الأصناف
                </div>
                <div className="space-y-1">
                  {data.top_items.map((it, idx) => (
                    <div key={`${it.name}-${idx}`} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="shrink-0">{["🥇", "🥈", "🥉"][idx]}</span>
                        <span className="truncate font-medium">{it.name}</span>
                      </span>
                      <span className="font-semibold tabular-nums shrink-0">{money(it.total)} ﷼</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            <Button size="sm" variant="outline" onClick={() => navigate("/archive")}>
              <ExternalLink size={14} className="ml-1" /> عرض في الأرشيف
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>دفعة جديدة</Button>
          </div>
        </div>
      )}
    </Card>
  );
};

const KpiTile = ({
  icon, label, value, sub, highlight, small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  small?: boolean;
}) => (
  <div className="rounded-xl bg-card border p-2.5 text-center">
    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
      {icon}
      <span className="text-[10px]">{label}</span>
    </div>
    <div className={`font-bold leading-tight tabular-nums ${highlight ? "text-base" : small ? "text-[11px]" : "text-sm"}`}>
      {value}
    </div>
    {sub && <div className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{sub}</div>}
  </div>
);

const AlertsSection = ({
  alerts, navigate,
}: {
  alerts: ReturnType<typeof buildBatchAlerts>;
  navigate: (to: string) => void;
}) => {
  if (alerts.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <span>🚨</span>
        <span>تنبيهات واقتراحات</span>
        <span className="text-xs text-muted-foreground font-normal">({fmt(alerts.length)})</span>
      </div>
      <div className="space-y-1.5">
        {alerts.map((a, i) => {
          const s = alertStyles[a.level];
          return (
            <div
              key={i}
              className={`rounded-lg border ${s.bg} ${s.border} ${s.text} px-3 py-2 flex items-start gap-2`}
            >
              <span className="text-base leading-none mt-0.5">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">{a.title}</div>
                {a.detail && <div className="text-[11px] opacity-80 mt-0.5 tabular-nums">{a.detail}</div>}
              </div>
              {a.actionLabel && a.actionHref && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] shrink-0"
                  onClick={() => navigate(a.actionHref!)}
                >
                  {a.actionLabel}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BatchSummaryCard;