import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";

const expenses = [
  { label: "الديكور", pct: 16.9, value: "49,482", color: "bg-primary" },
  { label: "الآلات والمعدات", pct: 16.6, value: "48,566", color: "bg-foreground" },
  { label: "الإيجار", pct: 13.7, value: "40,000", color: "bg-primary" },
  { label: "الهوية البصرية", pct: 7.6, value: "22,243", color: "bg-gray" },
  { label: "رواتب الموظفين", pct: 6.5, value: "19,150", color: "bg-foreground" },
  { label: "صيانة تأسيسية", pct: 6.2, value: "18,047", color: "bg-gray-light" },
  { label: "رسوم حكومية", pct: 5.4, value: "15,810", color: "bg-gray" },
  { label: "مستحقات أسامة", pct: 4.5, value: "13,250", color: "bg-primary" },
  { label: "التشطيبات الإضافية", pct: 3.7, value: "10,904", color: "bg-gray-light" },
  { label: "مصروفات الافتتاح", pct: 3.2, value: "9,497", color: "bg-foreground" },
  { label: "مصروفات تموينية", pct: 3.2, value: "9,337", color: "bg-gray" },
  { label: "مصروفات غير معروفة ⚠️", pct: 2.5, value: "7,185", color: "bg-warning" },
  { label: "الكهرباء", pct: 2.4, value: "7,054", color: "bg-gray-light" },
  { label: "خدمات إدارية/محاسبية", pct: 1.9, value: "5,500", color: "bg-gray" },
  { label: "سوشل ميديا", pct: 1.7, value: "5,000", color: "bg-foreground" },
  { label: "العمال", pct: 1.7, value: "4,880", color: "bg-gray-light" },
  { label: "إنترنت وشبكات", pct: 1.2, value: "3,500", color: "bg-gray" },
  { label: "دعاية وإعلان", pct: 1.0, value: "3,000", color: "bg-gray-light" },
];

const partners = [
  { name: "أسامة", pct: 49, agreed: "143,278", actual: "148,196", diff: "+4,918", status: "أنفق أكثر", statusColor: "text-danger" },
  { name: "يوسف", pct: 51, agreed: "149,127", actual: "144,209", diff: "-4,918", status: "أنفق أقل", statusColor: "text-success" },
];

const Profits = () => (
  <div>
    <PageHeader title="الأرباح والنسب" subtitle="المصروفات التأسيسية وتوزيع حصص الشركاء" />

    {/* Summary Cards */}
    <div className="grid grid-cols-3 gap-3 mb-5">
      <MetricCard label="💸 إجمالي المصروفات التأسيسية" value="292,405" sub="ريال سعودي" showRiyal />
      <MetricCard label="📋 عدد العمليات" value="204" sub="98% موثقة" subColor="success" />
      <MetricCard label="⚠️ بدون مستندات" value="18" sub="7,185 ر.س تحتاج مراجعة" subColor="danger" />
    </div>

    {/* Expense Breakdown */}
    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary mb-5">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">توزيع المصروفات التأسيسية حسب الحساب</div>

      {expenses.map((item) => (
        <div key={item.label} className="mb-3 last:mb-0">
          <div className="flex justify-between mb-1">
            <span className="text-[11px] text-gray font-medium">{item.label}</span>
            <span>
              <span className="text-[10px] text-gray-light ml-1">{item.pct}%</span>
              <span className="text-[12px] font-bold text-foreground">{item.value} ر</span>
            </span>
          </div>
          <div className="h-[4px] bg-background rounded-sm overflow-hidden">
            <div className={`h-full rounded-sm ${item.color}`} style={{ width: `${item.pct * 4}%` }} />
          </div>
        </div>
      ))}
    </div>

    {/* Partner Settlement */}
    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary mb-5">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">تسوية الشركاء</div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {partners.map((p) => (
          <div key={p.name} className="bg-background rounded-lg p-3 border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[13px] font-bold text-foreground">{p.name}</span>
              <span className="text-[11px] font-semibold text-primary">{p.pct}%</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-light">المصروف المتفق</span>
                <span className="text-foreground font-medium">{p.agreed} ر</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-light">المصروف الفعلي</span>
                <span className="text-foreground font-medium">{p.actual} ر</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1.5 border-t border-border">
                <span className="text-gray-light">الفرق</span>
                <span className={`font-bold ${p.statusColor}`}>{p.diff} ر — {p.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-center">
        <span className="text-[12px] font-semibold text-warning">⚠️ مطلوب: تحصيل 4,918 ريال من يوسف لصالح أسامة لتعديل الفرق عن نسب الشراكة</span>
      </div>
    </div>
  </div>
);

export default Profits;
