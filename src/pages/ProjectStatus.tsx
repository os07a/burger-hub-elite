import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";

const totalRevenue = 68270;
const totalExpenses = 66163;
const netCashFlow = totalRevenue - totalExpenses;
const burnRate = Math.round(totalExpenses / 4);
const investmentTotal = 292405;
const roiMonths = Math.round(investmentTotal / (totalRevenue / 4));

const monthsData = [
  { month: "ديسمبر", income: 13611, expenses: 3601, net: 10010 },
  { month: "يناير", income: 18906, expenses: 21765, net: -2859 },
  { month: "فبراير", income: 14524, expenses: 12632, net: 1892 },
  { month: "مارس", income: 19695, expenses: 23372, net: -3677 },
  { month: "أبريل", income: 5866, expenses: 4800, net: 1066 },
];
const maxIncome = Math.max(...monthsData.map(m => m.income));

const ProjectStatus = () => (
  <div>
    <PageHeader title="حالة المشروع" subtitle="بيانات حقيقية — كشف حساب بنك الراجحي · ديسمبر 2025 – أبريل 2026" badge="مباشر" />

    {/* 5 مؤشرات رئيسية */}
    <div className="grid grid-cols-5 gap-2 mb-4">
      {[
        { label: "إجمالي الإيرادات", value: "68,270", unit: "ر.س", icon: "📈", accent: "border-t-green-500", textColor: "text-green-400" },
        { label: "إجمالي المصروفات", value: "66,163", unit: "ر.س", icon: "📉", accent: "border-t-red-500", textColor: "text-red-400" },
        { label: "صافي التدفق", value: `${netCashFlow > 0 ? '+' : ''}${netCashFlow.toLocaleString()}`, unit: "ر.س", icon: "💰", accent: netCashFlow > 0 ? "border-t-green-500" : "border-t-red-500", textColor: netCashFlow > 0 ? "text-green-400" : "text-red-400" },
        { label: "معدل الحرق الشهري", value: burnRate.toLocaleString(), unit: "ر.س/شهر", icon: "🔥", accent: "border-t-orange-500", textColor: "text-orange-400" },
        { label: "الرصيد الحالي", value: "2,107", unit: "ر.س", icon: "🏦", accent: "border-t-primary", textColor: "text-primary" },
      ].map((m) => (
        <div key={m.label} className={`bg-surface border border-border ${m.accent} border-t-2 rounded-lg p-3`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-gray-light font-medium">{m.label}</span>
            <span className="text-[14px]">{m.icon}</span>
          </div>
          <div className={`text-[18px] font-bold ${m.textColor}`}>{m.value}</div>
          <div className="text-[9px] text-gray-light">{m.unit}</div>
        </div>
      ))}
    </div>

    {/* الصف الثاني */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      {/* مخطط الإيرادات */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">📊 الإيرادات vs المصروفات</div>
        <div className="space-y-2">
          {monthsData.map((m) => (
            <div key={m.month}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray w-14">{m.month}</span>
                <span className={`text-[9px] font-bold ${m.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {m.net >= 0 ? '+' : ''}{m.net.toLocaleString()}
                </span>
              </div>
              <div className="relative h-3 flex gap-0.5">
                <div className="h-full bg-green-500/30 rounded-r-sm border-r-2 border-r-green-400" style={{ width: `${(m.income / maxIncome) * 100}%` }} />
                <div className="h-full bg-red-500/20 rounded-l-sm border-l-2 border-l-red-400 absolute top-0 right-0" style={{ width: `${(m.expenses / maxIncome) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-3 text-[8px] text-gray-light">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-400 inline-block" /> إيرادات</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> مصروفات</span>
        </div>
      </div>

      {/* توزيع المصروفات */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">💸 توزيع المصروفات</div>
        <div className="space-y-1.5">
          {[
            { label: "مشتريات التشغيل", amount: 54642, color: "bg-primary", emoji: "🛒" },
            { label: "فواتير كهرباء", amount: 2428, color: "bg-yellow-500", emoji: "⚡" },
            { label: "إقامات عمالة", amount: 3614, color: "bg-orange-500", emoji: "📋" },
            { label: "موردين", amount: 2550, color: "bg-blue-500", emoji: "🚛" },
            { label: "سحوبات ومتفرقات", amount: 3500, color: "bg-muted-foreground", emoji: "💳" },
          ].map((item) => {
            const pct = Math.round((item.amount / totalExpenses) * 100);
            return (
              <div key={item.label} className="group">
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-gray flex items-center gap-1">
                    <span className="text-[11px]">{item.emoji}</span>{item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-light">{pct}%</span>
                    <span className="text-foreground font-medium">{item.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all group-hover:opacity-80`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* تحليلات ذكية */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">🧠 تحليلات ذكية</div>
        <div className="space-y-2">
          {[
            { icon: "⏱️", title: "استرداد رأس المال", desc: `الاستثمار الكلي 292,405 ر.س — بالمعدل الحالي يحتاج ~${roiMonths} شهر`, variant: "warning" as const },
            { icon: "📈", title: "أفضل شهر: مارس", desc: "19,695 ر.س إيرادات — أعلى شهر حتى الآن", variant: "success" as const },
            { icon: "⚠️", title: "يناير: أعلى مصروفات", desc: "21,765 ر.س صرف — تحويلات كبيرة (9,000 + 7,200)", variant: "danger" as const },
            { icon: "💡", title: "متوسط يومي", desc: `~${Math.round(totalRevenue / 101).toLocaleString()} ر.س/يوم عمل من الإيرادات`, variant: "info" as const },
            { icon: "🏦", title: "سيولة منخفضة", desc: "الرصيد 2,107 ر.س — أقل من أسبوع تشغيل", variant: "danger" as const },
          ].map((insight) => (
            <div key={insight.title} className="flex gap-2 p-2 rounded-lg bg-background border border-border">
              <span className="text-[14px] mt-0.5">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-bold text-foreground">{insight.title}</span>
                  <StatusBadge variant={insight.variant} className="text-[7px]">
                    {insight.variant === "success" ? "إيجابي" : insight.variant === "danger" ? "تنبيه" : insight.variant === "warning" ? "مراقبة" : "معلومة"}
                  </StatusBadge>
                </div>
                <div className="text-[9px] text-gray leading-relaxed">{insight.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* استثمار المشروع */}
    <div className="grid grid-cols-4 gap-2">
      {[
        { label: "ديكور وتجهيزات", amount: "69,585", pct: 23.8, icon: "🎨", color: "border-t-purple-500" },
        { label: "معدات وآلات", amount: "84,100", pct: 28.8, icon: "⚙️", color: "border-t-blue-500" },
        { label: "إيجار (سنوي)", amount: "40,000", pct: 13.7, icon: "🏠", color: "border-t-amber-500" },
        { label: "رواتب + تشغيل", amount: "84,000", pct: 28.7, icon: "👷", color: "border-t-green-500" },
      ].map((item) => (
        <div key={item.label} className={`bg-surface border border-border ${item.color} border-t-2 rounded-lg p-3 flex items-center gap-3`}>
          <div className="text-[22px]">{item.icon}</div>
          <div>
            <div className="text-[13px] font-bold text-foreground">{item.amount} <span className="text-[9px] text-gray-light font-normal">ر.س</span></div>
            <div className="text-[10px] text-gray">{item.label}</div>
            <div className="w-16 h-1 bg-border rounded-full overflow-hidden mt-1">
              <div className="h-full bg-foreground/30 rounded-full" style={{ width: `${item.pct * 3}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ProjectStatus;
