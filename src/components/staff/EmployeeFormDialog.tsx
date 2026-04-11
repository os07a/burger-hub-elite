import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddEmployee, useUpdateEmployee, type Employee } from "@/hooks/useEmployees";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

const EmployeeFormDialog = ({ open, onOpenChange, employee }: Props) => {
  const isEdit = !!employee;
  const addMutation = useAddEmployee();
  const updateMutation = useUpdateEmployee();

  const [form, setForm] = useState({
    name: employee?.name ?? "",
    role: employee?.role ?? "",
    role_short: employee?.role_short ?? "",
    salary: employee?.salary?.toString() ?? "",
    status: employee?.status ?? "حاضر",
    status_variant: employee?.status_variant ?? "success",
    performance_tasks: employee?.performance_tasks ?? "",
    performance_rating: employee?.performance_rating ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        role: form.role,
        role_short: form.role_short || null,
        salary: parseFloat(form.salary) || 0,
        status: form.status,
        status_variant: form.status_variant,
        performance_tasks: form.performance_tasks || null,
        performance_rating: form.performance_rating || null,
      };

      if (isEdit && employee) {
        await updateMutation.mutateAsync({ id: employee.id, ...payload });
        toast.success("تم تحديث بيانات الموظف");
      } else {
        await addMutation.mutateAsync(payload);
        toast.success("تم إضافة الموظف بنجاح");
      }
      onOpenChange(false);
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const loading = addMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل موظف" : "إضافة موظف جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>الاسم</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>الوظيفة</Label>
            <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>الراتب (ر.س)</Label>
              <Input type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>نوع الدوام</Label>
              <Input value={form.role_short} onChange={e => setForm(f => ({ ...f, role_short: e.target.value }))} placeholder="دوام كامل · 3,200 ر/شهر" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => {
                const variant = v === "حاضر" ? "success" : v === "تأخر" ? "warning" : "danger";
                setForm(f => ({ ...f, status: v, status_variant: variant }));
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="حاضر">حاضر</SelectItem>
                  <SelectItem value="تأخر">تأخر</SelectItem>
                  <SelectItem value="غائب">غائب</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>المهام</Label>
            <Input value={form.performance_tasks} onChange={e => setForm(f => ({ ...f, performance_tasks: e.target.value }))} placeholder="وصف المهام" />
          </div>
          <div className="space-y-2">
            <Label>تقييم الأداء</Label>
            <Input value={form.performance_rating} onChange={e => setForm(f => ({ ...f, performance_rating: e.target.value }))} placeholder="حضور منتظم · أقل تأخير" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormDialog;
