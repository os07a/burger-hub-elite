import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useProducts, useDeleteProduct, type Product } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import ProductFormDialog from "@/components/products/ProductFormDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const getMarginColor = (m: number) => (m >= 55 ? "text-success" : m >= 35 ? "text-warning" : "text-danger");

const Products = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const { data: products = [], isLoading } = useProducts();
  const del = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDel, setConfirmDel] = useState<Product | null>(null);

  const totalRevenue = products.reduce((s, p) => s + Number(p.price), 0);
  const avgMargin = products.length
    ? products.reduce((s, p) => {
        const m = Number(p.price) > 0 ? ((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100 : 0;
        return s + m;
      }, 0) / products.length
    : 0;
  const bestMargin = products.reduce<{ name: string; margin: number }>((best, p) => {
    const m = Number(p.price) > 0 ? ((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100 : 0;
    return m > best.margin ? { name: p.name, margin: m } : best;
  }, { name: "—", margin: 0 });

  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    const k = p.category || "بدون تصنيف";
    (acc[k] ||= []).push(p);
    return acc;
  }, {});

  const handleAdd = () => { setEditing(null); setDialogOpen(true); };
  const handleEdit = (p: Product) => { setEditing(p); setDialogOpen(true); };
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
        title="المنتجات"
        subtitle="إدارة قائمة المنتجات والأسعار والتكاليف"
        badge={`${products.length} منتج`}
        actions={isAdmin ? <Button size="sm" onClick={handleAdd}><Plus size={14} className="ml-1" /> إضافة منتج</Button> : undefined}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="📦 إجمالي المنتجات" value={products.length.toString()} sub={`${Object.keys(grouped).length} تصنيف`} />
        <MetricCard label="💰 مجموع الأسعار" value={totalRevenue.toFixed(0)} sub="مرجعي" showRiyal />
        <MetricCard label="📊 متوسط الهامش" value={`${avgMargin.toFixed(1)}%`} sub="هامش خام" subColor={avgMargin >= 50 ? "success" : "warning"} />
        <MetricCard label="🏆 أعلى هامش" value={bestMargin.name} sub={`↑ ${bestMargin.margin.toFixed(1)}%`} subColor="success" />
      </div>

      {isLoading && <div className="text-center text-muted-foreground py-8">جارٍ التحميل...</div>}

      {!isLoading && products.length === 0 && (
        <div className="ios-card text-center py-12">
          <div className="text-[14px] text-muted-foreground mb-3">لا توجد منتجات بعد</div>
          {isAdmin && <Button onClick={handleAdd}><Plus size={14} className="ml-1" /> أضف أول منتج</Button>}
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="ios-card">
            <div className="text-[11px] font-medium text-muted-foreground mb-3">{cat} · {items.length} صنف</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((p) => {
                const price = Number(p.price);
                const cost = Number(p.cost);
                const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
                return (
                  <div key={p.id} className="rounded-2xl border border-border bg-background p-4 hover:shadow-md transition-all">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} loading="lazy" className="w-full h-32 object-cover rounded-xl mb-3" />
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-[14px] font-bold text-foreground">{p.name}</div>
                      <div className="text-[16px] font-bold text-primary flex items-center gap-1">{price} <RiyalIcon size={11} /></div>
                    </div>
                    {p.description && <div className="text-[10px] text-muted-foreground leading-relaxed mb-3">{p.description}</div>}
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-muted/50 rounded-xl py-2">
                        <div className="text-[10px] text-muted-foreground mb-0.5">التكلفة</div>
                        <div className="text-[13px] font-bold text-foreground">{cost.toFixed(2)}</div>
                      </div>
                      <div className="bg-muted/50 rounded-xl py-2">
                        <div className="text-[10px] text-muted-foreground mb-0.5">الربح</div>
                        <div className="text-[13px] font-bold text-foreground">{(price - cost).toFixed(2)}</div>
                      </div>
                      <div className="bg-muted/50 rounded-xl py-2">
                        <div className="text-[10px] text-muted-foreground mb-0.5">هامش</div>
                        <div className={`text-[13px] font-bold ${getMarginColor(margin)}`}>{margin.toFixed(1)}%</div>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(p)}>
                          <Pencil size={12} className="ml-1" /> تعديل
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setConfirmDel(p)} className="text-danger">
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editing} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنتج؟</AlertDialogTitle>
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

export default Products;
