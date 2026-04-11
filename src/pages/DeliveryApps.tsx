import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

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
    metrics: {
      orders: "—",
      revenue: "—",
      avgOrder: "—",
    },
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
    metrics: {
      orders: "—",
      revenue: "—",
      avgOrder: "—",
    },
  },
];

const DeliveryApps = () => (
  <div>
    <PageHeader title="تطبيقات التوصيل" subtitle="منصات التوصيل المرتبطة بالمطعم" badge={`${apps.length} تطبيق`} />

    <div className="grid grid-cols-4 gap-3 mb-5">
      <MetricCard label="التطبيقات النشطة" value={apps.filter(a => a.status === "نشط").length} sub={`من ${apps.length} تطبيق`} subColor="success" />
      <MetricCard label="إجمالي الطلبات" value="—" sub="بانتظار الربط" subColor="warning" />
      <MetricCard label="إيرادات التوصيل" value="—" sub="بانتظار البيانات" subColor="warning" />
      <MetricCard label="متوسط العمولة" value="~22%" sub="نسبة تقريبية" subColor="danger" />
    </div>

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
              <div className="text-[16px] font-bold text-green-400">{app.metrics.revenue}</div>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border text-center">
              <div className="text-[9px] text-gray-light font-medium mb-1">العمولة</div>
              <div className="text-[16px] font-bold text-orange-400">{app.commission}</div>
            </div>
          </div>

          <div className="p-3 bg-background border border-border rounded-lg">
            <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-1">ملاحظات</div>
            <div className="text-[11px] text-gray leading-relaxed">{app.notes}</div>
          </div>
        </div>
      ))}
    </div>

    {/* نصائح */}
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
