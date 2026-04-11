import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";

const items = [
  { label: "المواد الخام", pct: 30, value: "38,000 ر", color: "bg-primary" },
  { label: "الرواتب", pct: 11, value: "14,200 ر", color: "bg-foreground" },
  { label: "الإيجار والخدمات", pct: 9, value: "12,000 ر", color: "bg-gray" },
  { label: "نسبة الشريك المستثمر", pct: 25, value: "11,650 ر", color: "bg-gray-light" },
];

const Profits = () => (
  <div>
    <PageHeader title="الأرباح والنسب" subtitle="الإيرادات والمصاريف وتوزيع الأرباح" />

    <div className="grid grid-cols-3 gap-3 mb-5">
      <MetricCard label="إيرادات الشهر" value="128,000" sub="ريال" />
      <MetricCard label="المصاريف" value="81,400" sub="رواتب + مواد + إيجار" subColor="danger" />
      <MetricCard label="صافي الربح" value="46,600" sub="هامش 36%" subColor="success" />
    </div>

    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">توزيع المصاريف والأرباح</div>

      {items.map((item) => (
        <div key={item.label} className="mb-3.5 last:mb-0">
          <div className="flex justify-between mb-1">
            <span className="text-[12px] text-gray font-medium">{item.label}</span>
            <span>
              <span className="text-[10px] text-gray-light ml-1">{item.pct}%</span>
              <span className="text-[12px] font-bold text-foreground">{item.value}</span>
            </span>
          </div>
          <div className="h-[5px] bg-background rounded-sm overflow-hidden">
            <div className={`h-full rounded-sm ${item.color}`} style={{ width: `${item.pct}%` }} />
          </div>
        </div>
      ))}

      <div className="mt-3.5">
        <div className="flex justify-between mb-1">
          <span className="text-[12px] font-bold text-foreground">صافي حصتك</span>
          <span>
            <span className="text-[10px] text-gray-light ml-1">75%</span>
            <span className="text-[14px] font-bold text-primary">34,950 ر</span>
          </span>
        </div>
        <div className="h-2 bg-background rounded-sm overflow-hidden">
          <div className="h-full rounded-sm bg-primary" style={{ width: "75%" }} />
        </div>
      </div>
    </div>
  </div>
);

export default Profits;
