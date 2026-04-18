import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import CapitalProgressCard from "@/components/profits/CapitalProgressCard";
import ShareTimelineTable from "@/components/profits/ShareTimelineTable";
import PartnerShareCard from "@/components/profits/PartnerShareCard";
import IncomeDistributionEngine from "@/components/profits/IncomeDistributionEngine";
import SmartProfitInsights from "@/components/profits/SmartProfitInsights";
import { usePartnerShares, summarizeShares } from "@/hooks/usePartnerShares";
import { useShareMilestones, computeMilestoneState } from "@/hooks/useShareMilestones";
import { useMonthlyIncomes } from "@/hooks/useIncomeDistribution";

const TOTAL_CAPITAL = 200_000;
const SHARE_UNIT = 1_000;

const expenses = [
  { label: "الديكور", pct: 16.9, value: "49,482", color: "bg-primary", bucket: "محل" },
  { label: "الآلات والمعدات", pct: 16.6, value: "48,566", color: "bg-foreground", bucket: "محل" },
  { label: "الإيجار", pct: 13.7, value: "40,000", color: "bg-primary", bucket: "محل" },
  { label: "الهوية البصرية", pct: 7.6, value: "22,243", color: "bg-gray", bucket: "محل" },
  { label: "رواتب الموظفين", pct: 6.5, value: "19,150", color: "bg-foreground", bucket: "تشغيل" },
  { label: "صيانة تأسيسية", pct: 6.2, value: "18,047", color: "bg-gray-light", bucket: "تشغيل" },
  { label: "رسوم حكومية", pct: 5.4, value: "15,810", color: "bg-gray", bucket: "محل" },
  { label: "مستحقات أسامة", pct: 4.5, value: "13,250", color: "bg-primary", bucket: "فكرة" },
  { label: "التشطيبات الإضافية", pct: 3.7, value: "10,904", color: "bg-gray-light", bucket: "محل" },
  { label: "مصروفات الافتتاح", pct: 3.2, value: "9,497", color: "bg-foreground", bucket: "محل" },
  { label: "مصروفات تموينية", pct: 3.2, value: "9,337", color: "bg-gray", bucket: "تشغيل" },
  { label: "مصروفات غير معروفة ⚠️", pct: 2.5, value: "7,185", color: "bg-warning", bucket: "غير محدد" },
  { label: "الكهرباء", pct: 2.4, value: "7,054", color: "bg-gray-light", bucket: "تشغيل" },
  { label: "خدمات إدارية/محاسبية", pct: 1.9, value: "5,500", color: "bg-gray", bucket: "تشغيل" },
  { label: "سوشل ميديا", pct: 1.7, value: "5,000", color: "bg-foreground", bucket: "تشغيل" },
  { label: "العمال", pct: 1.7, value: "4,880", color: "bg-gray-light", bucket: "تشغيل" },
  { label: "إنترنت وشبكات", pct: 1.2, value: "3,500", color: "bg-gray", bucket: "تشغيل" },
  { label: "دعاية وإعلان", pct: 1.0, value: "3,000", color: "bg-gray-light", bucket: "تشغيل" },
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

  const summaries = summarizeShares(shares);
  const totalPaid = summaries.reduce((s, p) => s + p.paidValue, 0);
  const totalPaidShares = summaries.reduce((s, p) => s + p.paidShares, 0);
  const totalShares = summaries.reduce((s, p) => s + p.totalShares, 0);
  const remainingCapital = TOTAL_CAPITAL - totalPaid;

  const { data: incomes = [] } = useMonthlyIncomes(totalPaidShares);
  const currentIncome = incomes[incomes.length - 1];
  const last3 = incomes.slice(-3);
  const avg3m = last3.length ? last3.reduce((s, i) => s + i.totalRevenue, 0) / last3.length : 0;

  // Next milestone + status
  const upcoming = milestones.find((m) => computeMilestoneState(m) !== "met");
  const overdueCount = milestones.filter((m) => computeMilestoneState(m) === "overdue").length;
  const status: "on_track" | "behind" | "ahead" = overdueCount > 0 ? "behind" : "on_track";

  // Partner data
  const osama = summaries.find((s) => s.partner === "أسامة") || {
    partner: "أسامة",
    paidShares: 0,
    pendingShares: 0,
    paidValue: 0,
    pendingValue: 0,
    totalShares: 0,
    byCategory: {},
  };
  const youssef = summaries.find((s) => s.partner === "يوسف") || {
    partner: "يوسف",
    paidShares: 0,
    pendingShares: 0,
    paidValue: 0,
    pendingValue: 0,
    totalShares: 0,
    byCategory: {},
  };

  const osamaPct = totalShares > 0 ? (osama.totalShares / TOTAL_CAPITAL) * 100 * 1000 / 1 : 49;
  const youssefPct = totalShares > 0 ? (youssef.totalShares / 200) * 100 : 51;
  const osamaPctNorm = (osama.totalShares / 200) * 100;

  const osamaShareIncome = currentIncome ? currentIncome.perShareAmount * osama.paidShares : 0;
  const youssefShareIncome = currentIncome ? currentIncome.perShareAmount * youssef.paidShares : 0;
  const osamaAvg = avg3m > 0 && totalPaidShares > 0 ? (avg3m / totalPaidShares) * osama.paidShares : 0;
  const youssefAvg = avg3m > 0 && totalPaidShares > 0 ? (avg3m / totalPaidShares) * youssef.paidShares : 0;

  // Smart insights
  const insights: { type: "success" | "warning" | "danger" | "info"; icon: string; text: string }[] = [];
  if (overdueCount > 0) {
    const overdueShares = milestones
      .filter((m) => computeMilestoneState(m) === "overdue")
      .reduce((s, m) => s + m.shares_required, 0);
    insights.push({
      type: "danger",
      icon: "⚠️",
      text: `يوجد ${overdueCount} دفعة متأخرة بمجموع ${overdueShares} سهم (${(overdueShares * SHARE_UNIT).toLocaleString("ar-SA")} ر.س) — مطلوب توفيرها فوراً`,
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
      text: `تم توليد ${currentIncome.sharesGenerated} سهم هذا الشهر، نصيب كل سهم مدفوع: ${Math.round(currentIncome.perShareAmount).toLocaleString("ar-SA")} ر.س`,
    });
  }
  insights.push({
    type: "warning",
    icon: "🔍",
    text: "يوجد 7,185 ر.س مصروفات غير موثقة في التأسيس — تحتاج مراجعة وتصنيف",
  });
  if (totalPaid >= TOTAL_CAPITAL) {
    insights.push({
      type: "success",
      icon: "🎉",
      text: "اكتمل رأس المال — كامل الدخل الآن قابل للتوزيع نقدياً على الشركاء",
    });
  }

  return (
    <div>
      <PageHeader title="الأرباح والنسب" subtitle="نظام أسهم الشراكة، توزيع الدخل، ومستحقات الشركاء" />

      {/* KPI summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <MetricCard
          label="🎯 رأس المال المتحقق"
          value={totalPaid.toLocaleString("ar-SA")}
          sub={`${totalPaidShares} سهم من 200`}
          subColor="success"
          showRiyal
        />
        <MetricCard
          label="📅 الدفعة القادمة"
          value={upcoming ? `${upcoming.shares_required} سهم` : "—"}
          sub={upcoming ? new Date(upcoming.due_date).toLocaleDateString("ar-SA", { day: "numeric", month: "long" }) : "اكتمل الجدول"}
          subColor={overdueCount > 0 ? "danger" : "gray"}
        />
        <MetricCard
          label="⚠️ دفعات متأخرة"
          value={overdueCount.toString()}
          sub={overdueCount > 0 ? "تحتاج إجراء فوري" : "كل شيء على المسار"}
          subColor={overdueCount > 0 ? "danger" : "success"}
        />
      </div>

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
      <div className="bg-surface border rounded-lg p-4 border-r-[3px] border-r-primary border-gray-50 mb-5">
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

      {/* Founding expenses (kept, enhanced with bucket tags) */}
      <div className="bg-surface border rounded-lg p-4 border-r-[3px] border-r-primary border-gray-50 mb-5">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider">
            توزيع المصروفات التأسيسية
          </div>
          <div className="flex gap-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded border bg-primary/10 text-primary border-primary/30">محل 108k</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded border bg-success/10 text-success border-success/30">تشغيل 70k</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded border bg-warning/10 text-warning border-warning/30">فكرة 30k</span>
          </div>
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
                <span className="text-[12px] font-bold text-foreground">{item.value} ر</span>
              </span>
            </div>
            <div className="h-[4px] bg-background rounded-sm overflow-hidden">
              <div className={`h-full rounded-sm ${item.color}`} style={{ width: `${item.pct * 4}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profits;
