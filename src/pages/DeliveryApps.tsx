import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import MetricCardPro from "@/components/delivery/MetricCardPro";
import ChannelRevenueTable from "@/components/delivery/ChannelRevenueTable";
import { useDeliveryMetrics } from "@/hooks/useDeliveryMetrics";
import KeetaPerformanceChart from "@/components/delivery/KeetaPerformanceChart";

const keetaChartData = [
  { date: "06/02", netIncome: 89.08, sales: 210, commission: 26.75, promoCost: 67, otherCosts: 27.17 },
  { date: "07/02", netIncome: 154.54, sales: 334, commission: 45.8, promoCost: 90.7, otherCosts: 42.96 },
  { date: "08/02", netIncome: 54.19, sales: 126, commission: 15.45, promoCost: 40.2, otherCosts: 16.16 },
  { date: "09/02", netIncome: -13.53, sales: 76, commission: 10.37, promoCost: 18.4, otherCosts: 60.76 },
  { date: "10/02", netIncome: 72.57, sales: 175, commission: 22.14, promoCost: 57.6, otherCosts: 22.69 },
  { date: "11/02", netIncome: 142.07, sales: 311, commission: 42.09, promoCost: 88.35, otherCosts: 38.49 },
  { date: "12/02", netIncome: 118.09, sales: 262, commission: 33, promoCost: 78.7, otherCosts: 32.21 },
  { date: "13/02", netIncome: 89.75, sales: 215, commission: 27, promoCost: 70.6, otherCosts: 27.65 },
  { date: "14/02", netIncome: 17.99, sales: 42, commission: 5.15, promoCost: 13.4, otherCosts: 5.46 },
  { date: "16/02", netIncome: 17.34, sales: 154, commission: 19.44, promoCost: 46.8, otherCosts: 70.42 },
  { date: "17/02", netIncome: 68.87, sales: 155, commission: 20.95, promoCost: 44.2, otherCosts: 20.98 },
  { date: "18/02", netIncome: 33.87, sales: 88, commission: 11.15, promoCost: 31.6, otherCosts: 11.38 },
  { date: "19/02", netIncome: 36.09, sales: 84, commission: 10.3, promoCost: 26.8, otherCosts: 10.81 },
  { date: "22/02", netIncome: 87.67, sales: 196, commission: 26.17, promoCost: 56.2, otherCosts: 25.96 },
  { date: "23/02", netIncome: 18.1, sales: 42, commission: 5.15, promoCost: 13.4, otherCosts: 5.35 },
  { date: "24/02", netIncome: 18.1, sales: 42, commission: 5.15, promoCost: 13.4, otherCosts: 5.35 },
  { date: "25/02", netIncome: 55.3, sales: 118, commission: 16.91, promoCost: 29.6, otherCosts: 16.19 },
  { date: "26/02", netIncome: 36.2, sales: 84, commission: 10.3, promoCost: 26.8, otherCosts: 10.7 },
  { date: "27/02", netIncome: 74.6, sales: 160, commission: 21.85, promoCost: 44.2, otherCosts: 19.35 },
  { date: "28/02", netIncome: 36.2, sales: 84, commission: 10.3, promoCost: 26.8, otherCosts: 10.7 },
  { date: "01/03", netIncome: 50.54, sales: 105, commission: 13.72, promoCost: 28.8, otherCosts: 11.94 },
  { date: "02/03", netIncome: 54.3, sales: 126, commission: 15.45, promoCost: 40.2, otherCosts: 16.05 },
  { date: "03/03", netIncome: 75.69, sales: 152, commission: 20.95, promoCost: 35.6, otherCosts: 19.76 },
  { date: "04/03", netIncome: 36.2, sales: 84, commission: 10.3, promoCost: 26.8, otherCosts: 10.7 },
  { date: "06/03", netIncome: 112.09, sales: 255, commission: 33.44, promoCost: 74.85, otherCosts: 34.62 },
  { date: "07/03", netIncome: 137.99, sales: 320, commission: 42.02, promoCost: 97.7, otherCosts: 42.29 },
  { date: "08/03", netIncome: 48.93, sales: 122.32, commission: 22.15, promoCost: 33.41, otherCosts: 17.83 },
  { date: "09/03", netIncome: 18.1, sales: 42, commission: 5.15, promoCost: 13.4, otherCosts: 5.35 },
  { date: "10/03", netIncome: 72.4, sales: 168, commission: 20.6, promoCost: 53.6, otherCosts: 21.4 },
  { date: "11/03", netIncome: 86.65, sales: 186, commission: 23.91, promoCost: 53.2, otherCosts: 22.24 },
];

const keetaSummary = {
  netIncome: 1899.98,
  sales: 4518.32,
  commission: -593.11,
  promoCost: -1342.31,
  otherCosts: -682.92,
  otherRevenue: 0,
};

const apps = [
  {
    name: "هنقرستيشن",
    nameEn: "HungerStation",
    logo: "H",
    logoBg: "bg-[hsl(45,90%,55%)]",
    status: "نشط",
    statusVariant: "success" as const,
    commission: "20-30%",
    joined: "ديسمبر 2025",
    notes: "أكبر تطبيق توصيل في السعودية — تغطية واسعة في المدينة المنورة",
  },
  {
    name: "كيتا",
    nameEn: "Keeta",
    logo: "K",
    logoBg: "bg-[hsl(50,85%,55%)]",
    status: "نشط",
    statusVariant: "success" as const,
    commission: "15-25%",
    joined: "ديسمبر 2025",
    notes: "تطبيق جديد في السوق — عمولات أقل وحوافز للمطاعم الجديدة",
  },
];

const summaryRows = [
  { label: "مبيعات صنف", value: keetaSummary.sales.toLocaleString() },
  { label: "الإيرادات الأخرى", value: keetaSummary.otherRevenue.toFixed(2) },
  { label: "العمولة", value: keetaSummary.commission.toLocaleString() },
  { label: "تكلفة العرض الترويجي", value: keetaSummary.promoCost.toLocaleString() },
  { label: "التكاليف الأخرى", value: keetaSummary.otherCosts.toLocaleString() },
];

const calcDelta = (cur: number, prev: number) => {
  if (!prev) return 0;
  return ((cur - prev) / prev) * 100;
};

const fmtAbs = (cur: number, prev: number, suffix = "SAR") => {
  const diff = cur - prev;
  const sign = diff >= 0 ? "+" : "";
  if (Math.abs(diff) >= 1000) return `${sign}${(diff / 1000).toFixed(0)}K ${suffix}`;
  return `${sign}${diff.toFixed(0)} ${suffix}`;
};

const DeliveryApps = () => {
  const { data: m } = useDeliveryMetrics();
  const [viewBy, setViewBy] = useState<"channel" | "branch" | "brand">("channel");

  const fallback = {
    revenue: 0, ordersCount: 0, avgBasket: 0, profitMargin: 0, adSpend: 0, roas: 0,
    prev: { revenue: 0, ordersCount: 0, avgBasket: 0, profitMargin: 0, adSpend: 0, roas: 0 },
    channels: [] as { key: string; revenue: number; orders: number }[],
  };
  const d = m ?? fallback;

  const channelTable = [
    { key: "hungerstation", name: "HungerStation", logo: "H", logoColor: "bg-[hsl(45,90%,55%)]", revenue: d.channels[0]?.revenue ?? 0 },
    { key: "keeta", name: "Keeta", logo: "K", logoColor: "bg-[hsl(50,85%,55%)]", revenue: d.channels[1]?.revenue ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title="تطبيقات التوصيل"
        subtitle="نظرة شاملة على الإيرادات، الطلبات، والأرباح"
        badge={`${apps.length} تطبيق`}
      />

      {/* New: 6 Pro KPI cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <MetricCardPro
          label="الإيرادات"
          value={Math.round(d.revenue).toLocaleString()}
          showRiyal
          deltaAbs={fmtAbs(d.revenue, d.prev.revenue)}
          delta={calcDelta(d.revenue, d.prev.revenue)}
          compareLabel="مقارنةً بالشهر الماضي"
          highlighted
        />
        <MetricCardPro
          label="الطلبات"
          value={d.ordersCount.toLocaleString()}
          deltaAbs={fmtAbs(d.ordersCount, d.prev.ordersCount, "")}
          delta={calcDelta(d.ordersCount, d.prev.ordersCount)}
          compareLabel="مقارنةً بالشهر الماضي"
        />
        <MetricCardPro
          label="متوسط السلة"
          value={d.avgBasket.toFixed(0)}
          showRiyal
          deltaAbs={fmtAbs(d.avgBasket, d.prev.avgBasket)}
          delta={calcDelta(d.avgBasket, d.prev.avgBasket)}
          compareLabel="مقارنةً بالشهر الماضي"
        />
        <MetricCardPro
          label="هامش الربحية"
          value={Math.round(d.profitMargin).toLocaleString()}
          showRiyal
          badge="40% من الإيرادات"
          deltaAbs={fmtAbs(d.profitMargin, d.prev.profitMargin)}
          delta={calcDelta(d.profitMargin, d.prev.profitMargin)}
          compareLabel="مقارنةً بالشهر الماضي"
        />
        <MetricCardPro
          label="العائد على الإنفاق الإعلاني"
          value={d.roas.toFixed(1)}
          showRiyal
          badge={`لكل 1 SAR تم إنفاقه`}
          deltaAbs={`${d.roas > d.prev.roas ? "+" : ""}${(d.roas - d.prev.roas).toFixed(1)} SAR`}
          delta={calcDelta(d.roas, d.prev.roas)}
          compareLabel="مقارنةً بالشهر الماضي"
        />
        <MetricCardPro
          label="الإنفاق الإعلاني"
          value={Math.round(d.adSpend).toLocaleString()}
          showRiyal
          badge="4% من الإيرادات"
          deltaAbs={fmtAbs(d.adSpend, d.prev.adSpend)}
          delta={calcDelta(d.adSpend, d.prev.adSpend)}
          compareLabel="مقارنةً بالشهر الماضي"
        />
      </div>

      {/* View-by tabs */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <span className="text-[12px] text-muted-foreground ml-2">عرض حسب</span>
        {[
          { key: "channel", label: "القناة" },
          { key: "branch", label: "الفرع" },
          { key: "brand", label: "العلامة" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setViewBy(t.key as typeof viewBy)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
              viewBy === t.key
                ? "bg-info text-white"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Channel revenue table */}
      <div className="mb-5">
        <ChannelRevenueTable channels={channelTable} />
      </div>

      {/* Keeta Account Balance */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-[13px] font-bold text-foreground">رصيد حساب Keeta</div>
          <div className="text-[28px] font-bold text-foreground flex items-center gap-1.5">
            9,214.56
            <span className="text-[11px] text-muted-foreground font-medium">ر.س</span>
          </div>
        </div>
        <button className="px-6 py-2.5 rounded-lg bg-[hsl(50,80%,85%)] text-foreground font-semibold text-[13px] hover:bg-[hsl(50,80%,78%)] transition-colors">
          سحب
        </button>
      </div>

      {/* Keeta 30-day Performance Chart (smart redesign) */}
      <div className="mb-5">
        <KeetaPerformanceChart
          data={keetaChartData}
          netIncomeTotal={keetaSummary.netIncome}
          netIncomeChange={-24.82}
          salesTotal={keetaSummary.sales}
          costsTotal={Math.abs(keetaSummary.commission) + Math.abs(keetaSummary.promoCost) + Math.abs(keetaSummary.otherCosts)}
        />
      </div>

      {/* App Cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {apps.map((app) => (
          <div key={app.name} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${app.logoBg} flex items-center justify-center text-[18px] font-bold text-white`}>
                  {app.logo}
                </div>
                <div>
                  <div className="text-[15px] font-bold text-foreground">{app.name}</div>
                  <div className="text-[10px] text-muted-foreground font-medium">{app.nameEn} · انضمام {app.joined}</div>
                </div>
              </div>
              <StatusBadge variant={app.statusVariant}>{app.status}</StatusBadge>
            </div>

            <div className="p-3 bg-background border border-border rounded-lg">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">ملاحظات</div>
              <div className="text-[11px] text-foreground/80 leading-relaxed">{app.notes}</div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">العمولة التقريبية</span>
              <span className="font-bold text-warning">{app.commission}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryApps;
