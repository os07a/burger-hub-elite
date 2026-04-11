import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddEmployeeDoc } from "@/hooks/useEmployees";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
}

const DocFormDialog = ({ open, onOpenChange, employeeId }: Props) => {
  const addDoc = useAddEmployeeDoc();
  const [form, setForm] = useState({
    label: "",
    doc_type: "iqama",
    doc_number: "",
    issue_date: "",
    expiry_date: "",
    status: "",
    status_variant: "success",
    details: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc.mutateAsync({
        employee_id: employeeId,
        label: form.label,
        doc_type: form.doc_type,
        doc_number: form.doc_number || null,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
        status: form.status,
        status_variant: form.status_variant,
        details: form.details || null,
      });
      toast.success("تم إضافة الوثيقة");
      onOpenChange(false);
    } catch {
      toast.error("حدث خطأ");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة وثيقة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>اسم الوثيقة</Label>
              <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="الإقامة" required />
            </div>
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select value={form.doc_type} onValueChange={v => setForm(f => ({ ...f, doc_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="iqama">إقامة</SelectItem>
                  <SelectItem value="health">شهادة صحية</SelectItem>
                  <SelectItem value="contract">عقد</SelectItem>
                  <SelectItem value="leave">إجازات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>رقم المستند</Label>
            <Input value={form.doc_number} onChange={e => setForm(f => ({ ...f, doc_number: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>تاريخ الإصدار</Label>
              <Input value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} placeholder="12 مارس 2025" />
            </div>
            <div className="space-y-2">
              <Label>تاريخ الانتهاء</Label>
              <Input value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} placeholder="12 مارس 2026" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Input value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} placeholder="باقي 11 شهر" required />
            </div>
            <div className="space-y-2">
              <Label>مستوى الحالة</Label>
              <Select value={form.status_variant} onValueChange={v => setForm(f => ({ ...f, status_variant: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">✅ سارية</SelectItem>
                  <SelectItem value="warning">⚠️ تنتهي قريباً</SelectItem>
                  <SelectItem value="danger">🚨 منتهية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>تفاصيل</Label>
            <Input value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} placeholder="ملاحظات إضافية" />
          </div>
          <Button type="submit" className="w-full" disabled={addDoc.isPending}>
            {addDoc.isPending ? "جاري الحفظ..." : "إضافة الوثيقة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocFormDialog;
