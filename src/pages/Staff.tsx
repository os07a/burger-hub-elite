import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

const employees = [
  {
    initials: "يو", name: "يونس", role: "كاشير + إشراف عام — دوام كامل · 3,200 ر/شهر",
    salary: 3200,
    status: "حاضر", statusVariant: "success" as const,
    performance: { salesHandled: "~40% من عمليات الكاشير", avgDaily: "حضور منتظم · أقل تأخير" },
    docs: [
      { label: "الإقامة", date: "12 مارس 2026", status: "باقي 11 شهر", statusClass: "text-success" },
      { label: "الشهادة الصحية", date: "30 يونيو 2025", status: "منتهية", statusClass: "text-danger" },
      { label: "الإجازة المستحقة", value: "18", sub: "يوم متبقي" },
      { label: "آخر إجازة", date: "يناير 2026", status: "7 أيام", statusClass: "text-gray-light" },
    ],
    alerts: [{ text: "● الشهادة الصحية منتهية", variant: "danger" as const }],
  },
  {
    initials: "شي", name: "شيمول", role: "طباخ رئيسي — دوام كامل · 3,800 ر/شهر",
    salary: 3800,
    status: "حاضر", statusVariant: "success" as const,
    performance: { salesHandled: "مسؤول تحضير البرجر (آنجوس + ناشفيل + كريسبي)", avgDaily: "إنتاجية عالية · يغطي الذروة" },
    docs: [
      { label: "الإقامة", date: "5 مايو 2025", status: "منتهية", statusClass: "text-danger" },
      { label: "الشهادة الصحية", date: "20 أبريل 2026", status: "باقي 9 أيام", statusClass: "text-warning" },
      { label: "الإجازة المستحقة", value: "21", sub: "يوم متبقي" },
      { label: "آخر إجازة", date: "أغسطس 2025", status: "14 يوم", statusClass: "text-gray-light" },
    ],
    alerts: [
      { text: "● الإقامة منتهية", variant: "danger" as const },
      { text: "● الشهادة الصحية تنتهي قريباً", variant: "warning" as const },
    ],
  },
  {
    initials: "مي", name: "ميراج", role: "تحضير + توصيل — دوام جزئي · 1,800 ر/شهر",
    salary: 1800,
    status: "تأخر", statusVariant: "warning" as const,
    performance: { salesHandled: "تحضير البطاطس والجوانب + توصيل محلي", avgDaily: "تأخيرات متكررة · يحتاج متابعة" },
    docs: [
      { label: "الإقامة", date: "18 يوليو 2026", status: "باقي 3 شهور", statusClass: "text-success" },
      { label: "الشهادة الصحية", date: "18 يوليو 2026", status: "باقي 3 شهور", statusClass: "text-success" },
      { label: "الإجازة المستحقة", value: "9", sub: "يوم متبقي" },
      { label: "آخر إجازة", date: "لم يأخذ بعد", status: "—", statusClass: "text-gray-light" },
    ],
    alerts: [{ text: "● جميع الوثائق سارية", variant: "success" as const }],
  },
  {
    initials: "ري", name: "ريان", role: "مساعد مطبخ — دوام جزئي · 1,600 ر/شهر",
    salary: 1600,
    status: "حاضر", statusVariant: "success" as const,
    performance: { salesHandled: "مساعدة شيمول في التحضير + نظافة المطبخ", avgDaily: "أداء مقبول" },
    docs: [
      { label: "الإقامة", date: "22 أبريل 2026", status: "باقي 11 يوم", statusClass: "text-warning" },
      { label: "الشهادة الصحية", date: "15 نوفمبر 2025", status: "منتهية", statusClass: "text-danger" },
      { label: "الإجازة المستحقة", value: "14", sub: "يوم متبقي" },
      { label: "آخر إجازة", date: "أكتوبر 2025", status: "5 أيام", statusClass: "text-gray-light" },
    ],
    alerts: [
      { text: "● الإقامة تنتهي خلال 11 يوم", variant: "warning" as const },
      { text: "● الشهادة الصحية منتهية", variant: "danger" as const },
    ],
  },
];

const totalSalaries = employees.reduce((a, e) => a + e.salary, 0);

const alertColors = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
};

const Staff = () => (
  <div>
    <PageHeader title="العمال" subtitle="الوثائق والإجازات والتنبيهات" badge={`${employees.length} موظف`} />

    <div className="grid grid-cols-4 gap-3 mb-4">
      <MetricCard label="👥 عدد الموظفين" value={employees.length.toString()} sub={`${employees.filter(e => e.statusVariant === "success").length} حاضر الآن`} subColor="success" />
      <MetricCard label="💰 إجمالي الرواتب" value={totalSalaries.toLocaleString()} sub="شهرياً · 49.7% من الإيرادات" subColor="warning" showRiyal />
      <MetricCard label="📈 متوسط المبيعات/موظف" value={Math.round(696 * 30 / employees.length).toLocaleString()} sub="شهرياً لكل موظف" showRiyal />
      <MetricCard label="📄 تنبيهات وثائق" value={employees.reduce((a, e) => a + e.alerts.filter(al => al.variant === "danger").length, 0).toString()} sub="وثائق منتهية تحتاج تجديد" subColor="danger" />
    </div>

    <div className="border border-border rounded-xl overflow-hidden bg-border space-y-px">
      {employees.map((emp) => (
        <div key={emp.name} className="bg-surface">
          <div className="flex items-center gap-3.5 p-4 border-b border-border hover:bg-background/50 transition-colors">
            <div className="w-[38px] h-[38px] rounded-full bg-primary flex items-center justify-center text-[13px] font-bold text-primary-foreground flex-shrink-0">
              {emp.initials}
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-bold text-foreground">{emp.name}</div>
              <div className="text-[11px] text-gray-light mt-px">{emp.role}</div>
            </div>
            <StatusBadge variant={emp.statusVariant}>{emp.status}</StatusBadge>
          </div>

          {/* ربط بالأداء */}
          <div className="px-5 py-2 border-b border-border bg-background/30">
            <div className="flex gap-4 text-[10px]">
              <span className="text-gray-light">📊 المهام: <span className="text-foreground font-medium">{emp.performance.salesHandled}</span></span>
              <span className="text-gray-light">📈 الأداء: <span className="text-foreground font-medium">{emp.performance.avgDaily}</span></span>
            </div>
          </div>

          <div className="grid grid-cols-4 border-b border-border">
            {emp.docs.map((doc) => (
              <div key={doc.label} className="p-3.5 border-l border-border last:border-l-0">
                <div className="text-[9px] text-gray-light font-semibold uppercase tracking-wide mb-1">{doc.label}</div>
                {doc.value ? (
                  <>
                    <div className="text-[20px] font-bold text-foreground leading-none">{doc.value}</div>
                    <div className="text-[10px] text-gray-light font-medium mt-0.5">{doc.sub}</div>
                  </>
                ) : (
                  <>
                    <div className="text-[12px] font-semibold text-foreground mb-1">{doc.date}</div>
                    <div className={`text-[10px] font-semibold ${doc.statusClass}`}>{doc.status}</div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="px-5 py-2 flex gap-1.5 flex-wrap bg-background">
            {emp.alerts.map((alert, i) => (
              <span key={i} className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${alertColors[alert.variant]}`}>
                {alert.text}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* ملخص تكلفة الموظفين مقابل الإيرادات */}
    <div className="mt-4 p-3 bg-surface border border-border rounded-lg">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-2">📊 تحليل تكلفة العمالة مقابل الإيرادات</div>
      <div className="grid grid-cols-3 gap-3 text-[11px]">
        <div className="bg-background rounded-lg p-3 border border-border text-center">
          <div className="text-[9px] text-gray-light mb-1">الرواتب الشهرية</div>
          <div className="text-[16px] font-bold text-foreground">{totalSalaries.toLocaleString()}</div>
          <div className="text-[9px] text-gray-light">ر.س</div>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border text-center">
          <div className="text-[9px] text-gray-light mb-1">متوسط الإيرادات الشهرية</div>
          <div className="text-[16px] font-bold text-primary">{(696 * 30).toLocaleString()}</div>
          <div className="text-[9px] text-gray-light">ر.س (696 × 30 يوم)</div>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border text-center">
          <div className="text-[9px] text-gray-light mb-1">نسبة العمالة من الإيرادات</div>
          <div className={`text-[16px] font-bold ${(totalSalaries / (696 * 30)) > 0.35 ? 'text-red-400' : 'text-green-400'}`}>
            {((totalSalaries / (696 * 30)) * 100).toFixed(1)}%
          </div>
          <div className="text-[9px] text-gray-light">{(totalSalaries / (696 * 30)) > 0.35 ? '⚠️ أعلى من المعيار (30-35%)' : '✅ ضمن المعيار'}</div>
        </div>
      </div>
    </div>
  </div>
);

export default Staff;
