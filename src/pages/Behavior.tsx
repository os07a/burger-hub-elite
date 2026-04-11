import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";

const rankings = [
  { rank: 1, name: "برجر دبل", desc: "اللحم · الجبن · الصلصة الخاصة", count: "1,240" },
  { rank: 2, name: "واجبة كاملة", desc: "برجر + بطاطس + مشروب", count: "980" },
  { rank: 3, name: "برجر كلاسيك", desc: "اللحم + الخضار فقط", count: "710" },
  { rank: 4, name: "تشيكن برجر", desc: "دجاج مقلي", count: "540" },
  { rank: 5, name: "بطاطس إضافية", desc: "إضافة منفردة", count: "390" },
  { rank: 6, name: "ميلك شيك", desc: "شوكولاتة · فانيلا · فراولة", count: "280" },
];

const rankColors: Record<number, string> = {
  1: "bg-primary text-primary-foreground",
  2: "bg-foreground text-primary-foreground",
  3: "bg-gray text-primary-foreground",
};

const ProgressBar = ({ label, value, color = "bg-primary" }: { label: string; value: number; color?: string }) => (
  <div className="mt-2.5 first:mt-0">
    <div className="flex justify-between text-[12px] text-gray mb-1 font-medium">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}%</span>
    </div>
    <div className="h-[5px] bg-background rounded-sm overflow-hidden">
      <div className={`h-full rounded-sm ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const hours = ["10م", "11م", "12م", "1م", "2م", "3م", "4م", "5م", "6م", "7م", "8م", "9م"];
const heatData = [
  [8, 10, 22, 28, 18, 12, 15, 20, 35, 52, 68, 55],
  [6, 9, 18, 24, 16, 11, 14, 18, 30, 44, 58, 50],
  [5, 8, 15, 22, 14, 10, 12, 16, 28, 40, 54, 46],
  [5, 8, 16, 23, 15, 10, 13, 17, 29, 42, 56, 48],
  [7, 10, 20, 26, 17, 12, 15, 19, 33, 50, 65, 58],
  [10, 14, 26, 32, 22, 16, 20, 28, 45, 64, 82, 72],
  [12, 16, 30, 20, 14, 18, 24, 32, 50, 72, 90, 78],
];

const heatColor = (v: number) => {
  const t = v / 90;
  if (t < 0.25) return { bg: "#fceaec", fg: "#8a0c18" };
  if (t < 0.5) return { bg: "#e8a0a8", fg: "#5a0010" };
  if (t < 0.75) return { bg: "#c03040", fg: "#fff" };
  return { bg: "#8a0c18", fg: "#fff" };
};

const Behavior = () => {
  return (
    <div>
      <PageHeader title="سلوك الزبائن" subtitle="تحليل المبيعات وأوقات الذروة" />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <MetricCard label="ذروة الأسبوع" value="الجمعة 9م" sub="90 طلب في ساعة" />
        <MetricCard label="الأكثر طلباً" value="برجر دبل" sub="34% من الطلبات" subColor="success" />
        <MetricCard label="متوسط الطلب" value="2.4" sub="صنف لكل زبون" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary">
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">ترتيب الأصناف — هذا الشهر</div>
          {rankings.map((item) => (
            <div key={item.rank} className="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0">
              <div className={`w-6 h-6 rounded-[7px] flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${rankColors[item.rank] || "bg-background text-gray"}`}>
                {item.rank}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-foreground">{item.name}</div>
                <div className="text-[10px] text-gray-light mt-px font-medium">{item.desc}</div>
              </div>
              <div className="text-[14px] font-bold text-foreground min-w-[52px] text-left">{item.count}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">الإضافات المفضلة</div>
            <ProgressBar label="جبن إضافي" value={62} />
            <ProgressBar label="مشروب كبير" value={55} />
            <ProgressBar label="صلصة حارة" value={48} color="bg-foreground" />
            <ProgressBar label="بدون خس" value={31} color="bg-gray-light" />
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">طريقة الاستلام</div>
            <ProgressBar label="توصيل" value={54} />
            <ProgressBar label="داخل المطعم" value={28} color="bg-foreground" />
            <ProgressBar label="استلام ذاتي" value={18} color="bg-gray-light" />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">أوقات الذروة — الطلبات لكل ساعة حسب اليوم</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse">
            <thead>
              <tr>
                <th />
                {hours.map((h) => (
                  <th key={h} className="text-[10px] text-gray-light font-semibold p-1 text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, di) => (
                <tr key={day}>
                  <td className="text-[11px] text-gray font-semibold pr-2.5 py-1 whitespace-nowrap text-right">{day}</td>
                  {heatData[di].map((v, hi) => {
                    const c = heatColor(v);
                    return (
                      <td key={hi} className="w-9 h-[29px] rounded text-center align-middle text-[10px] font-bold" style={{ background: c.bg, color: c.fg }}>
                        {v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-1.5 mt-2.5 justify-end">
          <span className="text-[10px] text-gray-light font-medium">هادئ</span>
          {["#fceaec", "#e8a0a8", "#c03040", "#8a0c18"].map((bg) => (
            <div key={bg} className="w-[13px] h-[13px] rounded-sm" style={{ background: bg }} />
          ))}
          <span className="text-[10px] text-gray-light font-medium">ذروة</span>
        </div>
      </div>
    </div>
  );
};

export default Behavior;
