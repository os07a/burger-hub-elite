import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import CapitalProgressCard from "@/components/profits/CapitalProgressCard";
import ShareTimelineTable from "@/components/profits/ShareTimelineTable";
import PartnerShareCard from "@/components/profits/PartnerShareCard";
import IncomeDistributionEngine from "@/components/profits/IncomeDistributionEngine";
import SmartProfitInsights from "@/components/profits/SmartProfitInsights";
import RestaurantCostVsRevenueCard from "@/components/profits/RestaurantCostVsRevenueCard";
import { usePartnerShares, summarizeShares } from "@/hooks/usePartnerShares";
import { useShareMilestones, computeMilestoneState } from "@/hooks/useShareMilestones";
import { useMonthlyIncomes } from "@/hooks/useIncomeDistribution";
import { useTotalCostBreakdown, useTotalRevenue } from "@/hooks/useRestaurantFinancials";
import { fmt } from "@/lib/format";

const TOTAL_CAPITAL = 200_000;
const SHARE_UNIT = 1_000;

const expenses = [
  { label: "الديكور", pct: 16.9, value: 49482, color: "bg-primary", bucket: "محل" },
  { label: "الآلات والمعدات", pct: 16.6, value: 48566, color: "bg-foreground", bucket: "محل" },
  { label: "الإيجار", pct: 13.7, value: 40000, color: "bg-primary", bucket: "محل" },
  { label: "الهوية البصرية", pct: 7.6, value: 22243, color: "bg-gray", bucket: "محل" },
  { label: "رواتب الموظفين", pct: 6.5, value: 19150, color: "bg-foreground", bucket: "تشغيل" },
  { label: "صيانة تأسيسية", pct: 6.2, value: 18047, color: "bg-gray-light", bucket: "تشغيل" },
  { label: "رسوم حكومية", pct: 5.4, value: 15810, color: "bg-gray", bucket: "محل" },
  { label: "مستحقات أسامة", pct: 4.5, value: 13250, color: "bg-primary", bucket: "فكرة" },
  { label: "التشطيبات الإضافية", pct: 3.7, value: 10904, color: "bg-gray-light", bucket: "محل" },
  { label: "مصروفات الافتتاح", pct: 3.2, value: 9497, color: "bg-foreground", bucket: "محل" },
  { label: "مصروفات تموينية", pct: 3.2, value: 9337, color: "bg-gray", bucket: "تشغيل" },
  { label: "مصروفات غير معروفة ⚠️", pct: 2.5, value: 7185, color: "bg-warning", bucket: "غير محدد" },
  { label: "الكهرباء", pct: 2.4, value: 7054, color: "bg-gray-light", bucket: "تشغيل" },
  { label: "خدمات إدارية/محاسبية", pct: 1.9, value: 5500, color: "bg-gray", bucket: "تشغيل" },
  { label: "سوشل ميديا", pct: 1.7, value: 5000, color: "bg-foreground", bucket: "تشغيل" },
  { label: "العمال", pct: 1.7, value: 4880, color: "bg-gray-light", bucket: "تشغيل" },
  { label: "إنترنت وشبكات", pct: 1.2, value: 3500, color: "bg-gray", bucket: "تشغيل" },
  { label: "دعاية وإعلان", pct: 1.0, value: 3000, color: "bg-gray-light", bucket: "تشغيل" },
];

const bucketBadge: Record<string, string> = {
  محل: "bg-primary/10 text-primary border-primary/30",
  تشغيل: "bg-success/10 text-success border-success/30",
  فكرة: "bg-warning/10 text-warning border-warning/30",
  "غير محدد": "bg-danger/10 text-danger border-danger/30",
};

const Profits = () => {
  const { data: shares = [] } = usePartnerShares();
  const { data: milestones = [] } = useShareMilestones();
  const { data: costBreakdown } = useTotalCostBreakdown();
  const { data: revenueData } = useTotalRevenue();

  const summaries = summarizeShares(shares);
  const totalPaid = summaries.reduce((s, p) => s + p.paidValue, 0);
  const totalPaidShares = summaries.reduce((s, p) => s + p.paidShares, 0);
  const totalShares = summaries.reduce((s, p) => s + p.totalShares, 0);
  const remainingCapital = TOTAL_CAPITAL - totalPaid;

  const { data: incomes = [] } = useMonthlyIncomes(totalPaidShares);
  const currentIncome = incomes[incomes.length - 1];
  const last3 = incomes.slice(-3);
  const avg3m = last3.length ? last3.reduce((s, i) => s + i.totalRevenue, 0) / last3.length : 0;

  const upcoming = milestones.find((m) => computeMilestoneState(m) !== "met");
  const overdueCount = milestones.filter((m) => computeMilestoneState(m) === "overdue").length;
  const status: "on_track" | "behind" | "ahead" = overdueCount > 0 ? "behind" : "on_track";

  const osama = summaries.find((s) => s.partner === "أسامة") || {
    partner: "أسامة", paidShares: 0, pendingShares: 0, paidValue: 0, pendingValue: 0, totalShares: 0, byCategory: {},
  };
  const youssef = summaries.find((s) => s.partner === "يوسف") || {
    partner: "يوسف", paidShares: 0, pendingShares: 0, paidValue: 0, pendingValue: 0, totalShares: 0, byCategory: {},
  };

  const youssefPct = (youssef.totalShares / 200) * 100;
  const osamaPctNorm = (osama.totalShares / 200) * 100;

  const osamaShareIncome = currentIncome ? currentIncome.perShareAmount * osama.paidShares : 0;
  const youssefShareIncome = currentIncome ? currentIncome.perShareAmount * youssef.paidShares : 0;
  const osamaAvg = avg3m > 0 && totalPaidShares > 0 ? (avg3m / totalPaidShares) * osama.paidShares : 0;
  const youssefAvg = avg3m > 0 && totalPaidShares > 0 ? (avg3m / totalPaidShares) * youssef.paidShares : 0;

  // Smart insights
  const insights: { type: "success" | "warning" | "danger" | "info"; icon: string; text: string }[] = [];

  if (costBreakdown && revenueData) {
    const recoveryPct = (revenueData.combinedTotal / costBreakdown.total) * 100;
    if (recoveryPct < 100) {
      insights.push({
        type: recoveryPct < 30 ? "danger" : recoveryPct < 70 ? "warning" : "info",
        icon: "💰",
        text: `استرديت ${fmt(revenueData.combinedTotal)} ر من أصل ${fmt(costBreakdown.total)} ر — نسبة الاسترداد ${recoveryPct.toFixed(1)}%`,
      });
    } else {
      insights.push({
        type: "success",
        icon: "🎉",
        text: `تم استرداد كامل تكلفة المطعم (${fmt(costBreakdown.total)} ر) — أي دخل إضافي = ربح صافي`,
      });
    }
    if (costBreakdown.invoicesPending > 0) {
      insights.push({
        type: "warning",
        icon: "🧾",
        text: `يوجد فواتير موردين معلّقة بمجموع ${fmt(costBreakdown.invoicesPending)} ر — راجع قسم الموردين`,
      });
    }
  }

  if (overdueCount > 0) {
    const overdueShares = milestones
      .filter((m) => computeMilestoneState(m) === "overdue")
      .reduce((s, m) => s + m.shares_required, 0);
    insights.push({
      type: "danger",
      icon: "⚠️",
      text: `يوجد ${overdueCount} دفعة متأخرة بمجموع ${overdueShares} سهم (${fmt(overdueShares * SHARE_UNIT)} ر.س) — مطلوب توفيرها فوراً`,
    });
  }
  if (currentIncome && currentIncome.totalRevenue < 15_761 * 30) {
    insights.push({
      type: "warning",
      icon: "📉",
      text: "دخل الشهر الحالي تحت نقطة التعادل التشغيلية — يُنصح بحجز كامل الدخل ولا توزيع نقدي",
    });
  }
  if (currentIncome && currentIncome.sharesGenerated > 0 && totalPaidShares > 0) {
    insights.push({
      type: "info",
      icon: "💡",
      text: `تم توليد ${currentIncome.sharesGenerated} سهم هذا الشهر، نصيب كل سهم مدفوع: ${fmt(currentIncome.perShareAmount)} ر.س`,
    });
  }
  insights.push({
    type: "warning",
    icon: "🔍",
    text: "يوجد 7,185 ر.س مصروفات غير موثقة في التأسيس — تحتاج مراجعة وتصنيف",
  });

  return (
    <div>
      <PageHeader title="الأرباح والنسب" subtitle="نظرة شاملة: تكلفة المطعم، نظام الأسهم، توزيع الدخل، ومستحقات الشركاء" />

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard
          label="💸 إجمالي تكلفة المطعم"
          value={costBreakdown ? fmt(costBreakdown.total) : "—"}
          sub="تأسيس + موردين + رواتب"
          subColor="danger"
          showRiyal
        />
        <MetricCard
          label="💰 إجمالي المسترد"
          value={revenueData ? fmt(revenueData.combinedTotal) : "—"}
          sub={revenueData ? `${revenueData.monthsCovered} شهر مبيعات` : ""}
          subColor="success"
          showRiyal
        />
        <MetricCard
          label="🎯 رأس المال المتحقق"
          value={fmt(totalPaid)}
          sub={`${totalPaidShares} سهم من 200`}
          subColor="success"
          showRiyal
        />
        <MetricCard
          label="⚠️ دفعات متأخرة"
          value={fmt(overdueCount)}
          sub={overdueCount > 0 ? "تحتاج إجراء فوري" : "كل شيء على المسار"}
          subColor={overdueCount > 0 ? "danger" : "success"}
        />
      </div>

      {/* Restaurant cost vs revenue (NEW — connects all sections) */}
      {costBreakdown && revenueData && (
        <div className="mb-5">
          <RestaurantCostVsRevenueCard
            totalCost={costBreakdown.total}
            totalRevenue={revenueData.combinedTotal}
            founding={costBreakdown.founding}
            invoicesPaid={costBreakdown.invoicesPaid}
            invoicesPending={costBreakdown.invoicesPending}
            payrollAccumulated={costBreakdown.payrollAccumulated}
            payrollMonthly={costBreakdown.payrollMonthly}
            monthsActive={costBreakdown.monthsActive}
            averageMonthlyRevenue={revenueData.averageMonthly}
          />
        </div>
      )}

      {/* Capital progress */}
      <div className="mb-5">
        <CapitalProgressCard
          totalCapital={TOTAL_CAPITAL}
          raisedCapital={totalPaid}
          nextMilestoneDate={upcoming?.due_date}
          nextMilestoneShares={upcoming?.shares_required}
          status={status}
        />
      </div>

      {/* Smart insights */}
      <div className="mb-5">
        <SmartProfitInsights insights={insights} />
      </div>

      {/* Income distribution engine */}
      <div className="mb-5">
        <IncomeDistributionEngine
          incomes={incomes}
          paidShares={totalPaidShares}
          remainingCapital={remainingCapital}
        />
      </div>

      {/* Partners cards */}
      <div className="bg-surface border border-border rounded-lg p-4 mb-5">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">
          مستحقات الشركاء (محسوبة من نظام الأسهم)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <PartnerShareCard
            partner="أسامة"
            ownershipPct={osamaPctNorm}
            paidShares={osama.paidShares}
            pendingShares={osama.pendingShares}
            monthlyShareIncome={osamaShareIncome}
            avg3mIncome={osamaAvg}
            upcomingObligationShares={0}
            byCategory={osama.byCategory}
          />
          <PartnerShareCard
            partner="يوسف"
            ownershipPct={youssefPct}
            paidShares={youssef.paidShares}
            pendingShares={youssef.pendingShares}
            monthlyShareIncome={youssefShareIncome}
            avg3mIncome={youssefAvg}
            upcomingObligationShares={milestones
              .filter((m) => computeMilestoneState(m) !== "met")
              .reduce((s, m) => s + m.shares_required, 0)}
            byCategory={youssef.byCategory}
          />
        </div>
      </div>

      {/* Timeline table */}
      <div className="mb-5">
        <ShareTimelineTable initialAchieved={70} reservedShares={16} milestones={milestones} />
      </div>

      {/* Founding expenses — smarter breakdown */}
      {(() => {
        const totalExp = expenses.reduce((s, e) => s + e.value, 0);
        const buckets = expenses.reduce<Record<string, { value: number; count: number }>>((acc, e) => {
          acc[e.bucket] = acc[e.bucket] || { value: 0, count: 0 };
          acc[e.bucket].value += e.value;
          acc[e.bucket].count += 1;
          return acc;
        }, {});
        const bucketEntries = Object.entries(buckets).sort((a, b) => b[1].value - a[1].value);
        const top3 = [...expenses].sort((a, b) => b.value - a.value).slice(0, 3);
        const top3Pct = (top3.reduce((s, e) => s + e.value, 0) / totalExp) * 100;
        const unknown = expenses.find((e) => e.bucket === "غير محدد");

        return (
          <div className="bg-surface border border-border rounded-lg p-4 mb-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider">
                  توزيع المصروفات التأسيسية
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  إجمالي {fmt(totalExp)} ر.س — موزّعة على {expenses.length} بنداً
                </div>
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                {bucketEntries.map(([name, b]) => (
                  <span key={name} className={`text-[9px] px-1.5 py-0.5 rounded border ${bucketBadge[name]}`}>
                    {name} {fmt(b.value)} ({((b.value / totalExp) * 100).toFixed(0)}%)
                  </span>
                ))}
              </div>
            </div>

            {/* Stacked bucket bar */}
            <div className="flex h-2 w-full rounded-full overflow-hidden mb-4 border border-border">
              {bucketEntries.map(([name, b]) => {
                const w = (b.value / totalExp) * 100;
                const cls =
                  name === "محل" ? "bg-primary"
                  : name === "تشغيل" ? "bg-success"
                  : name === "فكرة" ? "bg-warning"
                  : "bg-danger";
                return <div key={name} className={cls} style={{ width: `${w}%` }} title={`${name}: ${fmt(b.value)}`} />;
              })}
            </div>

            {expenses.map((item) => (
              <div key={item.label} className="mb-3 last:mb-0">
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-gray font-medium flex items-center gap-1.5">
                    {item.label}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${bucketBadge[item.bucket]}`}>
                      {item.bucket}
                    </span>
                  </span>
                  <span>
                    <span className="text-[10px] text-gray-light ml-1">{item.pct}%</span>
                    <span className="text-[12px] font-bold text-foreground">{fmt(item.value)} ر</span>
                  </span>
                </div>
                <div className="h-[4px] bg-background rounded-sm overflow-hidden">
                  <div className={`h-full rounded-sm ${item.color}`} style={{ width: `${item.pct * 4}%` }} />
                </div>
              </div>
            ))}

            {/* Smart footer insights */}
            <div className="mt-4 pt-3 border-t border-border space-y-1.5">
              <div className="text-[10px] text-gray-light flex justify-between">
                <span>🏆 أعلى 3 بنود ({top3.map((e) => e.label).join("، ")})</span>
                <span className="text-foreground font-semibold">{top3Pct.toFixed(1)}% من الإجمالي</span>
              </div>
              {unknown && (
                <div className="text-[10px] text-warning flex justify-between">
                  <span>⚠️ مصروفات غير موثّقة تحتاج مراجعة وتصنيف</span>
                  <span className="font-semibold">{fmt(unknown.value)} ر ({unknown.pct}%)</span>
                </div>
              )}
              <div className="text-[10px] text-gray-light flex justify-between">
                <span>💡 نسبة المصروفات الرأسمالية (محل) إلى التشغيلية</span>
                <span className="text-foreground font-semibold">
                  {(((buckets["محل"]?.value || 0) / (buckets["تشغيل"]?.value || 1))).toFixed(2)}× 
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Profits;
