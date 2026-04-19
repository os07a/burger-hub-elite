import { useState } from "react";
import { ChevronDown, Pencil, Trash2, Plus, GraduationCap, Calendar, AlertTriangle, Award, Star, Calculator } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { EmployeeFull } from "@/hooks/useEmployees";
import { useDeleteEmployee, useDeleteEmployeeRecord, useDeleteEmployeeDoc } from "@/hooks/useEmployees";
import { toast } from "sonner";
import { formatTenure, contractDaysLeft, computePayroll, currentMonthYM } from "@/lib/hr";
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
const sevLabels: Record<string, string> = { warning: "تنبيه", deduction: "خصم", final_warning: "إنذار نهائي" };

const EmployeeProfileCard = ({ employee: emp, attendance, isAdmin, onEdit, onAddDoc }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [openDialog, setOpenDialog] = useState<null | "qualification" | "leave" | "penalty" | "reward" | "evaluation">(null);
  const [activitySub, setActivitySub] = useState<"leaves" | "penalties" | "rewards" | "evaluations">("leaves");

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
  const quals = emp.employee_qualifications || [];
  const leaves = emp.employee_leaves || [];
  const penalties = emp.employee_penalties || [];
  const rewards = emp.employee_rewards || [];
  const evals = emp.employee_evaluations || [];

  const dangerDocs = docs.filter(d => d.status_variant === "danger").length;
  const warnDocs = docs.filter(d => d.status_variant === "warning").length;
  const contractLeft = contractDaysLeft(emp.contract_end);

  const recordsCount = docs.length + quals.length;
  const activitiesCount = leaves.length + penalties.length + rewards.length + evals.length;

  const alerts: { text: string; v: "success" | "warning" | "danger" }[] = [];
  if (dangerDocs > 0) alerts.push({ text: `${dangerDocs} وثيقة منتهية`, v: "danger" });
  if (warnDocs > 0) alerts.push({ text: `${warnDocs} وثيقة قاربت`, v: "warning" });
  if (contractLeft !== null && contractLeft <= 30 && contractLeft >= 0) alerts.push({ text: `العقد ينتهي بعد ${contractLeft} يوم`, v: "warning" });
  if (contractLeft !== null && contractLeft < 0) alerts.push({ text: "العقد منتهي", v: "danger" });

  // Profile fields (hide empty)
  const idContact = [
    { l: "الهوية", v: emp.national_id },
    { l: "الجنسية", v: emp.nationality },
    { l: "الميلاد", v: emp.birth_date },
    { l: "الجوال", v: emp.phone },
    { l: "طوارئ", v: emp.emergency_contact },
    { l: "العنوان", v: emp.address },
  ].filter(f => f.v);

  const contractFinance = [
    { l: "نوع العقد", v: emp.contract_type },
    { l: "بداية العقد", v: emp.contract_start },
    { l: "نهاية العقد", v: emp.contract_end ? `${emp.contract_end}${contractLeft !== null ? ` (${contractLeft} يوم)` : ""}` : null },
    { l: "تاريخ التوظيف", v: emp.hire_date },
    { l: "البنك", v: emp.bank_name },
    { l: "IBAN", v: emp.iban },
  ].filter(f => f.v);

  const handleDelete = async () => {
    try { await deleteEmp.mutateAsync(emp.id); toast.success("تم حذف الموظف"); }
    catch { toast.error("فشل الحذف"); }
  };

  const remove = (mut: any, label: string) => (id: string) => {
    mut.mutate(id, { onSuccess: () => toast.success(`تم حذف ${label}`), onError: () => toast.error("فشل الحذف") });
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <>
      <div className="ios-card !p-0 overflow-hidden">
        {/* Header — slim */}
        <div onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-base font-bold border-2 border-border flex-shrink-0">
            {emp.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[14px] font-bold">{emp.name}</span>
              <StatusBadge variant={emp.status_variant as any}>{emp.status}</StatusBadge>
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {emp.role}{emp.hire_date && ` · ${formatTenure(emp.hire_date)}`} · {(emp.salary || 0).toLocaleString()} ر/شهر
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {alerts.slice(0, 2).map((a, i) => (
              <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-${a.v}/10 text-${a.v}`}>● {a.text}</span>
            ))}
            {isAdmin && expanded && (
              <>
                <button onClick={(e) => { stop(e); onEdit(emp); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="تعديل">
                  <Pencil size={14} />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button onClick={stop} className="p-1.5 rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors" title="حذف">
                      <Trash2 size={14} />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl" onClick={stop}>
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
              </>
            )}
            <ChevronDown size={18} className={`text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
        </div>

        {expanded && (
          <div className="border-t border-border animate-fade-in">
            <Tabs defaultValue="profile" className="p-4">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="profile" className="text-[12px]">الملف</TabsTrigger>
                <TabsTrigger value="records" className="text-[12px]">السجلات{recordsCount > 0 && ` (${recordsCount})`}</TabsTrigger>
                <TabsTrigger value="activities" className="text-[12px]">الأنشطة{activitiesCount > 0 && ` (${activitiesCount})`}</TabsTrigger>
                <TabsTrigger value="payroll" className="text-[12px]">الراتب</TabsTrigger>
              </TabsList>

              {/* Profile */}
              <TabsContent value="profile" className="space-y-4">
                {idContact.length === 0 && contractFinance.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-[12px] text-muted-foreground mb-3">📝 لا توجد معلومات مفصّلة بعد</div>
                    {isAdmin && (
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => onEdit(emp)}>
                        <Pencil size={12} /> أكمل الملف
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileGroup title="هوية وتواصل" fields={idContact} />
                    <ProfileGroup title="تعاقد ومالي" fields={contractFinance} />
                  </div>
                )}
              </TabsContent>

              {/* Records: Documents + Qualifications */}
              <TabsContent value="records" className="space-y-4">
                <Section
                  title="الوثائق الرسمية"
                  count={docs.length}
                  addLabel="إضافة وثيقة"
                  onAdd={isAdmin ? () => onAddDoc(emp.id) : undefined}
                  emptyText="لا توجد وثائق"
                >
                  {docs.map(d => (
                    <Row key={d.id}
                      title={d.label} sub={`${d.doc_number || ""}${d.expiry_date ? ` · ينتهي ${d.expiry_date}` : ""}`}
                      badge={{ text: d.status, v: d.status_variant as any }}
                      onDelete={isAdmin ? () => remove(deleteDoc, "الوثيقة")(d.id) : undefined}
                    />
                  ))}
                </Section>

                <Section
                  title="المؤهلات والشهادات"
                  count={quals.length}
                  addLabel="إضافة مؤهل"
                  onAdd={isAdmin ? () => setOpenDialog("qualification") : undefined}
                  emptyText="لا توجد مؤهلات"
                >
                  {quals.map(q => (
                    <Row key={q.id}
                      icon={<GraduationCap size={14} className="text-primary" />}
                      title={q.title}
                      sub={`${q.qualification_type === "degree" ? "شهادة" : q.qualification_type === "certificate" ? "شهادة مهنية" : q.qualification_type === "course" ? "دورة" : "خبرة"}${q.institution ? ` · ${q.institution}` : ""}${q.year ? ` · ${q.year}` : ""}`}
                      onDelete={isAdmin ? () => remove(deleteQual, "المؤهل")(q.id) : undefined}
                    />
                  ))}
                </Section>
              </TabsContent>

              {/* Activities: sub-tabs */}
              <TabsContent value="activities" className="space-y-3">
                <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                  {([
                    { k: "leaves", l: "الإجازات", c: leaves.length },
                    { k: "penalties", l: "الجزاءات", c: penalties.length },
                    { k: "rewards", l: "المكافآت", c: rewards.length },
                    { k: "evaluations", l: "التقييمات", c: evals.length },
                  ] as const).map(s => (
                    <button key={s.k}
                      onClick={() => setActivitySub(s.k)}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${activitySub === s.k ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      {s.l}{s.c > 0 && ` (${s.c})`}
                    </button>
                  ))}
                </div>

                {activitySub === "leaves" && (
                  <Section addLabel="تسجيل إجازة" onAdd={isAdmin ? () => setOpenDialog("leave") : undefined} emptyText="لا توجد إجازات" count={leaves.length}>
                    {leaves.map(l => (
                      <Row key={l.id}
                        icon={<Calendar size={14} className="text-info" />}
                        title={`${leaveLabels[l.leave_type] || l.leave_type} · ${l.days_count} يوم`}
                        sub={`${l.start_date} ← ${l.end_date}${l.notes ? ` · ${l.notes}` : ""}`}
                        badge={{ text: leaveStatus[l.status]?.l || l.status, v: leaveStatus[l.status]?.v || "info" }}
                        onDelete={isAdmin ? () => remove(deleteLeave, "الإجازة")(l.id) : undefined}
                      />
                    ))}
                  </Section>
                )}

                {activitySub === "penalties" && (
                  <Section addLabel="إضافة جزاء" onAdd={isAdmin ? () => setOpenDialog("penalty") : undefined} emptyText="لا توجد جزاءات" count={penalties.length}>
                    {penalties.map(p => (
                      <Row key={p.id}
                        icon={<AlertTriangle size={14} className="text-danger" />}
                        title={p.reason}
                        sub={`${p.penalty_date} · ${(Number(p.amount) || 0).toLocaleString()} ر.س`}
                        badge={{ text: sevLabels[p.severity] || p.severity, v: p.severity === "warning" ? "warning" : "danger" }}
                        onDelete={isAdmin ? () => remove(deletePenalty, "الجزاء")(p.id) : undefined}
                      />
                    ))}
                  </Section>
                )}

                {activitySub === "rewards" && (
                  <Section addLabel="إضافة مكافأة" onAdd={isAdmin ? () => setOpenDialog("reward") : undefined} emptyText="لا توجد مكافآت" count={rewards.length}>
                    {rewards.map(r => (
                      <Row key={r.id}
                        icon={<Award size={14} className="text-success" />}
                        title={r.reason}
                        sub={`${r.reward_date} · ${(Number(r.amount) || 0).toLocaleString()} ر.س`}
                        badge={{ text: r.reward_type === "cash" ? "نقدي" : "معنوي", v: "success" }}
                        onDelete={isAdmin ? () => remove(deleteReward, "المكافأة")(r.id) : undefined}
                      />
                    ))}
                  </Section>
                )}

                {activitySub === "evaluations" && (
                  <Section addLabel="إضافة تقييم" onAdd={isAdmin ? () => setOpenDialog("evaluation") : undefined} emptyText="لا توجد تقييمات بعد" count={evals.length}>
                    {evals.sort((a, b) => b.evaluation_date.localeCompare(a.evaluation_date)).map(ev => (
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
                  </Section>
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

const ProfileGroup = ({ title, fields }: { title: string; fields: { l: string; v: string | null | undefined }[] }) => {
  if (fields.length === 0) return null;
  return (
    <div className="bg-muted/20 rounded-lg p-3 space-y-1.5">
      <div className="text-[10px] font-bold text-muted-foreground mb-2">{title}</div>
      {fields.map((f, i) => (
        <div key={i} className="flex items-center justify-between gap-3 text-[12px]">
          <span className="text-muted-foreground">{f.l}</span>
          <span className="font-semibold text-foreground truncate text-left" dir="ltr">{f.v}</span>
        </div>
      ))}
    </div>
  );
};

const Section = ({ title, count, addLabel, onAdd, emptyText, children }: {
  title?: string; count: number; addLabel: string; onAdd?: () => void; emptyText: string; children: React.ReactNode;
}) => (
  <div className="space-y-2">
    {(title || onAdd) && (
      <div className="flex items-center justify-between">
        {title ? <h4 className="text-[12px] font-semibold text-muted-foreground">{title}{count > 0 && ` (${count})`}</h4> : <span />}
        {onAdd && (
          <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={onAdd}>
            <Plus size={12} /> {addLabel}
          </Button>
        )}
      </div>
    )}
    {count === 0 ? <Empty text={emptyText} /> : <div className="space-y-2">{children}</div>}
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
  <div className="text-[12px] text-muted-foreground text-center py-5 bg-muted/20 rounded-lg">{text}</div>
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
