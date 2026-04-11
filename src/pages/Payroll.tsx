import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

const Payroll = () => (
  <div>
    <PageHeader title="الرواتب" subtitle="كشف الرواتب الشهري" />
    <div className="grid grid-cols-3 gap-3 mb-5">
      <MetricCard label="إجمالي الرواتب" value="14,200" sub="ريال / شهر" />
      <MetricCard label="عدد الموظفين" value="9" sub="6 كامل · 3 جزئي" />
      <MetricCard label="موعد الصرف" value="28" sub="من كل شهر" />
    </div>
    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">تفاصيل هذا الشهر</div>
      {[
        { name: "يونس", salary: "3,200 ريال" },
        { name: "شيمول", salary: "3,800 ريال" },
        { name: "ميراج", salary: "1,800 ريال" },
        { name: "موظف 4", salary: "1,600 ريال", badge: "خصم غياب" },
      ].map((emp) => (
        <div key={emp.name} className="flex justify-between items-center py-2 border-b border-border last:border-b-0 text-[13px]">
          <span className="text-gray">
            {emp.name}
            {emp.badge && <StatusBadge variant="warning" className="mr-2 text-[10px]">{emp.badge}</StatusBadge>}
          </span>
          <span className="font-semibold text-foreground">{emp.salary}</span>
        </div>
      ))}
      <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-border">
        <span className="font-bold text-[14px]">الإجمالي</span>
        <span className="font-bold text-[16px] text-primary">14,200 ريال</span>
      </div>
    </div>
  </div>
);

export default Payroll;
