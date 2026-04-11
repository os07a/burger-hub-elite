import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

type SupplierType = "assets" | "supplies";

interface Invoice {
  date: string;
  invoiceNo: string;
  amount: number;
  items: string;
}

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
  invoices?: Invoice[];
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
  {
    name: "معدات المطاعم والمطابخ (الرائد)", category: "قطع غيار · معدات مطبخ", status: "نشط", statusVariant: "success",
    ops: 1, total: "950", totalNum: 950, items: "شواية برجر كهرباء 70سم، علب كاتشب برأس",
    docs: "موثق", docsVariant: "success", type: "assets",
    invoices: [
      { date: "2026-03-30", invoiceNo: "1900", amount: 950, items: "شواية برجر كهرباء 70سم (808.70 ر.س) + علب كاتشب (8.70 ر.س)" },
    ],
  },

  // ═══ موردون تموينيون ═══
  {
    name: "مؤسسة الحلول المساندة التجارية", category: "لحوم · بطاطس · صوصات · أجبان", status: "نشط", statusVariant: "success",
    ops: 11, total: "7,500", totalNum: 7500,
    items: "لحم بريسكت بلاك أنجوس، كروك أن بطاطس، جبن شرائح أمريكي، مايونيز هاينز، صلصة باربكيو، هامبرجر جبن شرائح",
    docs: "موثق", docsVariant: "success", type: "supplies",
    invoices: [
      { date: "2026-03-08", invoiceNo: "INV41523", amount: 410.41, items: "مايونيز كريمي كلاسيك 3.7كجم، قلو صلصة باربكيو 25.4كجم، جبن شرائح أمريكي 184*8، برشلي صلصة ورشيستر 15أونز" },
      { date: "2026-03-15", invoiceNo: "INV41999", amount: 1630.76, items: "كروك أن بطاطس 7*7 بالقشر 2.5كجم، شهد خليط زبدة قوالب 2.5كجم، برايد جبن شرائح أمريكي 184*8، إيبوتي لحم بريسكت بلاك أنجوس استرالي" },
      { date: "2026-03-26", invoiceNo: "INV42810", amount: 334.65, items: "كروك أن بطاطس 7*7 بالقشر 2.5كجم ×3" },
      { date: "2026-03-30", invoiceNo: "INV43080", amount: 2606.28, items: "ريفيرينا لحم بريسكت بلاك أنجوس 19.3كجم، ريفيرينا لحم شاك بلاك أنجوس 24.9كجم، كروك أن بطاطس ×3، جبن شرائح أمريكي" },
      { date: "2026-03-31", invoiceNo: "INV43151", amount: 264.50, items: "هاينز مايونيز كريمي كلاسيك 3.7كجم ×1" },
      { date: "2026-04-02", invoiceNo: "INV43333", amount: 422.34, items: "كروك أن بطاطس ×3، بيدر كاتشب جالون 5كجم، هلو صلصة باربكيو 25.4كجم" },
      { date: "2026-04-04", invoiceNo: "INV43489", amount: 767.48, items: "ريفيرينا لحم بريسكت بلاك أنجوس 9.96كجم، جبن شرائح أمريكي، شهد خليط زبدة قوالب 2.5كجم" },
      { date: "2026-04-07", invoiceNo: "INV43772", amount: 401.35, items: "هاينز مايونيز كريمي كلاسيك 3.7كجم، هامبرجر جبن شرائح أصفر 84*8" },
      { date: "2026-04-09", invoiceNo: "—", amount: 111.55, items: "كروك أن بطاطس 7*7 بالقشر 2.5كجم ×1" },
    ],
  },
  {
    name: "شركة السلال المنتجة التجارية (Baskets)", category: "مشروبات · زيوت · ورقيات", status: "نشط", statusVariant: "success",
    ops: 10, total: "3,380", totalNum: 3380,
    items: "بيبسي قوارير 250مل، بيبسي دايت، سفن أب، زيت الرائد تنك 17لتر، ورق زعتر أوريقانو",
    docs: "موثق", docsVariant: "success", type: "supplies",
    invoices: [
      { date: "2026-03-12", invoiceNo: "2601039184", amount: 304.01, items: "بيبسي قوارير 250مل ×4 CTN، زيت الرائد تنك 17لتر ×1" },
      { date: "2026-03-15", invoiceNo: "2601040749", amount: 486.02, items: "زيت الرائد تنك 17لتر، بيبسي دايت قوارير، سفن أب قوارير، بيبسي قوارير، ورق زعتر أوريقانو فريشلي" },
      { date: "2026-03-27", invoiceNo: "2601047203", amount: 308.03, items: "زيت الرائد تنك 17لتر ×1، بيبسي قوارير 250مل ×4" },
      { date: "2026-03-30", invoiceNo: "2601048729", amount: 622.05, items: "بيبسي قوارير ×4، زبدة شهد 2.5كجم ×3، نشاء ذرة فوستر ×3، ملح سالسا 700جرام، كتشب شقرات بيزر 1000، زيت الرائد تنك 17لتر ×2" },
      { date: "2026-04-02", invoiceNo: "2601050482", amount: 460.02, items: "بيبسي قوارير ×4، بيبسي دايت قوارير ×3، زيت الرائد تنك 17لتر ×1" },
      { date: "2026-04-04", invoiceNo: "2601051722", amount: 250.01, items: "بيبسي قوارير 250مل ×5 CTN" },
      { date: "2026-04-04", invoiceNo: "2601051723", amount: 50.00, items: "بيبسي قوارير 250مل ×1 CTN" },
    ],
  },
  {
    name: "ثلاجة شحاته للتموين", category: "لحوم بقر مستوردة", status: "نشط", statusVariant: "success",
    ops: 1, total: "815", totalNum: 815,
    items: "Beef chuck roll Angus Pure AUS (لحم بقر أنجوس استرالي)",
    docs: "موثق", docsVariant: "success", type: "supplies",
    invoices: [
      { date: "2026-03-12", invoiceNo: "101814", amount: 814.98, items: "Beef chuck roll Angus Pure AUS — 16.480 كجم × 43 ر.س/كجم" },
    ],
  },
  {
    name: "شركة مسارات النهضة للتجارة", category: "دجاج طازج", status: "نشط", statusVariant: "success",
    ops: 4, total: "886", totalNum: 886,
    items: "أنصاف صدور دجاج طرية بدون عظم وبدون جلد ساديا 2كجم",
    docs: "موثق", docsVariant: "success", type: "supplies",
    invoices: [
      { date: "2026-03-28", invoiceNo: "21847", amount: 220.50, items: "أنصاف صدور دجاج طرية بدون عظم وبدون جلد ساديا 2كجم ×5" },
      { date: "2026-04-02", invoiceNo: "—", amount: 224.41, items: "أنصاف صدور دجاج طرية بدون عظم وبدون جلد ساديا 2كجم" },
      { date: "2026-04-07", invoiceNo: "25121", amount: 220.50, items: "أنصاف صدور دجاج طرية بدون عظم وبدون جلد ساديا 2كجم" },
      { date: "2026-04-09", invoiceNo: "25751", amount: 220.50, items: "أنصاف صدور دجاج طرية بدون عظم وبدون جلد ساديا 2كجم" },
    ],
  },
  {
    name: "شركة الخليج الغربية للاستيراد (Gulfwest)", category: "لحوم مجمدة · بطاطس مقلية", status: "نشط", statusVariant: "success",
    ops: 1, total: "2,114", totalNum: 2114,
    items: "بطاطس مقلية شوسترنق فرايز 7*7، لحم بقري بريسكت كامل مجمد، لحم بقر برجر بلدي مجمد",
    docs: "موثق", docsVariant: "success", type: "supplies",
    invoices: [
      { date: "2026-04-06", invoiceNo: "302604218l", amount: 2113.70, items: "Ever Crisp بطاطس مقلية 7*7 ×2 BOX (198 ر.س)، لحم بقري بريسكت كامل MRA MB2 مجمد 19كجم (722 ر.س)، لحم بقر بولار بلايد برجر بلدي مجمد 23.2كجم (928 ر.س)" },
    ],
  },
  {
    name: "مؤسسة المروانى التجارية", category: "بهارات · توابل", status: "نشط", statusVariant: "success",
    ops: 2, total: "91", totalNum: 91,
    items: "فلفل أبيض مجفف، تورد ناعم صيني، فلفل بابريكا ناعم بارد، فلفل بابريكا خشن",
    docs: "موثق", docsVariant: "success", type: "supplies",
    invoices: [
      { date: "2026-03-30", invoiceNo: "261800244484", amount: 60.03, items: "فلفل أبيض مجفف 435جم، تورد ناعم صيني 65جم، فلفل بابريكا ناعم بارد 525جم، فلفل بابريكا خشن 525جم" },
      { date: "2026-03-30", invoiceNo: "261800245420", amount: 30.59, items: "فلفل أسود ناعم 665جم" },
    ],
  },
  {
    name: "إبداع الأسماك", category: "أسماك طازجة · روبيان", status: "نشط", statusVariant: "success",
    ops: 1, total: "250", totalNum: 250,
    items: "سالمون طازج، روبيان (هومار)",
    docs: "موثق", docsVariant: "success", type: "supplies",
    invoices: [
      { date: "2026-04-04", invoiceNo: "0311", amount: 250, items: "Salmon (سلمون) — 150 ر.س، Homar (روبيان) — 90 ر.س" },
    ],
  },
  {
    name: "شركة سلة البيان لتجارة الجملة", category: "مستلزمات تغليف", status: "نشط", statusVariant: "success",
    ops: 1, total: "40", totalNum: 40,
    items: "ميكروف مستطيل 28 ونص مقسم 150 حبة",
    docs: "موثق", docsVariant: "success", type: "supplies",
    invoices: [
      { date: "2026-03-30", invoiceNo: "261003195459", amount: 40, items: "ميكروف مستطيل 28 ونص مقسم 150 حبة ×2 ربطة" },
    ],
  },
  {
    name: "شركة التكامل الذهبية التجارية", category: "أدوات مطبخ استيل", status: "نشط", statusVariant: "success",
    ops: 1, total: "140", totalNum: 140,
    items: "ثقالة استيل مدور م13 هندي، حوض موزع زبدة رول",
    docs: "موثق", docsVariant: "success", type: "supplies",
    invoices: [
      { date: "2026-03-31", invoiceNo: "6701001909", amount: 140, items: "ثقالة استيل مدور م13 هندي (33.10 ر.س)، حوض موزع زبدة رول (90 ر.س)" },
    ],
  },
  {
    name: "مخازن أغصان طيبة", category: "لفائف تغليف", status: "نشط", statusVariant: "success",
    ops: 1, total: "55", totalNum: 55,
    items: "ماكس رول تركي 300 متر عدد 6",
    docs: "موثق", docsVariant: "success", type: "supplies",
    invoices: [
      { date: "2026-04-04", invoiceNo: "260060014114", amount: 55, items: "ماكس رول تركي 300 متر عدد 6 ×1 باكة" },
    ],
  },
];

const Suppliers = () => {
  const [activeTab, setActiveTab] = useState<"all" | SupplierType>("all");
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

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
        <MetricCard label="الموارد التموينية" value={supplyTotal.toLocaleString()} sub={`${supplySuppliers.length} مورد · لحوم ومشروبات وبهارات`} subColor="success" />
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
                : "اللحوم، المشروبات، البهارات، الأسماك، الأجبان، والمستلزمات التشغيلية اليومية"}
            </div>
          </div>
        </div>
      )}

      {filtered.map((s) => (
        <div key={s.name} className={`bg-surface rounded-lg p-4 mb-2.5 border border-border transition-colors hover:border-primary/30 ${
          s.type === "assets" ? "border-r-2 border-r-orange-500/50" : "border-r-2 border-r-green-500/50"
        }`}>
          <div className="flex justify-between items-start mb-3">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => s.invoices && setExpandedSupplier(expandedSupplier === s.name ? null : s.name)}
            >
              <span className="text-[14px]">{s.type === "assets" ? "🏗️" : "🥩"}</span>
              <div>
                <div className="text-[14px] font-bold text-foreground flex items-center gap-1.5">
                  {s.name}
                  {s.invoices && (
                    <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {s.invoices.length} فاتورة
                    </span>
                  )}
                </div>
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

          {/* تفصيل الفواتير */}
          {s.invoices && expandedSupplier === s.name && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-[10px] font-bold text-gray-light mb-2">📋 سجل الفواتير</div>
              <div className="space-y-1.5">
                {s.invoices.map((inv, i) => (
                  <div key={i} className="flex items-center justify-between bg-background rounded-md px-3 py-2 text-[11px]">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-gray-light font-mono text-[10px] w-[75px]">{inv.date}</span>
                      <span className="text-gray font-mono text-[9px] w-[90px]">#{inv.invoiceNo}</span>
                      <span className="text-foreground flex-1 truncate">{inv.items}</span>
                    </div>
                    <span className="font-bold text-primary mr-3 whitespace-nowrap">{inv.amount.toLocaleString()} ر.س</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Suppliers;
