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

      {/* تحصيل اليوم */}
      <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary mb-5">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">إيرادات اليوم — التحصيل اليومي للمبيعات</div>
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="bg-background rounded-lg p-3 border border-border text-center">
            <div className="text-[10px] text-gray-light font-medium mb-1">💵 كاش</div>
            <div className="text-[20px] font-bold text-foreground">2,890</div>
            <div className="text-[10px] text-gray-light mt-0.5">ريال · 60%</div>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border text-center">
            <div className="text-[10px] text-gray-light font-medium mb-1">💳 شبكة</div>
            <div className="text-[20px] font-bold text-foreground">1,930</div>
            <div className="text-[10px] text-gray-light mt-0.5">ريال · 40%</div>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border text-center">
            <div className="text-[10px] text-primary font-semibold mb-1">الإجمالي</div>
            <div className="text-[20px] font-bold text-primary">4,820</div>
            <div className="text-[10px] text-green-400 mt-0.5 font-medium">↑ 12% عن أمس</div>
          </div>
        </div>
        <div className="h-2 bg-background rounded-sm overflow-hidden flex">
          <div className="h-full bg-foreground rounded-r-sm" style={{ width: "60%" }} />
          <div className="h-full bg-primary rounded-l-sm" style={{ width: "40%" }} />
        </div>
        <div className="flex justify-between mt-1.5 text-[9px] text-gray-light">
          <span>● كاش 60%</span>
          <span>● شبكة 40%</span>
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
