import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

const employees = [
  { name: "يونس", role: "كاشير + إشراف عام", salary: 3200, status: "نشط", statusVariant: "success" as const },
  { name: "شيمول", role: "طباخ رئيسي", salary: 3800, status: "نشط", statusVariant: "success" as const },
  { name: "ميراج", role: "تحضير + توصيل", salary: 1800, status: "نشط", statusVariant: "success" as const },
  { name: "ريان", role: "مساعد مطبخ", salary: 1600, status: "نشط", statusVariant: "success" as const },
];

const totalSalaries = employees.reduce((a, e) => a + e.salary, 0);
const avgDailyRevenue = 696;
const monthlyRevenue = avgDailyRevenue * 30;
const laborPct = ((totalSalaries / monthlyRevenue) * 100).toFixed(1);

const Payroll = () => (
  <div>
    <PageHeader title="الرواتب" subtitle="كشف الرواتب الشهري — بيانات حقيقية من كشف المصروفات" badge={`${employees.length} موظف`} />
    <div className="grid grid-cols-4 gap-3 mb-5">
      <MetricCard label="💰 إجمالي الرواتب الشهرية" value={totalSalaries.toLocaleString()} sub="شهرياً" showRiyal />
      <MetricCard label="👥 عدد الموظفين" value={employees.length.toString()} sub={`${employees.filter(e => e.status === "نشط").length} نشط`} subColor="success" />
      <MetricCard label="📊 نسبة العمالة من الإيرادات" value={`${laborPct}%`} sub={`من ${monthlyRevenue.toLocaleString()} ر.س إيرادات شهرية`} subColor={parseFloat(laborPct) > 35 ? "danger" : "success"} />
      <MetricCard label="🏗️ من المصروفات التأسيسية" value="19,150" sub="إجمالي ما صُرف على الرواتب سابقاً" subColor="warning" />
    </div>
    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">تفاصيل هذا الشهر — أبريل 2026</div>
      {employees.map((emp) => (
        <div key={emp.name} className="flex justify-between items-center py-2.5 border-b border-border last:border-b-0 text-[13px]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              {emp.name.slice(0, 2)}
            </div>
            <div>
              <span className="text-foreground font-medium">{emp.name}</span>
              <span className="text-[9px] text-gray-light mr-1.5">({emp.role})</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[9px] text-gray-light">
              {((emp.salary / totalSalaries) * 100).toFixed(0)}% من إجمالي الرواتب
            </div>
            <StatusBadge variant={emp.statusVariant}>{emp.status}</StatusBadge>
            <span className="font-bold text-foreground w-20 text-left">{emp.salary.toLocaleString()} ر.س</span>
          </div>
        </div>
      ))}
      <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-border">
        <span className="font-bold text-[14px]">الإجمالي</span>
        <span className="font-bold text-[16px] text-primary">{totalSalaries.toLocaleString()} ر.س</span>
      </div>
    </div>

    {/* تأثير الرواتب على نقطة التعادل */}
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="p-3 bg-surface border border-border rounded-lg">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-2">⚖️ تأثير الرواتب على نقطة التعادل</div>
        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between"><span className="text-gray">تكلفة الرواتب الشهرية</span><span className="font-bold text-foreground">{totalSalaries.toLocaleString()} ر.س</span></div>
          <div className="flex justify-between"><span className="text-gray">تكلفة التموين الشهرية (تقدير)</span><span className="font-bold text-foreground">~5,200 ر.س</span></div>
          <div className="flex justify-between"><span className="text-gray">إيجار + مصاريف ثابتة</span><span className="font-bold text-foreground">~4,000 ر.س</span></div>
          <div className="flex justify-between border-t border-border pt-2"><span className="font-bold text-foreground">نقطة التعادل الشهرية</span><span className="font-bold text-primary">~{(totalSalaries + 5200 + 4000).toLocaleString()} ر.س</span></div>
          <div className="flex justify-between"><span className="text-gray">متوسط الإيرادات الشهرية</span><span className="font-bold text-green-400">{monthlyRevenue.toLocaleString()} ر.س</span></div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-bold text-foreground">الهامش بعد التكاليف الثابتة</span>
            <span className={`font-bold ${monthlyRevenue - totalSalaries - 5200 - 4000 > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(monthlyRevenue - totalSalaries - 5200 - 4000).toLocaleString()} ر.س
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-surface border border-border rounded-lg">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-2">📊 المعيار في قطاع المطاعم</div>
        <div className="space-y-2">
          {[
            { label: "نسبة العمالة المثالية", value: "25-30%", yours: `${laborPct}%`, ok: parseFloat(laborPct) <= 30 },
            { label: "نسبة المواد الغذائية", value: "28-35%", yours: "~25%", ok: true },
            { label: "نسبة الإيجار", value: "8-12%", yours: `${((4000 / monthlyRevenue) * 100).toFixed(0)}%`, ok: true },
          ].map(b => (
            <div key={b.label} className="flex items-center justify-between p-2 bg-background border border-border rounded-lg text-[10px]">
              <span className="text-gray">{b.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-light">المعيار: {b.value}</span>
                <span className={`font-bold ${b.ok ? 'text-green-400' : 'text-red-400'}`}>أنت: {b.yours} {b.ok ? '✅' : '⚠️'}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 p-2 bg-primary/5 border border-primary/20 rounded-lg text-[9px] text-primary leading-relaxed">
          💡 نسبة العمالة ({laborPct}%) {parseFloat(laborPct) > 35 ? 'أعلى من المعيار. فكّر في تحسين الإنتاجية أو زيادة المبيعات قبل إضافة موظفين.' : 'ضمن النطاق المقبول لمطعم في مرحلة النمو.'}
        </div>
      </div>
    </div>
  </div>
);

export default Payroll;
