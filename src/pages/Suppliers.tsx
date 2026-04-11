import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";

const suppliers = [
  {
    name: "الوطنية للحوم", category: "لحوم ودواجن", status: "نشط", statusVariant: "success" as const,
    contact: "خالد المطيري", phone: "0501234567", cycle: "كل 3 أيام", payment: "آجل 15 يوم",
    lastSupply: "آخر توريد: منذ يومين · 48 كجم", avg: "2,400 ر",
  },
  {
    name: "مخبز الفجر", category: "خبز وأصناف مخبوزة", status: "يحتاج طلب", statusVariant: "warning" as const,
    contact: "عبدالله الشمري", phone: "0559876543", cycle: "يومي صباحاً", payment: "نقد عند التسليم",
    lastSupply: "آخر توريد: اليوم صباحاً · 200 حبة", avg: "380 ر",
  },
  {
    name: "الخضار الطازج", category: "خضروات وأعشاب", status: "متأخر", statusVariant: "danger" as const, borderDanger: true,
    contact: "أحمد العنزي", phone: "0534561234", cycle: "كل يومين", payment: "تحويل فوري",
    lastSupply: "آخر توريد: منذ 4 أيام — متأخر!", avg: "650 ر", lastSupplyDanger: true,
  },
  {
    name: "المبرد الذهبي", category: "بطاطس وأصناف مجمدة", status: "نشط", statusVariant: "success" as const,
    contact: "فيصل الدوسري", phone: "0506789012", cycle: "أسبوعي", payment: "آجل 7 أيام",
    lastSupply: "آخر توريد: منذ 3 أيام · 50 كجم", avg: "1,100 ر",
  },
  {
    name: "توزيع الألبان الوطنية", category: "جبن وألبان وصلصات", status: "نشط", statusVariant: "success" as const,
    contact: "ناصر القحطاني", phone: "0512345098", cycle: "مرتين أسبوعياً", payment: "آجل 10 أيام",
    lastSupply: "آخر توريد: أمس · 15 كجم جبن", avg: "900 ر",
  },
];

const Suppliers = () => (
  <div>
    <PageHeader title="الموردون" subtitle="جهات التوريد وبياناتهم" />
    {suppliers.map((s) => (
      <div key={s.name} className={`bg-surface rounded-lg p-4 mb-2.5 border border-border transition-colors hover:border-primary/30 ${s.borderDanger ? "border-r-[3px] border-r-danger" : ""}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-[14px] font-bold text-foreground">{s.name}</div>
            <div className="text-[10px] text-gray-light mt-0.5 font-medium">{s.category}</div>
          </div>
          <StatusBadge variant={s.statusVariant}>{s.status}</StatusBadge>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "المسؤول", value: s.contact },
            { label: "الجوال", value: s.phone },
            { label: "دورة التوريد", value: s.cycle },
            { label: "طريقة الدفع", value: s.payment },
          ].map((f) => (
            <div key={f.label}>
              <div className="text-[9px] text-gray-light font-semibold uppercase tracking-wide mb-1">{f.label}</div>
              <div className={`text-[12px] font-semibold text-foreground ${f.label === "الجوال" ? "dir-ltr" : ""}`} style={f.label === "الجوال" ? { direction: "ltr" } : {}}>{f.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-border flex justify-between text-[11px] text-gray-light font-medium">
          <span className={s.lastSupplyDanger ? "text-danger font-semibold" : ""}>{s.lastSupply}</span>
          <span>متوسط: <strong className="text-foreground">{s.avg}</strong></span>
        </div>
      </div>
    ))}
  </div>
);

export default Suppliers;
