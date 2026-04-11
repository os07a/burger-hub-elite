import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

const employees = [
  { name: "يونس", role: "طبّاخ رئيسي", salary: 3200, status: "نشط", statusVariant: "success" as const },
  { name: "شيمول", role: "مساعد مطبخ", salary: 3800, status: "نشط", statusVariant: "success" as const },
  { name: "ميراج", role: "تحضير", salary: 1800, status: "نشط", statusVariant: "success" as const },
  { name: "ريان", role: "كاشير", salary: 1500, status: "نشط", statusVariant: "success" as const },
];

const totalSalaries = employees.reduce((a, e) => a + e.salary, 0);

const Payroll = () => (
  <div>
    <PageHeader title="الرواتب" subtitle="كشف الرواتب الشهري — بيانات حقيقية من كشف المصروفات" />
    <div className="grid grid-cols-3 gap-3 mb-5">
      <MetricCard label="إجمالي الرواتب الشهرية" value={totalSalaries.toLocaleString()} sub="ريال / شهر" />
      <MetricCard label="عدد الموظفين" value={employees.length.toString()} sub={`${employees.filter(e => e.status === "نشط").length} نشط`} subColor="success" />
      <MetricCard label="من المصروفات التأسيسية" value="19,150" sub="إجمالي ما صُرف على الرواتب حتى الآن" subColor="warning" />
    </div>
    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">تفاصيل هذا الشهر</div>
      {employees.map((emp) => (
        <div key={emp.name} className="flex justify-between items-center py-2 border-b border-border last:border-b-0 text-[13px]">
          <div className="flex items-center gap-2">
            <span className="text-gray">{emp.name}</span>
            <span className="text-[9px] text-gray-light">({emp.role})</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge variant={emp.statusVariant}>{emp.status}</StatusBadge>
            <span className="font-semibold text-foreground">{emp.salary.toLocaleString()} ريال</span>
          </div>
        </div>
      ))}
      <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-border">
        <span className="font-bold text-[14px]">الإجمالي</span>
        <span className="font-bold text-[16px] text-primary">{totalSalaries.toLocaleString()} ريال</span>
      </div>
    </div>

    <div className="mt-4 p-3 bg-surface border border-border rounded-lg">
      <div className="text-[8px] text-gray leading-relaxed">
        💡 <b className="text-foreground">ملاحظة:</b> إجمالي ما صُرف على الرواتب في فترة التأسيس (أبريل 2025 – فبراير 2026) = 19,150 ر.س. الراتب الشهري الحالي = {totalSalaries.toLocaleString()} ر.س يمثل ~{((totalSalaries / 696 / 30) * 100).toFixed(0)}% من متوسط الإيرادات اليومية (696 ر.س × 30 يوم).
      </div>
    </div>
  </div>
);

export default Payroll;
