import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

const Dashboard = () => {
  return (
    <div>
      <PageHeader title="لوحة التحكم" subtitle="السبت، 11 أبريل 2026" badge="مباشر" />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard label="إيرادات اليوم" value="4,820" sub="↑ 12% عن أمس" subColor="success" />
        <MetricCard label="عدد الطلبات" value="138" sub="متوسط 35 ريال/طلب" />
        <MetricCard label="العمال الحاضرون" value="7 / 9" sub="2 غياب اليوم" subColor="warning" />
        <MetricCard label="تنبيهات المخزون" value="3" sub="تحتاج إعادة طلب" subColor="danger" />
      </div>


      {/* حالة المشروع */}
      <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-accent mb-5">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">🏗️ حالة المشروع — كشف الحساب البنكي (ديسمبر 2025 – أبريل 2026)</div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-background rounded-lg p-3 border border-border text-center">
            <div className="text-[10px] text-gray-light font-medium mb-1">إجمالي الإيرادات</div>
            <div className="text-[18px] font-bold text-green-400">68,270</div>
            <div className="text-[9px] text-gray-light">ر.س (4 أشهر)</div>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border text-center">
            <div className="text-[10px] text-gray-light font-medium mb-1">مشتريات المحل</div>
            <div className="text-[18px] font-bold text-foreground">54,642</div>
            <div className="text-[9px] text-gray-light">ر.س (عبر يوسف)</div>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border text-center">
            <div className="text-[10px] text-gray-light font-medium mb-1">فواتير وسداد</div>
            <div className="text-[18px] font-bold text-yellow-400">5,843</div>
            <div className="text-[9px] text-gray-light">ر.س (كهرباء + إقامات)</div>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border text-center">
            <div className="text-[10px] text-gray-light font-medium mb-1">الرصيد الحالي</div>
            <div className="text-[18px] font-bold text-primary">2,107</div>
            <div className="text-[9px] text-gray-light">ر.س</div>
          </div>
        </div>

        {/* تفصيل المصروفات */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-background rounded-lg p-3 border border-border">
            <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-2">💸 المصروفات حسب النوع</div>
            {[
              { label: "مشتريات المحل (مواد خام + تشغيل)", amount: "54,642", pct: 83, color: "bg-primary" },
              { label: "فواتير سداد (كهرباء)", amount: "2,428", pct: 4, color: "bg-yellow-500" },
              { label: "خدمات المقيمين (إقامات)", amount: "3,614", pct: 5, color: "bg-orange-500" },
              { label: "موردين (ورد المزرعه + فرن فرش)", amount: "2,550", pct: 4, color: "bg-blue-500" },
              { label: "تحويلات أخرى (أسامة + فهد)", amount: "3,500", pct: 5, color: "bg-gray-500" },
            ].map((item) => (
              <div key={item.label} className="mb-2 last:mb-0">
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-gray">{item.label}</span>
                  <span className="text-foreground font-medium">{item.amount} ر.س</span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-background rounded-lg p-3 border border-border">
            <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-2">📊 الإيرادات الشهرية</div>
            {[
              { month: "ديسمبر 2025", income: "13,611", days: 22 },
              { month: "يناير 2026", income: "18,906", days: 25 },
              { month: "فبراير 2026", income: "14,524", days: 21 },
              { month: "مارس 2026", income: "19,695", days: 24 },
              { month: "أبريل 2026 (جزئي)", income: "5,866", days: 9 },
            ].map((m) => (
              <div key={m.month} className="flex items-center justify-between py-1.5 border-b border-border last:border-b-0">
                <span className="text-[11px] text-gray">{m.month}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-light">{m.days} يوم</span>
                  <span className="text-[12px] font-bold text-green-400">{m.income} ر.س</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between mt-2 pt-2 border-t border-border">
              <span className="text-[11px] font-bold text-foreground">المتوسط الشهري</span>
              <span className="text-[12px] font-bold text-primary">~17,068 ر.س</span>
            </div>
          </div>
        </div>

        {/* استثمار المشروع - آلات وديكور */}
        <div className="bg-background rounded-lg p-3 border border-border">
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-2">🏭 استهلاك المشروع — آلات وديكور (من ملف المصروفات التأسيسية)</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "ديكور وتجهيزات", amount: "69,585", pct: "23.8%", icon: "🎨" },
              { label: "معدات وآلات", amount: "84,100", pct: "28.8%", icon: "⚙️" },
              { label: "إيجار (سنوي)", amount: "40,000", pct: "13.7%", icon: "🏠" },
            ].map((item) => (
              <div key={item.label} className="text-center p-2 rounded-lg border border-border">
                <div className="text-[18px] mb-1">{item.icon}</div>
                <div className="text-[12px] font-bold text-foreground">{item.amount} ر.س</div>
                <div className="text-[10px] text-gray">{item.label}</div>
                <div className="text-[9px] text-gray-light mt-0.5">{item.pct} من إجمالي الاستثمار</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">أكثر المبيعات اليوم</div>
          {[
            { label: "برجر دبل", value: "82 قطعة" },
            { label: "واجبة كاملة", value: "61 وجبة" },
            { label: "مشروبات", value: "114 كوب" },
            { label: "حلويات", value: "29 قطعة" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-b-0 text-[13px]">
              <span className="text-gray">{item.label}</span>
              <span className="text-foreground font-semibold">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">تنبيهات عاجلة</div>
          {[
            { label: "خس طازج", status: "نفد تقريباً", variant: "danger" as const },
            { label: "صلصة بيبر", status: "منخفض", variant: "warning" as const },
            { label: "خبز البرجر", status: "منخفض", variant: "warning" as const },
            { label: "لحم 200جم", status: "كافٍ", variant: "success" as const },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-b-0 text-[13px]">
              <span className="text-gray">{item.label}</span>
              <StatusBadge variant={item.variant}>{item.status}</StatusBadge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
