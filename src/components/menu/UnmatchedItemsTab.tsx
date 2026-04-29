import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link2, Plus, Loader2, Search, Package, Wand2, Sparkles } from "lucide-react";
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
  const [bulkBusy, setBulkBusy] = useState<null | "safe" | "all">(null);

  // Pre-compute auto-link candidates once for the strip counters
  const candidates = useMemo(() => {
    const safe: Array<{ u: UnmatchedSaleItem; pid: string; score: number }> = [];
    const loose: Array<{ u: UnmatchedSaleItem; pid: string; score: number }> = [];
    for (const u of unmatched) {
      if (!u.loyverse_item_id) continue; // can only relink rows that have a POS id
      const top = suggestProducts(u.display_name, products, 1)[0];
      if (!top) continue;
      if (top.score >= 0.75) safe.push({ u, pid: top.product.id, score: top.score });
      else if (top.score >= 0.6) loose.push({ u, pid: top.product.id, score: top.score });
    }
    return { safe, loose };
  }, [unmatched, products]);

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

  const linkClosest = async (sale: UnmatchedSaleItem) => {
    if (!sale.loyverse_item_id) {
      toast.error("هذا الصنف لا يحمل معرّف من الكاشير، استخدم 'إنشاء منتج جديد' بدل ذلك.");
      return;
    }
    const top = suggestProducts(sale.display_name, products, 1)[0];
    if (!top || top.score < 0.5) {
      toast.error("لم نجد منتجًا قريبًا بدرجة كافية. اختر يدويًا أو أنشئ منتج.");
      return;
    }
    await linkToExisting(top.product.id, sale);
  };

  const bulkAutoLink = async (mode: "safe" | "all") => {
    const list = mode === "safe" ? candidates.safe : [...candidates.safe, ...candidates.loose];
    if (list.length === 0) {
      toast.info("لا يوجد ما يمكن ربطه تلقائيًا بالحد المختار.");
      return;
    }
    setBulkBusy(mode);
    let ok = 0;
    let fail = 0;
    // sequential to keep load steady & easier to debug
    for (const c of list) {
      try {
        const { error } = await supabase
          .from("products")
          .update({ loyverse_item_id: c.u.loyverse_item_id })
          .eq("id", c.pid);
        if (error) throw error;
        ok++;
      } catch {
        fail++;
      }
    }
    qc.invalidateQueries({ queryKey: ["menu_engineering"] });
    setBulkBusy(null);
    toast.success(`تم ربط ${ok} صنف${fail ? ` · فشل ${fail}` : ""}`);
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

      {/* Bulk auto-link toolbar */}
      <div className="flex items-center justify-between gap-3 bg-primary/5 border border-primary/20 rounded-xl p-2.5 mb-3 flex-wrap">
        <div className="text-[11px] text-foreground flex items-center gap-2">
          <Sparkles size={12} className="text-primary" />
          <span>
            <b className="text-success">{candidates.safe.length}</b> جاهز للربط الآمن (تطابق ≥75%) ·{" "}
            <b className="text-warning">{candidates.loose.length}</b> اقتراحات إضافية (≥60%) ·{" "}
            <b className="text-muted-foreground">{unmatched.length - candidates.safe.length - candidates.loose.length}</b> يحتاج مراجعة
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => bulkAutoLink("safe")}
            disabled={bulkBusy !== null || candidates.safe.length === 0}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-success/10 text-success hover:bg-success/20 disabled:opacity-50 px-3 py-1.5 rounded-lg border border-success/30 transition"
          >
            {bulkBusy === "safe" ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
            ربط الواضح فقط ({candidates.safe.length})
          </button>
          <button
            onClick={() => bulkAutoLink("all")}
            disabled={bulkBusy !== null || candidates.safe.length + candidates.loose.length === 0}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 px-3 py-1.5 rounded-lg transition"
          >
            {bulkBusy === "all" ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
            ربط الكل تلقائيًا ({candidates.safe.length + candidates.loose.length})
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((u) => {
          const suggestions = suggestProducts(u.display_name, products, 3);
          const top = suggestions[0];
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
                <div className="flex items-center gap-1.5 shrink-0">
                  {top && top.score >= 0.5 && u.loyverse_item_id && (
                    <button
                      onClick={() => linkClosest(u)}
                      disabled={isBusy || bulkBusy !== null}
                      title={`ربط بـ "${top.product.name}" (${Math.round(top.score * 100)}%)`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-success hover:bg-success/10 px-2.5 py-1 rounded-lg transition border border-success/30"
                    >
                      {isBusy ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
                      ربط بالأقرب
                    </button>
                  )}
                <button
                  onClick={() => createNewProduct(u)}
                    disabled={isBusy || bulkBusy !== null}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition"
                >
                  {isBusy ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                  إنشاء منتج
                </button>
                </div>
              </div>

              {suggestions.length > 0 && u.loyverse_item_id ? (
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">أو اختر يدويًا:</span>
                  {suggestions.map((s) => (
                    <button
                      key={s.product.id}
                      onClick={() => linkToExisting(s.product.id, u)}
                      disabled={isBusy || bulkBusy !== null}
                      className="inline-flex items-center gap-1 text-[10px] bg-muted/40 hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded-md transition border border-border"
                    >
                      <Link2 size={9} />
                      <span className="font-semibold">{s.product.name}</span>
                      <span className="text-muted-foreground">({Math.round(s.score * 100)}%)</span>
                    </button>
                  ))}
                </div>
              ) : !u.loyverse_item_id ? (
                <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                  هذا الصنف لا يحمل معرّف من الكاشير — استخدم "إنشاء منتج جديد" فقط.
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                  لا توجد منتجات قريبة في القائمة — أنشئ منتجًا جديدًا.
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