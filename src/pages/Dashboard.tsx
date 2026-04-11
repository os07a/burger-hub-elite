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
    <div className="animate-fade-in">
      <PageHeader title="لوحة التحكم" subtitle="السبت، 11 أبريل 2026" badge="مباشر" />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="متوسط الإيرادات اليومية" value={avgDaily.toString()} sub={`بناءً على ${activeDays} يوم فعلي`} subColor="success" />
        <MetricCard label="إجمالي المبيعات" value={totalGrossSales.toLocaleString()} sub="ديسمبر 2025 – أبريل 2026" />
        <MetricCard label="صافي المبيعات" value={totalNetSales.toLocaleString()} sub="بعد الخصومات والمسترد" subColor="success" />
        <MetricCard label="تنبيهات المخزون" value="4" sub="خبز + مايونيز + بيبسي + زيت" subColor="danger" />
      </div>

      {/* ملخص المبيعات */}
      <div className="ios-card mb-6">
        <div className="text-[11px] font-medium text-muted-foreground mb-4">ملخص المبيعات — متوسطات حقيقية ({activeDays} يوم)</div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-background rounded-xl p-4 text-center">
            <div className="text-[11px] text-muted-foreground font-medium mb-1.5">📊 متوسط يومي</div>
            <div className="text-[22px] font-bold text-foreground tracking-tight">{avgDaily}</div>
            <div className="text-[11px] text-muted-foreground mt-1">ريال/يوم</div>
          </div>
          <div className="bg-background rounded-xl p-4 text-center">
            <div className="text-[11px] text-muted-foreground font-medium mb-1.5">🏆 أعلى يوم</div>
            <div className="text-[22px] font-bold text-success tracking-tight">2,030</div>
            <div className="text-[11px] text-muted-foreground mt-1">ريال · 2 يناير</div>
          </div>
          <div className="bg-background rounded-xl p-4 text-center">
            <div className="text-[11px] text-primary font-semibold mb-1.5">أبريل (حتى الآن)</div>
            <div className="text-[22px] font-bold text-primary tracking-tight">{aprilAvg}</div>
            <div className="text-[11px] text-success mt-1 font-medium">↑ {(((aprilAvg - avgDaily) / avgDaily) * 100).toFixed(0)}% عن المتوسط العام</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-background rounded-full overflow-hidden flex">
          <div className="h-full bg-foreground/80 rounded-r-full" style={{ width: `${(totalNetSales / totalGrossSales * 100).toFixed(0)}%` }} />
          <div className="h-full bg-primary/60 rounded-l-full" style={{ width: `${(totalDiscounts / totalGrossSales * 100).toFixed(0)}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>● صافي المبيعات: {totalNetSales.toLocaleString()} ر.س</span>
          <span>● خصومات: {totalDiscounts.toLocaleString()} ر.س ({((totalDiscounts / totalGrossSales) * 100).toFixed(1)}%)</span>
        </div>
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* أعلى المنتجات */}
        <div className="ios-card">
          <div className="text-[11px] font-medium text-muted-foreground mb-4">أكثر المنتجات مبيعاً</div>
          {[
            { label: "آنجوس لحم", value: "34% من الطلبات", emoji: "🥩" },
            { label: "وجبة كاملة", value: "25% من الطلبات", emoji: "🍔" },
            { label: "كريسبي الدجاج", value: "19% من الطلبات", emoji: "🍗" },
            { label: "ناشفيل الدجاج", value: "12% من الطلبات", emoji: "🌶️" },
          ].map((item, i) => (
            <div key={item.label} className={`flex justify-between items-center py-3 text-[13px] ${i < 3 ? "border-b border-border" : ""}`}>
              <span className="text-muted-foreground">{item.emoji} {item.label}</span>
              <span className="text-foreground font-semibold">{item.value}</span>
            </div>
          ))}
        </div>

        {/* تنبيهات المخزون */}
        <div className="ios-card">
          <div className="text-[11px] font-medium text-muted-foreground mb-4">تنبيهات المخزون</div>
          {[
            { label: "زيت الرائد تنك 17لتر", status: "حرج", variant: "danger" as const, supplier: "السلال المنتجة" },
            { label: "خبز البرجر", status: "منخفض", variant: "warning" as const, supplier: "مورد محلي" },
            { label: "مايونيز هاينز", status: "منخفض", variant: "warning" as const, supplier: "الحلول المساندة" },
            { label: "بيبسي قوارير", status: "منخفض", variant: "warning" as const, supplier: "السلال المنتجة" },
          ].map((item, i) => (
            <div key={item.label} className={`flex justify-between items-center py-3 text-[13px] ${i < 3 ? "border-b border-border" : ""}`}>
              <div>
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-[10px] text-gray-light mr-1.5">({item.supplier})</span>
              </div>
              <StatusBadge variant={item.variant}>{item.status}</StatusBadge>
            </div>
          ))}
        </div>
      </div>

      {/* حالة الطاقم */}
      <div className="ios-card">
        <div className="text-[11px] font-medium text-muted-foreground mb-4">👥 حالة الطاقم اليوم</div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: "يونس", role: "كاشير", status: "حاضر", variant: "success" as const },
            { name: "شيمول", role: "طباخ", status: "حاضر", variant: "success" as const },
            { name: "ميراج", role: "تحضير", status: "تأخر 22د", variant: "warning" as const },
            { name: "ريان", role: "مساعد", status: "حاضر", variant: "success" as const },
          ].map((emp) => (
            <div key={emp.name} className="bg-background rounded-xl p-4 text-center">
              <div className="text-[13px] font-semibold text-foreground">{emp.name}</div>
              <div className="text-[10px] text-muted-foreground mb-2">{emp.role}</div>
              <StatusBadge variant={emp.variant}>{emp.status}</StatusBadge>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border flex justify-between text-[11px] text-muted-foreground">
          <span>الرواتب الشهرية: <b className="text-foreground">{totalSalaries.toLocaleString()} ر.س</b></span>
          <span>نسبة العمالة: <b className={totalSalaries / (avgDaily * 30) > 0.35 ? "text-danger" : "text-success"}>{((totalSalaries / (avgDaily * 30)) * 100).toFixed(1)}%</b></span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
