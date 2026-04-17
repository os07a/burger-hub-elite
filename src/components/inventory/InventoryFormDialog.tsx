import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAddInventory, useUpdateInventory, type InventoryItem } from "@/hooks/useInventory";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item?: InventoryItem | null;
}

const InventoryFormDialog = ({ open, onOpenChange, item }: Props) => {
  const add = useAddInventory();
  const update = useUpdateInventory();
  const [form, setForm] = useState({
    name: "", category: "", supplier: "", unit: "كجم", quantity: 0, min_quantity: 0, cost_per_unit: 0,
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        category: item.category ?? "",
        supplier: item.supplier ?? "",
        unit: item.unit,
        quantity: Number(item.quantity),
        min_quantity: Number(item.min_quantity),
        cost_per_unit: Number(item.cost_per_unit),
      });
    } else {
      setForm({ name: "", category: "", supplier: "", unit: "كجم", quantity: 0, min_quantity: 0, cost_per_unit: 0 });
    }
  }, [item, open]);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("الاسم مطلوب"); return; }
    try {
      if (item) {
        await update.mutateAsync({ id: item.id, ...form });
        toast.success("تم تحديث الصنف");
      } else {
        await add.mutateAsync(form);
        toast.success("تمت إضافة الصنف");
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
          <DialogTitle>{item ? "تعديل صنف" : "إضافة صنف"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>اسم الصنف</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>التصنيف</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="لحوم / خبز / صوصات..." />
            </div>
            <div>
              <Label>المورد</Label>
              <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>الوحدة</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="كجم / كرتون / حبة" />
            </div>
            <div>
              <Label>الكمية</Label>
              <Input type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>الحد الأدنى</Label>
              <Input type="number" step="0.01" value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <Label>التكلفة لكل وحدة (ر.س)</Label>
            <Input type="number" step="0.01" value={form.cost_per_unit} onChange={(e) => setForm({ ...form, cost_per_unit: parseFloat(e.target.value) || 0 })} />
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

export default InventoryFormDialog;
