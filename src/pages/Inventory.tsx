import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";

const items = [
  { name: "لحم برجر 200جم", qty: "48 كجم", min: "20 كجم", status: "كافٍ", variant: "success" as const },
  { name: "خبز البرجر", qty: "80 حبة", min: "100 حبة", status: "منخفض", variant: "warning" as const },
  { name: "خس طازج", qty: "2 كجم", min: "5 كجم", status: "نفد تقريباً", variant: "danger" as const, qtyDanger: true },
  { name: "بطاطس مجمدة", qty: "35 كجم", min: "15 كجم", status: "كافٍ", variant: "success" as const },
  { name: "صلصة بيبر", qty: "4 لتر", min: "6 لتر", status: "منخفض", variant: "warning" as const },
  { name: "جبن شيدر", qty: "12 كجم", min: "8 كجم", status: "كافٍ", variant: "success" as const },
];

const Inventory = () => (
  <div>
    <PageHeader title="المخزون" subtitle="متابعة الكميات والتنبيهات" />
    <div className="bg-surface border border-border rounded-lg p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["الصنف", "الكمية الحالية", "الحد الأدنى", "الحالة"].map((h) => (
              <th key={h} className="text-[9px] text-gray-light font-semibold uppercase tracking-wide px-2.5 pb-2.5 text-right border-b-2 border-border">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.name} className="hover:bg-background/50">
              <td className="px-2.5 py-2.5 border-b border-border font-semibold text-[13px]">{item.name}</td>
              <td className={`px-2.5 py-2.5 border-b border-border font-bold text-[13px] ${item.qtyDanger ? "text-danger" : ""}`}>{item.qty}</td>
              <td className="px-2.5 py-2.5 border-b border-border text-gray-light text-[13px]">{item.min}</td>
              <td className="px-2.5 py-2.5 border-b border-border"><StatusBadge variant={item.variant}>{item.status}</StatusBadge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Inventory;
