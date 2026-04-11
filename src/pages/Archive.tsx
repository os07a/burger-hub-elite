import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

const filters = [
  { id: "all", label: "الكل" },
  { id: "invoice", label: "فاتورة" },
  { id: "receipt", label: "سند قبض" },
  { id: "contract", label: "عقد" },
  { id: "permit", label: "تصريح / رخصة" },
  { id: "other", label: "أخرى" },
];

const typeConfig: Record<string, { label: string; variant: "info" | "success" | "warning" | "danger"; icon: string }> = {
  invoice: { label: "فاتورة", variant: "info", icon: "🧾" },
  receipt: { label: "سند قبض", variant: "success", icon: "📄" },
  contract: { label: "عقد", variant: "warning", icon: "📋" },
  permit: { label: "تصريح", variant: "info", icon: "🏛️" },
  other: { label: "أخرى", variant: "danger", icon: "📁" },
};

const months = [
  {
    label: "أبريل 2026", count: 8,
    docs: [
      { type: "invoice", name: "فاتورة الوطنية للحوم", party: "الوطنية للحوم", amount: "2,400 ر", date: "9 أبريل", status: "مدفوع", statusVariant: "success" as const },
      { type: "receipt", name: "سند قبض مبيعات اليوم", party: "—", amount: "4,820 ر", date: "11 أبريل", status: "محفوظ", statusVariant: "success" as const },
      { type: "invoice", name: "فاتورة مخبز الفجر", party: "مخبز الفجر", amount: "380 ر", date: "10 أبريل", status: "مدفوع", statusVariant: "success" as const },
    ],
  },
  {
    label: "مارس 2026", count: 10,
    docs: [
      { type: "contract", name: "عقد الإيجار السنوي", party: "مالك العقار", amount: "40,000 ر", date: "1 مارس", status: "موقّع", statusVariant: "success" as const },
      { type: "permit", name: "رخصة البلدية", party: "بلدية المدينة", amount: "1,200 ر", date: "15 مارس", status: "سارية", statusVariant: "success" as const },
      { type: "invoice", name: "فاتورة المبرد الذهبي", party: "المبرد الذهبي", amount: "1,100 ر", date: "20 مارس", status: "مدفوع", statusVariant: "success" as const },
      { type: "invoice", name: "فاتورة الكهرباء", party: "شركة الكهرباء", amount: "850 ر", date: "28 مارس", status: "معلق", statusVariant: "warning" as const },
    ],
  },
];

const Archive = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div>
      <PageHeader title="الأرشيف" subtitle="الفواتير · السندات · المستندات الرسمية" badge="24 مستند" />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <MetricCard label="هذا الشهر" value="8" sub="مستند مرفوع" />
        <MetricCard label="إجمالي الفواتير" value="14" sub="فاتورة" />
        <MetricCard label="آخر رفع" value="اليوم" sub="منذ ساعتين" subColor="success" />
      </div>

      <div className="flex gap-1.5 mb-5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
              activeFilter === f.id
                ? "bg-foreground text-primary-foreground border-foreground"
                : "bg-surface text-gray border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-primary hover:bg-danger-bg bg-surface mb-5">
        <div className="mx-auto mb-2.5 w-10 h-10 rounded-lg bg-background flex items-center justify-center text-gray">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" strokeWidth="2" /><line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" /></svg>
        </div>
        <div className="text-[14px] font-bold text-foreground mb-1">اضغط لرفع مستند</div>
        <div className="text-[11px] text-gray-light">صورة أو PDF · فاتورة، سند قبض، عقد، تصريح</div>
      </div>

      {months.map((month) => (
        <div key={month.label} className="mb-5">
          <div className="text-[11px] font-bold text-gray mb-2 flex items-center gap-2">
            {month.label}
            <span className="text-[10px] font-semibold bg-background text-gray-light px-2 py-0.5 rounded-lg">{month.count} مستندات</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["المستند", "النوع", "الجهة", "المبلغ", "التاريخ", "الحالة"].map((h) => (
                    <th key={h} className="text-[9px] text-gray-light font-semibold uppercase tracking-wide px-2.5 pb-2.5 pt-2.5 text-right border-b-2 border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {month.docs
                  .filter((doc) => activeFilter === "all" || doc.type === activeFilter)
                  .map((doc) => {
                    const tc = typeConfig[doc.type];
                    return (
                      <tr key={doc.name} className="hover:bg-background/50">
                        <td className="px-2.5 py-2.5 border-b border-border">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-md bg-background border border-border flex items-center justify-center text-[16px] flex-shrink-0">{tc.icon}</div>
                            <span className="font-bold text-foreground text-[12px]">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 border-b border-border"><StatusBadge variant={tc.variant} className="text-[10px]">{tc.label}</StatusBadge></td>
                        <td className="px-2.5 py-2.5 border-b border-border text-gray text-[12px]">{doc.party}</td>
                        <td className="px-2.5 py-2.5 border-b border-border font-bold text-foreground text-[12px]">{doc.amount}</td>
                        <td className="px-2.5 py-2.5 border-b border-border text-gray-light text-[12px]">{doc.date}</td>
                        <td className="px-2.5 py-2.5 border-b border-border"><StatusBadge variant={doc.statusVariant} className="text-[10px]">{doc.status}</StatusBadge></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Archive;
