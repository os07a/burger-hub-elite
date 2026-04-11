import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";

/* ────── بيانات كشف البنك ────── */
const totalBankRevenue = 68270;
const totalBankExpenses = 66163;
const netCashFlow = totalBankRevenue - totalBankExpenses;
const burnRate = Math.round(totalBankExpenses / 4);
const investmentTotal = 292405;
const roiMonths = Math.round(investmentTotal / (totalBankRevenue / 4));

const bankMonths = [
  { month: "ديسمبر", income: 13611, expenses: 3601 },
  { month: "يناير", income: 18906, expenses: 21765 },
  { month: "فبراير", income: 14524, expenses: 12632 },
  { month: "مارس", income: 19695, expenses: 23372 },
  { month: "أبريل", income: 5866, expenses: 4800 },
];

/* ────── بيانات مبيعات الكاشير (حقيقية) ────── */
const salesMonths = [
  { month: "ديسمبر 25", key: "12-25", gross: 15951, net: 15292, days: 31, avg: 493, max: 902, min: 5, discounts: 616, refunds: 43 },
  { month: "يناير 26", key: "01-26", gross: 32266, net: 27470, days: 31, avg: 886, max: 2030, min: 240, discounts: 4709, refunds: 87 },
  { month: "فبراير 26", key: "02-26", gross: 15294, net: 15055, days: 28, avg: 538, max: 1052, min: 97, discounts: 76, refunds: 163 },
  { month: "مارس 26", key: "03-26", gross: 24787, net: 24728, days: 31, avg: 798, max: 1759, min: 293, discounts: 59, refunds: 0 },
  { month: "أبريل 26", key: "04-26", gross: 9342, net: 9325, days: 11, avg: 848, max: 1141, min: 333, discounts: 17, refunds: 0 },
];

const totalGross = 97640;
const totalNet = 91870;
const totalDays = 132;
const dailyAvg = Math.round(totalNet / totalDays);
const totalDiscounts = 5477;
const discountRate = ((totalDiscounts / totalGross) * 100).toFixed(1);

const weekdayData = [
  { day: "الجمعة", avg: 810, icon: "🟢" },
  { day: "الخميس", avg: 707, icon: "🟢" },
  { day: "السبت", avg: 704, icon: "🟡" },
  { day: "الأحد", avg: 681, icon: "🟡" },
  { day: "الثلاثاء", avg: 674, icon: "🟡" },
  { day: "الأربعاء", avg: 668, icon: "🟡" },
  { day: "الاثنين", avg: 627, icon: "🔴" },
];

const growthData = [
  { from: "ديسمبر", to: "يناير", pct: 79.6 },
  { from: "يناير", to: "فبراير", pct: -45.2 },
  { from: "فبراير", to: "مارس", pct: 64.3 },
  { from: "مارس", to: "أبريل", pct: -62.3 },
];

const maxGross = Math.max(...salesMonths.map(m => m.gross));
const maxBankIncome = Math.max(...bankMonths.map(m => m.income));

const ProjectStatus = () => (
  <div>
    <PageHeader title="حالة المشروع" subtitle="كشف بنك الراجحي + تقرير الكاشير · ديسمبر 2025 – أبريل 2026" badge="مباشر" />

    {/* ═══════ القسم الأول: مؤشرات مالية عليا ═══════ */}
    <div className="grid grid-cols-5 gap-2 mb-4">
      {[
        { label: "إجمالي المبيعات (كاشير)", value: totalGross.toLocaleString(), unit: "ر.س", icon: "🧾", accent: "border-t-primary", textColor: "text-primary" },
        { label: "صافي المبيعات", value: totalNet.toLocaleString(), unit: "ر.س", icon: "💵", accent: "border-t-green-500", textColor: "text-green-400" },
        { label: "متوسط يومي", value: dailyAvg.toLocaleString(), unit: "ر.س/يوم", icon: "📊", accent: "border-t-blue-500", textColor: "text-blue-400" },
        { label: "معدل الخصم", value: `${discountRate}%`, unit: `${totalDiscounts.toLocaleString()} ر.س`, icon: "🏷️", accent: "border-t-orange-500", textColor: "text-orange-400" },
        { label: "الرصيد البنكي", value: "2,107", unit: "ر.س", icon: "🏦", accent: "border-t-red-500", textColor: "text-red-400" },
      ].map((m) => (
        <div key={m.label} className={`bg-surface border border-border ${m.accent} border-t-2 rounded-lg p-3`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-gray-light font-medium">{m.label}</span>
            <span className="text-[14px]">{m.icon}</span>
          </div>
          <div className={`text-[18px] font-bold ${m.textColor}`}>{m.value}</div>
          <div className="text-[9px] text-gray-light">{m.unit}</div>
        </div>
      ))}
    </div>

    {/* ═══════ القسم الثاني: مبيعات شهرية + أيام الأسبوع + نمو ═══════ */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      {/* أداء المبيعات الشهري */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">🧾 أداء المبيعات الشهري (كاشير)</div>
        <div className="space-y-2">
          {salesMonths.map((m) => (
            <div key={m.key}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-gray w-20">{m.month}</span>
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="text-gray-light">{m.days} يوم</span>
                  <span className="text-foreground font-bold">{m.net.toLocaleString()}</span>
                </div>
              </div>
              <div className="relative h-3 bg-border/50 rounded-sm overflow-hidden">
                <div className="h-full bg-primary/60 rounded-sm" style={{ width: `${(m.gross / maxGross) * 100}%` }} />
                <div className="absolute top-0 right-0 h-full bg-primary rounded-sm" style={{ width: `${(m.net / maxGross) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[8px] text-gray-light mt-0.5">
                <span>أدنى: {m.min}</span>
                <span>متوسط: {m.avg}</span>
                <span>أعلى: {m.max}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* أداء أيام الأسبوع */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">📅 متوسط المبيعات حسب اليوم</div>
        <div className="space-y-1.5">
          {weekdayData.map((d) => (
            <div key={d.day} className="flex items-center gap-2">
              <span className="text-[10px]">{d.icon}</span>
              <span className="text-[11px] text-gray w-16">{d.day}</span>
              <div className="flex-1 h-4 bg-border/30 rounded-sm overflow-hidden relative">
                <div
                  className={`h-full rounded-sm ${d.avg >= 750 ? 'bg-green-500/40' : d.avg >= 670 ? 'bg-yellow-500/30' : 'bg-red-500/30'}`}
                  style={{ width: `${(d.avg / 810) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">
                  {d.avg} ر.س
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2 bg-background border border-border rounded-lg">
          <div className="text-[9px] font-bold text-foreground mb-1">💡 استنتاج</div>
          <div className="text-[8px] text-gray leading-relaxed">
            الجمعة أقوى يوم (810 ر.س) والاثنين الأضعف (627 ر.س).
            الفارق 29% — فرصة لعروض يوم الاثنين.
          </div>
        </div>
      </div>

      {/* النمو الشهري */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">📈 النمو الشهري</div>
        <div className="space-y-2">
          {growthData.map((g) => (
            <div key={g.from + g.to} className="p-2.5 bg-background border border-border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray">{g.from} → {g.to}</span>
                <span className={`text-[13px] font-bold ${g.pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {g.pct >= 0 ? '↑' : '↓'} {Math.abs(g.pct)}%
                </span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${g.pct >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(g.pct), 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2 bg-background border border-border rounded-lg">
          <div className="text-[9px] font-bold text-foreground mb-1">⚠️ ملاحظة</div>
          <div className="text-[8px] text-gray leading-relaxed">
            النمو متذبذب بشدة — صعود كبير يليه هبوط حاد.
            يناير تضخّم بسبب خصومات الافتتاح (4,709 ر.س خصم).
          </div>
        </div>
      </div>
    </div>

    {/* ═══════ القسم الثالث: نقاط الضعف + التوقعات + العجز ═══════ */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      {/* نقاط الضعف */}
      <div className="bg-surface border border-border border-r-2 border-r-red-500 rounded-lg p-4">
        <div className="text-[9px] font-semibold text-red-400 uppercase tracking-wider mb-3">🔴 نقاط الضعف</div>
        <div className="space-y-2">
          {[
            { title: "فبراير: أضعف شهر كامل", desc: "متوسط 538 ر.س/يوم — أقل من التعادل التشغيلي. أيام وصلت 97 ر.س فقط.", severity: "danger" as const },
            { title: "الاثنين: أضعف يوم أسبوعي", desc: "627 ر.س متوسط — أقل 23% من الجمعة. يحتاج استراتيجية عروض.", severity: "warning" as const },
            { title: "تذبذب عالي في المبيعات", desc: "الفارق بين أعلى يوم (2,030) وأدنى يوم فعلي (97) = 2,000%.", severity: "danger" as const },
            { title: "خصومات يناير مبالغة", desc: `4,709 ر.س خصومات (14.6% من مبيعات الشهر) — أكلت هامش الربح.`, severity: "warning" as const },
            { title: "اعتماد على أيام الذروة", desc: "أعلى 10 أيام = 30% من إجمالي المبيعات — خطر تركّز.", severity: "warning" as const },
          ].map((w) => (
            <div key={w.title} className="p-2 bg-background border border-border rounded-lg">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-foreground">{w.title}</span>
                <StatusBadge variant={w.severity} className="text-[7px]">
                  {w.severity === "danger" ? "حرج" : "تحذير"}
                </StatusBadge>
              </div>
              <div className="text-[8px] text-gray leading-relaxed">{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* العجز والفجوات */}
      <div className="bg-surface border border-border border-r-2 border-r-orange-500 rounded-lg p-4">
        <div className="text-[9px] font-semibold text-orange-400 uppercase tracking-wider mb-3">🟠 العجز والفجوات</div>
        <div className="space-y-2">
          {[
            { title: "فجوة البنك vs الكاشير", value: `${(totalNet - totalBankRevenue).toLocaleString()} ر.س`, desc: "المبيعات في الكاشير (91,870) أعلى من إيداعات البنك (68,270) — يعني فيه كاش لم يودع.", icon: "🔍" },
            { title: "عجز السيولة", value: "2,107 ر.س", desc: "الرصيد الحالي يكفي يوم واحد فقط بالمعدل الحالي. أقل من أسبوع تشغيل.", icon: "🚨" },
            { title: "معدل الاسترداد", value: `${((293/totalGross)*100).toFixed(2)}%`, desc: `293 ر.س مبالغ مستردة — نسبة صحية لكن تحتاج مراقبة.`, icon: "↩️" },
            { title: "أيام تحت 300 ر.س", value: "8 أيام", desc: "8 أيام من 132 تحت 300 ر.س — غالبها في ديسمبر وفبراير.", icon: "📉" },
            { title: "لا بيانات تكلفة", value: "0%", desc: "تكلفة البضاعة المباعة = صفر في النظام. يعني هامش الربح الحقيقي غير محسوب.", icon: "⚠️" },
          ].map((g) => (
            <div key={g.title} className="p-2 bg-background border border-border rounded-lg">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                  <span className="text-[12px]">{g.icon}</span> {g.title}
                </span>
                <span className="text-[11px] font-bold text-orange-400">{g.value}</span>
              </div>
              <div className="text-[8px] text-gray leading-relaxed">{g.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* التوقعات */}
      <div className="bg-surface border border-border border-r-2 border-r-green-500 rounded-lg p-4">
        <div className="text-[9px] font-semibold text-green-400 uppercase tracking-wider mb-3">🟢 التوقعات والتحليل التنبؤي</div>
        <div className="space-y-2">
          {(() => {
            const apr30Projected = Math.round(9325 * (30 / 11));
            const q2Projected = Math.round(apr30Projected * 3 * 1.1);
            const monthlyTarget = Math.round(investmentTotal / 24);
            return [
              { title: "توقع أبريل الكامل", value: `~${apr30Projected.toLocaleString()} ر.س`, desc: `بناءً على 11 يوم (848 ر.س/يوم) — إذا استمر المعدل يصل ~${apr30Projected.toLocaleString()}.`, icon: "🎯" },
              { title: "توقع Q2 (أبريل-يونيو)", value: `~${q2Projected.toLocaleString()} ر.س`, desc: "مع نمو 10% شهري متوقع بسبب دخول الصيف.", icon: "📈" },
              { title: "هدف التعادل الشهري", value: `${monthlyTarget.toLocaleString()} ر.س/شهر`, desc: `لاسترداد رأس المال (${investmentTotal.toLocaleString()}) في سنتين.`, icon: "⚖️" },
              { title: "استرداد رأس المال", value: `~${roiMonths} شهر`, desc: `بمتوسط ربح شهري ~${Math.round(netCashFlow / 4).toLocaleString()} ر.س — يحتاج تحسين الهوامش.`, icon: "⏱️" },
              { title: "الإيجابي: مارس نموذجي", value: "798 ر.س/يوم", desc: "مارس أثبت أن المتجر قادر على 25K+ شهرياً بدون خصومات.", icon: "✅" },
            ].map((f) => (
              <div key={f.title} className="p-2 bg-background border border-border rounded-lg">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                    <span className="text-[12px]">{f.icon}</span> {f.title}
                  </span>
                  <span className="text-[11px] font-bold text-green-400">{f.value}</span>
                </div>
                <div className="text-[8px] text-gray leading-relaxed">{f.desc}</div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>

    {/* ═══════ القسم الرابع: البنك + الاستثمار ═══════ */}
    <div className="grid grid-cols-2 gap-3 mb-4">
      {/* إيرادات vs مصروفات البنك */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">🏦 الحركة البنكية — إيرادات vs مصروفات</div>
        <div className="space-y-2">
          {bankMonths.map((m) => {
            const net = m.income - m.expenses;
            return (
              <div key={m.month}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-gray w-14">{m.month}</span>
                  <span className={`text-[9px] font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {net >= 0 ? '+' : ''}{net.toLocaleString()}
                  </span>
                </div>
                <div className="relative h-3">
                  <div className="h-full bg-green-500/30 rounded-r-sm border-r-2 border-r-green-400" style={{ width: `${(m.income / maxBankIncome) * 100}%` }} />
                  <div className="h-full bg-red-500/20 rounded-l-sm border-l-2 border-l-red-400 absolute top-0 right-0" style={{ width: `${(m.expenses / maxBankIncome) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-3 text-[8px] text-gray-light">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-400 inline-block" /> إيرادات</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> مصروفات</span>
        </div>
      </div>

      {/* توزيع المصروفات */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">💸 توزيع المصروفات البنكية</div>
        <div className="space-y-1.5">
          {[
            { label: "مشتريات التشغيل", amount: 54642, color: "bg-primary", emoji: "🛒" },
            { label: "فواتير كهرباء", amount: 2428, color: "bg-yellow-500", emoji: "⚡" },
            { label: "إقامات عمالة", amount: 3614, color: "bg-orange-500", emoji: "📋" },
            { label: "موردين", amount: 2550, color: "bg-blue-500", emoji: "🚛" },
            { label: "سحوبات ومتفرقات", amount: 3500, color: "bg-muted-foreground", emoji: "💳" },
          ].map((item) => {
            const pct = Math.round((item.amount / totalBankExpenses) * 100);
            return (
              <div key={item.label} className="group">
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-gray flex items-center gap-1">
                    <span className="text-[11px]">{item.emoji}</span>{item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-light">{pct}%</span>
                    <span className="text-foreground font-medium">{item.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* ═══════ القسم الخامس: الاستثمار ═══════ */}
    <div className="grid grid-cols-4 gap-2">
      {[
        { label: "ديكور وتجهيزات", amount: "69,585", pct: 23.8, icon: "🎨", color: "border-t-purple-500" },
        { label: "معدات وآلات", amount: "84,100", pct: 28.8, icon: "⚙️", color: "border-t-blue-500" },
        { label: "إيجار (سنوي)", amount: "40,000", pct: 13.7, icon: "🏠", color: "border-t-amber-500" },
        { label: "رواتب + تشغيل", amount: "84,000", pct: 28.7, icon: "👷", color: "border-t-green-500" },
      ].map((item) => (
        <div key={item.label} className={`bg-surface border border-border ${item.color} border-t-2 rounded-lg p-3 flex items-center gap-3`}>
          <div className="text-[22px]">{item.icon}</div>
          <div>
            <div className="text-[13px] font-bold text-foreground">{item.amount} <span className="text-[9px] text-gray-light font-normal">ر.س</span></div>
            <div className="text-[10px] text-gray">{item.label}</div>
            <div className="w-16 h-1 bg-border rounded-full overflow-hidden mt-1">
              <div className="h-full bg-foreground/30 rounded-full" style={{ width: `${item.pct * 3}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ProjectStatus;
