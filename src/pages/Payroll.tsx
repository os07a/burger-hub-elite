import { useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { useEmployees } from "@/hooks/useEmployees";
import { useMonthAttendance } from "@/hooks/useAttendance";
import { computePayroll, currentMonthYM } from "@/lib/hr";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("ar-SA", { year: "numeric", month: "long" });
};

const useMonthRevenue = (monthYM: string) =>
  useQuery({
    queryKey: ["daily_sales", "month", monthYM],
    queryFn: async () => {
      const [y, m] = monthYM.split("-").map(Number);
      const start = `${y}-${String(m).padStart(2, "0")}-01`;
      const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
      const { data, error } = await supabase
        .from("daily_sales")
        .select("net_sales,total_sales,date")
        .gte("date", start)
        .lt("date", next);
      if (error) throw error;
      return (data || []).reduce((s, r) => s + Number(r.net_sales || r.total_sales || 0), 0);
    },
  });

const Payroll = () => {
  const monthYM = currentMonthYM();
  const { data: employees = [] } = useEmployees();
  const { data: monthAttendance = [] } = useMonthAttendance(monthYM);
  const { data: monthRevenue = 0 } = useMonthRevenue(monthYM);

  const rows = useMemo(() => {
    return employees
      .filter(e => e.status !== "منتهي")
      .map(emp => {
        const empAtt = monthAttendance.filter(a => a.employee_id === emp.id);
        const result = computePayroll(emp, empAtt, monthYM);
        return { emp, result };
      });
  }, [employees, monthAttendance, monthYM]);

  const totalSalaries = rows.reduce((a, r) => a + r.result.net, 0);
  const totalGross = rows.reduce((a, r) => a + r.result.basic + r.result.allowances, 0);
  const totalAbsenceDays = rows.reduce((a, r) => a + r.result.absenceDays, 0);
  const laborPct = monthRevenue > 0 ? ((totalSalaries / monthRevenue) * 100).toFixed(1) : "—";
  const laborNum = monthRevenue > 0 ? parseFloat(laborPct) : 0;

  return (
    <div>
      <PageHeader title="الرواتب" subtitle={`كشف رواتب ${monthLabel(monthYM)} — مربوط بالحضور تلقائياً`} badge={`${rows.length} موظف`} />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard label="💰 صافي الرواتب الشهرية" value={totalSalaries.toLocaleString(undefined, { maximumFractionDigits: 0 })} sub={`بعد خصم ${totalAbsenceDays} يوم غياب`} showRiyal />
        <MetricCard label="👥 عدد الموظفين" value={rows.length.toString()} sub="نشط هذا الشهر" subColor="success" />
        <MetricCard
          label="📊 نسبة العمالة من الإيرادات"
          value={monthRevenue > 0 ? `${laborPct}%` : "—"}
          sub={monthRevenue > 0 ? `من ${monthRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} ر.س إيرادات` : "لا توجد إيرادات مسجلة"}
          subColor={monthRevenue > 0 ? (laborNum > 35 ? "danger" : laborNum > 30 ? "warning" : "success") : undefined}
        />
        <MetricCard label="📉 إجمالي الخصومات" value={(totalGross - totalSalaries).toLocaleString(undefined, { maximumFractionDigits: 0 })} sub="غياب + جزاءات − مكافآت" subColor="warning" showRiyal />
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">
          تفاصيل {monthLabel(monthYM)} — محسوبة من الحضور الفعلي
        </div>
        {rows.length === 0 ? (
          <div className="text-center py-6 text-gray-light text-[12px]">لا يوجد موظفين.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr>
                  {["الموظف", "الأساسي", "البدلات", "مكافآت", "جزاءات", "غياب (أيام)", "خصم الغياب", "الصافي"].map(h => (
                    <th key={h} className="text-[9px] text-gray-light font-semibold uppercase tracking-wide px-2 pb-2.5 text-right border-b-2 border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ emp, result }) => (
                  <tr key={emp.id} className="hover:bg-background/50">
                    <td className="px-2 py-2.5 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                          {emp.name.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-[12px] block">{emp.name}</span>
                          <span className="text-[9px] text-gray-light">{emp.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 border-b border-border text-[12px] font-semibold">{result.basic.toLocaleString()}</td>
                    <td className="px-2 py-2.5 border-b border-border text-[12px] text-gray-light">{result.allowances.toLocaleString()}</td>
                    <td className="px-2 py-2.5 border-b border-border text-[12px] text-success">{result.rewards ? `+${result.rewards.toLocaleString()}` : "—"}</td>
                    <td className="px-2 py-2.5 border-b border-border text-[12px] text-danger">{result.penalties ? `-${result.penalties.toLocaleString()}` : "—"}</td>
                    <td className="px-2 py-2.5 border-b border-border text-[12px]">
                      {result.absenceDays > 0 ? <StatusBadge variant="danger">{result.absenceDays} يوم</StatusBadge> : <span className="text-gray-light">—</span>}
                    </td>
                    <td className="px-2 py-2.5 border-b border-border text-[12px] text-danger font-semibold">
                      {result.absenceDeduction > 0 ? `-${result.absenceDeduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
                    </td>
                    <td className="px-2 py-2.5 border-b border-border text-[13px] font-bold text-foreground text-left">{result.net.toLocaleString(undefined, { maximumFractionDigits: 0 })} ر.س</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={7} className="px-2 pt-3 font-bold text-[14px]">الإجمالي</td>
                  <td className="px-2 pt-3 font-bold text-[16px] text-primary text-left">{totalSalaries.toLocaleString(undefined, { maximumFractionDigits: 0 })} ر.س</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="mt-3 p-3 bg-info/5 border border-info/20 rounded-lg text-[10px] text-info leading-relaxed">
        💡 الخصم التلقائي يطبّق فقط على أيام الغياب المسجلة في نظام الحضور (status = "غائب"). التأخير والساعات الإضافية تُعرض في صفحة الحضور للمتابعة بدون خصم/علاوة تلقائية.
      </div>
    </div>
  );
};

export default Payroll;
