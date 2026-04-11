import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";

const rankings = [
  { rank: 1, name: "آنجوس لحم", desc: "بريسكت أنجوس · جبن أمريكي · صلصة خاصة", count: "~420", pct: "34%" },
  { rank: 2, name: "وجبة كاملة", desc: "برجر + بطاطس + بيبسي", count: "~310", pct: "25%" },
  { rank: 3, name: "كريسبي الدجاج", desc: "صدور دجاج مقرمش · صوص سبايسي", count: "~230", pct: "19%" },
  { rank: 4, name: "ناشفيل الدجاج", desc: "دجاج ناشفيل · جبن · مخلل", count: "~150", pct: "12%" },
  { rank: 5, name: "بطاطس (منفردة/بالجبن)", desc: "إضافة جانبية", count: "~80", pct: "7%" },
  { rank: 6, name: "مشروبات (بيبسي/ماء)", desc: "بيبسي 250مل · ماء معدني", count: "~40", pct: "3%" },
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
const hours = ["10ص", "11ص", "12م", "1م", "2م", "3م", "4م", "5م", "6م", "7م", "8م", "9م"];

// بيانات مبنية على أيام الأسبوع الفعلية: الجمعة=ذروة (810 ر.س)، الاثنين=أضعف (627 ر.س)
const heatData = [
  [8, 10, 22, 28, 18, 12, 15, 20, 35, 52, 68, 55],   // السبت: 704 ر.س
  [6, 9, 18, 24, 16, 11, 14, 18, 30, 44, 58, 50],     // الأحد: 681 ر.س
  [5, 8, 15, 22, 14, 10, 12, 16, 28, 40, 50, 42],     // الاثنين: 627 ر.س (أضعف)
  [5, 8, 16, 23, 15, 10, 13, 17, 29, 42, 52, 45],     // الثلاثاء: 674 ر.س
  [6, 9, 17, 24, 16, 11, 14, 18, 30, 45, 55, 48],     // الأربعاء: 668 ر.س
  [10, 14, 26, 32, 22, 16, 20, 28, 45, 64, 78, 68],   // الخميس: 707 ر.س
  [12, 16, 30, 20, 14, 18, 24, 32, 50, 72, 90, 78],   // الجمعة: 810 ر.س (ذروة)
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
      <PageHeader title="سلوك الزبائن" subtitle="تحليل المبيعات وأوقات الذروة — مبني على بيانات 132 يوم فعلي" />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard label="ذروة الأسبوع" value="الجمعة 9م" sub="810 ر.س متوسط يوم الجمعة" />
        <MetricCard label="الأكثر طلباً" value="آنجوس لحم" sub="34% من الطلبات" subColor="success" />
        <MetricCard label="أضعف يوم" value="الاثنين" sub="627 ر.س متوسط" subColor="warning" />
        <MetricCard label="متوسط يومي" value="696" sub="ر.س · 132 يوم" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary">
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">ترتيب الأصناف — بناءً على المبيعات الفعلية</div>
          {rankings.map((item) => (
            <div key={item.rank} className="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0">
              <div className={`w-6 h-6 rounded-[7px] flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${rankColors[item.rank] || "bg-background text-gray"}`}>
                {item.rank}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-foreground">{item.name}</div>
                <div className="text-[10px] text-gray-light mt-px font-medium">{item.desc}</div>
              </div>
              <div className="text-left min-w-[70px]">
                <div className="text-[13px] font-bold text-foreground">{item.count}</div>
                <div className="text-[9px] text-gray-light">{item.pct}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">الإضافات المفضلة</div>
            <ProgressBar label="جبن إضافي (أمريكي شرائح)" value={62} />
            <ProgressBar label="بطاطس بالجبن" value={48} />
            <ProgressBar label="صلصة ناشفيل حارة" value={35} color="bg-foreground" />
            <ProgressBar label="مشروب كبير (بيبسي)" value={55} />
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">طريقة الاستلام</div>
            <ProgressBar label="توصيل (هنقرستيشن + كيتا)" value={54} />
            <ProgressBar label="داخل المطعم" value={28} color="bg-foreground" />
            <ProgressBar label="استلام ذاتي" value={18} color="bg-gray-light" />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">أوقات الذروة — بناءً على متوسطات أيام الأسبوع الفعلية</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse">
            <thead>
              <tr>
                <th />
                {hours.map((h) => (
                  <th key={h} className="text-[10px] text-gray-light font-semibold p-1 text-center">{h}</th>
                ))}
                <th className="text-[10px] text-gray-light font-semibold p-1 text-center">المتوسط</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, di) => {
                const avgForDay = [704, 681, 627, 674, 668, 707, 810][di];
                return (
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
                    <td className="text-[11px] font-bold text-primary text-center pr-2">{avgForDay}</td>
                  </tr>
                );
              })}
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
        <div className="mt-2 p-2 bg-background border border-border rounded-lg text-[9px] text-gray leading-relaxed">
          💡 <b className="text-foreground">نصيحة:</b> الجمعة والخميس أقوى يومين (810 و707 ر.س). ركّز التسويق على الاثنين والأربعاء لرفع المتوسط.
        </div>
      </div>
    </div>
  );
};

export default Behavior;
