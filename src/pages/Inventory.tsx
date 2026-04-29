import { useMemo, useState } from "react";
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
import type { StockFilter } from "@/components/inventory/InventoryFilterBar";

interface InventoryProps {
  statusFilter?: StockFilter;
  searchQuery?: string;
  categoryFilter?: string | null;
}

const Inventory = ({ statusFilter = "all", searchQuery = "", categoryFilter = null }: InventoryProps) => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const { data: items = [], isLoading } = useInventory();
  const del = useDeleteInventory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [confirmDel, setConfirmDel] = useState<InventoryItem | null>(null);

  const withStatus = useMemo(
    () => items.map((i) => ({ ...i, stock: getStockStatus(Number(i.quantity), Number(i.min_quantity)) })),
    [items],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return withStatus.filter((i) => {
      if (statusFilter !== "all" && i.stock.variant !== statusFilter) return false;
      if (categoryFilter && i.category !== categoryFilter) return false;
      if (q && !`${i.name} ${i.supplier ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [withStatus, statusFilter, categoryFilter, searchQuery]);

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
    <div>
      {isLoading && <div className="text-center text-muted-foreground py-8">جارٍ التحميل...</div>}

      {!isLoading && items.length === 0 && (
        <div className="ios-card text-center py-12">
          <div className="text-[14px] text-muted-foreground mb-3">لا توجد أصناف بعد</div>
          {isAdmin && <Button onClick={handleAdd}><Plus size={14} className="ml-1" /> أضف أول صنف</Button>}
        </div>
      )}

      {items.length > 0 && (
        <div className="ios-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-semibold text-muted-foreground">
              📦 جرد المخزون
              <span className="mr-2 text-[10px] text-gray-light">
                · يعرض {filtered.length} من {items.length}
              </span>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={handleAdd}>
                <Plus size={14} className="ml-1" /> إضافة صنف
              </Button>
            )}
          </div>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted-foreground text-[12px] py-8">
                      لا توجد أصناف مطابقة للفلتر الحالي
                    </td>
                  </tr>
                )}
                {filtered.map((item) => (
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
