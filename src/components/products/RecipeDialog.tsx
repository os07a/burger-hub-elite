import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, AlertTriangle, Pencil, X, Check, RefreshCw } from "lucide-react";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { toast } from "sonner";
import { useInventory } from "@/hooks/useInventory";
import { useUpdateProduct, type Product } from "@/hooks/useProducts";
import {
  useProductRecipes,
  useRecipeHistory,
  useAddRecipeIngredient,
  useUpdateRecipeIngredient,
  useDeleteRecipeIngredient,
  type RecipeIngredient,
} from "@/hooks/useRecipes";
import { useProductCosting, unitFactor } from "@/hooks/useProductCosting";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product | null;
}

const UNITS = ["جرام", "كجم", "مل", "لتر", "قطعة"];

const formatDate = (s: string | null) => (s ? new Date(s).toLocaleDateString("ar-SA") : "—");

const RecipeDialog = ({ open, onOpenChange, product }: Props) => {
  const { data: inventory = [] } = useInventory();
  const { data: recipes = [], isLoading } = useProductRecipes(product?.id);
  const { data: history = [] } = useRecipeHistory(product?.id);
  const costing = useProductCosting(product?.id);
  const addIng = useAddRecipeIngredient();
  const updateIng = useUpdateRecipeIngredient();
  const deleteIng = useDeleteRecipeIngredient();
  const updateProduct = useUpdateProduct();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ quantity_per_unit: 0, unit: "جرام", waste_percentage: 0, notes: "" });

  const [newForm, setNewForm] = useState({
    inventory_item_id: "",
    quantity_per_unit: 0,
    unit: "جرام",
    waste_percentage: 0,
    notes: "",
  });

  if (!product) return null;

  const usedIds = new Set(recipes.map((r) => r.inventory_item_id));
  const missingLoyverseId = !product.loyverse_item_id || product.loyverse_item_id.trim().length === 0;

  const handleAdd = async () => {
    if (!newForm.inventory_item_id) {
      toast.error("اختر المكوّن أولاً");
      return;
    }
    if (usedIds.has(newForm.inventory_item_id)) {
      toast.error("هذا المكوّن مضاف بالفعل في الوصفة الحالية، تقدر تعدّله من الجدول");
      return;
    }
    if (newForm.quantity_per_unit <= 0) {
      toast.error("أدخل كمية أكبر من صفر");
      return;
    }
    try {
      await addIng.mutateAsync({
        product_id: product.id,
        inventory_item_id: newForm.inventory_item_id,
        quantity_per_unit: newForm.quantity_per_unit,
        unit: newForm.unit,
        waste_percentage: newForm.waste_percentage,
        notes: newForm.notes || null,
      });
      toast.success("تم إضافة المكوّن");
      setNewForm({ inventory_item_id: "", quantity_per_unit: 0, unit: "جرام", waste_percentage: 0, notes: "" });
    } catch (e: any) {
      toast.error(e.message ?? "فشل الإضافة");
    }
  };

  const startEdit = (r: RecipeIngredient) => {
    setEditingId(r.id);
    setEditForm({
      quantity_per_unit: Number(r.quantity_per_unit),
      unit: r.unit,
      waste_percentage: Number(r.waste_percentage),
      notes: r.notes ?? "",
    });
  };

  const saveEdit = async (r: RecipeIngredient) => {
    if (editForm.quantity_per_unit <= 0) {
      toast.error("الكمية لازم تكون أكبر من صفر");
      return;
    }
    try {
      await updateIng.mutateAsync({
        old_id: r.id,
        product_id: product.id,
        inventory_item_id: r.inventory_item_id,
        quantity_per_unit: editForm.quantity_per_unit,
        unit: editForm.unit,
        waste_percentage: editForm.waste_percentage,
        notes: editForm.notes || null,
      });
      toast.success("تم تحديث المكوّن (نسخة جديدة)");
      setEditingId(null);
    } catch (e: any) {
      toast.error(e.message ?? "فشل التحديث");
    }
  };

  const handleDelete = async (r: RecipeIngredient) => {
    if (!confirm("تأكيد إزالة هذا المكوّن من الوصفة الحالية؟ (سيُحفظ في السجل)")) return;
    try {
      await deleteIng.mutateAsync({ id: r.id, product_id: product.id });
      toast.success("تم إزالة المكوّن");
    } catch (e: any) {
      toast.error(e.message ?? "فشل الحذف");
    }
  };

  const handleApplyCost = async () => {
    try {
      await updateProduct.mutateAsync({ id: product.id, cost: Number(costing.computedCost.toFixed(2)) });
      toast.success("تم تحديث تكلفة المنتج");
    } catch (e: any) {
      toast.error(e.message ?? "فشل التحديث");
    }
  };

  const ingredientCost = (r: RecipeIngredient) => {
    const inv = r.inventory_items;
    if (!inv) return 0;
    const f = unitFactor(r.unit, inv.unit);
    return Number(r.quantity_per_unit) * f * (1 + Number(r.waste_percentage) / 100) * Number(inv.cost_per_unit);
  };

  const marginColor = costing.margin >= 55 ? "text-success" : costing.margin >= 35 ? "text-warning" : "text-danger";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🧾 وصفة المنتج — {product.name}</DialogTitle>
        </DialogHeader>

        {missingLoyverseId && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/30 text-warning-foreground">
            <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-warning">⚠️ تنبيه: لا يوجد معرّف Loyverse لهذا المنتج</div>
              <div className="text-warning/90 mt-0.5">
                الخصم التلقائي من المخزون لن يعمل لهذا المنتج حتى يُضاف <span className="font-mono">loyverse_item_id</span> من نافذة تعديل المنتج.
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="active" className="mt-2">
          <TabsList>
            <TabsTrigger value="active">الوصفة النشطة</TabsTrigger>
            <TabsTrigger value="history">السجل ({history.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {/* Active ingredients table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-right">
                    <th className="px-3 py-2 font-medium">المكوّن</th>
                    <th className="px-3 py-2 font-medium">الكمية</th>
                    <th className="px-3 py-2 font-medium">الوحدة</th>
                    <th className="px-3 py-2 font-medium">الهدر %</th>
                    <th className="px-3 py-2 font-medium">التكلفة</th>
                    <th className="px-3 py-2 font-medium w-24">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">جارٍ التحميل...</td></tr>
                  )}
                  {!isLoading && recipes.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">لا توجد مكوّنات بعد. أضف أول مكوّن من الأسفل.</td></tr>
                  )}
                  {recipes.map((r) => {
                    const isEditing = editingId === r.id;
                    return (
                      <tr key={r.id} className="border-t border-border">
                        <td className="px-3 py-2">{r.inventory_items?.name ?? "—"}</td>
                        <td className="px-3 py-2">
                          {isEditing ? (
                            <Input type="number" step="0.001" value={editForm.quantity_per_unit}
                              onChange={(e) => setEditForm({ ...editForm, quantity_per_unit: parseFloat(e.target.value) || 0 })}
                              className="h-8 w-24" />
                          ) : Number(r.quantity_per_unit)}
                        </td>
                        <td className="px-3 py-2">
                          {isEditing ? (
                            <Select value={editForm.unit} onValueChange={(v) => setEditForm({ ...editForm, unit: v })}>
                              <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                              <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                          ) : r.unit}
                        </td>
                        <td className="px-3 py-2">
                          {isEditing ? (
                            <Input type="number" step="0.1" value={editForm.waste_percentage}
                              onChange={(e) => setEditForm({ ...editForm, waste_percentage: parseFloat(e.target.value) || 0 })}
                              className="h-8 w-20" />
                          ) : `${Number(r.waste_percentage)}%`}
                        </td>
                        <td className="px-3 py-2 inline-flex items-center gap-1">
                          {ingredientCost(r).toFixed(2)} <RiyalIcon size={11} />
                        </td>
                        <td className="px-3 py-2">
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(r)} disabled={updateIng.isPending}>
                                <Check size={14} className="text-success" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                                <X size={14} />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(r)}>
                                <Pencil size={14} />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(r)} disabled={deleteIng.isPending}>
                                <Trash2 size={14} className="text-danger" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add new ingredient */}
            <div className="rounded-xl border border-dashed border-border p-3 space-y-3 bg-muted/20">
              <div className="text-sm font-semibold">➕ إضافة مكوّن جديد</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="col-span-2">
                  <Label className="text-xs">المكوّن</Label>
                  <Select value={newForm.inventory_item_id} onValueChange={(v) => setNewForm({ ...newForm, inventory_item_id: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر من المخزون" /></SelectTrigger>
                    <SelectContent>
                      {inventory.map((it) => (
                        <SelectItem key={it.id} value={it.id} disabled={usedIds.has(it.id)}>
                          {it.name} {usedIds.has(it.id) ? "(مضاف)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">الكمية للوحدة</Label>
                  <Input type="number" step="0.001" value={newForm.quantity_per_unit}
                    onChange={(e) => setNewForm({ ...newForm, quantity_per_unit: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label className="text-xs">الوحدة</Label>
                  <Select value={newForm.unit} onValueChange={(v) => setNewForm({ ...newForm, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">الهدر %</Label>
                  <Input type="number" step="0.1" value={newForm.waste_percentage}
                    onChange={(e) => setNewForm({ ...newForm, waste_percentage: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-2 md:col-span-3">
                  <Label className="text-xs">ملاحظة (اختياري)</Label>
                  <Input value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleAdd} disabled={addIng.isPending} size="sm">
                <Plus size={14} className="ml-1" /> إضافة المكوّن
              </Button>
            </div>

            {/* Cost summary */}
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">التكلفة المحسوبة</div>
                  <div className="font-semibold inline-flex items-center gap-1">{costing.computedCost.toFixed(2)} <RiyalIcon size={12} /></div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">سعر البيع</div>
                  <div className="font-semibold inline-flex items-center gap-1">{Number(product.price).toFixed(2)} <RiyalIcon size={12} /></div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">الربح</div>
                  <div className={`font-semibold inline-flex items-center gap-1 ${marginColor}`}>{costing.marginValue.toFixed(2)} <RiyalIcon size={12} /></div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">الهامش</div>
                  <div className={`font-semibold ${marginColor}`}>{costing.margin.toFixed(1)}%</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleApplyCost}
                  disabled={updateProduct.isPending || costing.computedCost <= 0}>
                  <RefreshCw size={14} className="ml-1" /> تحديث تكلفة المنتج إلى {costing.computedCost.toFixed(2)}
                </Button>
                {costing.missingIngredients.length > 0 && (
                  <span className="text-xs text-danger">
                    ⚠️ {costing.missingIngredients.length} مكوّن مخزونه لا يكفي لوحدة واحدة
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {history.length === 0 ? (
              <div className="px-3 py-6 text-center text-muted-foreground text-sm">لا توجد إصدارات سابقة.</div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-right">
                      <th className="px-3 py-2 font-medium">المكوّن</th>
                      <th className="px-3 py-2 font-medium">الكمية</th>
                      <th className="px-3 py-2 font-medium">الهدر %</th>
                      <th className="px-3 py-2 font-medium">من</th>
                      <th className="px-3 py-2 font-medium">إلى</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="px-3 py-2">{r.inventory_items?.name ?? "—"}</td>
                        <td className="px-3 py-2">{Number(r.quantity_per_unit)} {r.unit}</td>
                        <td className="px-3 py-2">{Number(r.waste_percentage)}%</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{formatDate(r.valid_from)}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{formatDate(r.valid_to)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDialog;
