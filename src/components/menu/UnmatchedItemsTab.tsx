import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link2, Plus, Loader2, Search, Package } from "lucide-react";
import type { UnmatchedSaleItem } from "@/hooks/useMenuEngineering";
import { suggestProducts, type ProductLite } from "@/lib/menuMatching";

interface Props {
  unmatched: UnmatchedSaleItem[];
  products: ProductLite[]; // active products
}

const UnmatchedItemsTab = ({ unmatched, products }: Props) => {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return unmatched;
    return unmatched.filter((u) => u.display_name.toLowerCase().includes(ql));
  }, [unmatched, q]);

  const linkToExisting = async (productId: string, sale: UnmatchedSaleItem) => {
    if (!sale.loyverse_item_id) {
      toast.error("هذا الصنف لا يحمل معرّف من الكاشير، استخدم 'إنشاء منتج جديد' بدل ذلك.");
      return;
    }
    setBusy(sale.key);
    try {
      const { error } = await supabase
        .from("products")
        .update({ loyverse_item_id: sale.loyverse_item_id })
        .eq("id", productId);
      if (error) throw error;
      toast.success("تم ربط الصنف بالمنتج");
      qc.invalidateQueries({ queryKey: ["menu_engineering"] });
    } catch (e: any) {
      toast.error("فشل الربط: " + (e?.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  const createNewProduct = async (sale: UnmatchedSaleItem) => {
    setBusy(sale.key);
    try {
      const avgPrice = sale.units_sold > 0 ? sale.net_revenue / sale.units_sold : 0;
      const avgCost = sale.units_sold > 0 ? sale.cost_total / sale.units_sold : 0;
      const { error } = await supabase.from("products").insert({
        name: sale.display_name,
        price: Number(avgPrice.toFixed(2)),
        cost: Number(avgCost.toFixed(2)),
        is_active: true,
        loyverse_item_id: sale.loyverse_item_id,
        product_type: "ready_made",
      });
      if (error) throw error;
      toast.success("تم إنشاء المنتج وربطه");
      qc.invalidateQueries({ queryKey: ["menu_engineering"] });
    } catch (e: any) {
      toast.error("فشل الإنشاء: " + (e?.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  if (unmatched.length === 0) {
    return (
      <div className="ios-card text-center py-10 text-muted-foreground text-[12px]" dir="rtl">
        <Package size={28} className="mx-auto mb-2 opacity-40" />
        ممتاز! كل أصناف الكاشير مربوطة بمنتجاتك.
      </div>
    );
  }

  return (
    <div className="ios-card" dir="rtl">
      <div className="flex items-center justify-between mb-3 gap-3">
        <div>
          <div className="text-[13px] font-bold text-foreground">أصناف غير مربوطة</div>
          <div className="text-[11px] text-muted-foreground">
            هذه الأصناف ظهرت في الكاشير لكنها غير مربوطة بمنتج في القائمة. اربطها لتظهر في تحليل المنيو.
          </div>
        </div>
        <div className="relative">
          <Search size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث..."
            className="bg-muted/30 border border-border rounded-lg text-[11px] pr-7 pl-2.5 py-1.5 w-44 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((u) => {
          const suggestions = suggestProducts(u.display_name, products, 3);
          const isBusy = busy === u.key;
          return (
            <div key={u.key} className="border border-border rounded-xl p-3 hover:bg-muted/20 transition">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-foreground truncate">{u.display_name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{u.units_sold} وحدة</span>
                    <span>·</span>
                    <span>{Math.round(u.net_revenue).toLocaleString("ar-SA")} ر.س</span>
                    {u.loyverse_item_id && (
                      <>
                        <span>·</span>
                        <code className="text-[9px] bg-muted/40 px-1 rounded">{u.loyverse_item_id}</code>
                      </>
                    )}
                    {!u.loyverse_item_id && (
                      <>
                        <span>·</span>
                        <span className="text-warning">بدون معرّف من الكاشير</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => createNewProduct(u)}
                  disabled={isBusy}
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition"
                >
                  {isBusy ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                  إنشاء منتج
                </button>
              </div>

              {suggestions.length > 0 && u.loyverse_item_id && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">ربط بمنتج موجود:</span>
                  {suggestions.map((s) => (
                    <button
                      key={s.product.id}
                      onClick={() => linkToExisting(s.product.id, u)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1 text-[10px] bg-muted/40 hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded-md transition border border-border"
                    >
                      <Link2 size={9} />
                      <span className="font-semibold">{s.product.name}</span>
                      <span className="text-muted-foreground">({Math.round(s.score * 100)}%)</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-[12px]">لا نتائج للبحث.</div>
        )}
      </div>
    </div>
  );
};

export default UnmatchedItemsTab;