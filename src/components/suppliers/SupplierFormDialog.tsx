import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddSupplier, useUpdateSupplier, type Supplier } from "@/hooks/useSuppliers";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  supplier?: Supplier | null;
}

const SupplierFormDialog = ({ open, onOpenChange, supplier }: Props) => {
  const add = useAddSupplier();
  const update = useUpdateSupplier();
  const [form, setForm] = useState({
    name: "", category: "", contact_name: "", phone: "", email: "", payment_terms: "", notes: "",
  });

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name,
        category: supplier.category ?? "",
        contact_name: supplier.contact_name ?? "",
        phone: supplier.phone ?? "",
        email: supplier.email ?? "",
        payment_terms: supplier.payment_terms ?? "",
        notes: supplier.notes ?? "",
      });
    } else {
      setForm({ name: "", category: "", contact_name: "", phone: "", email: "", payment_terms: "", notes: "" });
    }
  }, [supplier, open]);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("الاسم مطلوب"); return; }
    try {
      if (supplier) {
        await update.mutateAsync({ id: supplier.id, ...form });
        toast.success("تم تحديث المورد");
      } else {
        await add.mutateAsync(form);
        toast.success("تمت إضافة المورد");
      }
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message ?? "حدث خطأ");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{supplier ? "تعديل مورد" : "إضافة مورد"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>الاسم</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>التصنيف</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="لحوم / مشروبات..." />
            </div>
            <div>
              <Label>اسم المسؤول</Label>
              <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>الجوال</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>البريد</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>شروط الدفع</Label>
            <Input value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} placeholder="نقدي / 30 يوم..." />
          </div>
          <div>
            <Label>ملاحظات</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={add.isPending || update.isPending}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierFormDialog;
