import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

const filters = [
  { id: "all", label: "الكل" },
  { id: "tax-invoice", label: "فاتورة ضريبية" },
  { id: "invoice", label: "فاتورة" },
  { id: "receipt", label: "إيصال حوالة" },
  { id: "quote", label: "عرض سعر" },
  { id: "approval", label: "اعتماد عهدة" },
  { id: "other", label: "أخرى" },
];

const typeConfig: Record<string, { label: string; variant: "info" | "success" | "warning" | "danger"; icon: string }> = {
  "tax-invoice": { label: "فاتورة ضريبية", variant: "info", icon: "🧾" },
  invoice: { label: "فاتورة", variant: "info", icon: "📄" },
  receipt: { label: "إيصال حوالة", variant: "success", icon: "💳" },
  quote: { label: "عرض سعر", variant: "warning", icon: "📋" },
  approval: { label: "اعتماد عهدة", variant: "success", icon: "✅" },
  other: { label: "أخرى", variant: "danger", icon: "📁" },
};

const months = [
  {
    label: "فبراير 2026", count: 1,
    docs: [
      { type: "invoice", name: "لوح اكريليك وستكرات وايقونات فوق المدخنة", account: "الديكور", amount: "2,240 ر", date: "2 فبراير", status: "موثق", statusVariant: "success" as const, recipient: "أسامة" },
    ],
  },
  {
    label: "يناير 2026", count: 5,
    docs: [
      { type: "other", name: "إدارة حسابات السوشل ميديا (قوقل ماب+انستقرام+تيك توك)", account: "سوشل ميديا", amount: "5,000 ر", date: "28 يناير", status: "بيانات فقط", statusVariant: "warning" as const, recipient: "أسامة" },
      { type: "approval", name: "قريل حديد تصميم مخصص", account: "الآلات والمعدات", amount: "2,300 ر", date: "8 يناير", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "receipt", name: "NFC عند الكاشير لحسابات السوشل ميديا", account: "صيانة تأسيسية", amount: "650 ر", date: "6 يناير", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "approval", name: "جوال ايفون 11 مستعمل", account: "الآلات والمعدات", amount: "500 ر", date: "2 يناير", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "other", name: "مستلزمات الافتتاح", account: "مصروفات الافتتاح", amount: "1,067 ر", date: "1 يناير", status: "بيانات فقط", statusVariant: "warning" as const, recipient: "يونس" },
    ],
  },
  {
    label: "ديسمبر 2025", count: 18,
    docs: [
      { type: "other", name: "راتب يونس ديسمبر 2025", account: "رواتب الموظفين", amount: "3,000 ر", date: "27 ديسمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "quote", name: "إعلان عمر تفاحة — تيك توك", account: "مصروفات الافتتاح", amount: "3,000 ر", date: "26 ديسمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "tax-invoice", name: "مكيفين سبليت", account: "الآلات والمعدات", amount: "3,498 ر", date: "21 ديسمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "tax-invoice", name: "جهاز تطبيق البونات", account: "الآلات والمعدات", amount: "4,995 ر", date: "19 ديسمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "tax-invoice", name: "دفايات", account: "مصروفات الافتتاح", amount: "1,500 ر", date: "21 ديسمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "invoice", name: "أسطوانات غاز عدد 2", account: "مصروفات الافتتاح", amount: "440 ر", date: "21 ديسمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "other", name: "عربون لحساب الورد", account: "مصروفات الافتتاح", amount: "150 ر", date: "23 ديسمبر", status: "بيانات فقط", statusVariant: "warning" as const, recipient: "يونس" },
      { type: "other", name: "عربون مؤسسة نفيخة", account: "مصروفات الافتتاح", amount: "200 ر", date: "23 ديسمبر", status: "بيانات فقط", statusVariant: "warning" as const, recipient: "يونس" },
    ],
  },
  {
    label: "نوفمبر 2025", count: 13,
    docs: [
      { type: "other", name: "راتب يونس (يوليو – نوفمبر 25)", account: "رواتب الموظفين", amount: "8,000 ر", date: "27 نوفمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "other", name: "ريان راتب شهر 11/25", account: "رواتب الموظفين", amount: "3,900 ر", date: "27 نوفمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "other", name: "ميراج راتب شهر 11/25", account: "رواتب الموظفين", amount: "1,500 ر", date: "27 نوفمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "other", name: "شيمول راتب شهر 11/25", account: "رواتب الموظفين", amount: "1,500 ر", date: "27 نوفمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "other", name: "المصور إبراهيم العصاري — فيديو و6 صور منيو", account: "دعاية وإعلان", amount: "1,500 ر", date: "22 نوفمبر", status: "بيانات فقط", statusVariant: "warning" as const, recipient: "يونس" },
      { type: "quote", name: "ستاند استنلس استيل توابل الدجاج واللحم", account: "الآلات والمعدات", amount: "600 ر", date: "11 نوفمبر", status: "موثق", statusVariant: "success" as const, recipient: "أسامة" },
      { type: "other", name: "ترتيب بلوك + كهرباء وتغيير مفاتيح الطبلون", account: "الكهرباء", amount: "1,175 ر", date: "12 نوفمبر", status: "بيانات فقط", statusVariant: "warning" as const, recipient: "يونس" },
    ],
  },
  {
    label: "أكتوبر 2025", count: 8,
    docs: [
      { type: "receipt", name: "رخام ترفنتيونو", account: "الديكور", amount: "2,550 ر", date: "13 أكتوبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "tax-invoice", name: "ثلاجة كاونتر", account: "الآلات والمعدات", amount: "1,500 ر", date: "18 أكتوبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "tax-invoice", name: "شاشة بلازما (العرض الخارجية)", account: "الآلات والمعدات", amount: "1,020 ر", date: "15 أكتوبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "tax-invoice", name: "تابلت المنيو وأغراض", account: "الآلات والمعدات", amount: "765 ر", date: "19 أكتوبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "other", name: "خاصة بمعلمين برجر (تجهيز منيو المطعم)", account: "صيانة تأسيسية", amount: "2,000 ر", date: "9 أكتوبر", status: "بيانات فقط", statusVariant: "warning" as const, recipient: "يونس" },
    ],
  },
  {
    label: "سبتمبر 2025", count: 43,
    docs: [
      { type: "quote", name: "طباعة بوكسات البرجر وتجهيزات الوجبات", account: "الهوية البصرية", amount: "17,192 ر", date: "30 سبتمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "tax-invoice", name: "طاولات ستانلس استيل مع تركيب ألواح", account: "الآلات والمعدات", amount: "5,600 ر", date: "1 سبتمبر", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "quote", name: "مستلزمات كهرباء للمدخنة", account: "الكهرباء", amount: "366 ر", date: "15 سبتمبر", status: "موثق", statusVariant: "success" as const, recipient: "أسامة" },
      { type: "quote", name: "مستلزمات سباكة (سيليكون وطارد حمام)", account: "التشطيبات الإضافية", amount: "110 ر", date: "15 سبتمبر", status: "موثق", statusVariant: "success" as const, recipient: "أسامة" },
      { type: "quote", name: "عمال نظافة", account: "العمال", amount: "150 ر", date: "15 سبتمبر", status: "موثق", statusVariant: "success" as const, recipient: "أسامة" },
    ],
  },
  {
    label: "يوليو 2025", count: 13,
    docs: [
      { type: "other", name: "ويبي الأفندي تصوير لايف ستايل 15 صورة", account: "دعاية وإعلان", amount: "1,500 ر", date: "12 يوليو", status: "بيانات فقط", statusVariant: "warning" as const, recipient: "يونس" },
      { type: "tax-invoice", name: "مغناطيس استيل + صحون استيل وسخانة جبن", account: "صيانة تأسيسية", amount: "1,255 ر", date: "12 يوليو", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "tax-invoice", name: "قلاية كهربائية بوعائين", account: "الآلات والمعدات", amount: "4,849 ر", date: "23 يوليو", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "approval", name: "صوصات", account: "مصروفات تموينية", amount: "880 ر", date: "12 يوليو", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
    ],
  },
  {
    label: "أبريل – يونيو 2025", count: 4,
    docs: [
      { type: "tax-invoice", name: "جريل فحم كهربائي (زهرة)", account: "الآلات والمعدات", amount: "1,900 ر", date: "28 أبريل", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "receipt", name: "رخام أرضية المحل (دفعة 1)", account: "التشطيبات الإضافية", amount: "575 ر", date: "24 مايو", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "receipt", name: "رخام أرضية المحل (دفعة 2)", account: "التشطيبات الإضافية", amount: "699 ر", date: "31 مايو", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
      { type: "tax-invoice", name: "حماصة خبز", account: "الآلات والمعدات", amount: "2,950 ر", date: "10 يونيو", status: "موثق", statusVariant: "success" as const, recipient: "يونس" },
    ],
  },
];

const Archive = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div>
      <PageHeader title="الأرشيف" subtitle="كشف المصروفات التأسيسي الكامل — مطعم برجر هم" badge="204 عملية" />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard label="إجمالي المصروفات" value="292,405" sub="ريال سعودي" />
        <MetricCard label="فواتير ضريبية" value="16" sub="فاتورة موثقة" subColor="success" />
        <MetricCard label="بدون مستندات" value="18" sub="تحتاج مراجعة" subColor="danger" />
        <MetricCard label="الفترة" value="11 شهر" sub="أبريل 2025 – فبراير 2026" subColor="gray" />
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

      {months.map((month) => {
        const filteredDocs = month.docs.filter(
          (doc) => activeFilter === "all" || doc.type === activeFilter
        );
        if (filteredDocs.length === 0) return null;

        return (
          <div key={month.label} className="mb-5">
            <div className="text-[11px] font-bold text-gray mb-2 flex items-center gap-2">
              {month.label}
              <span className="text-[10px] font-semibold bg-background text-gray-light px-2 py-0.5 rounded-lg">{month.count} عملية</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["المستند", "النوع", "الحساب", "المبلغ", "التاريخ", "المستلم", "الحالة"].map((h) => (
                      <th key={h} className="text-[9px] text-gray-light font-semibold uppercase tracking-wide px-2.5 pb-2.5 pt-2.5 text-right border-b-2 border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc, i) => {
                    const tc = typeConfig[doc.type] || typeConfig.other;
                    return (
                      <tr key={i} className="hover:bg-background/50">
                        <td className="px-2.5 py-2.5 border-b border-border">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center text-[14px] flex-shrink-0">{tc.icon}</div>
                            <span className="font-bold text-foreground text-[11px] leading-tight">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 border-b border-border"><StatusBadge variant={tc.variant} className="text-[9px]">{tc.label}</StatusBadge></td>
                        <td className="px-2.5 py-2.5 border-b border-border text-gray text-[11px]">{doc.account}</td>
                        <td className="px-2.5 py-2.5 border-b border-border font-bold text-foreground text-[12px]">{doc.amount}</td>
                        <td className="px-2.5 py-2.5 border-b border-border text-gray-light text-[11px]">{doc.date}</td>
                        <td className="px-2.5 py-2.5 border-b border-border text-gray text-[11px]">{doc.recipient}</td>
                        <td className="px-2.5 py-2.5 border-b border-border"><StatusBadge variant={doc.statusVariant} className="text-[9px]">{doc.status}</StatusBadge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Archive;
