import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Calendar as CalendarIcon, X, AlertCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PosSyncDialog from "@/components/dashboard/PosSyncDialog";
import { useBehaviorInsights, HOUR_LABELS, ORDERED_WEEKDAYS_LABEL } from "@/hooks/useBehaviorInsights";
import { fmt } from "@/lib/format";

const rankColors: Record<number, string> = {
  1: "bg-primary text-primary-foreground",
  2: "bg-foreground text-primary-foreground",
  3: "bg-gray text-primary-foreground",
};

const ProgressBar = ({ label, value, color = "bg-primary" }: { label: string; value: number; color?: string }) => (
  <div className="mt-2.5 first:mt-0">
    <div className="flex justify-between text-[12px] text-gray mb-1 font-medium">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}%</span>
    </div>
    <div className="h-[5px] bg-background rounded-sm overflow-hidden">
      <div className={`h-full rounded-sm ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const heatColor = (v: number, max: number, sample: number) => {
  if (sample < 1) return { bg: "#f1f1f1", fg: "#9ca3af" };
  const t = max ? v / max : 0;
  if (t < 0.25) return { bg: "#fceaec", fg: "#8a0c18" };
  if (t < 0.5) return { bg: "#e8a0a8", fg: "#5a0010" };
  if (t < 0.75) return { bg: "#c03040", fg: "#fff" };
  return { bg: "#8a0c18", fg: "#fff" };
};

const Behavior = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [posSyncOpen, setPosSyncOpen] = useState(false);
  const queryClient = useQueryClient();

  const { isLoading, error, data, isEmpty } = useBehaviorInsights({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const hasFilter = !!(fromDate || toDate);
  const resetFilter = () => { setFromDate(""); setToDate(""); };

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    setFromDate(iso(start));
    setToDate(iso(end));
  };

  const Toolbar = (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-2 py-1.5">
        <CalendarIcon size={12} className="text-gray-light" />
        <span className="text-[10px] text-gray-light">من</span>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          className="bg-transparent text-[11px] text-foreground outline-none w-[120px]" />
        <span className="text-[10px] text-gray-light mx-1">إلى</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          className="bg-transparent text-[11px] text-foreground outline-none w-[120px]" />
      </div>
      <div className="flex items-center gap-1">
        {[
          { label: "7 أيام", d: 7 },
          { label: "30 يوم", d: 30 },
          { label: "90 يوم", d: 90 },
        ].map((p) => (
          <button key={p.d} onClick={() => setPreset(p.d)}
            className="text-[10px] text-gray-light hover:text-foreground bg-surface border border-border rounded-lg px-2 py-1.5 transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      {hasFilter && (
        <button onClick={resetFilter}
          className="flex items-center gap-1 text-[10px] text-gray-light hover:text-foreground bg-surface border border-border rounded-lg px-2 py-1.5 transition-colors">
          <X size={10} /> إعادة تعيين
        </button>
      )}
      <button onClick={() => setPosSyncOpen(true)}
        className="flex items-center gap-1.5 text-[11px] font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors mr-auto">
        <RefreshCw size={12} /> مزامنة الكاشير
      </button>
      <PosSyncDialog open={posSyncOpen} onOpenChange={setPosSyncOpen}
        onSynced={() => queryClient.invalidateQueries({ queryKey: ["behavior-insights"] })} />
    </div>
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader title="سلوك الزبائن" subtitle="جاري تحميل بيانات الكاشير..." />
        {Toolbar}
        <div className="grid grid-cols-4 gap-3 mb-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-64 mb-4" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="سلوك الزبائن" subtitle="خطأ في تحميل البيانات" />
        {Toolbar}
        <div className="bg-surface border border-red-500/30 rounded-lg p-6 text-center text-red-400 text-[12px]">
          ⚠️ تعذر تحميل البيانات: {error.message}
        </div>
      </div>
    );
  }

  if (!data || isEmpty || data.readiness.daysCount === 0) {
    return (
      <div>
        <PageHeader title="سلوك الزبائن" subtitle={hasFilter ? "ما فيه بيانات في النطاق المحدد" : "لا توجد بيانات بعد"} />
        {Toolbar}
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <div className="text-[32px] mb-2">📊</div>
          <div className="text-[14px] font-bold text-foreground mb-1">
            {hasFilter ? "ما فيه إيصالات في الفترة المختارة" : "ما فيه بيانات كاشير بعد"}
          </div>
          <div className="text-[11px] text-gray-light leading-relaxed max-w-md mx-auto">
            {hasFilter ? "غيّر النطاق أو اضغط إعادة تعيين." : "اضغط زر 'مزامنة الكاشير' أعلاه لجلب البيانات من Loyverse."}
          </div>
        </div>
      </div>
    );
  }

  const { kpis, itemRanking, weekdayAverages, heatmap, heatMax, readiness, dateRange, insights } = data;
  const showPeak = readiness.level !== "insufficient";
  const isPreliminary = readiness.level === "preliminary";
  const isDeep = readiness.level === "deep";

  const subtitle = `تقرير الكاشير · ${dateRange.totalDays} يوم${dateRange.minDate ? ` · ${dateRange.minDate} → ${dateRange.maxDate}` : ""}`;

  return (
    <div>
      <PageHeader title="سلوك الزبائن" subtitle={subtitle} />
      {Toolbar}

      {readiness.level === "insufficient" && (
        <div className="mb-4 flex items-start gap-2 bg-warning/10 border border-warning/30 rounded-lg p-3">
          <AlertCircle size={16} className="text-warning flex-shrink-0 mt-0.5" />
          <div className="flex-[1] text-[11px] text-foreground leading-relaxed">
            <b>عتبة الجاهزية لم تُستوفَ بعد.</b> {readiness.message} (نعرض الأصناف فقط، ونحجب تحليل الذروة وخريطة الحرارة.)
          </div>
        </div>
      )}
      {isPreliminary && (
        <div className="mb-4 flex items-start gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-foreground leading-relaxed">
            🟡 {readiness.message}
          </div>
        </div>
      )}
      {isDeep && (
        <div className="mb-4 flex items-start gap-2 bg-success/10 border border-success/30 rounded-lg p-3">
          <AlertCircle size={16} className="text-success flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-foreground leading-relaxed">
            ✅ {readiness.message}
          </div>
        </div>
      )}

      <TooltipProvider delayDuration={150}>
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <MetricCard
                label="🔥 ذروة الأسبوع"
                value={showPeak ? `${kpis.peakDay} ${kpis.peakHour}` : "—"}
                sub={showPeak ? `متوسط ${fmt(kpis.peakValue)} ر.س/إيصال (عينة ${kpis.peakSamples} يوم)` : "بحاجة لبيانات أكثر"}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[260px] text-right" dir="rtl">
            <div className="text-[11px] font-bold text-foreground mb-1">ذروة الأسبوع</div>
            <div className="text-[10px] text-muted-foreground leading-relaxed">
              اليوم والساعة الأعلى بمتوسط الإيراد لكل إيصال (بتوقيت الرياض). نحتاج 14 يوم على الأقل لعرضها.
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <MetricCard
                label="🏆 الأكثر طلباً"
                value={kpis.topItem.length > 18 ? kpis.topItem.slice(0, 18) + "…" : kpis.topItem}
                sub={`${kpis.topItemPct.toFixed(0)}% من إجمالي الكميات`}
                subColor="success"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[260px] text-right" dir="rtl">
            <div className="text-[11px] font-bold text-foreground mb-1">الأكثر طلباً</div>
            <div className="text-[10px] text-muted-foreground leading-relaxed">
              المنتج الذي تكرّرت كميته الأكبر في فواتير الكاشير ضمن النطاق الحالي.
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <MetricCard
                label="📉 أضعف يوم"
                value={showPeak ? kpis.weakestDay : "—"}
                sub={showPeak ? `${fmt(kpis.weakestDayAvg)} ر.س متوسط` : "بحاجة لبيانات أكثر"}
                subColor="warning"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[260px] text-right" dir="rtl">
            <div className="text-[11px] font-bold text-foreground mb-1">أضعف يوم في الأسبوع</div>
            <div className="text-[10px] text-muted-foreground leading-relaxed">
              يوم الأسبوع الأقل إيراداً (متوسط مبيعات ذلك اليوم عبر التواريخ المتاحة).
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <MetricCard label="📊 متوسط يومي" value={fmt(kpis.dailyAvg)} sub={`${dateRange.totalDays} يوم`} showRiyal />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[260px] text-right" dir="rtl">
            <div className="text-[11px] font-bold text-foreground mb-1">المتوسط اليومي</div>
            <div className="text-[10px] text-muted-foreground leading-relaxed">
              مجموع إيرادات كل الأيام ÷ عدد الأيام المسجّلة في النطاق.
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      </TooltipProvider>

      {isDeep && insights && insights.narratives.length > 0 && (
        <div className="mb-4 bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold text-foreground">🧠 رؤى ذكية للأسبوع</div>
            <span className="text-[9px] text-success bg-success/10 border border-success/30 rounded px-2 py-0.5">
              بيانات كاملة (≥30 يوم) ✅
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {insights.narratives.map((n, i) => {
              const toneClasses = {
                success: "border-success/30 bg-success/5",
                warning: "border-warning/30 bg-warning/5",
                danger: "border-danger/30 bg-danger/5",
                info: "border-blue-500/30 bg-blue-500/5",
                neutral: "border-border bg-background",
              }[n.tone];
              return (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border ${toneClasses}`}>
                  <span className="text-[16px] flex-shrink-0 leading-none mt-0.5">{n.emoji}</span>
                  <div className="text-[11px] text-foreground leading-relaxed">{n.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="border rounded-lg p-4 border-r-[3px] border-r-primary border-gray-50 bg-gray-50">
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">ترتيب الأصناف — مبيعات فعلية من الكاشير</div>
          {itemRanking.length === 0 && (
            <div className="text-[11px] text-gray-light text-center py-6">لا توجد أصناف مسجّلة في النطاق.</div>
          )}
          {itemRanking.map((item, idx) => {
            const rank = idx + 1;
            return (
              <div key={item.name} className="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0">
                <div className={`w-6 h-6 rounded-[7px] flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${rankColors[rank] || "bg-background text-gray"}`}>
                  {rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-foreground truncate">{item.name}</div>
                  <div className="text-[10px] text-gray-light mt-px font-medium">{fmt(item.gross)} ر.س مبيعات</div>
                </div>
                <div className="text-left min-w-[70px]">
                  <div className="text-[13px] font-bold text-foreground">{fmt(item.qty)}</div>
                  <div className="text-[9px] text-gray-light">{item.pct.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider">الإضافات المفضلة</div>
              <span className="text-[8px] text-gray-light bg-background border border-border rounded px-1.5 py-0.5">تقدير</span>
            </div>
            <ProgressBar label="جبن إضافي (أمريكي شرائح)" value={62} />
            <ProgressBar label="بطاطس بالجبن" value={48} />
            <ProgressBar label="صلصة ناشفيل حارة" value={35} color="bg-foreground" />
            <ProgressBar label="مشروب كبير (بيبسي)" value={55} />
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider">طريقة الاستلام</div>
              <span className="text-[8px] text-gray-light bg-background border border-border rounded px-1.5 py-0.5">تقدير</span>
            </div>
            <ProgressBar label="توصيل (هنقرستيشن + كيتا)" value={54} />
            <ProgressBar label="داخل المطعم" value={28} color="bg-foreground" />
            <ProgressBar label="استلام ذاتي" value={18} color="bg-gray-light" />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider">أوقات الذروة — متوسط الإيراد لكل ساعة (بتوقيت الرياض)</div>
          {isPreliminary && <span className="text-[9px] text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded px-2 py-0.5">🟡 بيانات أولية</span>}
        </div>
        {!showPeak ? (
          <div className="text-center py-10 text-[11px] text-gray-light">
            🔒 خريطة الحرارة محجوبة — استمر بمزامنة الكاشير حتى تتجمع 14 يوم على الأقل.
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse">
            <thead>
              <tr>
                <th />
                {HOUR_LABELS.map((h) => (
                  <th key={h} className="text-[10px] text-gray-light font-semibold p-1 text-center">{h}</th>
                ))}
                <th className="text-[10px] text-gray-light font-semibold p-1 text-center">المتوسط</th>
              </tr>
            </thead>
            <tbody>
              {ORDERED_WEEKDAYS_LABEL.map((day, di) => {
                const avgForDay = weekdayAverages[di]?.avg ?? 0;
                return (
                  <tr key={day}>
                    <td className="text-[11px] text-gray font-semibold pr-2.5 py-1 whitespace-nowrap text-right">{day}</td>
                    {heatmap[di].map((cell, hi) => {
                      const c = heatColor(cell.avg, heatMax, cell.sampleDays);
                      return (
                        <td key={hi} className="w-9 h-[29px] rounded text-center align-middle text-[10px] font-bold"
                          style={{ background: c.bg, color: c.fg }}
                          title={cell.sampleDays > 0 ? `${cell.avg} ر.س متوسط · ${cell.sampleDays} يوم عينة` : "لا توجد بيانات"}>
                          {cell.sampleDays > 0 ? cell.avg : ""}
                        </td>
                      );
                    })}
                    <td className="text-[11px] font-bold text-primary text-center pr-2">{fmt(avgForDay)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
        <div className="flex items-center gap-1.5 mt-2.5 justify-end">
          <span className="text-[10px] text-gray-light font-medium">هادئ</span>
          {["#fceaec", "#e8a0a8", "#c03040", "#8a0c18"].map((bg) => (
            <div key={bg} className="w-[13px] h-[13px] rounded-sm" style={{ background: bg }} />
          ))}
          <span className="text-[10px] text-gray-light font-medium">ذروة</span>
        </div>
        {showPeak && kpis.strongestDay !== "—" && (
          <div className="mt-2 p-2 bg-background border border-border rounded-lg text-[9px] text-gray leading-relaxed">
            💡 <b className="text-foreground">نصيحة:</b> أقوى يوم {kpis.strongestDay} ({fmt(kpis.strongestDayAvg)} ر.س متوسط)، وأضعف يوم {kpis.weakestDay} ({fmt(kpis.weakestDayAvg)} ر.س). ركّز التسويق على الأيام الضعيفة لرفع المتوسط.
          </div>
        )}
      </div>
    </div>
  );
};

export default Behavior;
