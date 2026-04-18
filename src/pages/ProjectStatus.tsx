import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Landmark,
  Receipt,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { fmt } from "@/lib/format";
import { useProjectStatusInsights } from "@/hooks/useProjectStatusInsights";
import InsightCard from "@/components/project-status/InsightCard";
import WeekdayHeatmap from "@/components/project-status/WeekdayHeatmap";
import MomentumBar from "@/components/project-status/MomentumBar";
import HealthScore from "@/components/project-status/HealthScore";

/* ────── Bank statement ────── */
const totalBankRevenue = 68270;
const totalBankExpenses = 66163;
const investmentTotal = 292405;
const bankBalance = 2107;
const netCashFlow = totalBankRevenue - totalBankExpenses;
const roiMonths = Math.round(investmentTotal / (totalBankRevenue / 4));

const bankMonths = [
  { month: "ديسمبر", income: 13611, expenses: 3601 },
  { month: "يناير", income: 18906, expenses: 21765 },
  { month: "فبراير", income: 14524, expenses: 12632 },
  { month: "مارس", income: 19695, expenses: 23372 },
  { month: "أبريل", income: 5866, expenses: 4800 },
];

/* ────── POS sales (real) ────── */
const salesMonths = [
  { month: "ديسمبر 25", key: "12-25", gross: 15951, net: 15292, days: 31, avg: 493, max: 902, min: 5, discounts: 616, refunds: 43 },
  { month: "يناير 26", key: "01-26", gross: 32266, net: 27470, days: 31, avg: 886, max: 2030, min: 240, discounts: 4709, refunds: 87 },
  { month: "فبراير 26", key: "02-26", gross: 15294, net: 15055, days: 28, avg: 538, max: 1052, min: 97, discounts: 76, refunds: 163 },
  { month: "مارس 26", key: "03-26", gross: 24787, net: 24728, days: 31, avg: 798, max: 1759, min: 293, discounts: 59, refunds: 0 },
  { month: "أبريل 26", key: "04-26", gross: 9342, net: 9325, days: 11, avg: 848, max: 1141, min: 333, discounts: 17, refunds: 0 },
];

const totalGross = 97640;
const totalNet = 91870;
const totalDays = 132;
const dailyAvg = Math.round(totalNet / totalDays);
const totalDiscounts = 5477;
const discountRate = ((totalDiscounts / totalGross) * 100).toFixed(1);

// 132 days = ~19 occurrences/weekday (some 18, some 19). Totals = avg * count.
const weekdayData = [
  { day: "الجمعة", avg: 810, count: 19 },
  { day: "الخميس", avg: 707, count: 19 },
  { day: "السبت", avg: 704, count: 19 },
  { day: "الأحد", avg: 681, count: 19 },
  { day: "الثلاثاء", avg: 674, count: 19 },
  { day: "الأربعاء", avg: 668, count: 19 },
  { day: "الاثنين", avg: 627, count: 18 },
].map((d) => ({ ...d, total: d.avg * d.count }));

const growthData = [
  { from: "ديسمبر", to: "يناير", pct: 79.6 },
  { from: "يناير", to: "فبراير", pct: -45.2 },
  { from: "فبراير", to: "مارس", pct: 64.3 },
  { from: "مارس", to: "أبريل", pct: -62.3 },
];

const maxGross = Math.max(...salesMonths.map((m) => m.gross));
const maxBankIncome = Math.max(...bankMonths.map((m) => m.income));

const ProjectStatus = () => {
  const insights = useProjectStatusInsights({
    salesMonths,
    bankMonths,
    weekdayData,
    bankBalance,
    totalGross,
    totalNet,
    totalDiscounts,
  });

  const apr30Projected = Math.round(9325 * (30 / 11));
  const q2Projected = Math.round(apr30Projected * 3 * 1.1);
  const monthlyTarget = Math.round(investmentTotal / 24);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="حالة المشروع"
        subtitle="كشف بنك الراجحي + تقرير الكاشير · ديسمبر 2025 – أبريل 2026"
        badge="مباشر"
      />

      {/* ═══════ Hero KPIs ═══════ */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <MetricCard label="إجمالي المبيعات" value={fmt(totalGross)} sub="كاشير" subColor="gray" showRiyal />
        <MetricCard label="صافي المبيعات" value={fmt(totalNet)} sub="بعد الخصومات" subColor="success" showRiyal />
        <MetricCard label="متوسط يومي" value={fmt(dailyAvg)} sub={`${totalDays} يوم`} subColor="gray" showRiyal />
        <MetricCard label="معدل الخصم" value={`${discountRate}%`} sub={`${fmt(totalDiscounts)} ر.س`} subColor="warning" />
        <MetricCard label="الرصيد البنكي" value={fmt(bankBalance)} sub="الراجحي" subColor="danger" showRiyal />
      </div>

      {/* ═══════ Health + Momentum ═══════ */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <HealthScore score={insights.healthScore} label={insights.healthLabel} tone={insights.healthTone} />
        <div className="col-span-2">
          <MomentumBar
            momentumPct={insights.momentumPct}
            trendUp={insights.trendUp}
            last30Avg={insights.last30Avg}
            prev30Avg={insights.prev30Avg}
            burnRatePerDay={insights.burnRatePerDay}
            incomeRatePerDay={insights.incomeRatePerDay}
            runwayDays={insights.runwayDays}
          />
        </div>
      </div>

      {/* ═══════ Analytics grid: Monthly / Weekday / Growth ═══════ */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Monthly sales */}
        <div className="ios-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Receipt size={16} />
            </div>
            <div className="text-[12px] font-semibold text-foreground">أداء المبيعات الشهري</div>
          </div>
          <div className="space-y-3">
            {salesMonths.map((m, i) => {
              const prev = salesMonths[i - 1];
              const up = prev ? m.net >= prev.net : true;
              return (
                <div key={m.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      {prev && (up ? (
                        <TrendingUp size={10} className="text-success" />
                      ) : (
                        <TrendingDown size={10} className="text-danger" />
                      ))}
                      {m.month}
                    </span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-muted-foreground">{m.days} يوم</span>
                      <span className="text-foreground font-bold flex items-center gap-1">
                        {fmt(m.net)}
                        <RiyalIcon size={9} />
                      </span>
                    </div>
                  </div>
                  <div className="relative h-3 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary/25 rounded-full" style={{ width: `${(m.gross / maxGross) * 100}%` }} />
                    <div className="absolute top-0 right-0 h-full bg-primary rounded-full" style={{ width: `${(m.net / maxGross) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>أدنى: {fmt(m.min)}</span>
                    <span>متوسط: {fmt(m.avg)}</span>
                    <span>أعلى: {fmt(m.max)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekday heatmap */}
        <div className="ios-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center">
              <Calendar size={16} />
            </div>
            <div className="text-[12px] font-semibold text-foreground">متوسط المبيعات حسب اليوم</div>
          </div>
          <WeekdayHeatmap data={weekdayData} highlight={insights.bestDay?.day} />
          <div className="mt-4 p-3 bg-background rounded-xl flex items-start gap-2">
            <Sparkles size={14} className="text-accent shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-bold text-foreground mb-0.5">استنتاج</div>
              <div className="text-[10px] text-muted-foreground leading-relaxed">
                {insights.bestDay?.day} أقوى يوم ({fmt(insights.bestDay?.avg ?? 0)} ر.س) و{insights.worstDay?.day} الأضعف
                ({fmt(insights.worstDay?.avg ?? 0)} ر.س). الفارق {insights.weekdaySpreadPct.toFixed(0)}% — فرصة لعروض يوم {insights.worstDay?.day}.
              </div>
            </div>
          </div>
        </div>

        {/* Growth */}
        <div className="ios-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-info/10 text-info flex items-center justify-center">
              <Activity size={16} />
            </div>
            <div className="text-[12px] font-semibold text-foreground">النمو الشهري</div>
          </div>
          <div className="space-y-2.5">
            {growthData.map((g) => {
              const up = g.pct >= 0;
              return (
                <div key={g.from + g.to} className="p-3 bg-background rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${up ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                        {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{g.from} → {g.to}</span>
                    </div>
                    <span className={`text-[14px] font-bold ${up ? "text-success" : "text-danger"}`}>
                      {up ? "+" : ""}{g.pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${up ? "bg-success" : "bg-danger"}`}
                      style={{ width: `${Math.min(Math.abs(g.pct), 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════ Smart analysis: Weakness / Gaps / Forecasts ═══════ */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="ios-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-danger/10 text-danger flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
            <div className="text-[12px] font-semibold text-foreground">نقاط الضعف</div>
          </div>
          <div className="space-y-2">
            <InsightCard icon={TrendingDown} tone="danger" title="فبراير: أضعف شهر" description="متوسط 538 ر.س/يوم — أقل من التعادل التشغيلي." />
            <InsightCard icon={Calendar} tone="warning" title="الاثنين: أضعف يوم" description="627 ر.س — أقل 23% من الجمعة. يحتاج عروض." />
            <InsightCard icon={Activity} tone="danger" title="تذبذب عالي" description="الفارق بين أعلى وأدنى يوم 2,000%." />
            <InsightCard icon={Zap} tone="warning" title="خصومات يناير مبالغة" description="4,709 ر.س = 14.6% من مبيعات الشهر." />
            <InsightCard icon={Target} tone="warning" title="تركّز أيام الذروة" description="أعلى 10 أيام = 30% من الإجمالي." />
          </div>
        </div>

        <div className="ios-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-warning/15 text-warning flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
            <div className="text-[12px] font-semibold text-foreground">العجز والفجوات</div>
          </div>
          <div className="space-y-2">
            <InsightCard icon={Landmark} tone="warning" title="فجوة البنك vs الكاشير" value={fmt(totalNet - totalBankRevenue)} showRiyal description="مبيعات الكاشير أعلى من إيداعات البنك — كاش لم يودع." />
            <InsightCard icon={Wallet} tone="danger" title="عجز السيولة" value={fmt(bankBalance)} showRiyal description="الرصيد يكفي ~يوم واحد بالمعدل الحالي." />
            <InsightCard icon={CreditCard} tone="warning" title="معدل الاسترداد" value={`${((293 / totalGross) * 100).toFixed(2)}%`} description="293 ر.س مبالغ مستردة — صحية لكن تحتاج مراقبة." />
            <InsightCard icon={Calendar} tone="warning" title="أيام تحت 300 ر.س" value="8 أيام" description="غالبها في ديسمبر وفبراير." />
            <InsightCard icon={FileText} tone="danger" title="لا بيانات تكلفة" value="0%" description="تكلفة البضاعة المباعة = صفر — هامش الربح غير محسوب." />
          </div>
        </div>

        <div className="ios-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-success/10 text-success flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div className="text-[12px] font-semibold text-foreground">التوقعات والتحليل التنبؤي</div>
          </div>
          <div className="space-y-2">
            <InsightCard icon={Target} tone="success" title="توقع أبريل الكامل" value={`~${fmt(apr30Projected)}`} showRiyal description={`بناءً على 11 يوم (848 ر.س/يوم).`} />
            <InsightCard icon={TrendingUp} tone="success" title="توقع Q2" value={`~${fmt(q2Projected)}`} showRiyal description="مع نمو 10% شهري متوقع بدخول الصيف." />
            <InsightCard icon={Target} tone="info" title="هدف التعادل الشهري" value={`${fmt(monthlyTarget)}`} showRiyal description={`لاسترداد رأس المال (${fmt(investmentTotal)}) في سنتين.`} />
            <InsightCard icon={Activity} tone="info" title="استرداد رأس المال" value={`~${roiMonths} شهر`} description={`بمتوسط ربح شهري ~${fmt(Math.round(netCashFlow / 4))} ر.س.`} />
            <InsightCard icon={Sparkles} tone="success" title="مارس نموذجي" value="798" showRiyal description="مارس أثبت قدرة المتجر على 25K+ شهرياً بدون خصومات." />
          </div>
        </div>
      </div>

      {/* ═══════ Bank vs Cashier + Expense distribution ═══════ */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="ios-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Landmark size={16} />
            </div>
            <div className="text-[12px] font-semibold text-foreground">الحركة البنكية — إيرادات vs مصروفات</div>
          </div>
          <div className="space-y-3">
            {bankMonths.map((m) => {
              const net = m.income - m.expenses;
              return (
                <div key={m.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-muted-foreground">{m.month}</span>
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${net >= 0 ? "text-success" : "text-danger"}`}>
                      {net >= 0 ? "+" : ""}{fmt(net)}
                      <RiyalIcon size={9} />
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: `${(m.income / maxBankIncome) * 100}%` }} />
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${(m.expenses / maxBankIncome) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-success inline-block" /> إيرادات
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary/60 inline-block" /> مصروفات
            </span>
          </div>
        </div>

        <div className="ios-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center">
              <Wallet size={16} />
            </div>
            <div className="text-[12px] font-semibold text-foreground">توزيع المصروفات البنكية</div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "مشتريات التشغيل", amount: 54642, icon: ShoppingCart, tone: "primary" as const },
              { label: "فواتير كهرباء", amount: 2428, icon: Zap, tone: "warning" as const },
              { label: "إقامات عمالة", amount: 3614, icon: FileText, tone: "accent" as const },
              { label: "موردين", amount: 2550, icon: Truck, tone: "info" as const },
              { label: "سحوبات ومتفرقات", amount: 3500, icon: CreditCard, tone: "muted" as const },
            ].map((item) => {
              const pct = Math.round((item.amount / totalBankExpenses) * 100);
              const toneText = {
                primary: "text-primary",
                warning: "text-warning",
                accent: "text-accent",
                info: "text-info",
                muted: "text-muted-foreground",
              }[item.tone];
              const toneBg = {
                primary: "bg-primary/10",
                warning: "bg-warning/15",
                accent: "bg-accent/15",
                info: "bg-info/10",
                muted: "bg-muted",
              }[item.tone];
              const toneFill = {
                primary: "bg-primary",
                warning: "bg-warning",
                accent: "bg-accent",
                info: "bg-info",
                muted: "bg-muted-foreground",
              }[item.tone];
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-full ${toneBg} ${toneText} flex items-center justify-center`}>
                        <Icon size={13} />
                      </span>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{pct}%</span>
                      <span className="text-foreground font-semibold flex items-center gap-1">
                        {fmt(item.amount)}
                        <RiyalIcon size={9} />
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                    <div className={`h-full ${toneFill} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════ Investment distribution ═══════ */}
      <div className="ios-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Building2 size={16} />
            </div>
            <div className="text-[12px] font-semibold text-foreground">توزيع الاستثمار التأسيسي</div>
          </div>
          <div className="text-[12px] font-bold text-foreground flex items-center gap-1">
            {fmt(investmentTotal)}
            <RiyalIcon size={11} />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "ديكور وتشطيبات", amount: 60386, pct: 20.7, icon: Building2, tone: "primary" },
            { label: "آلات ومعدات", amount: 48566, pct: 16.6, icon: Zap, tone: "warning" },
            { label: "إيجار", amount: 40000, pct: 13.7, icon: Landmark, tone: "info" },
            { label: "رواتب وعمالة", amount: 24030, pct: 8.2, icon: FileText, tone: "accent" },
            { label: "أخرى", amount: 119423, pct: 40.8, icon: Receipt, tone: "muted" },
          ].map((item) => {
            const toneBg = {
              primary: "bg-primary/10",
              warning: "bg-warning/15",
              info: "bg-info/10",
              accent: "bg-accent/15",
              muted: "bg-muted",
            }[item.tone as string];
            const toneText = {
              primary: "text-primary",
              warning: "text-warning",
              info: "text-info",
              accent: "text-accent",
              muted: "text-muted-foreground",
            }[item.tone as string];
            const toneFill = {
              primary: "bg-primary/60",
              warning: "bg-warning/60",
              info: "bg-info/60",
              accent: "bg-accent/60",
              muted: "bg-muted-foreground/60",
            }[item.tone as string];
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-background rounded-xl p-4 text-center">
                <div className={`w-10 h-10 rounded-full ${toneBg} ${toneText} mx-auto mb-2 flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
                <div className="text-[15px] font-bold text-foreground flex items-center justify-center gap-1">
                  {fmt(item.amount)}
                  <RiyalIcon size={10} />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{item.label}</div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mt-2">
                  <div className={`h-full ${toneFill} rounded-full`} style={{ width: `${Math.min(item.pct * 2.5, 100)}%` }} />
                </div>
                <div className="text-[9px] text-muted-foreground mt-1">{item.pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectStatus;
