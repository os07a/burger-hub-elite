import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

const burgers = [
  { name: "برجر دبل", desc: "لحمتين · جبن · صلصة خاصة · خس · طماطم", price: "35 ر", status: "نشط", variant: "success" as const },
  { name: "برجر كلاسيك", desc: "لحمة · خضار · صلصة بيبر", price: "25 ر", status: "نشط", variant: "success" as const },
  { name: "تشيكن برجر", desc: "دجاج مقلي مقرمش · مايونيز · خس", price: "28 ر", status: "نشط", variant: "success" as const },
  { name: "برجر مشروم", desc: "لحمة · جبن · مشروم مشوي", price: "32 ر", status: "نشط", variant: "success" as const },
  { name: "سموك برجر", desc: "لحمة · جبن مدخن · بيكون بقري · BBQ", price: "38 ر", status: "موسمي", variant: "warning" as const },
];

const meals = [
  { name: "واجبة كلاسيك", desc: "برجر + بطاطس + مشروب", price: "42 ر" },
  { name: "واجبة دبل", desc: "برجر دبل + بطاطس + مشروب", price: "52 ر" },
  { name: "واجبة عائلية", desc: "4 برجر + 2 بطاطس كبير + 4 مشروبات", price: "149 ر" },
];

const extras = [
  { name: "بطاطس", desc: "وسط / كبير", price: "8 / 12 ر" },
  { name: "مشروب غازي", desc: "وسط / كبير", price: "6 / 9 ر" },
  { name: "ميلك شيك", desc: "شوك · فانيلا · فراولة", price: "18 ر" },
  { name: "جبن إضافي", desc: "شيدر / موزاريلا", price: "4 ر" },
  { name: "صلصات", desc: "حارة · بيبر · BBQ", price: "2 ر" },
];

const ProductTable = ({ headers, rows, showStatus = false }: { headers: string[]; rows: any[]; showStatus?: boolean }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} className="text-[9px] text-gray-light font-semibold uppercase tracking-wide px-2.5 pb-2.5 text-right border-b-2 border-border">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-background/50">
            <td className="px-2.5 py-2.5 border-b border-border font-bold text-foreground text-[13px]">{row.name}</td>
            <td className="px-2.5 py-2.5 border-b border-border text-gray text-[12px]">{row.desc}</td>
            <td className="px-2.5 py-2.5 border-b border-border font-bold text-primary whitespace-nowrap text-[13px]">{row.price}</td>
            {showStatus && row.variant && (
              <td className="px-2.5 py-2.5 border-b border-border"><StatusBadge variant={row.variant}>{row.status}</StatusBadge></td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Products = () => (
  <div>
    <PageHeader title="المنتجات" subtitle="قائمة الأصناف والأسعار والتصنيفات" badge="26 منتج" />

    <div className="grid grid-cols-3 gap-3 mb-5">
      <MetricCard label="إجمالي الأصناف" value="26" sub="صنف نشط" />
      <MetricCard label="متوسط سعر الطلب" value="35" sub="ريال" />
      <MetricCard label="أعلى صنف مبيعاً" value="برجر دبل" sub="34% من الطلبات" subColor="success" />
    </div>

    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary mb-4">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">البرجر</div>
      <ProductTable headers={["الاسم", "الوصف", "السعر", "الحالة"]} rows={burgers} showStatus />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">الوجبات الكاملة</div>
        <ProductTable headers={["الاسم", "المحتوى", "السعر"]} rows={meals} />
      </div>
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">الإضافات والمشروبات</div>
        <ProductTable headers={["الاسم", "الحجم", "السعر"]} rows={extras} />
      </div>
    </div>
  </div>
);

export default Products;
