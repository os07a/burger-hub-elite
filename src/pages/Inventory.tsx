import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

// أصناف مطابقة للمنتجات الفعلية والموردين
const items = [
  { name: "لحم بريسكت بلاك أنجوس", supplier: "الحلول المساندة / الخليج الغربية", qty: "~25 كجم", min: "15 كجم", status: "كافٍ", variant: "success" as const, category: "لحوم" },
  { name: "صدور دجاج ساديا 2كجم", supplier: "مسارات النهضة", qty: "6 باكات", min: "4 باكات", status: "كافٍ", variant: "success" as const, category: "لحوم" },
  { name: "بطاطس كروك أن 7×7", supplier: "الحلول المساندة / الخليج الغربية", qty: "4 كراتين", min: "3 كراتين", status: "كافٍ", variant: "success" as const, category: "بطاطس" },
  { name: "جبن شرائح أمريكي", supplier: "الحلول المساندة", qty: "3 باكات", min: "2 باكات", status: "كافٍ", variant: "success" as const, category: "أجبان" },
  { name: "خبز البرجر", supplier: "مورد محلي", qty: "~60 حبة", min: "100 حبة", status: "منخفض", variant: "warning" as const, category: "خبز" },
  { name: "مايونيز هاينز 3.7كجم", supplier: "الحلول المساندة", qty: "1 عبوة", min: "2 عبوة", status: "منخفض", variant: "warning" as const, category: "صوصات" },
  { name: "بيبسي قوارير 250مل", supplier: "السلال المنتجة", qty: "2 كرتون", min: "3 كراتين", status: "منخفض", variant: "warning" as const, category: "مشروبات" },
  { name: "زيت الرائد تنك 17لتر", supplier: "السلال المنتجة", qty: "1 تنك", min: "1 تنك", status: "حرج", variant: "danger" as const, category: "زيوت", qtyDanger: true },
  { name: "صلصة باربكيو 25.4كجم", supplier: "الحلول المساندة", qty: "1 عبوة", min: "1 عبوة", status: "كافٍ", variant: "success" as const, category: "صوصات" },
  { name: "فلفل أبيض + بابريكا", supplier: "المروانى", qty: "كمية كافية", min: "—", status: "كافٍ", variant: "success" as const, category: "بهارات" },
  { name: "ميكروف تغليف مقسم", supplier: "سلة البيان", qty: "~200 حبة", min: "100 حبة", status: "كافٍ", variant: "success" as const, category: "تغليف" },
  { name: "ماكس رول لفائف", supplier: "أغصان طيبة", qty: "3 رولات", min: "2 رول", status: "كافٍ", variant: "success" as const, category: "تغليف" },
];

const lowStockCount = items.filter(i => i.variant === "warning" || i.variant === "danger").length;
const categories = [...new Set(items.map(i => i.category))];

const Inventory = () => (
  <div>
    <PageHeader title="المخزون" subtitle="متابعة الكميات والتنبيهات — مرتبط بالموردين والمنتجات" badge={`${items.length} صنف`} />

    <div className="grid grid-cols-4 gap-3 mb-4">
      <MetricCard label="📦 إجمالي الأصناف" value={items.length.toString()} sub={`${categories.length} تصنيف`} />
      <MetricCard label="✅ كافٍ" value={items.filter(i => i.variant === "success").length.toString()} sub="لا يحتاج طلب" subColor="success" />
      <MetricCard label="⚡ منخفض" value={items.filter(i => i.variant === "warning").length.toString()} sub="يحتاج إعادة طلب قريباً" subColor="warning" />
      <MetricCard label="🚨 حرج" value={items.filter(i => i.variant === "danger").length.toString()} sub="يحتاج طلب فوري" subColor="danger" />
    </div>

    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">📦 جرد المخزون — مرتبط بالموردين</div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["الصنف", "المورد", "الكمية الحالية", "الحد الأدنى", "التصنيف", "الحالة"].map((h) => (
              <th key={h} className="text-[9px] text-gray-light font-semibold uppercase tracking-wide px-2.5 pb-2.5 text-right border-b-2 border-border">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.name} className="hover:bg-background/50">
              <td className="px-2.5 py-2.5 border-b border-border font-semibold text-[12px] text-foreground">{item.name}</td>
              <td className="px-2.5 py-2.5 border-b border-border text-[11px] text-gray">{item.supplier}</td>
              <td className={`px-2.5 py-2.5 border-b border-border font-bold text-[12px] ${item.qtyDanger ? "text-danger" : "text-foreground"}`}>{item.qty}</td>
              <td className="px-2.5 py-2.5 border-b border-border text-gray-light text-[12px]">{item.min}</td>
              <td className="px-2.5 py-2.5 border-b border-border">
                <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{item.category}</span>
              </td>
              <td className="px-2.5 py-2.5 border-b border-border"><StatusBadge variant={item.variant}>{item.status}</StatusBadge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {lowStockCount > 0 && (
      <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
        <div className="text-[11px] font-bold text-warning mb-1">⚠️ تنبيه: {lowStockCount} أصناف تحتاج إعادة طلب</div>
        <div className="text-[10px] text-gray leading-relaxed">
          {items.filter(i => i.variant !== "success").map(i => `${i.name} (${i.supplier})`).join(" · ")}
        </div>
      </div>
    )}
  </div>
);

export default Inventory;
