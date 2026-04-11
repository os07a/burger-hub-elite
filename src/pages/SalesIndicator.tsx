import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";

/* ── بيانات يومية مختصرة (أبرز الأيام) ── */
const bestDays = [
  { date: "2 يناير", value: 2030 },
  { date: "27 مارس", value: 1759 },
  { date: "3 يناير", value: 1597 },
  { date: "20 مارس", value: 1404 },
  { date: "22 مارس", value: 1391 },
];

const worstDays = [
  { date: "1 ديسمبر", value: 5 },
  { date: "18 فبراير", value: 97 },
  { date: "21 فبراير", value: 118 },
  { date: "22 فبراير", value: 131 },
  { date: "19 فبراير", value: 135 },
];

const salesMonths = [
  { month: "ديسمبر", gross: 15951, net: 15292, days: 31, avg: 493, discounts: 616 },
  { month: "يناير", gross: 32266, net: 27470, days: 31, avg: 886, discounts: 4709 },
  { month: "فبراير", gross: 15294, net: 15055, days: 28, avg: 538, discounts: 76 },
  { month: "مارس", gross: 24787, net: 24728, days: 31, avg: 798, discounts: 59 },
  { month: "أبريل", gross: 9342, net: 9325, days: 11, avg: 848, discounts: 17 },
];

const weekdays = [
  { day: "الجمعة", avg: 810 },
  { day: "الخميس", avg: 707 },
  { day: "السبت", avg: 704 },
  { day: "الأحد", avg: 681 },
  { day: "الثلاثاء", avg: 674 },
  { day: "الأربعاء", avg: 668 },
  { day: "الاثنين", avg: 627 },
];

const maxAvg = 810;

const SalesIndicator = () => (
  <div>
    <PageHeader title="مؤشر المبيعات" subtitle="تقرير الكاشير · 132 يوم · ديسمبر 2025 – أبريل 2026" badge="تحليل" />

    {/* مؤشرات سريعة */}
    <div className="grid grid-cols-6 gap-2 mb-4">
      {[
        { label: "🧾 إجمالي المبيعات", value: "97,640", color: "text-primary" },
        { label: "💵 صافي المبيعات", value: "91,870", color: "text-green-400" },
        { label: "📊 متوسط يومي", value: "696", color: "text-blue-400" },
        { label: "🏆 أعلى يوم", value: "2,030", color: "text-green-400" },
        { label: "📉 أدنى يوم فعلي", value: "97", color: "text-red-400" },
        { label: "🏷️ إجمالي الخصومات", value: "5,477", color: "text-orange-400" },
      ].map((m) => (
        <div key={m.label} className="bg-surface border border-border rounded-lg p-3 text-center">
          <div className="text-[9px] text-gray-light font-medium mb-1">{m.label}</div>
          <div className={`text-[18px] font-bold ${m.color}`}>{m.value}</div>
          <div className="text-[8px] text-gray-light">ر.س</div>
        </div>
      ))}
    </div>

    {/* الأداء الشهري التفصيلي */}
    <div className="bg-surface border border-border rounded-lg p-4 mb-4">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">📊 الأداء الشهري التفصيلي</div>
      <div className="overflow-hidden">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border text-[9px] text-gray-light uppercase">
              <th className="text-right py-2 font-medium">الشهر</th>
              <th className="text-center py-2 font-medium">إجمالي</th>
              <th className="text-center py-2 font-medium">صافي</th>
              <th className="text-center py-2 font-medium">أيام</th>
              <th className="text-center py-2 font-medium">متوسط/يوم</th>
              <th className="text-center py-2 font-medium">خصومات</th>
              <th className="text-center py-2 font-medium">معدل خصم</th>
              <th className="text-center py-2 font-medium">تقييم</th>
            </tr>
          </thead>
          <tbody>
            {salesMonths.map((m) => {
              const discPct = ((m.discounts / m.gross) * 100).toFixed(1);
              const rating = m.avg >= 800 ? "ممتاز" : m.avg >= 600 ? "جيد" : m.avg >= 400 ? "ضعيف" : "حرج";
              const ratingVariant = m.avg >= 800 ? "success" : m.avg >= 600 ? "info" : m.avg >= 400 ? "warning" : "danger";
              return (
                <tr key={m.month} className="border-b border-border/50 hover:bg-background/50">
                  <td className="py-2 font-bold text-foreground">{m.month}</td>
                  <td className="text-center text-foreground">{m.gross.toLocaleString()}</td>
                  <td className="text-center font-medium text-green-400">{m.net.toLocaleString()}</td>
                  <td className="text-center text-gray">{m.days}</td>
                  <td className="text-center font-bold text-foreground">{m.avg}</td>
                  <td className="text-center text-orange-400">{m.discounts.toLocaleString()}</td>
                  <td className="text-center text-gray">{discPct}%</td>
                  <td className="text-center">
                    <StatusBadge variant={ratingVariant as "success" | "warning" | "danger" | "info"} className="text-[8px]">{rating}</StatusBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-4">
      {/* أفضل 5 أيام */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-green-400 uppercase tracking-wider mb-3">🏆 أفضل 5 أيام</div>
        <div className="space-y-1.5">
          {bestDays.map((d, i) => (
            <div key={d.date} className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg">
              <span className="text-[14px] w-6 text-center font-bold text-green-400">#{i + 1}</span>
              <span className="text-[11px] text-gray flex-1">{d.date}</span>
              <span className="text-[13px] font-bold text-green-400">{d.value.toLocaleString()}</span>
              <span className="text-[8px] text-gray-light">ر.س</span>
            </div>
          ))}
        </div>
      </div>

      {/* أضعف 5 أيام */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-red-400 uppercase tracking-wider mb-3">📉 أضعف 5 أيام</div>
        <div className="space-y-1.5">
          {worstDays.map((d, i) => (
            <div key={d.date} className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg">
              <span className="text-[14px] w-6 text-center font-bold text-red-400">#{i + 1}</span>
              <span className="text-[11px] text-gray flex-1">{d.date}</span>
              <span className="text-[13px] font-bold text-red-400">{d.value.toLocaleString()}</span>
              <span className="text-[8px] text-gray-light">ر.س</span>
            </div>
          ))}
          <div className="p-2 mt-1 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="text-[8px] text-red-400 leading-relaxed">
              ⚠️ أغلب الأيام الضعيفة في فبراير — يحتاج تحقيق: هل بسبب الطقس أو نقص مواد أو قلة الطلب؟
            </div>
          </div>
        </div>
      </div>

      {/* أداء أيام الأسبوع */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">📅 خريطة الأسبوع</div>
        <div className="space-y-1.5">
          {weekdays.map((d) => {
            const barColor = d.avg >= 750 ? 'bg-green-500/50' : d.avg >= 670 ? 'bg-yellow-500/40' : 'bg-red-500/40';
            return (
              <div key={d.day} className="flex items-center gap-2">
                <span className="text-[11px] text-gray w-14 text-left">{d.day}</span>
                <div className="flex-1 h-5 bg-border/20 rounded-sm overflow-hidden relative">
                  <div className={`h-full rounded-sm ${barColor}`} style={{ width: `${(d.avg / maxAvg) * 100}%` }} />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">{d.avg} ر.س</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 p-2 bg-background border border-border rounded-lg text-[8px] text-gray leading-relaxed">
          💡 <b className="text-foreground">نصيحة:</b> ركّز التسويق على الاثنين والأربعاء — فرصة رفع 15-20% بعروض بسيطة.
        </div>
      </div>
    </div>

    {/* ═══ تحليل الخصومات + توقعات ═══ */}
    <div className="grid grid-cols-2 gap-3">
      {/* تحليل الخصومات */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-orange-400 uppercase tracking-wider mb-3">🏷️ تحليل الخصومات والمسترد</div>
        <div className="space-y-2">
          {salesMonths.map((m) => {
            const discPct = ((m.discounts / m.gross) * 100);
            const barColor = discPct > 10 ? 'bg-red-500' : discPct > 2 ? 'bg-orange-500' : 'bg-green-500';
            return (
              <div key={m.month}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-gray">{m.month}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${discPct > 10 ? 'text-red-400' : discPct > 2 ? 'text-orange-400' : 'text-green-400'}`}>
                      {discPct.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-gray-light">{m.discounts.toLocaleString()} ر.س</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(discPct * 5, 100)}%` }} />
                </div>
              </div>
            );
          })}
          <div className="p-2 bg-background border border-border rounded-lg mt-2">
            <div className="text-[8px] text-gray leading-relaxed">
              📝 يناير استخدم خصومات افتتاحية كبيرة (14.6%). من فبراير فصاعداً انخفضت لأقل من 1% — تحسّن ممتاز في إدارة التسعير.
            </div>
          </div>
        </div>
      </div>

      {/* التوقعات والأهداف */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-green-400 uppercase tracking-wider mb-3">🔮 التوقعات والأهداف</div>
        <div className="space-y-2">
          {[
            { title: "توقع أبريل الكامل", value: "~25,430 ر.س", desc: "بمعدل 848 ر.س/يوم × 30 يوم", trend: "up" },
            { title: "هدف مايو (تحسين 15%)", value: "~29,250 ر.س", desc: "975 ر.س/يوم — محقق إذا تحسّن الاثنين والأربعاء", trend: "up" },
            { title: "الهدف: 1,000 ر.س/يوم", value: "30,000 ر.س/شهر", desc: "يحتاج رفع المتوسط 44% عن ديسمبر", trend: "target" },
            { title: "نقطة التعادل الشهرية", value: "~16,500 ر.س", desc: "بناءً على معدل حرق 16,541 ر.س/شهر", trend: "warning" },
            { title: "المسار الحالي (سنوي)", value: "~192,000 ر.س", desc: "بمتوسط 696 ر.س × 276 يوم عمل", trend: "up" },
          ].map((f) => (
            <div key={f.title} className="p-2 bg-background border border-border rounded-lg flex items-center gap-2">
              <span className={`text-[16px] ${f.trend === 'up' ? '' : f.trend === 'target' ? '' : ''}`}>
                {f.trend === 'up' ? '📈' : f.trend === 'target' ? '🎯' : '⚖️'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground">{f.title}</span>
                  <span className="text-[11px] font-bold text-green-400">{f.value}</span>
                </div>
                <div className="text-[8px] text-gray">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SalesIndicator;
