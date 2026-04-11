import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";

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
    logo: "🟣",
    status: "نشط",
    statusVariant: "success" as const,
    commission: "20-30%",
    joined: "ديسمبر 2025",
    notes: "أكبر تطبيق توصيل في السعودية — تغطية واسعة في المدينة المنورة",
    metrics: { orders: "—", revenue: "—", avgOrder: "—" },
  },
  {
    name: "كيتا",
    nameEn: "Keeta",
    logo: "🟢",
    status: "نشط",
    statusVariant: "success" as const,
    commission: "15-25%",
    joined: "ديسمبر 2025",
    notes: "تطبيق جديد في السوق — عمولات أقل وحوافز للمطاعم الجديدة",
    metrics: { orders: "—", revenue: "—", avgOrder: "—" },
  },
];

const summaryRows = [
  { label: "مبيعات صنف", value: keetaSummary.sales.toLocaleString(), color: "text-foreground" },
  { label: "الإيرادات الأخرى", value: keetaSummary.otherRevenue.toFixed(2), color: "text-foreground" },
  { label: "العمولة", value: keetaSummary.commission.toLocaleString(), color: "text-foreground" },
  { label: "تكلفة العرض الترويجي", value: keetaSummary.promoCost.toLocaleString(), color: "text-foreground" },
  { label: "التكاليف الأخرى", value: keetaSummary.otherCosts.toLocaleString(), color: "text-foreground" },
];

const DeliveryApps = () => (
  <div>
    <PageHeader title="تطبيقات التوصيل" subtitle="منصات التوصيل المرتبطة بالمطعم" badge={`${apps.length} تطبيق`} />

    <div className="grid grid-cols-4 gap-3 mb-5">
      <MetricCard label="📱 التطبيقات النشطة" value={apps.filter(a => a.status === "نشط").length} sub={`من ${apps.length} تطبيق`} subColor="success" />
      <MetricCard label="🛵 إجمالي الطلبات" value="—" sub="بانتظار الربط" subColor="warning" />
      <MetricCard label="💵 إيرادات التوصيل" value="—" sub="بانتظار البيانات" subColor="warning" />
      <MetricCard label="🏷️ متوسط العمولة" value="~22%" sub="نسبة تقريبية" subColor="danger" />
    </div>

    {/* Keeta Account Balance */}
    <div className="bg-surface border border-border rounded-lg p-5 mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-[13px] font-bold text-foreground">رصيد الحساب</div>
        <div className="text-[28px] font-bold text-foreground flex items-center gap-1.5">
          9,214.56
          <span className="text-[11px] text-muted-foreground font-medium">ر.س</span>
        </div>
      </div>
      <button className="px-6 py-2.5 rounded-lg bg-[hsl(50,80%,85%)] text-foreground font-semibold text-[13px] hover:bg-[hsl(50,80%,78%)] transition-colors">
        سحب
      </button>
    </div>

    {/* Keeta 30-day Chart + Summary */}
    <div className="bg-surface border border-border rounded-lg p-5 mb-5">
      <div className="flex items-start gap-6">
        {/* Chart */}
        <div className="flex-1 min-w-0">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={keetaChartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ fontSize: 11, direction: "rtl", borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    sales: "مبيعات صنف",
                    commission: "العمولة",
                    promoCost: "تكلفة العرض",
                    otherCosts: "تكاليف أخرى",
                    netIncome: "صافي الدخل",
                  };
                  return [value.toFixed(2), labels[name] || name];
                }}
              />
              <Legend
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    sales: "مبيعات صنف",
                    commission: "العمولة",
                    promoCost: "تكلفة العرض الترويجي",
                    otherCosts: "التكاليف الأخرى",
                    netIncome: "صافي الدخل",
                  };
                  return <span style={{ fontSize: 10 }}>{labels[value] || value}</span>;
                }}
              />
              <Bar dataKey="sales" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="commission" fill="#6366f1" stackId="b" />
              <Bar dataKey="promoCost" fill="#1e3a5f" stackId="b" />
              <Bar dataKey="otherCosts" fill="#8b5cf6" stackId="b" />
              <Line type="monotone" dataKey="netIncome" stroke="#2563eb" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="w-[260px] shrink-0 pt-2" dir="rtl">
          <div className="text-[11px] text-muted-foreground mb-1">صافي الدخل</div>
          <div className="text-[26px] font-bold text-foreground flex items-center gap-2 mb-4">
            {keetaSummary.netIncome.toLocaleString()}
            <span className="text-[11px] text-danger font-medium">↓ 24.82%</span>
          </div>
          <div className="space-y-3">
            {summaryRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <div className="text-[11px] text-muted-foreground">{row.label}</div>
                <div className={`text-[13px] font-bold ${row.color}`}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* App Cards */}
    <div className="grid grid-cols-2 gap-3 mb-5">
      {apps.map((app) => (
        <div key={app.name} className="bg-surface border border-border rounded-lg p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-[24px]">
                {app.logo}
              </div>
              <div>
                <div className="text-[15px] font-bold text-foreground">{app.name}</div>
                <div className="text-[10px] text-gray-light font-medium">{app.nameEn} · انضمام {app.joined}</div>
              </div>
            </div>
            <StatusBadge variant={app.statusVariant}>{app.status}</StatusBadge>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-background rounded-lg p-3 border border-border text-center">
              <div className="text-[9px] text-gray-light font-medium mb-1">الطلبات</div>
              <div className="text-[16px] font-bold text-foreground">{app.metrics.orders}</div>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border text-center">
              <div className="text-[9px] text-gray-light font-medium mb-1">الإيرادات</div>
              <div className="text-[16px] font-bold text-success">{app.metrics.revenue}</div>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border text-center">
              <div className="text-[9px] text-gray-light font-medium mb-1">العمولة</div>
              <div className="text-[16px] font-bold text-warning">{app.commission}</div>
            </div>
          </div>

          <div className="p-3 bg-background border border-border rounded-lg">
            <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-1">ملاحظات</div>
            <div className="text-[11px] text-gray leading-relaxed">{app.notes}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Tips */}
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">💡 نصائح لتطبيقات التوصيل</div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "📊", title: "تتبع العمولات", desc: "سجّل عمولة كل تطبيق شهرياً لمعرفة الأكثر ربحية بعد خصم العمولة." },
          { icon: "⏱️", title: "وقت التحضير", desc: "حافظ على وقت تحضير أقل من 15 دقيقة لتحسين ترتيبك في التطبيق." },
          { icon: "⭐", title: "التقييمات", desc: "رد على تقييمات العملاء — التقييم العالي يرفع ظهورك في نتائج البحث." },
        ].map((tip) => (
          <div key={tip.title} className="p-3 bg-background border border-border rounded-lg">
            <div className="text-[14px] mb-1">{tip.icon}</div>
            <div className="text-[11px] font-bold text-foreground mb-0.5">{tip.title}</div>
            <div className="text-[9px] text-gray leading-relaxed">{tip.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DeliveryApps;
