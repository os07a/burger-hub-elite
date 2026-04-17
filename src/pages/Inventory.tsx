import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useInventory, useDeleteInventory, getStockStatus, type InventoryItem } from "@/hooks/useInventory";
import { useAuth } from "@/contexts/AuthContext";
import InventoryFormDialog from "@/components/inventory/InventoryFormDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const Inventory = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const { data: items = [], isLoading } = useInventory();
  const del = useDeleteInventory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [confirmDel, setConfirmDel] = useState<InventoryItem | null>(null);

  const withStatus = items.map((i) => ({ ...i, stock: getStockStatus(Number(i.quantity), Number(i.min_quantity)) }));
  const sufficient = withStatus.filter((i) => i.stock.variant === "success").length;
  const low = withStatus.filter((i) => i.stock.variant === "warning").length;
  const critical = withStatus.filter((i) => i.stock.variant === "danger").length;
  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const lowList = withStatus.filter((i) => i.stock.variant !== "success");

  const handleAdd = () => { setEditing(null); setDialogOpen(true); };
  const handleEdit = (i: InventoryItem) => { setEditing(i); setDialogOpen(true); };
  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await del.mutateAsync(confirmDel.id);
      toast.success("تم الحذف");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setConfirmDel(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="المخزون"
        subtitle="متابعة الكميات والتنبيهات"
        badge={`${items.length} صنف`}
        actions={isAdmin ? <Button size="sm" onClick={handleAdd}><Plus size={14} className="ml-1" /> إضافة صنف</Button> : undefined}
      />

      <div className="grid grid-cols-4 gap-3 mb-4">
        <MetricCard label="📦 إجمالي الأصناف" value={items.length.toString()} sub={`${categories.length} تصنيف`} />
        <MetricCard label="✅ كافٍ" value={sufficient.toString()} sub="لا يحتاج طلب" subColor="success" />
        <MetricCard label="⚡ منخفض" value={low.toString()} sub="إعادة طلب قريباً" subColor="warning" />
        <MetricCard label="🚨 حرج" value={critical.toString()} sub="طلب فوري" subColor="danger" />
      </div>

      {isLoading && <div className="text-center text-muted-foreground py-8">جارٍ التحميل...</div>}

      {!isLoading && items.length === 0 && (
        <div className="ios-card text-center py-12">
          <div className="text-[14px] text-muted-foreground mb-3">لا توجد أصناف بعد</div>
          {isAdmin && <Button onClick={handleAdd}><Plus size={14} className="ml-1" /> أضف أول صنف</Button>}
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">📦 جرد المخزون</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["الصنف", "المورد", "الكمية", "الحد الأدنى", "التصنيف", "الحالة", ""].map((h) => (
                    <th key={h} className="text-[9px] text-gray-light font-semibold uppercase tracking-wide px-2.5 pb-2.5 text-right border-b-2 border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withStatus.map((item) => (
                  <tr key={item.id} className="hover:bg-background/50">
                    <td className="px-2.5 py-2.5 border-b border-border font-semibold text-[12px] text-foreground">{item.name}</td>
                    <td className="px-2.5 py-2.5 border-b border-border text-[11px] text-gray">{item.supplier ?? "—"}</td>
                    <td className={`px-2.5 py-2.5 border-b border-border font-bold text-[12px] ${item.stock.variant === "danger" ? "text-danger" : "text-foreground"}`}>
                      {Number(item.quantity)} {item.unit}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-border text-gray-light text-[12px]">{Number(item.min_quantity)} {item.unit}</td>
                    <td className="px-2.5 py-2.5 border-b border-border">
                      <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{item.category ?? "—"}</span>
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-border"><StatusBadge variant={item.stock.variant}>{item.stock.label}</StatusBadge></td>
                    <td className="px-2.5 py-2.5 border-b border-border">
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}>
                            <Pencil size={12} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-danger" onClick={() => setConfirmDel(item)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lowList.length > 0 && (
        <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <div className="text-[11px] font-bold text-warning mb-1">⚠️ تنبيه: {lowList.length} أصناف تحتاج إعادة طلب</div>
          <div className="text-[10px] text-gray leading-relaxed">
            {lowList.map((i) => `${i.name}${i.supplier ? ` (${i.supplier})` : ""}`).join(" · ")}
          </div>
        </div>
      )}

      <InventoryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editing} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الصنف؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف "{confirmDel?.name}" نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-danger hover:bg-danger/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
