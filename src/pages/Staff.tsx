import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEmployees, type EmployeeWithDocs } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";
import EmployeeCard from "@/components/staff/EmployeeCard";
import EmployeeFormDialog from "@/components/staff/EmployeeFormDialog";
import DocFormDialog from "@/components/staff/DocFormDialog";

const Staff = () => {
  const { data: employees = [], isLoading } = useEmployees();
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";

  const [empDialogOpen, setEmpDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeWithDocs | null>(null);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docEmployeeId, setDocEmployeeId] = useState("");

  const totalSalaries = employees.reduce((a, e) => a + (e.salary || 0), 0);
  const dangerCount = employees.reduce(
    (a, e) => a + (e.employee_docs?.filter(d => d.status_variant === "danger").length || 0), 0
  );

  if (isLoading) {
    return (
      <div className="animate-fade-in flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <PageHeader title="الطاقم" subtitle="المستندات والوثائق والإجازات والتنبيهات" badge={`${employees.length} موظف`} />
        {isAdmin && (
          <Button onClick={() => { setEditingEmployee(null); setEmpDialogOpen(true); }} className="gap-1.5">
            <Plus size={16} /> إضافة موظف
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="👥 عدد الموظفين" value={employees.length.toString()} sub={`${employees.filter(e => e.status_variant === "success").length} حاضر الآن`} subColor="success" />
        <MetricCard label="💰 إجمالي الرواتب" value={totalSalaries.toLocaleString()} sub="شهرياً" subColor="warning" showRiyal />
        <MetricCard label="📈 متوسط المبيعات/موظف" value={employees.length ? Math.round(696 * 30 / employees.length).toLocaleString() : "0"} sub="شهرياً لكل موظف" showRiyal />
        <MetricCard label="📄 تنبيهات وثائق" value={dangerCount.toString()} sub="وثائق منتهية تحتاج تجديد" subColor="danger" />
      </div>

      {employees.length === 0 ? (
        <div className="ios-card text-center py-12">
          <p className="text-muted-foreground mb-4">لا يوجد موظفين بعد</p>
          {isAdmin && (
            <Button onClick={() => { setEditingEmployee(null); setEmpDialogOpen(true); }}>
              <Plus size={16} className="ml-1" /> إضافة أول موظف
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              isAdmin={isAdmin}
              onEdit={(e) => { setEditingEmployee(e); setEmpDialogOpen(true); }}
              onAddDoc={(id) => { setDocEmployeeId(id); setDocDialogOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Labor cost summary */}
      {employees.length > 0 && (
        <div className="ios-card mt-6">
          <div className="text-[11px] font-medium text-muted-foreground mb-4">📊 تحليل تكلفة العمالة مقابل الإيرادات</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background rounded-xl p-4 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">الرواتب الشهرية</div>
              <div className="text-[18px] font-bold text-foreground flex items-center justify-center gap-1">{totalSalaries.toLocaleString()} <RiyalIcon size={12} /></div>
            </div>
            <div className="bg-background rounded-xl p-4 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">متوسط الإيرادات الشهرية</div>
              <div className="text-[18px] font-bold text-primary flex items-center justify-center gap-1">{(696 * 30).toLocaleString()} <RiyalIcon size={12} /></div>
            </div>
            <div className="bg-background rounded-xl p-4 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">نسبة العمالة من الإيرادات</div>
              <div className={`text-[18px] font-bold ${(totalSalaries / (696 * 30)) > 0.35 ? 'text-danger' : 'text-success'}`}>
                {totalSalaries > 0 ? ((totalSalaries / (696 * 30)) * 100).toFixed(1) : "0"}%
              </div>
            </div>
          </div>
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
