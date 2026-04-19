import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, TrendingUp, Crown, Menu as MenuIcon, BarChart3, Calculator, Package, Beef, GlassWater } from "lucide-react";
import { useProducts, useDeleteProduct, type Product } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import ProductFormDialog from "@/components/products/ProductFormDialog";
import ProductMovementTab from "@/components/products/ProductMovementTab";
import ProductCalculatorTab from "@/components/products/ProductCalculatorTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const getMarginColor = (m: number) => (m >= 55 ? "text-success" : m >= 35 ? "text-warning" : "text-danger");

const getRating = (m: number) => {
  if (m >= 65) return { label: "ممتاز", icon: "🏆", cls: "bg-success/15 text-success border-success/30" };
  if (m >= 50) return { label: "جيد", icon: "✅", cls: "bg-primary/10 text-primary border-primary/30" };
  if (m >= 35) return { label: "مقبول", icon: "⚠️", cls: "bg-warning/15 text-warning border-warning/30" };
  return { label: "مراجعة", icon: "🔴", cls: "bg-danger/10 text-danger border-danger/30" };
};

const categoryEmoji = (c: string) =>
  c.includes("لحم") ? "🥩" : c.includes("دجاج") ? "🍗" : c.includes("سمك") ? "🐟" : c.includes("برجر") ? "🍔" : c.includes("إضاف") ? "🍟" : c.includes("مشروب") ? "🥤" : c.includes("صوص") ? "🥫" : "🍽️";

const CATEGORY_ORDER = ["برجر لحم", "برجر دجاج", "برجر سمك", "إضافات", "مشروبات", "صوصات"];
const categoryRank = (c: string) => {
  const i = CATEGORY_ORDER.indexOf(c);
  return i === -1 ? 999 : i;
};

type TypeFilter = "all" | "primary" | "ready_made";

const Products = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const { data: products = [], isLoading } = useProducts();
  const del = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDel, setConfirmDel] = useState<Product | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filtered = products.filter((p) => {
    if (typeFilter === "all") return true;
    return ((p as any).product_type ?? "primary") === typeFilter;
  });

  const avgMargin = products.length
    ? products.reduce((s, p) => {
        const m = Number(p.price) > 0 ? ((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100 : 0;
        return s + m;
      }, 0) / products.length
    : 0;
  const bestMargin = products.reduce<{ id: string; name: string; margin: number }>((best, p) => {
    const m = Number(p.price) > 0 ? ((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100 : 0;
    return m > best.margin ? { id: p.id, name: p.name, margin: m } : best;
  }, { id: "", name: "—", margin: 0 });

  const primaryCount = products.filter((p) => ((p as any).product_type ?? "primary") === "primary").length;
  const readyCount = products.length - primaryCount;
  const topProductId = bestMargin.id;

  const grouped = filtered.reduce<Record<string, Product[]>>((acc, p) => {
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
        <MetricCard label="إجمالي المنتجات" value={products.length.toString()} sub={`${Object.keys(grouped).length} تصنيف`} />
        <MetricCard label="منتجات أساسية" value={primaryCount.toString()} sub="مُصنّعة في المطعم" />
        <MetricCard label="منتجات جاهزة" value={readyCount.toString()} sub="تُباع كما هي" />
        <MetricCard label="متوسط الهامش" value={`${avgMargin.toFixed(1)}%`} sub="هامش خام" subColor={avgMargin >= 50 ? "success" : "warning"} />
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-4">
          <TabsTrigger value="list" className="text-[12px] gap-1.5"><MenuIcon size={13} /> القائمة</TabsTrigger>
          <TabsTrigger value="movement" className="text-[12px] gap-1.5"><BarChart3 size={13} /> الحركة</TabsTrigger>
          <TabsTrigger value="calculator" className="text-[12px] gap-1.5"><Calculator size={13} /> الحاسبة</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Type filter */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={typeFilter === "all" ? "default" : "outline"}
              onClick={() => setTypeFilter("all")}
              className="h-7 text-[11px] gap-1"
            >
              <Package size={12} /> الكل ({products.length})
            </Button>
            <Button
              size="sm"
              variant={typeFilter === "primary" ? "default" : "outline"}
              onClick={() => setTypeFilter("primary")}
              className="h-7 text-[11px] gap-1"
            >
              <Beef size={12} /> أساسي ({primaryCount})
            </Button>
            <Button
              size="sm"
              variant={typeFilter === "ready_made" ? "default" : "outline"}
              onClick={() => setTypeFilter("ready_made")}
              className="h-7 text-[11px] gap-1"
            >
              <GlassWater size={12} /> جاهز ({readyCount})
            </Button>
          </div>

          {isLoading && <div className="text-center text-muted-foreground py-8">جارٍ التحميل...</div>}

          {!isLoading && filtered.length === 0 && (
            <div className="ios-card text-center py-12">
              <div className="text-[14px] text-muted-foreground mb-3">لا توجد منتجات في هذا التصنيف</div>
              {isAdmin && <Button onClick={handleAdd}><Plus size={14} className="ml-1" /> أضف منتج</Button>}
            </div>
          )}

          <div className="space-y-4">
            {Object.entries(grouped).map(([cat, items]) => {
              const catAvg = items.reduce((s, p) => {
                const m = Number(p.price) > 0 ? ((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100 : 0;
                return s + m;
              }, 0) / items.length;

              return (
                <div key={cat} className="ios-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px]">{categoryEmoji(cat)}</span>
                      <span className="text-[12px] font-bold text-foreground">{cat}</span>
                      <span className="text-[10px] text-muted-foreground">· {items.length} صنف</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <TrendingUp size={11} className={getMarginColor(catAvg)} />
                      <span>متوسط هامش <span className={`font-bold ${getMarginColor(catAvg)}`}>{catAvg.toFixed(0)}%</span></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((p) => {
                      const price = Number(p.price);
                      const cost = Number(p.cost);
                      const profit = price - cost;
                      const margin = price > 0 ? (profit / price) * 100 : 0;
                      const rating = getRating(margin);
                      const isTop = p.id === topProductId && margin > 0;
                      const ptype = ((p as any).product_type ?? "primary") as "primary" | "ready_made";

                      return (
                        <div
                          key={p.id}
                          className={`group relative rounded-2xl border bg-background p-3 hover:shadow-lg transition-all flex gap-3 ${
                            isTop
                              ? "border-warning/50 shadow-warning/10 shadow-md bg-gradient-to-br from-warning/5 to-transparent"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          {isTop && (
                            <div className="absolute -top-3 right-3 z-10 flex items-center gap-1 bg-gradient-to-r from-warning to-warning/80 text-white text-[10px] font-bold pl-2.5 pr-2 py-1 rounded-full shadow-lg shadow-warning/30 ring-2 ring-background">
                              <Crown size={11} className="fill-white" />
                              <span>الأعلى ربحاً</span>
                            </div>
                          )}

                          {isAdmin && (
                            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button
                                onClick={() => handleEdit(p)}
                                className="w-6 h-6 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition"
                                aria-label="تعديل"
                              >
                                <Pencil size={11} />
                              </button>
                              <button
                                onClick={() => setConfirmDel(p)}
                                className="w-6 h-6 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center text-danger hover:bg-danger hover:text-white hover:border-danger transition"
                                aria-label="حذف"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          )}

                          <div className="shrink-0">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} loading="lazy" className="w-16 h-16 object-cover rounded-xl border border-border" />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-muted/40 border border-border flex items-center justify-center text-[24px]">
                                {categoryEmoji(cat)}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-[13px] font-bold text-foreground truncate leading-tight">{p.name}</div>
                                <div className="text-[15px] font-bold text-primary flex items-center gap-0.5 shrink-0">
                                  {price}<RiyalIcon size={10} />
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border text-[9px] font-semibold ${
                                  ptype === "primary"
                                    ? "bg-primary/10 text-primary border-primary/30"
                                    : "bg-muted text-muted-foreground border-border"
                                }`}>
                                  {ptype === "primary" ? <Beef size={9} /> : <GlassWater size={9} />}
                                  {ptype === "primary" ? "أساسي" : "جاهز"}
                                </span>
                                <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-semibold ${rating.cls}`}>
                                  <span>{rating.icon}</span>
                                  <span>{rating.label}</span>
                                </div>
                                <div className={`text-[10px] font-bold ${getMarginColor(margin)}`}>{margin.toFixed(0)}%</div>
                              </div>
                            </div>

                            <div className="mt-2">
                              <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden flex">
                                <div className="bg-danger/60 h-full" style={{ width: `${price > 0 ? (cost / price) * 100 : 0}%` }} />
                                <div className="bg-success h-full" style={{ width: `${price > 0 ? (profit / price) * 100 : 0}%` }} />
                              </div>
                              <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                                <span>تكلفة <span className="text-foreground font-semibold">{cost.toFixed(1)}</span></span>
                                <span>ربح <span className="text-success font-bold">{profit.toFixed(1)}</span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="movement"><ProductMovementTab /></TabsContent>
        <TabsContent value="calculator"><ProductCalculatorTab /></TabsContent>
      </Tabs>

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
