import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

// بيانات مركزية متطابقة مع باقي الأقسام
const avgDaily = 696;
const totalGrossSales = 97640;
const totalNetSales = 91870;
const totalDiscounts = 5477;
const activeDays = 132;
const totalSalaries = 10400;
const aprilAvg = 848;

const Dashboard = () => {
  return (
    <div>
      <PageHeader title="لوحة التحكم" subtitle="السبت، 11 أبريل 2026" badge="مباشر" />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard label="متوسط الإيرادات اليومية" value={avgDaily.toString()} sub={`بناءً على ${activeDays} يوم فعلي`} subColor="success" />
        <MetricCard label="إجمالي المبيعات" value={totalGrossSales.toLocaleString()} sub="ديسمبر 2025 – أبريل 2026" />
        <MetricCard label="صافي المبيعات" value={totalNetSales.toLocaleString()} sub="بعد الخصومات والمسترد" subColor="success" />
        <MetricCard label="تنبيهات المخزون" value="4" sub="خبز + مايونيز + بيبسي + زيت" subColor="danger" />
      </div>

      {/* تحصيل اليوم */}
      <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary mb-5">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">ملخص المبيعات — متوسطات حقيقية ({activeDays} يوم)</div>
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="bg-background rounded-lg p-3 border border-border text-center">
            <div className="text-[10px] text-gray-light font-medium mb-1">📊 متوسط يومي</div>
            <div className="text-[20px] font-bold text-foreground">{avgDaily}</div>
            <div className="text-[10px] text-gray-light mt-0.5">ريال/يوم</div>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border text-center">
            <div className="text-[10px] text-gray-light font-medium mb-1">🏆 أعلى يوم</div>
            <div className="text-[20px] font-bold text-green-400">2,030</div>
            <div className="text-[10px] text-gray-light mt-0.5">ريال · 2 يناير</div>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border text-center">
            <div className="text-[10px] text-primary font-semibold mb-1">أبريل (حتى الآن)</div>
            <div className="text-[20px] font-bold text-primary">{aprilAvg}</div>
            <div className="text-[10px] text-green-400 mt-0.5 font-medium">↑ {(((aprilAvg - avgDaily) / avgDaily) * 100).toFixed(0)}% عن المتوسط العام</div>
          </div>
        </div>
        <div className="h-2 bg-background rounded-sm overflow-hidden flex">
          <div className="h-full bg-foreground rounded-r-sm" style={{ width: `${(totalNetSales / totalGrossSales * 100).toFixed(0)}%` }} />
          <div className="h-full bg-primary rounded-l-sm" style={{ width: `${(totalDiscounts / totalGrossSales * 100).toFixed(0)}%` }} />
        </div>
        <div className="flex justify-between mt-1.5 text-[9px] text-gray-light">
          <span>● صافي المبيعات: {totalNetSales.toLocaleString()} ر.س</span>
          <span>● خصومات: {totalDiscounts.toLocaleString()} ر.س ({((totalDiscounts / totalGrossSales) * 100).toFixed(1)}%)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* أعلى المنتجات مبيعاً - مطابق لصفحة المنتجات */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">أكثر المنتجات مبيعاً</div>
          {[
            { label: "آنجوس لحم", value: "34% من الطلبات", emoji: "🥩" },
            { label: "وجبة كاملة", value: "25% من الطلبات", emoji: "🍔" },
            { label: "كريسبي الدجاج", value: "19% من الطلبات", emoji: "🍗" },
            { label: "ناشفيل الدجاج", value: "12% من الطلبات", emoji: "🌶️" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-b-0 text-[13px]">
              <span className="text-gray">{item.emoji} {item.label}</span>
              <span className="text-foreground font-semibold">{item.value}</span>
            </div>
          ))}
        </div>

        {/* تنبيهات المخزون - مطابق لصفحة المخزون */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">تنبيهات المخزون</div>
          {[
            { label: "زيت الرائد تنك 17لتر", status: "حرج", variant: "danger" as const, supplier: "السلال المنتجة" },
            { label: "خبز البرجر", status: "منخفض", variant: "warning" as const, supplier: "مورد محلي" },
            { label: "مايونيز هاينز", status: "منخفض", variant: "warning" as const, supplier: "الحلول المساندة" },
            { label: "بيبسي قوارير", status: "منخفض", variant: "warning" as const, supplier: "السلال المنتجة" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-b-0 text-[13px]">
              <div>
                <span className="text-gray">{item.label}</span>
                <span className="text-[9px] text-gray-light mr-1">({item.supplier})</span>
              </div>
              <StatusBadge variant={item.variant}>{item.status}</StatusBadge>
            </div>
          ))}
        </div>
      </div>

      {/* ملخص سريع للموظفين */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">👥 حالة الطاقم اليوم</div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: "يونس", role: "كاشير", status: "حاضر", variant: "success" as const },
            { name: "شيمول", role: "طباخ", status: "حاضر", variant: "success" as const },
            { name: "ميراج", role: "تحضير", status: "تأخر 22د", variant: "warning" as const },
            { name: "ريان", role: "مساعد", status: "حاضر", variant: "success" as const },
          ].map((emp) => (
            <div key={emp.name} className="bg-background rounded-lg p-3 border border-border text-center">
              <div className="text-[12px] font-bold text-foreground">{emp.name}</div>
              <div className="text-[9px] text-gray-light mb-1">{emp.role}</div>
              <StatusBadge variant={emp.variant}>{emp.status}</StatusBadge>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-gray-light">
          <span>الرواتب الشهرية: <b className="text-foreground">{totalSalaries.toLocaleString()} ر.س</b></span>
          <span>نسبة العمالة: <b className={totalSalaries / (avgDaily * 30) > 0.35 ? "text-red-400" : "text-green-400"}>{((totalSalaries / (avgDaily * 30)) * 100).toFixed(1)}%</b></span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
