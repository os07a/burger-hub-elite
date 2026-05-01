import { useState, useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Download, AlertTriangle } from "lucide-react";
import { useEmployees, type EmployeeFull } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import EmployeeProfileCard from "@/components/staff/EmployeeProfileCard";
import EmployeeFormDialog from "@/components/staff/EmployeeFormDialog";
import DocFormDialog from "@/components/staff/DocFormDialog";
import { computePayroll, currentMonthYM, contractDaysLeft, monthsBetween, downloadCsv } from "@/lib/hr";
import { toast } from "sonner";

const Staff = () => {
  const { data: employees = [], isLoading } = useEmployees();
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";

  // Recent attendance (last 60 days for current/prev month)
  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance-recent"],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 60);
      const { data, error } = await supabase
        .from("attendance").select("date, status, employee_id")
        .gte("date", since.toISOString().slice(0, 10));
      if (error) throw error;
      return data || [];
    },
  });

  const [empDialogOpen, setEmpDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeFull | null>(null);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docEmployeeId, setDocEmployeeId] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterContract, setFilterContract] = useState("all");

  const filtered = useMemo(() => employees.filter(e => {
    const s = search.trim().toLowerCase();
    if (s && !e.name.toLowerCase().includes(s) && !(e.role || "").toLowerCase().includes(s) && !(e.nationality || "").toLowerCase().includes(s)) return false;
    if (filterDept !== "all" && e.department !== filterDept) return false;
    if (filterContract !== "all" && e.contract_type !== filterContract) return false;
    return true;
  }), [employees, search, filterDept, filterContract]);

  // Smart aggregates
  const totalSalaries = employees.reduce((a, e) => a + (e.salary || 0), 0);
  const dangerDocsCount = employees.reduce((a, e) => a + (e.employee_docs?.filter(d => d.status_variant === "danger").length || 0), 0);
  const warningDocsCount = employees.reduce((a, e) => a + (e.employee_docs?.filter(d => d.status_variant === "warning").length || 0), 0);
  const expiringContracts = employees.filter(e => {
    const d = contractDaysLeft(e.contract_end);
    return d !== null && d <= 30 && d >= 0;
  });
  const expiredContracts = employees.filter(e => {
    const d = contractDaysLeft(e.contract_end);
    return d !== null && d < 0;
  });
  const avgTenureMonths = employees.length
    ? Math.round(employees.filter(e => e.hire_date).reduce((s, e) => s + monthsBetween(e.hire_date!), 0) / Math.max(1, employees.filter(e => e.hire_date).length))
    : 0;
  const saudiCount = employees.filter(e => e.contract_type === "saudi" || e.nationality === "سعودي").length;
  const saudizationPct = employees.length ? Math.round((saudiCount / employees.length) * 100) : 0;

  const monthYM = currentMonthYM();
  const monthLeavesCount = employees.reduce((s, e) =>
    s + (e.employee_leaves?.filter(l => l.start_date.startsWith(monthYM)).length || 0), 0);
  const monthPenaltiesTotal = employees.reduce((s, e) =>
    s + (e.employee_penalties?.filter(p => p.penalty_date.startsWith(monthYM)).reduce((x, p) => x + (Number(p.amount) || 0), 0) || 0), 0);
  const monthRewardsTotal = employees.reduce((s, e) =>
    s + (e.employee_rewards?.filter(r => r.reward_date.startsWith(monthYM)).reduce((x, r) => x + (Number(r.amount) || 0), 0) || 0), 0);
  const evaluationsDue = employees.filter(e => {
    const last = e.employee_evaluations?.[0]?.evaluation_date;
    if (!last) return true;
    return monthsBetween(last) >= 3;
  }).length;

  const exportPayrollCsv = () => {
    const rows: (string | number)[][] = [
      ["الموظف", "القسم", "الأساسي", "البدلات", "مكافآت", "جزاءات", "أيام غياب", "خصم غياب", "الصافي"],
    ];
    employees.forEach(e => {
      const empAtt = attendance.filter(a => a.employee_id === e.id);
      const p = computePayroll(e, empAtt, monthYM);
      rows.push([
        e.name, e.department || "—",
        p.basic.toFixed(2), p.allowances.toFixed(2), p.rewards.toFixed(2),
        p.penalties.toFixed(2), p.absenceDays, p.absenceDeduction.toFixed(2),
        p.net.toFixed(2),
      ]);
    });
    const totalNet = employees.reduce((s, e) => s + computePayroll(e, attendance.filter(a => a.employee_id === e.id), monthYM).net, 0);
    rows.push(["", "", "", "", "", "", "", "الإجمالي", totalNet.toFixed(2)]);
    downloadCsv(`payroll-${monthYM}.csv`, rows);
    toast.success("تم تنزيل كشف الرواتب");
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" dir="rtl">
      <PageHeader
        title="الطاقم"
        subtitle="نظام إدارة موارد بشرية ذكي — وثائق، إجازات، تقييمات، ورواتب"
        badge={`${employees.length} موظف`}
        actions={isAdmin ? (
          <>
            <Button variant="outline" onClick={exportPayrollCsv} className="gap-1.5">
              <Download size={16} /> كشف رواتب {monthYM}
            </Button>
            <Button onClick={() => { setEditingEmployee(null); setEmpDialogOpen(true); }} className="gap-1.5">
              <Plus size={16} /> إضافة موظف
            </Button>
          </>
        ) : undefined}
      />

      {/* Smart alerts strip */}
      {(expiringContracts.length > 0 || expiredContracts.length > 0 || dangerDocsCount > 0 || warningDocsCount > 0 || evaluationsDue > 0) && (
        <div className="ios-card mb-4 !p-3 border-r-4 border-r-warning">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTriangle size={14} className="text-warning" />
            <span className="text-[12px] font-semibold">تنبيهات ذكية:</span>
            {expiredContracts.length > 0 && <span className="text-[11px] px-2 py-1 rounded-full bg-danger/10 text-danger font-medium">🔴 {expiredContracts.length} عقد منتهي</span>}
            {expiringContracts.length > 0 && <span className="text-[11px] px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">⏰ {expiringContracts.length} عقد ينتهي خلال 30 يوم</span>}
            {dangerDocsCount > 0 && <span className="text-[11px] px-2 py-1 rounded-full bg-danger/10 text-danger font-medium">🚨 {dangerDocsCount} وثيقة منتهية</span>}
            {warningDocsCount > 0 && <span className="text-[11px] px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">⚡ {warningDocsCount} وثيقة قاربت</span>}
            {evaluationsDue > 0 && <span className="text-[11px] px-2 py-1 rounded-full bg-info/10 text-info font-medium">📊 {evaluationsDue} تقييم مستحق</span>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="👥 عدد الموظفين" value={employees.length.toString()} sub={`${employees.filter(e => e.status_variant === "success").length} حاضر الآن`} subColor="success" />
        <MetricCard label="💰 إجمالي الرواتب" value={totalSalaries.toLocaleString()} sub="شهرياً" subColor="warning" showRiyal />
        <MetricCard label="⏱ متوسط مدة الخدمة" value={`${avgTenureMonths} شهر`} sub={avgTenureMonths >= 12 ? "استقرار جيد" : "حديث"} subColor={avgTenureMonths >= 12 ? "success" : "gray"} />
        <MetricCard label="🇸🇦 نسبة السعودة" value={`${saudizationPct}%`} sub={`${saudiCount} من ${employees.length}`} subColor={saudizationPct >= 30 ? "success" : "warning"} />
        <MetricCard label="🏖 إجازات الشهر" value={monthLeavesCount.toString()} sub={monthYM} subColor="gray" />
        <MetricCard label="🎁 مكافآت الشهر" value={monthRewardsTotal.toLocaleString()} sub="إجمالي" subColor="success" showRiyal />
        <MetricCard label="⚠️ جزاءات الشهر" value={monthPenaltiesTotal.toLocaleString()} sub="إجمالي" subColor="danger" showRiyal />
        <MetricCard label="📄 تنبيهات وثائق" value={(dangerDocsCount + warningDocsCount).toString()} sub={`${dangerDocsCount} منتهية، ${warningDocsCount} قاربت`} subColor="danger" />
      </div>

      {/* Filters */}
      <div className="ios-card !p-3 mb-4 flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم، الوظيفة، الجنسية..." className="pr-9" />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-40"><SelectValue placeholder="القسم" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأقسام</SelectItem>
            <SelectItem value="مطبخ">مطبخ</SelectItem>
            <SelectItem value="كاشير">كاشير</SelectItem>
            <SelectItem value="توصيل">توصيل</SelectItem>
            <SelectItem value="إدارة">إدارة</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterContract} onValueChange={setFilterContract}>
          <SelectTrigger className="w-40"><SelectValue placeholder="نوع العقد" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل العقود</SelectItem>
            <SelectItem value="saudi">سعودة</SelectItem>
            <SelectItem value="expat">وافد</SelectItem>
            <SelectItem value="part_time">جزئي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="ios-card text-center py-12">
          <p className="text-muted-foreground mb-4">{employees.length === 0 ? "لا يوجد موظفين بعد" : "لا توجد نتائج للبحث"}</p>
          {isAdmin && employees.length === 0 && (
            <Button onClick={() => { setEditingEmployee(null); setEmpDialogOpen(true); }}>
              <Plus size={16} className="ml-1" /> إضافة أول موظف
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(emp => (
            <EmployeeProfileCard
              key={emp.id}
              employee={emp}
              attendance={attendance}
              isAdmin={isAdmin}
              onEdit={(e) => { setEditingEmployee(e); setEmpDialogOpen(true); }}
              onAddDoc={(id) => { setDocEmployeeId(id); setDocDialogOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <EmployeeFormDialog
        open={empDialogOpen}
        onOpenChange={setEmpDialogOpen}
        employee={editingEmployee}
      />
      {docDialogOpen && (
        <DocFormDialog
          open={docDialogOpen}
          onOpenChange={setDocDialogOpen}
          employeeId={docEmployeeId}
        />
      )}
    </div>
  );
};

export default Staff;
