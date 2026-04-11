import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronDown, FileText, BarChart3, X, TrendingDown, TrendingUp, Minus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import RiyalIcon from "@/components/ui/RiyalIcon";

type SupplierType = "assets" | "supplies";

interface Invoice {
  date: string;
  invoiceNo: string;
  amount: number;
  items: string;
}

interface MarketInsight {
  avgMarketPrice: number;
  yourPrice: number;
  unit: string;
  item: string;
  verdict: "أرخص" | "سعر السوق" | "أغلى";
  impactNote: string;
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
  marketInsights?: MarketInsight[];
  costImpact?: string;
  smartTip?: string;
}

const suppliers: Supplier[] = [
  {
    name: "مؤسسة الحلول المساندة التجارية", category: "لحوم · بطاطس · صوصات · أجبان", status: "نشط", statusVariant: "success",
    ops: 11, total: "7,500", totalNum: 7500,
    items: "لحم بريسكت بلاك أنجوس، كروك أن بطاطس، جبن شرائح أمريكي، مايونيز هاينز، صلصة باربكيو، هامبرجر جبن شرائح",
    docs: "موثق", docsVariant: "success", type: "supplies",
    costImpact: "يمثل 49% من تكلفة التموين · المورد الرئيسي للحوم والبطاطس",
    smartTip: "سعر البريسكت أنجوس (38 ر.س/كجم) أقل من سعر السوق. التمسك بهذا المورد يوفّر ~200 ر.س شهرياً",
    marketInsights: [
      { item: "بريسكت بلاك أنجوس", yourPrice: 38, avgMarketPrice: 43, unit: "ر.س/كجم", verdict: "أرخص", impactNote: "توفير 5 ر.س/كجم = ~200 ر.س شهرياً" },
      { item: "بطاطس مقلية 7×7", yourPrice: 111, avgMarketPrice: 115, unit: "ر.س/كرتون", verdict: "أرخص", impactNote: "توفير بسيط 4 ر.س/كرتون" },
      { item: "مايونيز هاينز 3.7كجم", yourPrice: 264, avgMarketPrice: 250, unit: "ر.س/عبوة", verdict: "أغلى", impactNote: "أغلى بـ14 ر.س · ابحث عن بديل أو فاوض" },
      { item: "جبن شرائح أمريكي", yourPrice: 72, avgMarketPrice: 70, unit: "ر.س/باكة", verdict: "سعر السوق", impactNote: "سعر مطابق تقريباً" },
    ],
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
    name: "شركة السلال المنتجة التجارية", category: "مشروبات · زيوت · ورقيات", status: "نشط", statusVariant: "success",
    ops: 10, total: "3,380", totalNum: 3380,
    items: "بيبسي قوارير 250مل، بيبسي دايت، سفن أب، زيت الرائد تنك 17لتر، ورق زعتر أوريقانو",
    docs: "موثق", docsVariant: "success", type: "supplies",
    costImpact: "يمثل 22% من تكلفة التموين · المورد الرئيسي للمشروبات والزيوت",
    smartTip: "زيت الرائد 17لتر (72 ر.س) أغلى من البدائل المحلية. فكّر بتجربة زيت عافية بالجملة",
    marketInsights: [
      { item: "بيبسي قوارير 250مل (كرتون)", yourPrice: 50, avgMarketPrice: 48, unit: "ر.س/كرتون", verdict: "سعر السوق", impactNote: "سعر قريب من السوق" },
      { item: "زيت الرائد تنك 17لتر", yourPrice: 72, avgMarketPrice: 65, unit: "ر.س/تنك", verdict: "أغلى", impactNote: "أغلى بـ7 ر.س/تنك · ~28 ر.س شهرياً زيادة" },
    ],
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
    costImpact: "5% من تكلفة التموين · مورد بديل للحوم",
    smartTip: "سعر الكجم (43 ر.س) أعلى من الحلول المساندة (38 ر.س). استخدم كبديل طوارئ فقط",
    marketInsights: [
      { item: "لحم أنجوس Chuck Roll", yourPrice: 43, avgMarketPrice: 43, unit: "ر.س/كجم", verdict: "سعر السوق", impactNote: "سعر مطابق للسوق لكن الحلول المساندة أرخص بـ5 ر.س" },
    ],
    invoices: [
      { date: "2026-03-12", invoiceNo: "101814", amount: 814.98, items: "Beef chuck roll Angus Pure AUS — 16.480 كجم × 43 ر.س/كجم" },
    ],
  },
  {
    name: "شركة مسارات النهضة للتجارة", category: "دجاج طازج", status: "نشط", statusVariant: "success",
    ops: 4, total: "886", totalNum: 886,
    items: "أنصاف صدور دجاج طرية بدون عظم وبدون جلد ساديا 2كجم",
    docs: "موثق", docsVariant: "success", type: "supplies",
    costImpact: "6% من تكلفة التموين · مورد الدجاج الوحيد",
    smartTip: "سعر صدور الدجاج (44 ر.س/كجم) منافس. ساديا ماركة موثوقة ومتاحة بالجملة",
    marketInsights: [
      { item: "صدور دجاج ساديا 2كجم", yourPrice: 44, avgMarketPrice: 46, unit: "ر.س/باكة", verdict: "أرخص", impactNote: "توفير 2 ر.س/باكة = ~32 ر.س شهرياً" },
    ],
    invoices: [
      { date: "2026-03-28", invoiceNo: "21847", amount: 220.50, items: "أنصاف صدور دجاج طرية بدون عظم وبدون جلد ساديا 2كجم ×5" },
      { date: "2026-04-02", invoiceNo: "—", amount: 224.41, items: "أنصاف صدور دجاج طرية بدون عظم وبدون جلد ساديا 2كجم" },
      { date: "2026-04-07", invoiceNo: "25121", amount: 220.50, items: "أنصاف صدور دجاج طرية بدون عظم وبدون جلد ساديا 2كجم" },
      { date: "2026-04-09", invoiceNo: "25751", amount: 220.50, items: "أنصاف صدور دجاج طرية بدون عظم وبدون جلد ساديا 2كجم" },
    ],
  },
  {
    name: "شركة الخليج الغربية للاستيراد", category: "لحوم مجمدة · بطاطس مقلية", status: "نشط", statusVariant: "success",
    ops: 1, total: "2,114", totalNum: 2114,
    items: "بطاطس مقلية شوسترنق فرايز 7*7، لحم بقري بريسكت كامل مجمد، لحم بقر برجر بلدي مجمد",
    docs: "موثق", docsVariant: "success", type: "supplies",
    costImpact: "14% من تكلفة التموين · مورد بديل للحوم والبطاطس بالجملة",
    smartTip: "سعر البريسكت (38 ر.س/كجم) منافس ومشابه للحلول المساندة. البطاطس (99 ر.س/كرتون) أرخص من الكل",
    marketInsights: [
      { item: "بطاطس مقلية 7×7 (كرتون)", yourPrice: 99, avgMarketPrice: 115, unit: "ر.س/كرتون", verdict: "أرخص", impactNote: "توفير 16 ر.س/كرتون · ممتاز للكميات الكبيرة" },
      { item: "بريسكت بقري كامل مجمد", yourPrice: 38, avgMarketPrice: 43, unit: "ر.س/كجم", verdict: "أرخص", impactNote: "سعر ممتاز مقارنة بالسوق" },
      { item: "برجر بلدي مجمد", yourPrice: 40, avgMarketPrice: 42, unit: "ر.س/كجم", verdict: "أرخص", impactNote: "توفير بسيط 2 ر.س/كجم" },
    ],
    invoices: [
      { date: "2026-04-06", invoiceNo: "302604218l", amount: 2113.70, items: "Ever Crisp بطاطس مقلية 7*7 ×2 BOX (198 ر.س)، لحم بقري بريسكت كامل MRA MB2 مجمد 19كجم (722 ر.س)، لحم بقر بولار بلايد برجر بلدي مجمد 23.2كجم (928 ر.س)" },
    ],
  },
  {
    name: "مؤسسة المروانى التجارية", category: "بهارات · توابل", status: "نشط", statusVariant: "success",
    ops: 2, total: "91", totalNum: 91,
    items: "فلفل أبيض مجفف، تورد ناعم صيني، فلفل بابريكا ناعم بارد، فلفل بابريكا خشن",
    docs: "موثق", docsVariant: "success", type: "supplies",
    costImpact: "أقل من 1% من التكلفة · مصروف ثانوي",
    smartTip: "أسعار البهارات ممتازة ومنافسة. المروانى من أرخص محلات التوابل بالجملة في المنطقة",
    marketInsights: [
      { item: "فلفل أبيض مجفف 435جم", yourPrice: 15, avgMarketPrice: 18, unit: "ر.س", verdict: "أرخص", impactNote: "توفير 3 ر.س/عبوة" },
    ],
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
    costImpact: "2% من تكلفة التموين · مورد تخصصي",
    smartTip: "سعر السلمون (150 ر.س) أعلى من سوق الجملة. فاوض أو ابحث عن مورد سمك بالجملة",
    marketInsights: [
      { item: "سالمون طازج (كجم تقريبي)", yourPrice: 75, avgMarketPrice: 60, unit: "ر.س/كجم", verdict: "أغلى", impactNote: "أغلى بـ15 ر.س/كجم · ابحث عن بديل بالجملة" },
      { item: "روبيان (هومار)", yourPrice: 90, avgMarketPrice: 85, unit: "ر.س/كجم", verdict: "سعر السوق", impactNote: "سعر مقبول" },
    ],
    invoices: [
      { date: "2026-04-04", invoiceNo: "0311", amount: 250, items: "Salmon (سلمون) — 150 ر.س، Homar (روبيان) — 90 ر.س" },
    ],
  },
  {
    name: "شركة سلة البيان لتجارة الجملة", category: "مستلزمات تغليف", status: "نشط", statusVariant: "success",
    ops: 1, total: "40", totalNum: 40,
    items: "ميكروف مستطيل 28 ونص مقسم 150 حبة",
    docs: "موثق", docsVariant: "success", type: "supplies",
    costImpact: "أقل من 1% · مصروف تشغيلي ثانوي",
    smartTip: "سعر مناسب للتغليف بالجملة",
    invoices: [
      { date: "2026-03-30", invoiceNo: "261003195459", amount: 40, items: "ميكروف مستطيل 28 ونص مقسم 150 حبة ×2 ربطة" },
    ],
  },
  {
    name: "شركة التكامل الذهبية التجارية", category: "أدوات مطبخ استيل", status: "نشط", statusVariant: "success",
    ops: 1, total: "140", totalNum: 140,
    items: "ثقالة استيل مدور م13 هندي، حوض موزع زبدة رول",
    docs: "موثق", docsVariant: "success", type: "supplies",
    costImpact: "أقل من 1% · أدوات تشغيلية",
    smartTip: "سعر مقبول لأدوات المطبخ الاستيل",
    invoices: [
      { date: "2026-03-31", invoiceNo: "6701001909", amount: 140, items: "ثقالة استيل مدور م13 هندي (33.10 ر.س)، حوض موزع زبدة رول (90 ر.س)" },
    ],
  },
  {
    name: "مخازن أغصان طيبة", category: "لفائف تغليف", status: "نشط", statusVariant: "success",
    ops: 1, total: "55", totalNum: 55,
    items: "ماكس رول تركي 300 متر عدد 6",
    docs: "موثق", docsVariant: "success", type: "supplies",
    costImpact: "أقل من 1% · مصروف تشغيلي ثانوي",
    smartTip: "سعر جيد للفائف بالجملة",
    invoices: [
      { date: "2026-04-04", invoiceNo: "260060014114", amount: 55, items: "ماكس رول تركي 300 متر عدد 6 ×1 باكة" },
    ],
  },
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
];

// ── Invoice Modal ──
const InvoiceModal = ({ supplier, onClose }: { supplier: Supplier; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden m-4"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h3 className="text-[15px] font-bold text-foreground">{supplier.name}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{supplier.invoices?.length} فاتورة · إجمالي {supplier.total} ر.س</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
          <X size={14} className="text-muted-foreground" />
        </button>
      </div>

      {/* Invoices */}
      <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2">
        {supplier.invoices?.map((inv, i) => (
          <div key={i} className="ios-card !p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">{inv.date}</span>
                <span className="text-[10px] text-muted-foreground font-mono">#{inv.invoiceNo}</span>
              </div>
              <span className="text-[14px] font-bold text-primary flex items-center gap-1">
                {inv.amount.toLocaleString()} <RiyalIcon size={10} />
              </span>
            </div>
            <p className="text-[11px] text-foreground leading-relaxed">{inv.items}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Market Insights Modal ──
const InsightsModal = ({ supplier, onClose }: { supplier: Supplier; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden m-4"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h3 className="text-[15px] font-bold text-foreground">تحليل ذكي</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">مقارنة أسعارك بالسوق السعودي</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
          <X size={14} className="text-muted-foreground" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2.5">
        {supplier.marketInsights?.map((ins, i) => {
          const diff = ins.yourPrice - ins.avgMarketPrice;
          const pct = ((diff / ins.avgMarketPrice) * 100).toFixed(0);
          return (
            <div key={i} className="ios-card !p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-foreground">{ins.item}</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  ins.verdict === "أرخص" ? "bg-success/15 text-success" :
                  ins.verdict === "أغلى" ? "bg-danger/15 text-danger" :
                  "bg-info/15 text-info"
                }`}>
                  {ins.verdict === "أرخص" ? <TrendingDown size={10} className="inline ml-1" /> :
                   ins.verdict === "أغلى" ? <TrendingUp size={10} className="inline ml-1" /> :
                   <Minus size={10} className="inline ml-1" />}
                  {ins.verdict}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-muted rounded-lg p-2.5 text-center">
                  <div className="text-[9px] text-muted-foreground mb-1">سعرك</div>
                  <div className="text-[14px] font-bold text-foreground">{ins.yourPrice} <span className="text-[9px] text-muted-foreground font-normal">{ins.unit}</span></div>
                </div>
                <div className="bg-muted rounded-lg p-2.5 text-center">
                  <div className="text-[9px] text-muted-foreground mb-1">متوسط السوق</div>
                  <div className="text-[14px] font-bold text-foreground">{ins.avgMarketPrice} <span className="text-[9px] text-muted-foreground font-normal">{ins.unit}</span></div>
                </div>
              </div>

              <div className={`text-[10px] px-2.5 py-1.5 rounded-lg ${
                ins.verdict === "أرخص" ? "bg-success/10 text-success" :
                ins.verdict === "أغلى" ? "bg-danger/10 text-danger" :
                "bg-info/10 text-info"
              }`}>
                {diff !== 0 && <span className="font-bold">{diff > 0 ? "+" : ""}{pct}% </span>}
                {ins.impactNote}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// ── Supplier Card ──
const SupplierCard = ({
  s,
  onViewInvoices,
  onViewInsights,
}: {
  s: Supplier;
  onViewInvoices: () => void;
  onViewInsights: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ios-card animate-fade-in">
      {/* Main Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[16px] shrink-0 ${
            s.type === "supplies" ? "bg-success/10" : "bg-warning/10"
          }`}>
            {s.type === "supplies" ? "🥩" : "🏗️"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-foreground truncate">{s.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.category}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-left ml-3">
            <div className="text-[15px] font-bold text-primary flex items-center gap-1">
              {s.total} <RiyalIcon size={10} />
            </div>
            <div className="text-[9px] text-muted-foreground">{s.ops} عملية</div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-all"
          >
            <ChevronDown size={13} className={`text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-border space-y-3">
          {/* Status + Tags */}
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge variant={s.statusVariant}>{s.status}</StatusBadge>
            <StatusBadge variant={s.docsVariant}>{s.docs}</StatusBadge>
            <StatusBadge variant={s.type === "supplies" ? "success" : "warning"}>
              {s.type === "supplies" ? "تموين" : "أصول"}
            </StatusBadge>
          </div>

          {/* Cost Impact */}
          {s.costImpact && (
            <div className="text-[10px] text-muted-foreground bg-muted rounded-lg px-3 py-2">
              📌 {s.costImpact}
            </div>
          )}

          {/* Smart Tip */}
          {s.smartTip && (
            <div className="text-[10px] bg-primary/8 text-primary rounded-lg px-3 py-2 border border-primary/15">
              💡 {s.smartTip}
            </div>
          )}

          {/* Items */}
          <div>
            <div className="text-[9px] text-muted-foreground font-semibold mb-1">الأصناف</div>
            <div className="text-[11px] text-foreground leading-relaxed">{s.items}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {s.invoices && s.invoices.length > 0 && (
              <button
                onClick={onViewInvoices}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-2 rounded-lg transition-colors"
              >
                <FileText size={12} />
                عرض الفواتير ({s.invoices.length})
              </button>
            )}
            {s.marketInsights && s.marketInsights.length > 0 && (
              <button
                onClick={onViewInsights}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-accent-foreground bg-accent/15 hover:bg-accent/25 px-3 py-2 rounded-lg transition-colors"
              >
                <BarChart3 size={12} />
                تحليل ذكي
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ──
const Suppliers = () => {
  const [activeTab, setActiveTab] = useState<"all" | SupplierType>("all");
  const [invoiceModal, setInvoiceModal] = useState<Supplier | null>(null);
  const [insightsModal, setInsightsModal] = useState<Supplier | null>(null);

  const filtered = activeTab === "all" ? suppliers : suppliers.filter(s => s.type === activeTab);
  const supplySuppliers = suppliers.filter(s => s.type === "supplies");
  const assetSuppliers = suppliers.filter(s => s.type === "assets");
  const supplyTotal = supplySuppliers.reduce((a, s) => a + s.totalNum, 0);
  const assetTotal = assetSuppliers.reduce((a, s) => a + s.totalNum, 0);

  const allInsights = supplySuppliers.flatMap(s => s.marketInsights || []);
  const cheaperCount = allInsights.filter(i => i.verdict === "أرخص").length;
  const expensiveCount = allInsights.filter(i => i.verdict === "أغلى").length;

  const COLORS = ["hsl(var(--success))", "hsl(var(--info))", "hsl(var(--warning))", "hsl(var(--danger))", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];
  const chartData = supplySuppliers
    .map(s => ({ name: s.name.length > 18 ? s.name.slice(0, 16) + "…" : s.name, value: s.totalNum }))
    .sort((a, b) => b.value - a.value);

  const tabs: { key: "all" | SupplierType; label: string; count: number }[] = [
    { key: "all", label: "الكل", count: suppliers.length },
    { key: "supplies", label: "التموين", count: supplySuppliers.length },
    { key: "assets", label: "الأصول", count: assetSuppliers.length },
  ];

  return (
    <div>
      <PageHeader title="الموردون" subtitle="إدارة ذكية لجهات التوريد والمشتريات" badge={`${suppliers.length} مورد`} />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <MetricCard label="الموارد التموينية" value={supplyTotal.toLocaleString()} sub={`${supplySuppliers.length} مورد`} subColor="success" showRiyal />
        <MetricCard label="موردون الأصول" value={assetTotal.toLocaleString()} sub={`${assetSuppliers.length} مورد`} subColor="warning" showRiyal />
        <MetricCard label="أرخص من السوق" value={cheaperCount.toString()} sub={`من ${allInsights.length} صنف`} subColor="success" />
        <MetricCard label="أغلى من السوق" value={expensiveCount.toString()} sub="يحتاج مفاوضة" subColor="danger" />
      </div>

      {/* Chart - compact */}
      {(activeTab === "all" || activeTab === "supplies") && (
        <div className="ios-card mb-5">
          <div className="text-[12px] font-bold text-foreground mb-3">توزيع مصروفات التموين</div>
          <div className="flex items-center gap-6">
            <div className="w-[200px] h-[160px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                    {chartData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()} ر.س`, ""]}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 11, direction: "rtl" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {chartData.slice(0, 6).map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-foreground flex-1 truncate">{d.name}</span>
                  <span className="text-muted-foreground font-mono">{((d.value / supplyTotal) * 100).toFixed(0)}%</span>
                </div>
              ))}
              {chartData.length > 6 && (
                <div className="text-[9px] text-muted-foreground">+{chartData.length - 6} آخرين</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-card border border-border rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
              activeTab === t.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Supplier List */}
      <div className="space-y-2.5">
        {filtered.map(s => (
          <SupplierCard
            key={s.name}
            s={s}
            onViewInvoices={() => setInvoiceModal(s)}
            onViewInsights={() => setInsightsModal(s)}
          />
        ))}
      </div>

      {/* Modals */}
      {invoiceModal && <InvoiceModal supplier={invoiceModal} onClose={() => setInvoiceModal(null)} />}
      {insightsModal && <InsightsModal supplier={insightsModal} onClose={() => setInsightsModal(null)} />}
    </div>
  );
};

export default Suppliers;
