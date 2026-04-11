import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

type SupplierType = "assets" | "supplies";

interface Supplier {
  name: string;
  category: string;
  status: string;
  statusVariant: "success" | "warning" | "info" | "danger";
  ops: number;
  total: string;
  totalNum: number;
  items: string;
  docs: string;
  docsVariant: "success" | "warning" | "info" | "danger";
  type: SupplierType;
}

const suppliers: Supplier[] = [
  // ═══ موردون أصول ═══
  {
    name: "مورد الديكور والاستيل", category: "ديكور · استيل · رخام", status: "نشط", statusVariant: "success",
    ops: 22, total: "49,482", totalNum: 49482, items: "طاولات استيل، ألواح ديكور، واجهات",
    docs: "موثق", docsVariant: "success", type: "assets",
  },
  {
    name: "مورد الآلات والمعدات", category: "أجهزة مطبخ · معدات تشغيل", status: "نشط", statusVariant: "success",
    ops: 22, total: "48,566", totalNum: 48566, items: "جريل فحم كهربائي، قلاية، حماصة خبز، جهاز بونات",
    docs: "موثق", docsVariant: "success", type: "assets",
  },
  {
    name: "مالك العقار", category: "إيجار المحل", status: "نشط", statusVariant: "success",
    ops: 2, total: "40,000", totalNum: 40000, items: "دفعة إيجار أولى وثانية (فبراير – أغسطس 2026)",
    docs: "متوفر البيانات", docsVariant: "warning", type: "assets",
  },
  {
    name: "مطابع الهوية البصرية", category: "طباعة · بوكسات · تصميم", status: "نشط", statusVariant: "success",
    ops: 3, total: "22,243", totalNum: 22243, items: "طباعة بوكسات البرجر، تجهيزات الوجبات، تصميم الواجهة",
    docs: "موثق", docsVariant: "success", type: "assets",
  },
  {
    name: "مورد التشطيبات والموارد", category: "رخام · تشطيبات إضافية", status: "نشط", statusVariant: "success",
    ops: 15, total: "10,904", totalNum: 10904, items: "رخام أرضيات، تشطيبات إضافية",
    docs: "موثق", docsVariant: "success", type: "assets",
  },
  {
    name: "مورد الصيانة التأسيسية", category: "صيانة · تجهيزات", status: "نشط", statusVariant: "success",
    ops: 36, total: "18,047", totalNum: 18047, items: "مغناطيس استيل، صحون، سخانة جبن، ثلاجات",
    docs: "موثق", docsVariant: "success", type: "assets",
  },
  {
    name: "الجهات الحكومية", category: "رسوم · تراخيص · رخص", status: "مكتمل", statusVariant: "info",
    ops: 14, total: "15,810", totalNum: 15810, items: "رخصة بلدية، نقل كفالة، تصاريح، اشتراكات",
    docs: "موثق", docsVariant: "success", type: "assets",
  },
  {
    name: "خدمات الإنترنت والشبكات", category: "إنترنت · شبكات", status: "نشط", statusVariant: "success",
    ops: 2, total: "3,500", totalNum: 3500, items: "تجهيز شبكة إنترنت، اشتراكات",
    docs: "موثق", docsVariant: "success", type: "assets",
  },
  {
    name: "ويبي الأفندي (دعاية)", category: "تصوير · دعاية وإعلان", status: "منتهي", statusVariant: "warning",
    ops: 2, total: "3,000", totalNum: 3000, items: "تصوير لايف ستايل 15 صورة، دعاية",
    docs: "متوفر البيانات", docsVariant: "warning", type: "assets",
  },
  {
    name: "إدارة سوشل ميديا", category: "قوقل ماب · انستقرام · تيك توك", status: "نشط", statusVariant: "success",
    ops: 1, total: "5,000", totalNum: 5000, items: "إدارة حسابات ديسمبر 2025 ويناير 2026",
    docs: "متوفر البيانات", docsVariant: "warning", type: "assets",
  },
  {
    name: "شركة الكهرباء", category: "كهرباء · عداد", status: "نشط", statusVariant: "success",
    ops: 10, total: "7,054", totalNum: 7054, items: "فواتير كهرباء، تركيب عداد",
    docs: "موثق", docsVariant: "success", type: "assets",
  },

  // ═══ موردون تموينيون ═══
  {
    name: "مورد المواد التموينية", category: "صوصات · مواد غذائية", status: "نشط", statusVariant: "success",
    ops: 21, total: "9,337", totalNum: 9337, items: "صوصات، سمك، مواد تموينية متنوعة",
    docs: "موثق", docsVariant: "success", type: "supplies",
  },
];

const Suppliers = () => {
  const [activeTab, setActiveTab] = useState<"all" | SupplierType>("all");

  const filtered = activeTab === "all" ? suppliers : suppliers.filter(s => s.type === activeTab);
  const assetSuppliers = suppliers.filter(s => s.type === "assets");
  const supplySuppliers = suppliers.filter(s => s.type === "supplies");
  const assetTotal = assetSuppliers.reduce((a, s) => a + s.totalNum, 0);
  const supplyTotal = supplySuppliers.reduce((a, s) => a + s.totalNum, 0);

  const tabs: { key: "all" | SupplierType; label: string; count: number }[] = [
    { key: "all", label: "الكل", count: suppliers.length },
    { key: "assets", label: "موردون الأصول", count: assetSuppliers.length },
    { key: "supplies", label: "الموارد التموينية", count: supplySuppliers.length },
  ];

  return (
    <div>
      <PageHeader title="الموردون" subtitle="جهات التوريد الحقيقية من كشف المصروفات" badge={`${suppliers.length} مورد`} />

      <div className="grid grid-cols-4 gap-3 mb-4">
        <MetricCard label="إجمالي التوريدات" value={(assetTotal + supplyTotal).toLocaleString()} sub="ريال سعودي · من أصل 292,405 مصروفات تأسيسية" />
        <MetricCard label="موردون الأصول" value={assetTotal.toLocaleString()} sub={`${assetSuppliers.length} مورد · ديكور وآلات وعقار`} subColor="warning" />
        <MetricCard label="الموارد التموينية" value={supplyTotal.toLocaleString()} sub={`${supplySuppliers.length} مورد · مواد غذائية`} subColor="success" />
        <MetricCard label="عدد العمليات" value={suppliers.reduce((a, s) => a + s.ops, 0).toString()} sub="عملية موثقة" subColor="success" />
      </div>

      {/* تابات التصنيف */}
      <div className="flex gap-1 mb-4 bg-surface border border-border rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === t.key
                ? "bg-primary text-primary-foreground"
                : "text-gray hover:text-foreground hover:bg-background"
            }`}
          >
            {t.label} <span className="opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {/* عنوان القسم */}
      {activeTab !== "all" && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[16px]">{activeTab === "assets" ? "🏗️" : "🥩"}</span>
          <div>
            <div className="text-[13px] font-bold text-foreground">
              {activeTab === "assets" ? "موردون الأصول" : "الموارد التموينية"}
            </div>
            <div className="text-[9px] text-gray-light">
              {activeTab === "assets"
                ? "الديكور، الآلات، العقار، التراخيص، الهوية البصرية، الشبكات، والدعاية"
                : "المواد الغذائية، الصوصات، اللحوم، والمستلزمات التشغيلية اليومية"}
            </div>
          </div>
        </div>
      )}

      {filtered.map((s) => (
        <div key={s.name} className={`bg-surface rounded-lg p-4 mb-2.5 border border-border transition-colors hover:border-primary/30 ${
          s.type === "assets" ? "border-r-2 border-r-orange-500/50" : "border-r-2 border-r-green-500/50"
        }`}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[14px]">{s.type === "assets" ? "🏗️" : "🥩"}</span>
              <div>
                <div className="text-[14px] font-bold text-foreground">{s.name}</div>
                <div className="text-[10px] text-gray-light mt-0.5 font-medium">{s.category}</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              <StatusBadge variant={s.type === "assets" ? "warning" : "success"}>
                {s.type === "assets" ? "أصول" : "تموين"}
              </StatusBadge>
              <StatusBadge variant={s.docsVariant}>{s.docs}</StatusBadge>
              <StatusBadge variant={s.statusVariant}>{s.status}</StatusBadge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            <div>
              <div className="text-[9px] text-gray-light font-semibold uppercase tracking-wide mb-1">عدد العمليات</div>
              <div className="text-[13px] font-bold text-foreground">{s.ops}</div>
            </div>
            <div>
              <div className="text-[9px] text-gray-light font-semibold uppercase tracking-wide mb-1">إجمالي المبلغ</div>
              <div className="text-[13px] font-bold text-primary">{s.total} ر.س</div>
            </div>
            <div>
              <div className="text-[9px] text-gray-light font-semibold uppercase tracking-wide mb-1">الأصناف</div>
              <div className="text-[11px] text-gray font-medium">{s.items}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Suppliers;
