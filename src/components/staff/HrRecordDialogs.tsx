import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddEmployeeRecord } from "@/hooks/useEmployees";
import { toast } from "sonner";
import { daysBetween } from "@/lib/hr";

interface BaseProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  employeeId: string;
}

// ─────────────────────────── Qualification ───────────────────────────
export const QualificationDialog = ({ open, onOpenChange, employeeId }: BaseProps) => {
  const add = useAddEmployeeRecord("employee_qualifications");
  const [form, setForm] = useState({ qualification_type: "certificate", title: "", institution: "", year: "", notes: "" });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader><DialogTitle>إضافة مؤهل / شهادة / خبرة</DialogTitle></DialogHeader>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            await add.mutateAsync({
              employee_id: employeeId,
              qualification_type: form.qualification_type,
              title: form.title,
              institution: form.institution || null,
              year: form.year ? parseInt(form.year) : null,
              notes: form.notes || null,
            } as any);
            toast.success("تم الحفظ");
            onOpenChange(false);
          } catch { toast.error("فشل الحفظ"); }
        }} className="space-y-3">
          <div className="space-y-2">
            <Label>النوع</Label>
            <Select value={form.qualification_type} onValueChange={v => setForm(f => ({ ...f, qualification_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="degree">شهادة جامعية</SelectItem>
                <SelectItem value="certificate">شهادة مهنية</SelectItem>
                <SelectItem value="course">دورة تدريبية</SelectItem>
                <SelectItem value="experience">خبرة سابقة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>العنوان</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>الجهة</Label>
              <Input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} /></div>
            <div className="space-y-2"><Label>السنة</Label>
              <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} /></div>
          </div>
          <div className="space-y-2"><Label>ملاحظات</Label>
            <Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <Button type="submit" className="w-full" disabled={add.isPending}>حفظ</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────── Leave ───────────────────────────
export const LeaveDialog = ({ open, onOpenChange, employeeId }: BaseProps) => {
  const add = useAddEmployeeRecord("employee_leaves");
  const [form, setForm] = useState({ leave_type: "annual", start_date: "", end_date: "", status: "approved", notes: "" });
  const days = form.start_date && form.end_date ? Math.max(1, daysBetween(form.start_date, form.end_date) + 1) : 1;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader><DialogTitle>تسجيل إجازة</DialogTitle></DialogHeader>
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!form.start_date || !form.end_date) return toast.error("التواريخ مطلوبة");
          try {
            await add.mutateAsync({
              employee_id: employeeId,
              leave_type: form.leave_type,
              start_date: form.start_date,
              end_date: form.end_date,
              days_count: days,
              status: form.status,
              notes: form.notes || null,
            } as any);
            toast.success("تم تسجيل الإجازة");
            onOpenChange(false);
          } catch { toast.error("فشل الحفظ"); }
        }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>النوع</Label>
              <Select value={form.leave_type} onValueChange={v => setForm(f => ({ ...f, leave_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">سنوية</SelectItem>
                  <SelectItem value="sick">مرضية</SelectItem>
                  <SelectItem value="emergency">طارئة</SelectItem>
                  <SelectItem value="unpaid">بدون راتب</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">معلقة</SelectItem>
                  <SelectItem value="approved">معتمدة</SelectItem>
                  <SelectItem value="rejected">مرفوضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>من</Label>
              <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>إلى</Label>
              <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required /></div>
          </div>
          <div className="text-[12px] text-muted-foreground">عدد الأيام: <span className="font-bold text-foreground">{days}</span></div>
          <div className="space-y-2"><Label>ملاحظات</Label>
            <Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <Button type="submit" className="w-full" disabled={add.isPending}>حفظ</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────── Penalty ───────────────────────────
export const PenaltyDialog = ({ open, onOpenChange, employeeId }: BaseProps) => {
  const add = useAddEmployeeRecord("employee_penalties");
  const [form, setForm] = useState({ reason: "", amount: "0", severity: "warning", penalty_date: new Date().toISOString().slice(0, 10), notes: "" });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader><DialogTitle>تسجيل جزاء</DialogTitle></DialogHeader>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            await add.mutateAsync({
              employee_id: employeeId,
              reason: form.reason,
              amount: parseFloat(form.amount) || 0,
              severity: form.severity,
              penalty_date: form.penalty_date,
              notes: form.notes || null,
            } as any);
            toast.success("تم تسجيل الجزاء");
            onOpenChange(false);
          } catch { toast.error("فشل الحفظ"); }
        }} className="space-y-3">
          <div className="space-y-2"><Label>السبب</Label>
            <Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label>المبلغ</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
            <div className="space-y-2"><Label>الشدة</Label>
              <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">تنبيه</SelectItem>
                  <SelectItem value="deduction">خصم</SelectItem>
                  <SelectItem value="final_warning">إنذار نهائي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>التاريخ</Label>
              <Input type="date" value={form.penalty_date} onChange={e => setForm(f => ({ ...f, penalty_date: e.target.value }))} /></div>
          </div>
          <div className="space-y-2"><Label>ملاحظات</Label>
            <Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <Button type="submit" className="w-full" disabled={add.isPending}>حفظ</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────── Reward ───────────────────────────
export const RewardDialog = ({ open, onOpenChange, employeeId }: BaseProps) => {
  const add = useAddEmployeeRecord("employee_rewards");
  const [form, setForm] = useState({ reason: "", amount: "0", reward_type: "cash", reward_date: new Date().toISOString().slice(0, 10), notes: "" });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader><DialogTitle>تسجيل مكافأة</DialogTitle></DialogHeader>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            await add.mutateAsync({
              employee_id: employeeId,
              reason: form.reason,
              amount: parseFloat(form.amount) || 0,
              reward_type: form.reward_type,
              reward_date: form.reward_date,
              notes: form.notes || null,
            } as any);
            toast.success("تم تسجيل المكافأة");
            onOpenChange(false);
          } catch { toast.error("فشل الحفظ"); }
        }} className="space-y-3">
          <div className="space-y-2"><Label>السبب</Label>
            <Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label>المبلغ</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
            <div className="space-y-2"><Label>النوع</Label>
              <Select value={form.reward_type} onValueChange={v => setForm(f => ({ ...f, reward_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="recognition">معنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>التاريخ</Label>
              <Input type="date" value={form.reward_date} onChange={e => setForm(f => ({ ...f, reward_date: e.target.value }))} /></div>
          </div>
          <div className="space-y-2"><Label>ملاحظات</Label>
            <Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <Button type="submit" className="w-full" disabled={add.isPending}>حفظ</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────── Evaluation ───────────────────────────
export const EvaluationDialog = ({ open, onOpenChange, employeeId }: BaseProps) => {
  const add = useAddEmployeeRecord("employee_evaluations");
  const [form, setForm] = useState({
    evaluation_date: new Date().toISOString().slice(0, 10),
    period: "monthly", score: "4", strengths: "", weaknesses: "", goals: "", evaluator: "",
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>تقييم الأداء</DialogTitle></DialogHeader>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            await add.mutateAsync({
              employee_id: employeeId,
              evaluation_date: form.evaluation_date,
              period: form.period,
              score: parseInt(form.score),
              strengths: form.strengths || null,
              weaknesses: form.weaknesses || null,
              goals: form.goals || null,
              evaluator: form.evaluator || null,
            } as any);
            toast.success("تم حفظ التقييم");
            onOpenChange(false);
          } catch { toast.error("فشل الحفظ"); }
        }} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label>التاريخ</Label>
              <Input type="date" value={form.evaluation_date} onChange={e => setForm(f => ({ ...f, evaluation_date: e.target.value }))} /></div>
            <div className="space-y-2"><Label>الفترة</Label>
              <Select value={form.period} onValueChange={v => setForm(f => ({ ...f, period: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="quarterly">ربع سنوي</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>التقييم (1-5)</Label>
              <Select value={form.score} onValueChange={v => setForm(f => ({ ...f, score: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{"⭐".repeat(n)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>المُقيِّم</Label>
            <Input value={form.evaluator} onChange={e => setForm(f => ({ ...f, evaluator: e.target.value }))} /></div>
          <div className="space-y-2"><Label>نقاط القوة</Label>
            <Textarea rows={2} value={form.strengths} onChange={e => setForm(f => ({ ...f, strengths: e.target.value }))} /></div>
          <div className="space-y-2"><Label>نقاط الضعف</Label>
            <Textarea rows={2} value={form.weaknesses} onChange={e => setForm(f => ({ ...f, weaknesses: e.target.value }))} /></div>
          <div className="space-y-2"><Label>الأهداف</Label>
            <Textarea rows={2} value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))} /></div>
          <Button type="submit" className="w-full" disabled={add.isPending}>حفظ</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
