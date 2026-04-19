import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddEmployee, useUpdateEmployee, useEmployees, type Employee } from "@/hooks/useEmployees";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

type Allowance = { name: string; amount: number };

const DEPARTMENTS = ["مطبخ", "كاشير", "توصيل", "إدارة"];
const CONTRACT_TYPES = [
  { v: "saudi", l: "سعودة" },
  { v: "expat", l: "وافد" },
  { v: "part_time", l: "جزئي" },
];
const WEEK_DAYS = [
  { v: "sun", l: "الأحد" },
  { v: "mon", l: "الاثنين" },
  { v: "tue", l: "الثلاثاء" },
  { v: "wed", l: "الأربعاء" },
  { v: "thu", l: "الخميس" },
  { v: "fri", l: "الجمعة" },
  { v: "sat", l: "السبت" },
];

const EmployeeFormDialog = ({ open, onOpenChange, employee }: Props) => {
  const isEdit = !!employee;
  const addMutation = useAddEmployee();
  const updateMutation = useUpdateEmployee();
  const { data: allEmployees = [] } = useEmployees();

  const [form, setForm] = useState({
    // Basic
    name: "", role: "", role_short: "", status: "حاضر", status_variant: "success",
    performance_tasks: "", performance_rating: "",
    // Personal
    national_id: "", nationality: "", birth_date: "",
    phone: "", emergency_contact: "", address: "",
    // Contract
    hire_date: "", contract_type: "expat", contract_start: "", contract_end: "",
    department: "", job_title: "", direct_manager_id: "",
    // Financial
    basic_salary: "", bank_name: "", iban: "",
    // Work
    shift_hours: "8",
  });
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [workDays, setWorkDays] = useState<string[]>(["sun", "mon", "tue", "wed", "thu"]);

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name ?? "",
        role: employee.role ?? "",
        role_short: employee.role_short ?? "",
        status: employee.status ?? "حاضر",
        status_variant: employee.status_variant ?? "success",
        performance_tasks: employee.performance_tasks ?? "",
        performance_rating: employee.performance_rating ?? "",
        national_id: employee.national_id ?? "",
        nationality: employee.nationality ?? "",
        birth_date: employee.birth_date ?? "",
        phone: employee.phone ?? "",
        emergency_contact: employee.emergency_contact ?? "",
        address: employee.address ?? "",
        hire_date: employee.hire_date ?? "",
        contract_type: employee.contract_type ?? "expat",
        contract_start: employee.contract_start ?? "",
        contract_end: employee.contract_end ?? "",
        department: employee.department ?? "",
        job_title: employee.job_title ?? "",
        direct_manager_id: employee.direct_manager_id ?? "",
        basic_salary: (employee.basic_salary ?? employee.salary ?? 0).toString(),
        bank_name: employee.bank_name ?? "",
        iban: employee.iban ?? "",
        shift_hours: (employee.shift_hours ?? 8).toString(),
      });
      setAllowances(Array.isArray(employee.allowances) ? (employee.allowances as any) : []);
      setWorkDays(Array.isArray(employee.work_days) ? (employee.work_days as any) : ["sun", "mon", "tue", "wed", "thu"]);
    } else {
      setForm({
        name: "", role: "", role_short: "", status: "حاضر", status_variant: "success",
        performance_tasks: "", performance_rating: "",
        national_id: "", nationality: "", birth_date: "",
        phone: "", emergency_contact: "", address: "",
        hire_date: "", contract_type: "expat", contract_start: "", contract_end: "",
        department: "", job_title: "", direct_manager_id: "",
        basic_salary: "", bank_name: "", iban: "",
        shift_hours: "8",
      });
      setAllowances([]);
      setWorkDays(["sun", "mon", "tue", "wed", "thu"]);
    }
  }, [employee, open]);

  const totalAllowances = allowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const grossSalary = (parseFloat(form.basic_salary) || 0) + totalAllowances;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: form.name,
        role: form.role,
        role_short: form.role_short || null,
        salary: grossSalary,
        basic_salary: parseFloat(form.basic_salary) || 0,
        allowances,
        status: form.status,
        status_variant: form.status_variant,
        performance_tasks: form.performance_tasks || null,
        performance_rating: form.performance_rating || null,
        national_id: form.national_id || null,
        nationality: form.nationality || null,
        birth_date: form.birth_date || null,
        phone: form.phone || null,
        emergency_contact: form.emergency_contact || null,
        address: form.address || null,
        hire_date: form.hire_date || null,
        contract_type: form.contract_type || null,
        contract_start: form.contract_start || null,
        contract_end: form.contract_end || null,
        department: form.department || null,
        job_title: form.job_title || null,
        direct_manager_id: form.direct_manager_id || null,
        bank_name: form.bank_name || null,
        iban: form.iban || null,
        work_days: workDays,
        shift_hours: parseFloat(form.shift_hours) || null,
      };

      if (isEdit && employee) {
        await updateMutation.mutateAsync({ id: employee.id, ...payload });
        toast.success("تم تحديث بيانات الموظف");
      } else {
        await addMutation.mutateAsync(payload);
        toast.success("تم إضافة الموظف بنجاح");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    }
  };

  const loading = addMutation.isPending || updateMutation.isPending;
  const managerOptions = allEmployees.filter(e => e.id !== employee?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `تعديل: ${employee?.name}` : "إضافة موظف جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="personal">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="personal">شخصي</TabsTrigger>
              <TabsTrigger value="contract">تعاقد</TabsTrigger>
              <TabsTrigger value="financial">مالي</TabsTrigger>
              <TabsTrigger value="work">عمل</TabsTrigger>
            </TabsList>

            {/* Personal */}
            <TabsContent value="personal" className="space-y-3 pt-3">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>رقم الهوية / الإقامة</Label>
                  <Input value={form.national_id} onChange={e => setForm(f => ({ ...f, national_id: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>الجنسية</Label>
                  <Input value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} placeholder="سعودي / مصري..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>تاريخ الميلاد</Label>
                  <Input type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>الجوال</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="05xxxxxxxx" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>جهة اتصال للطوارئ</Label>
                <Input value={form.emergency_contact} onChange={e => setForm(f => ({ ...f, emergency_contact: e.target.value }))} placeholder="اسم + رقم" />
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} />
              </div>
            </TabsContent>

            {/* Contract */}
            <TabsContent value="contract" className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>المسمى الوظيفي *</Label>
                  <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="طباخ، كاشير..." required />
                </div>
                <div className="space-y-2">
                  <Label>القسم</Label>
                  <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                    <SelectTrigger><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>المدير المباشر</Label>
                  <Select value={form.direct_manager_id || "none"} onValueChange={v => setForm(f => ({ ...f, direct_manager_id: v === "none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="بدون" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— بدون —</SelectItem>
                      {managerOptions.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>تاريخ التوظيف</Label>
                  <Input type="date" value={form.hire_date} onChange={e => setForm(f => ({ ...f, hire_date: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>نوع العقد</Label>
                  <Select value={form.contract_type} onValueChange={v => setForm(f => ({ ...f, contract_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map(c => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>بداية العقد</Label>
                  <Input type="date" value={form.contract_start} onChange={e => setForm(f => ({ ...f, contract_start: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>نهاية العقد</Label>
                  <Input type="date" value={form.contract_end} onChange={e => setForm(f => ({ ...f, contract_end: e.target.value }))} />
                </div>
              </div>
            </TabsContent>

            {/* Financial */}
            <TabsContent value="financial" className="space-y-3 pt-3">
              <div className="space-y-2">
                <Label>الراتب الأساسي (ر.س) *</Label>
                <Input type="number" step="0.01" value={form.basic_salary} onChange={e => setForm(f => ({ ...f, basic_salary: e.target.value }))} required />
              </div>

              {/* Allowances */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>البدلات</Label>
                  <Button type="button" size="sm" variant="outline" className="h-7 gap-1" onClick={() => setAllowances(a => [...a, { name: "", amount: 0 }])}>
                    <Plus size={12} /> إضافة بدل
                  </Button>
                </div>
                {allowances.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">لا توجد بدلات. اضغط "إضافة بدل" لإضافة سكن، نقل، أو غيره.</p>
                ) : (
                  <div className="space-y-2">
                    {allowances.map((a, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder="اسم البدل (سكن، نقل...)"
                          value={a.name}
                          onChange={e => setAllowances(arr => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="المبلغ"
                          value={a.amount}
                          onChange={e => setAllowances(arr => arr.map((x, idx) => idx === i ? { ...x, amount: Number(e.target.value) } : x))}
                          className="w-32"
                        />
                        <Button type="button" size="icon" variant="outline" onClick={() => setAllowances(arr => arr.filter((_, idx) => idx !== i))}>
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">إجمالي الراتب الشهري</span>
                <span className="text-[16px] font-bold text-primary">{grossSalary.toLocaleString()} ر.س</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>اسم البنك</Label>
                  <Input value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} placeholder="الراجحي، الأهلي..." />
                </div>
                <div className="space-y-2">
                  <Label>رقم الآيبان (IBAN)</Label>
                  <Input value={form.iban} onChange={e => setForm(f => ({ ...f, iban: e.target.value }))} placeholder="SA..." dir="ltr" />
                </div>
              </div>
            </TabsContent>

            {/* Work */}
            <TabsContent value="work" className="space-y-3 pt-3">
              <div className="space-y-2">
                <Label>أيام العمل</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map(d => {
                    const active = workDays.includes(d.v);
                    return (
                      <button
                        type="button"
                        key={d.v}
                        onClick={() => setWorkDays(prev => active ? prev.filter(x => x !== d.v) : [...prev, d.v])}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {d.l}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>ساعات الوردية</Label>
                  <Input type="number" step="0.5" value={form.shift_hours} onChange={e => setForm(f => ({ ...f, shift_hours: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>الحالة الحالية</Label>
                  <Select value={form.status} onValueChange={v => {
                    const variant = v === "حاضر" ? "success" : v === "تأخر" ? "warning" : "danger";
                    setForm(f => ({ ...f, status: v, status_variant: variant }));
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="حاضر">حاضر</SelectItem>
                      <SelectItem value="تأخر">تأخر</SelectItem>
                      <SelectItem value="غائب">غائب</SelectItem>
                      <SelectItem value="إجازة">إجازة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>المهام</Label>
                <Input value={form.performance_tasks} onChange={e => setForm(f => ({ ...f, performance_tasks: e.target.value }))} placeholder="وصف المهام اليومية" />
              </div>
              <div className="space-y-2">
                <Label>وصف الأداء</Label>
                <Input value={form.performance_rating} onChange={e => setForm(f => ({ ...f, performance_rating: e.target.value }))} placeholder="حضور منتظم..." />
              </div>
              <div className="space-y-2">
                <Label>وصف مختصر (للبطاقة)</Label>
                <Input value={form.role_short} onChange={e => setForm(f => ({ ...f, role_short: e.target.value }))} placeholder="دوام كامل · 3,200 ر/شهر" />
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة الموظف"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormDialog;
