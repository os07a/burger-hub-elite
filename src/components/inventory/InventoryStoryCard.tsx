import RiyalIcon from "@/components/ui/RiyalIcon";
import { fmt } from "@/lib/format";
import { Package, AlertTriangle, TrendingDown, ShieldCheck } from "lucide-react";
import { useInventory, getStockStatus } from "@/hooks/useInventory";

const todayWeekday = new Intl.DateTimeFormat("ar-SA", {
  timeZone: "Asia/Riyadh",
  weekday: "long",
}).format(new Date());

const InventoryStoryCard = () => {
  const { data: items = [] } = useInventory();

  const withStatus = items.map((i) => ({
    ...i,
    stock: getStockStatus(Number(i.quantity), Number(i.min_quantity)),
  }));

  const total = items.length;
  const sufficient = withStatus.filter((i) => i.stock.variant === "success").length;
  const low = withStatus.filter((i) => i.stock.variant === "warning").length;
  const critical = withStatus.filter((i) => i.stock.variant === "danger").length;

  const stockValue = items.reduce(
    (sum, i) => sum + Number(i.quantity) * Number(i.cost_per_unit ?? 0),
    0,
  );

  // Top supplier with most items needing reorder
  const supplierShortages = new Map<string, number>();
  withStatus
    .filter((i) => i.stock.variant !== "success")
    .forEach((i) => {
      const key = i.supplier ?? "غير محدد";
      supplierShortages.set(key, (supplierShortages.get(key) ?? 0) + 1);
    });
  const topSupplier = [...supplierShortages.entries()].sort((a, b) => b[1] - a[1])[0];

  const tone: "success" | "warning" | "danger" =
    critical > 0 ? "danger" : low > 0 ? "warning" : "success";

  const toneClasses = {
    success: { bg: "bg-success/10", text: "text-success", icon: ShieldCheck },
    warning: { bg: "bg-warning/15", text: "text-warning", icon: AlertTriangle },
    danger: { bg: "bg-danger/10", text: "text-danger", icon: TrendingDown },
  }[tone];
  const Icon = toneClasses.icon;

  let storyText: string;
  if (total === 0) {
    storyText = `اليوم ${todayWeekday}. لا توجد أصناف في المخزون بعد — أضف أول صنف لبدء التتبع.`;
  } else if (critical > 0) {
    storyText = `اليوم ${todayWeekday} — انتباه: ${critical} صنف بحالة حرجة${low > 0 ? ` و${low} منخفض` : ""}. قيمة المخزون الحالية ${fmt(stockValue)} ر.س${topSupplier ? `. أكثر مورد يحتاج طلب: ${topSupplier[0]} (${topSupplier[1]} صنف).` : "."}`;
  } else if (low > 0) {
    storyText = `اليوم ${todayWeekday} — وضع المخزون مستقر مع ${low} صنف يقترب من الحد الأدنى. قيمة المخزون ${fmt(stockValue)} ر.س${topSupplier ? `. راجع طلبات ${topSupplier[0]}.` : "."}`;
  } else {
    storyText = `اليوم ${todayWeekday} — كل الأصناف بمستويات كافية. قيمة المخزون ${fmt(stockValue)} ر.س عبر ${total} صنف.`;
  }

  return (
    <div className="ios-card mb-5">
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-full ${toneClasses.bg} ${toneClasses.text} flex items-center justify-center shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mb-1">📦 قصة المخزون</div>
          <div className="text-[13px] leading-relaxed text-foreground">{storyText}</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mt-4">
        <div className="rounded-xl bg-background p-3">
          <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
            <Package size={10} /> إجمالي الأصناف
          </div>
          <div className="text-[16px] font-bold text-foreground">{fmt(total)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
            القيمة {fmt(stockValue)} <RiyalIcon size={9} />
          </div>
        </div>
        <div className="rounded-xl bg-background p-3">
          <div className="text-[10px] text-muted-foreground mb-1">كافٍ</div>
          <div className="text-[16px] font-bold text-success">{fmt(sufficient)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">لا يحتاج طلب</div>
        </div>
        <div className="rounded-xl bg-background p-3">
          <div className="text-[10px] text-muted-foreground mb-1">منخفض</div>
          <div className="text-[16px] font-bold text-warning">{fmt(low)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">قريب من الحد الأدنى</div>
        </div>
        <div className="rounded-xl bg-background p-3">
          <div className="text-[10px] text-muted-foreground mb-1">حرج</div>
          <div className="text-[16px] font-bold text-danger">{fmt(critical)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">طلب فوري</div>
        </div>
      </div>
    </div>
  );
};

export default InventoryStoryCard;