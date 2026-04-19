import { useState } from "react";
import { ChevronDown, Pencil, Trash2, Plus, FileText, GraduationCap, Calendar, AlertTriangle, Award, Star, Calculator, Phone, Hash, Briefcase, Building2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { EmployeeFull } from "@/hooks/useEmployees";
import { useDeleteEmployee, useDeleteEmployeeRecord, useDeleteEmployeeDoc } from "@/hooks/useEmployees";
import { toast } from "sonner";
import { formatTenure, contractDaysLeft, allowancesTotal, computePayroll, currentMonthYM } from "@/lib/hr";
import { QualificationDialog, LeaveDialog, PenaltyDialog, RewardDialog, EvaluationDialog } from "./HrRecordDialogs";

interface Props {
  employee: EmployeeFull;
  attendance: { date: string; status: string; employee_id: string }[];
  isAdmin: boolean;
  onEdit: (emp: EmployeeFull) => void;
  onAddDoc: (empId: string) => void;
}

const leaveLabels: Record<string, string> = { annual: "سنوية", sick: "مرضية", emergency: "طارئة", unpaid: "بدون راتب" };
const leaveStatus: Record<string, { l: string; v: "success" | "warning" | "danger" | "info" }> = {
  approved: { l: "معتمدة", v: "success" }, pending: { l: "معلقة", v: "warning" }, rejected: { l: "مرفوضة", v: "danger" },
};
const sevColors: Record<string, string> = { warning: "text-warning", deduction: "text-danger", final_warning: "text-danger" };
const sevLabels: Record<string, string> = { warning: "تنبيه", deduction: "خصم", final_warning: "إنذار نهائي" };

const EmployeeProfileCard = ({ employee: emp, attendance, isAdmin, onEdit, onAddDoc }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [openDialog, setOpenDialog] = useState<null | "qualification" | "leave" | "penalty" | "reward" | "evaluation">(null);

  const deleteEmp = useDeleteEmployee();
  const deleteDoc = useDeleteEmployeeDoc();
  const deleteQual = useDeleteEmployeeRecord("employee_qualifications");
  const deleteLeave = useDeleteEmployeeRecord("employee_leaves");
  const deletePenalty = useDeleteEmployeeRecord("employee_penalties");
  const deleteReward = useDeleteEmployeeRecord("employee_rewards");
  const deleteEval = useDeleteEmployeeRecord("employee_evaluations");

  const empAttendance = attendance.filter(a => a.employee_id === emp.id);
  const payroll = computePayroll(emp, empAttendance, currentMonthYM());

  const docs = emp.employee_docs || [];
  const dangerDocs = docs.filter(d => d.status_variant === "danger").length;
  const warnDocs = docs.filter(d => d.status_variant === "warning").length;
  const contractLeft = contractDaysLeft(emp.contract_end);

  // Profile alerts
  const alerts: { text: string; v: "success" | "warning" | "danger" }[] = [];
  if (dangerDocs > 0) alerts.push({ text: `${dangerDocs} وثيقة منتهية`, v: "danger" });
  if (warnDocs > 0) alerts.push({ text: `${warnDocs} وثيقة قاربت`, v: "warning" });
  if (contractLeft !== null && contractLeft <= 30 && contractLeft >= 0) alerts.push({ text: `العقد ينتهي بعد ${contractLeft} يوم`, v: "warning" });
  if (contractLeft !== null && contractLeft < 0) alerts.push({ text: "العقد منتهي", v: "danger" });

  const handleDelete = async () => {
    try { await deleteEmp.mutateAsync(emp.id); toast.success("تم حذف الموظف"); }
    catch { toast.error("فشل الحذف"); }
  };

  const remove = (mut: any, label: string) => (id: string) => {
    mut.mutate(id, { onSuccess: () => toast.success(`تم حذف ${label}`), onError: () => toast.error("فشل الحذف") });
  };

  return (
    <>
      <div className="ios-card !p-0 overflow-hidden">
        {/* Header */}
        <div onClick={() => setExpanded(!expanded)} className="flex items-center gap-4 p-5 cursor-pointer hover:bg-muted/30 transition-colors">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold border-2 border-border flex-shrink-0">
            {emp.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[15px] font-bold">{emp.name}</span>
              <StatusBadge variant={emp.status_variant as any}>{emp.status}</StatusBadge>
              {emp.department && <StatusBadge variant="info">{emp.department}</StatusBadge>}
            </div>
            <div className="text-[12px] text-muted-foreground">
              {emp.role}{emp.hire_date && ` · مدة الخدمة: ${formatTenure(emp.hire_date)}`} · {(emp.salary || 0).toLocaleString()} ر/شهر
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {alerts.slice(0, 2).map((a, i) => (
              <span key={i} className={`text-[10px] font-semibold px-2 py-1 rounded-full bg-${a.v}/10 text-${a.v}`}>● {a.text}</span>
            ))}
            <ChevronDown size={18} className={`text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
        </div>

        {expanded && (
          <div className="border-t border-border animate-fade-in">
            {/* Admin actions */}
            {isAdmin && (
              <div className="px-5 py-2.5 border-b border-border flex gap-2 bg-muted/10 flex-wrap">
                <Button size="sm" variant="outline" className="text-[11px] h-7 gap-1" onClick={(e) => { e.stopPropagation(); onEdit(emp); }}>
                  <Pencil size={12} /> تعديل البيانات
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-[11px] h-7 gap-1 text-danger border-danger/30 hover:bg-danger/10">
                      <Trash2 size={12} /> حذف الموظف
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>حذف {emp.name}؟</AlertDialogTitle>
                      <AlertDialogDescription>سيُحذف الموظف وجميع سجلاته (وثائق، إجازات، جزاءات...) نهائياً.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            <Tabs defaultValue="overview" className="p-5">
              <TabsList className="grid grid-cols-7 mb-4">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="docs">وثائق</TabsTrigger>
                <TabsTrigger value="qualifications">مؤهلات</TabsTrigger>
                <TabsTrigger value="leaves">إجازات</TabsTrigger>
                <TabsTrigger value="penalties">جزاءات/مكافآت</TabsTrigger>
                <TabsTrigger value="evaluations">تقييمات</TabsTrigger>
                <TabsTrigger value="payroll">الراتب</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <InfoTile icon={<Hash size={12} />} label="رقم الهوية" value={emp.national_id} />
                  <InfoTile icon={<Building2 size={12} />} label="الجنسية" value={emp.nationality} />
                  <InfoTile icon={<Calendar size={12} />} label="تاريخ الميلاد" value={emp.birth_date} />
                  <InfoTile icon={<Phone size={12} />} label="الجوال" value={emp.phone} />
                  <InfoTile icon={<Phone size={12} />} label="طوارئ" value={emp.emergency_contact} />
                  <InfoTile icon={<Briefcase size={12} />} label="نوع العقد" value={emp.contract_type} />
                  <InfoTile icon={<Calendar size={12} />} label="تاريخ التوظيف" value={emp.hire_date} />
                  <InfoTile icon={<Calendar size={12} />} label="نهاية العقد" value={emp.contract_end ? `${emp.contract_end}${contractLeft !== null ? ` (${contractLeft} يوم)` : ""}` : null} />
                  <InfoTile icon={<Building2 size={12} />} label="القسم" value={emp.department} />
                </div>
                {emp.address && (
                  <div className="text-[11px] text-muted-foreground bg-muted/30 rounded-lg p-3">📍 {emp.address}</div>
                )}
                {alerts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {alerts.map((a, i) => (
                      <span key={i} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full bg-${a.v}/10 text-${a.v}`}>● {a.text}</span>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Documents */}
              <TabsContent value="docs" className="space-y-2">
                {isAdmin && (
                  <Button size="sm" variant="outline" className="gap-1 mb-2" onClick={() => onAddDoc(emp.id)}>
                    <Plus size={12} /> إضافة وثيقة
                  </Button>
                )}
                {docs.length === 0 ? <Empty text="لا توجد وثائق" /> : (
                  <div className="space-y-2">
                    {docs.map(d => (
                      <Row key={d.id}
                        title={d.label} sub={`${d.doc_number || ""}${d.expiry_date ? ` · ينتهي ${d.expiry_date}` : ""}`}
                        badge={{ text: d.status, v: d.status_variant as any }}
                        onDelete={isAdmin ? () => remove(deleteDoc, "الوثيقة")(d.id) : undefined}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Qualifications */}
              <TabsContent value="qualifications" className="space-y-2">
                {isAdmin && (
                  <Button size="sm" variant="outline" className="gap-1 mb-2" onClick={() => setOpenDialog("qualification")}>
                    <Plus size={12} /> إضافة مؤهل
                  </Button>
                )}
                {emp.employee_qualifications?.length === 0 ? <Empty text="لا توجد مؤهلات" /> : (
                  <div className="space-y-2">
                    {emp.employee_qualifications?.map(q => (
                      <Row key={q.id}
                        title={q.title}
                        sub={`${q.qualification_type === "degree" ? "شهادة" : q.qualification_type === "certificate" ? "شهادة مهنية" : q.qualification_type === "course" ? "دورة" : "خبرة"}${q.institution ? ` · ${q.institution}` : ""}${q.year ? ` · ${q.year}` : ""}`}
                        icon={<GraduationCap size={14} className="text-primary" />}
                        onDelete={isAdmin ? () => remove(deleteQual, "المؤهل")(q.id) : undefined}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Leaves */}
              <TabsContent value="leaves" className="space-y-2">
                {isAdmin && (
                  <Button size="sm" variant="outline" className="gap-1 mb-2" onClick={() => setOpenDialog("leave")}>
                    <Plus size={12} /> تسجيل إجازة
                  </Button>
                )}
                {emp.employee_leaves?.length === 0 ? <Empty text="لا توجد إجازات" /> : (
                  <div className="space-y-2">
                    {emp.employee_leaves?.map(l => (
                      <Row key={l.id}
                        title={`${leaveLabels[l.leave_type] || l.leave_type} · ${l.days_count} يوم`}
                        sub={`${l.start_date} ← ${l.end_date}${l.notes ? ` · ${l.notes}` : ""}`}
                        badge={{ text: leaveStatus[l.status]?.l || l.status, v: leaveStatus[l.status]?.v || "info" }}
                        icon={<Calendar size={14} className="text-info" />}
                        onDelete={isAdmin ? () => remove(deleteLeave, "الإجازة")(l.id) : undefined}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Penalties + Rewards */}
              <TabsContent value="penalties" className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[12px] font-semibold flex items-center gap-1.5"><AlertTriangle size={13} className="text-danger" /> الجزاءات</h4>
                      {isAdmin && <Button size="sm" variant="outline" className="h-6 gap-1 text-[10px]" onClick={() => setOpenDialog("penalty")}><Plus size={10} /> إضافة</Button>}
                    </div>
                    {emp.employee_penalties?.length === 0 ? <Empty text="لا توجد جزاءات" /> : (
                      <div className="space-y-1.5">
                        {emp.employee_penalties?.map(p => (
                          <Row key={p.id}
                            title={p.reason}
                            sub={`${p.penalty_date} · ${(Number(p.amount) || 0).toLocaleString()} ر.س`}
                            badge={{ text: sevLabels[p.severity] || p.severity, v: p.severity === "warning" ? "warning" : "danger" }}
                            onDelete={isAdmin ? () => remove(deletePenalty, "الجزاء")(p.id) : undefined}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[12px] font-semibold flex items-center gap-1.5"><Award size={13} className="text-success" /> المكافآت</h4>
                      {isAdmin && <Button size="sm" variant="outline" className="h-6 gap-1 text-[10px]" onClick={() => setOpenDialog("reward")}><Plus size={10} /> إضافة</Button>}
                    </div>
                    {emp.employee_rewards?.length === 0 ? <Empty text="لا توجد مكافآت" /> : (
                      <div className="space-y-1.5">
                        {emp.employee_rewards?.map(r => (
                          <Row key={r.id}
                            title={r.reason}
                            sub={`${r.reward_date} · ${(Number(r.amount) || 0).toLocaleString()} ر.س`}
                            badge={{ text: r.reward_type === "cash" ? "نقدي" : "معنوي", v: "success" }}
                            onDelete={isAdmin ? () => remove(deleteReward, "المكافأة")(r.id) : undefined}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Evaluations */}
              <TabsContent value="evaluations" className="space-y-2">
                {isAdmin && (
                  <Button size="sm" variant="outline" className="gap-1 mb-2" onClick={() => setOpenDialog("evaluation")}>
                    <Plus size={12} /> إضافة تقييم
                  </Button>
                )}
                {emp.employee_evaluations?.length === 0 ? <Empty text="لا توجد تقييمات بعد" /> : (
                  <div className="space-y-2">
                    {emp.employee_evaluations?.sort((a, b) => b.evaluation_date.localeCompare(a.evaluation_date)).map(ev => (
                      <div key={ev.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold">{ev.evaluation_date}</span>
                            <StatusBadge variant="info">{ev.period === "monthly" ? "شهري" : ev.period === "quarterly" ? "ربع سنوي" : "سنوي"}</StatusBadge>
                            {ev.evaluator && <span className="text-[10px] text-muted-foreground">— {ev.evaluator}</span>}
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={12} className={i < ev.score ? "fill-warning text-warning" : "text-muted"} />
                            ))}
                          </div>
                        </div>
                        {ev.strengths && <div className="text-[11px] text-success mb-1">✓ {ev.strengths}</div>}
                        {ev.weaknesses && <div className="text-[11px] text-warning mb-1">! {ev.weaknesses}</div>}
                        {ev.goals && <div className="text-[11px] text-muted-foreground">🎯 {ev.goals}</div>}
                        {isAdmin && (
                          <button onClick={() => remove(deleteEval, "التقييم")(ev.id)} className="text-muted-foreground hover:text-danger mt-2">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Payroll */}
              <TabsContent value="payroll" className="space-y-3">
                <div className="ios-card !p-4 bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator size={14} className="text-primary" />
                    <h4 className="text-[13px] font-bold">حاسبة راتب {currentMonthYM()}</h4>
                  </div>
                  <PayrollRow label="الراتب الأساسي" value={payroll.basic} />
                  <PayrollRow label="البدلات" value={payroll.allowances} positive />
                  <PayrollRow label="مكافآت الشهر" value={payroll.rewards} positive />
                  <PayrollRow label="جزاءات الشهر" value={-payroll.penalties} negative={payroll.penalties > 0} />
                  <PayrollRow label={`خصم غياب (${payroll.absenceDays} يوم)`} value={-payroll.absenceDeduction} negative={payroll.absenceDays > 0} />
                  <div className="border-t border-border mt-2 pt-2 flex items-center justify-between">
                    <span className="text-[13px] font-bold">الصافي</span>
                    <span className="text-[18px] font-bold text-primary">{payroll.net.toLocaleString(undefined, { maximumFractionDigits: 2 })} ر.س</span>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground">يوم غياب = الراتب الأساسي ÷ 30. حسبت من سجل الحضور للشهر الجاري.</div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {openDialog === "qualification" && <QualificationDialog open onOpenChange={(o) => !o && setOpenDialog(null)} employeeId={emp.id} />}
      {openDialog === "leave" && <LeaveDialog open onOpenChange={(o) => !o && setOpenDialog(null)} employeeId={emp.id} />}
      {openDialog === "penalty" && <PenaltyDialog open onOpenChange={(o) => !o && setOpenDialog(null)} employeeId={emp.id} />}
      {openDialog === "reward" && <RewardDialog open onOpenChange={(o) => !o && setOpenDialog(null)} employeeId={emp.id} />}
      {openDialog === "evaluation" && <EvaluationDialog open onOpenChange={(o) => !o && setOpenDialog(null)} employeeId={emp.id} />}
    </>
  );
};

const InfoTile = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => (
  <div className="bg-background border border-border rounded-lg p-2.5">
    <div className="text-[9px] text-muted-foreground font-medium mb-1 flex items-center gap-1">{icon} {label}</div>
    <div className="text-[12px] font-semibold text-foreground truncate">{value || "—"}</div>
  </div>
);

const Row = ({ title, sub, badge, icon, onDelete }: {
  title: string; sub?: string;
  badge?: { text: string; v: "success" | "warning" | "danger" | "info" };
  icon?: React.ReactNode; onDelete?: () => void;
}) => (
  <div className="flex items-center gap-3 px-3 py-2 border border-border rounded-lg bg-background">
    {icon}
    <div className="flex-1 min-w-0">
      <div className="text-[12px] font-semibold truncate">{title}</div>
      {sub && <div className="text-[10px] text-muted-foreground truncate">{sub}</div>}
    </div>
    {badge && <StatusBadge variant={badge.v}>{badge.text}</StatusBadge>}
    {onDelete && (
      <button onClick={onDelete} className="text-muted-foreground hover:text-danger transition-colors">
        <Trash2 size={12} />
      </button>
    )}
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <div className="text-[12px] text-muted-foreground text-center py-6">{text}</div>
);

const PayrollRow = ({ label, value, positive, negative }: { label: string; value: number; positive?: boolean; negative?: boolean }) => (
  <div className="flex items-center justify-between py-1 text-[12px]">
    <span className="text-muted-foreground">{label}</span>
    <span className={`font-semibold ${positive ? "text-success" : negative ? "text-danger" : "text-foreground"}`}>
      {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </span>
  </div>
);

export default EmployeeProfileCard;
