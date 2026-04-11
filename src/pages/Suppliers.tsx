import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

const suppliers = [
  {
    name: "مورد الديكور والاستيل", category: "ديكور · استيل · رخام", status: "نشط", statusVariant: "success" as const,
    ops: 22, total: "49,482", items: "طاولات استيل، ألواح ديكور، واجهات",
    docs: "موثق", docsVariant: "success" as const,
  },
  {
    name: "مورد الآلات والمعدات", category: "أجهزة مطبخ · معدات تشغيل", status: "نشط", statusVariant: "success" as const,
    ops: 22, total: "48,566", items: "جريل فحم كهربائي، قلاية، حماصة خبز، جهاز بونات",
    docs: "موثق", docsVariant: "success" as const,
  },
  {
    name: "مالك العقار", category: "إيجار المحل", status: "نشط", statusVariant: "success" as const,
    ops: 2, total: "40,000", items: "دفعة إيجار أولى وثانية (فبراير – أغسطس 2026)",
    docs: "متوفر البيانات", docsVariant: "warning" as const,
  },
  {
    name: "مطابع الهوية البصرية", category: "طباعة · بوكسات · تصميم", status: "نشط", statusVariant: "success" as const,
    ops: 3, total: "22,243", items: "طباعة بوكسات البرجر، تجهيزات الوجبات، تصميم الواجهة",
    docs: "موثق", docsVariant: "success" as const,
  },
  {
    name: "مورد التشطيبات والموارد", category: "رخام · تشطيبات إضافية", status: "نشط", statusVariant: "success" as const,
    ops: 15, total: "10,904", items: "رخام أرضيات، تشطيبات إضافية",
    docs: "موثق", docsVariant: "success" as const,
  },
  {
    name: "مورد المواد التموينية", category: "صوصات · مواد غذائية", status: "نشط", statusVariant: "success" as const,
    ops: 21, total: "9,337", items: "صوصات، سمك، مواد تموينية متنوعة",
    docs: "موثق", docsVariant: "success" as const,
  },
  {
    name: "شركة الكهرباء", category: "كهرباء · عداد", status: "نشط", statusVariant: "success" as const,
    ops: 10, total: "7,054", items: "فواتير كهرباء، تركيب عداد",
    docs: "موثق", docsVariant: "success" as const,
  },
  {
    name: "مورد الصيانة التأسيسية", category: "صيانة · تجهيزات", status: "نشط", statusVariant: "success" as const,
    ops: 36, total: "18,047", items: "مغناطيس استيل، صحون، سخانة جبن، ثلاجات",
    docs: "موثق", docsVariant: "success" as const,
  },
  {
    name: "الجهات الحكومية", category: "رسوم · تراخيص · رخص", status: "مكتمل", statusVariant: "info" as const,
    ops: 14, total: "15,810", items: "رخصة بلدية، نقل كفالة، تصاريح، اشتراكات",
    docs: "موثق", docsVariant: "success" as const,
  },
  {
    name: "خدمات الإنترنت والشبكات", category: "إنترنت · شبكات", status: "نشط", statusVariant: "success" as const,
    ops: 2, total: "3,500", items: "تجهيز شبكة إنترنت، اشتراكات",
    docs: "موثق", docsVariant: "success" as const,
  },
  {
    name: "ويبي الأفندي (دعاية)", category: "تصوير · دعاية وإعلان", status: "منتهي", statusVariant: "warning" as const,
    ops: 2, total: "3,000", items: "تصوير لايف ستايل 15 صورة، دعاية",
    docs: "متوفر البيانات", docsVariant: "warning" as const,
  },
  {
    name: "إدارة سوشل ميديا", category: "قوقل ماب · انستقرام · تيك توك", status: "نشط", statusVariant: "success" as const,
    ops: 1, total: "5,000", items: "إدارة حسابات ديسمبر 2025 ويناير 2026",
    docs: "متوفر البيانات", docsVariant: "warning" as const,
  },
];

const Suppliers = () => (
  <div>
    <PageHeader title="الموردون" subtitle="جهات التوريد الحقيقية من كشف المصروفات" badge={`${suppliers.length} مورد`} />

    <div className="grid grid-cols-3 gap-3 mb-5">
      <MetricCard label="إجمالي التوريدات" value="292,405" sub="ريال سعودي" />
      <MetricCard label="عدد العمليات" value="204" sub="عملية موثقة" subColor="success" />
      <MetricCard label="موردين نشطين" value={suppliers.filter(s => s.status === "نشط").length} sub="من {suppliers.length} مورد" subColor="success" />
    </div>

    {suppliers.map((s) => (
      <div key={s.name} className="bg-surface rounded-lg p-4 mb-2.5 border border-border transition-colors hover:border-primary/30">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-[14px] font-bold text-foreground">{s.name}</div>
            <div className="text-[10px] text-gray-light mt-0.5 font-medium">{s.category}</div>
          </div>
          <div className="flex gap-1.5">
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

export default Suppliers;
