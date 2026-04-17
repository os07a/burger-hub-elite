import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddInvoice } from "@/hooks/useSuppliers";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  supplierId: string;
}

const InvoiceFormDialog = ({ open, onOpenChange, supplierId }: Props) => {
  const add = useAddInvoice();
  const [form, setForm] = useState({
    invoice_number: "",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    status: "مدفوعة",
    notes: "",
  });

  const handleSubmit = async () => {
    if (form.amount <= 0) { toast.error("المبلغ مطلوب"); return; }
    try {
      await add.mutateAsync({ ...form, supplier_id: supplierId });
      toast.success("تمت إضافة الفاتورة");
      onOpenChange(false);
      setForm({ invoice_number: "", amount: 0, date: new Date().toISOString().slice(0, 10), status: "مدفوعة", notes: "" });
    } catch (e: any) {
      toast.error(e.message ?? "حدث خطأ");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة فاتورة</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>رقم الفاتورة</Label>
              <Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} />
            </div>
            <div>
              <Label>التاريخ</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>المبلغ (ر.س)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>الحالة</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="مدفوعة">مدفوعة</option>
                <option value="معلقة">معلقة</option>
                <option value="ملغاة">ملغاة</option>
              </select>
            </div>
          </div>
          <div>
            <Label>الأصناف / ملاحظات</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={add.isPending}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceFormDialog;
