import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Calendar as CalendarIcon, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PosSyncDialog from "@/components/dashboard/PosSyncDialog";
import { useSalesIndicator } from "@/hooks/useSalesIndicator";
import { fmt, formatArabicDayMonth } from "@/lib/format";

const SalesIndicator = () => {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [posSyncOpen, setPosSyncOpen] = useState(false);
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useSalesIndicator({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const hasFilter = !!(fromDate || toDate);
  const resetFilter = () => { setFromDate(""); setToDate(""); };

  const Toolbar = (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-2 py-1.5">
        <CalendarIcon size={12} className="text-gray-light" />
        <span className="text-[10px] text-gray-light">من</span>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="bg-transparent text-[11px] text-foreground outline-none w-[120px]"
        />
        <span className="text-[10px] text-gray-light mx-1">إلى</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="bg-transparent text-[11px] text-foreground outline-none w-[120px]"
        />
      </div>
      {hasFilter && (
        <button
          onClick={resetFilter}
          className="flex items-center gap-1 text-[10px] text-gray-light hover:text-foreground bg-surface border border-border rounded-lg px-2 py-1.5 transition-colors"
        >
          <X size={10} /> إعادة تعيين
        </button>
      )}
      <button
        onClick={() => setPosSyncOpen(true)}
        className="flex items-center gap-1.5 text-[11px] font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors mr-auto"
      >
        <RefreshCw size={12} /> مزامنة الكاشير
      </button>
      <PosSyncDialog
        open={posSyncOpen}
        onOpenChange={setPosSyncOpen}
        onSynced={() => queryClient.invalidateQueries({ queryKey: ["daily-sales-summary"] })}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader title="مؤشر المبيعات" subtitle="جاري تحميل بيانات الكاشير..." badge="تحليل" />
        {Toolbar}
        <div className="grid grid-cols-6 gap-2 mb-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
        <Skeleton className="h-64 mb-4" />
        <div className="grid grid-cols-3 gap-3 mb-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="مؤشر المبيعات" subtitle="خطأ في تحميل البيانات" badge="تحليل" />
        {Toolbar}
        <div className="bg-surface border border-red-500/30 rounded-lg p-6 text-center text-red-400 text-[12px]">
          ⚠️ تعذر تحميل بيانات المبيعات: {error.message}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="مؤشر المبيعات" subtitle={hasFilter ? "ما فيه بيانات في النطاق المحدد" : "لا توجد بيانات بعد"} badge="تحليل" />
        {Toolbar}
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <div className="text-[32px] mb-2">📊</div>
          <div className="text-[14px] font-bold text-foreground mb-1">
            {hasFilter ? "ما فيه بيانات في الفترة المختارة" : "ما فيه بيانات مبيعات بعد"}
          </div>
          <div className="text-[11px] text-gray-light leading-relaxed max-w-md mx-auto">
            {hasFilter
              ? "غيّر النطاق أو اضغط إعادة تعيين."
              : "شغّل مزامنة الكاشير من الزر أعلاه لجلب البيانات وعرضها هنا."}
          </div>
        </div>
      </div>
    );
  }

  const { kpis, monthlyBreakdown, bestDays, worstDays, worstMonthNote, weekdayAverages, weekdayTip, forecasts, subtitle } = data;
  const maxWeekdayAvg = Math.max(...weekdayAverages.map((w) => w.avg), 1);

  const kpiCards: { label: string; value: string; color: string; tooltipTitle: string; tooltipDesc: string }[] = [
    {
      label: "🧾 إجمالي المبيعات",
      value: fmt(kpis.totalGross),
      color: "text-primary",
      tooltipTitle: "إجمالي المبيعات (Gross Sales)",
      tooltipDesc: "مجموع قيمة الفواتير المسجّلة في الكاشير قبل خصم أي خصومات أو مسترد. يمثّل حجم الحركة الكلي خلال الفترة.",
    },
    {
      label: "💵 صافي المبيعات",
      value: fmt(kpis.totalNet),
      color: "text-black",
      tooltipTitle: "صافي المبيعات (Net Sales)",
      tooltipDesc: "إجمالي المبيعات − الخصومات − المسترد. هذا هو الإيراد الفعلي الذي دخل المحل ويستخدم لحساب الأرباح.",
    },
    {
      label: "📊 متوسط يومي",
      value: fmt(kpis.dailyAvg),
      color: "text-blue-400",
      tooltipTitle: "المتوسط اليومي",
      tooltipDesc: `إجمالي المبيعات ÷ عدد الأيام المسجّلة (${data.daysCount} يوم). يعكس مستوى الأداء اليومي ويُقارن بهدف 1,000 ر.س/يوم.`,
    },
    {
      label: "🏆 أعلى يوم",
      value: fmt(kpis.bestDay),
      color: "text-black",
      tooltipTitle: "أعلى يوم في النطاق",
      tooltipDesc: kpis.bestDayDate
        ? `أعلى مبيعات يومية مسجّلة: ${kpis.bestDayLabel} (${kpis.bestDayDate}). استخدمه كمرجع لما يقدر المحل يحققه.`
        : "أعلى مبيعات يومية مسجّلة في النطاق.",
    },
    {
      label: "📉 أدنى يوم فعلي",
      value: fmt(kpis.worstDay),
      color: "text-red-400",
      tooltipTitle: "أدنى يوم فعلي",
      tooltipDesc: kpis.worstDayDate
        ? `أقل يوم فيه مبيعات > 0 (نتجاهل أيام الإغلاق التام): ${kpis.worstDayLabel} (${kpis.worstDayDate}). راجعه لمعرفة السبب.`
        : "أقل يوم فيه مبيعات فعلية > 0 (تستبعد أيام الإغلاق).",
    },
    {
      label: "🏷️ إجمالي الخصومات",
      value: fmt(kpis.totalDiscounts),
      color: "text-orange-400",
      tooltipTitle: "إجمالي الخصومات",
      tooltipDesc: `مجموع كل الخصومات الممنوحة. النسبة الحالية ${kpis.discountPct.toFixed(1)}% من الإجمالي — يفضّل أن تبقى تحت 2% لحماية الهامش.`,
    },
  ];

  return (
  <div>
    <PageHeader title="مؤشر المبيعات" subtitle={subtitle} badge="تحليل" />
    {Toolbar}

    {/* مؤشرات سريعة */}
    <TooltipProvider delayDuration={150}>
      <div className="grid grid-cols-6 gap-2 mb-4">
        {kpiCards.map((m) => (
          <Tooltip key={m.label}>
            <TooltipTrigger asChild>
              <div className="bg-surface border border-border rounded-lg p-3 text-center cursor-help hover:border-primary/40 transition-colors">
                <div className="text-[9px] text-gray-light font-medium mb-1">{m.label}</div>
                <div className={`text-[18px] font-bold ${m.color}`}>{m.value}</div>
                <div className="text-[8px] text-gray-light">ر.س</div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px] text-right" dir="rtl">
              <div className="text-[11px] font-bold text-foreground mb-1">{m.tooltipTitle}</div>
              <div className="text-[10px] text-muted-foreground leading-relaxed">{m.tooltipDesc}</div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>

    {/* الأداء الشهري التفصيلي */}
    <div className="bg-surface border border-border rounded-lg p-4 mb-4">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">📊 الأداء الشهري التفصيلي</div>
      <div className="overflow-hidden">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border text-[9px] text-gray-light uppercase">
              <th className="text-right py-2 font-medium">الشهر</th>
              <th className="text-center py-2 font-medium">إجمالي</th>
              <th className="text-center py-2 font-medium">صافي</th>
              <th className="text-center py-2 font-medium">أيام</th>
              <th className="text-center py-2 font-medium">متوسط/يوم</th>
              <th className="text-center py-2 font-medium">خصومات</th>
              <th className="text-center py-2 font-medium">معدل خصم</th>
              <th className="text-center py-2 font-medium">تقييم</th>
            </tr>
          </thead>
          <tbody>
            {monthlyBreakdown.map((m) => {
              return (
                <tr key={m.key} className="border-b border-border/50 hover:bg-background/50">
                  <td className="py-2 font-bold text-foreground">{m.month}</td>
                  <td className="text-center text-foreground">{fmt(m.gross)}</td>
                  <td className="text-center font-medium text-black">{fmt(m.net)}</td>
                  <td className="text-center text-gray">{m.days}</td>
                  <td className="text-center font-bold text-foreground">{fmt(m.avg)}</td>
                  <td className="text-center text-rose-700">{fmt(m.discounts)}</td>
                  <td className="text-center text-gray">{m.discPct.toFixed(1)}%</td>
                  <td className="text-center">
                    <StatusBadge variant={m.ratingVariant} className="text-[8px]">{m.rating}</StatusBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-4">
      {/* أفضل 5 أيام */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold uppercase tracking-wider mb-3 text-black">🏆 أفضل 5 أيام</div>
        <div className="space-y-1.5">
          {bestDays.map((d, i) => (
            <div key={d.date} className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg">
              <span className="text-[14px] w-6 text-center font-bold text-black">#{i + 1}</span>
              <span className="text-[11px] text-gray flex-1">{d.label}</span>
              <span className="text-[13px] font-bold text-black">{fmt(d.value)}</span>
              <span className="text-[8px] text-gray-light">ر.س</span>
            </div>
          ))}
        </div>
      </div>

      {/* أضعف 5 أيام */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-red-400 uppercase tracking-wider mb-3">📉 أضعف 5 أيام</div>
        <div className="space-y-1.5">
          {worstDays.map((d, i) => (
            <div key={d.date} className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg">
              <span className="text-[14px] w-6 text-center font-bold text-red-400">#{i + 1}</span>
              <span className="text-[11px] text-gray flex-1">{d.label}</span>
              <span className="text-[13px] font-bold text-red-400">{fmt(d.value)}</span>
              <span className="text-[8px] text-gray-light">ر.س</span>
            </div>
          ))}
          <div className="p-2 mt-1 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="text-[8px] text-red-400 leading-relaxed">
              ⚠️ {worstMonthNote}
            </div>
          </div>
        </div>
      </div>

      {/* أداء أيام الأسبوع */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">📅 خريطة الأسبوع</div>
        <div className="space-y-1.5">
          {weekdayAverages.map((d) => {
            const barColor = d.avg >= 750 ? 'bg-green-500/50' : d.avg >= 670 ? 'bg-yellow-500/40' : 'bg-red-500/40';
            return (
              <div key={d.day} className="flex items-center gap-2">
                <span className="text-[11px] text-gray w-14 text-left">{d.day}</span>
                <div className="flex-1 h-5 bg-border/20 rounded-sm overflow-hidden relative">
                  <div className={`h-full rounded-sm ${barColor}`} style={{ width: `${(d.avg / maxWeekdayAvg) * 100}%` }} />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">{fmt(d.avg)} ر.س</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 p-2 bg-background border border-border rounded-lg text-[8px] text-gray leading-relaxed">
          💡 <b className="text-foreground">نصيحة:</b> {weekdayTip}
        </div>
      </div>
    </div>

    {/* ═══ تحليل الخصومات + توقعات ═══ */}
    <div className="grid grid-cols-2 gap-3">
      {/* تحليل الخصومات */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-orange-400 uppercase tracking-wider mb-3">🏷️ تحليل الخصومات والمسترد</div>
        <div className="space-y-2">
          {monthlyBreakdown.map((m) => {
            const discPct = m.discPct;
            const barColor = discPct > 10 ? 'bg-red-500' : discPct > 2 ? 'bg-orange-500' : 'bg-green-500';
            return (
              <div key={m.key}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-gray">{m.month}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${discPct > 10 ? 'text-red-400' : discPct > 2 ? 'text-orange-400' : 'text-green-400'}`}>
                      {discPct.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-gray-light">{fmt(m.discounts)} ر.س</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(discPct * 5, 100)}%` }} />
                </div>
              </div>
            );
          })}
          <div className="p-2 bg-background border border-border rounded-lg mt-2">
            <div className="text-[8px] text-gray leading-relaxed">
              📝 معدل الخصم الكلي: {((kpis.totalDiscounts / kpis.totalGross) * 100 || 0).toFixed(1)}% — راقبه شهرياً وابقه تحت 2% لحماية الهامش.
            </div>
          </div>
        </div>
      </div>

      {/* التوقعات والأهداف */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold uppercase tracking-wider mb-3 text-success">🔮 التوقعات والأهداف</div>
        <div className="space-y-2">
          {forecasts.map((f) => (
            <div key={f.title} className="p-2 bg-background border border-border rounded-lg flex items-center gap-2">
              <span className={`text-[16px] ${f.trend === 'up' ? '' : f.trend === 'target' ? '' : ''}`}>
                {f.trend === 'up' ? '📈' : f.trend === 'target' ? '🎯' : '⚖️'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground">{f.title}</span>
                  <span className="text-[11px] font-bold text-success">{f.value}</span>
                </div>
                <div className="text-[8px] text-gray">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
};

export default SalesIndicator;
