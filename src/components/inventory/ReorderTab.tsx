import { useMemo } from "react";
import { Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useInventory, getStockStatus, type InventoryItem } from "@/hooks/useInventory";
import StatusBadge from "@/components/ui/StatusBadge";

type Row = InventoryItem & { stock: ReturnType<typeof getStockStatus>; needed: number };

const ReorderTab = () => {
  const { data: items = [], isLoading } = useInventory();

  const grouped = useMemo(() => {
    const rows: Row[] = items
      .map((i) => {
        const stock = getStockStatus(Number(i.quantity), Number(i.min_quantity));
        const needed = Math.max(0, Number(i.min_quantity) - Number(i.quantity));
        return { ...i, stock, needed };
      })
      .filter((i) => i.stock.variant !== "success");

    const map = new Map<string, Row[]>();
    rows.forEach((r) => {
      const key = r.supplier ?? "بدون مورد محدد";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });

    // Sort: suppliers with most critical items first
    return [...map.entries()]
      .map(([supplier, list]) => ({
        supplier,
        list: list.sort((a, b) => {
          const order = { danger: 0, warning: 1, success: 2 } as const;
          return order[a.stock.variant] - order[b.stock.variant];
        }),
        criticalCount: list.filter((i) => i.stock.variant === "danger").length,
      }))
      .sort((a, b) => b.criticalCount - a.criticalCount || b.list.length - a.list.length);
  }, [items]);

  const copyOrderList = (supplier: string, list: Row[]) => {
    const text = `طلب من: ${supplier}\n\n${list
      .map((i, idx) => `${idx + 1}. ${i.name} — ${i.needed} ${i.unit} (المتوفر ${Number(i.quantity)} / الحد الأدنى ${Number(i.min_quantity)})`)
      .join("\n")}`;
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ قائمة طلب ${supplier}`);
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-8">جارٍ التحميل...</div>;
  }

  if (grouped.length === 0) {
    return (
      <div className="ios-card text-center py-12">
        <div className="text-success text-[14px] font-semibold mb-1">✅ كل الأصناف بمستويات كافية</div>
        <div className="text-[12px] text-muted-foreground">لا توجد طلبات شراء مطلوبة حالياً.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[12px] text-warning">
        <AlertTriangle size={14} />
        <span>{grouped.reduce((s, g) => s + g.list.length, 0)} صنف يحتاج إعادة طلب موزّعة على {grouped.length} مورد</span>
      </div>

      {grouped.map(({ supplier, list, criticalCount }) => (
        <div key={supplier} className="ios-card">
          <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-border">
            <div>
              <div className="text-[14px] font-semibold text-foreground">{supplier}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {list.length} صنف
                {criticalCount > 0 && (
                  <span className="text-danger font-semibold mr-2">· {criticalCount} حرج</span>
                )}
              </div>
            </div>
            <button
              onClick={() => copyOrderList(supplier, list)}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Copy size={12} /> نسخ قائمة الطلب
            </button>
          </div>
          <div className="space-y-2">
            {list.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-3 text-[12px] py-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <StatusBadge variant={i.stock.variant}>{i.stock.label}</StatusBadge>
                  <span className="font-medium text-foreground truncate">{i.name}</span>
                  {i.category && (
                    <span className="text-[10px] text-muted-foreground">· {i.category}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] shrink-0">
                  <span className="text-muted-foreground">
                    المتوفر <b className="text-foreground">{Number(i.quantity)}</b> / {Number(i.min_quantity)} {i.unit}
                  </span>
                  <span className="text-warning font-semibold">
                    يحتاج {i.needed} {i.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReorderTab;