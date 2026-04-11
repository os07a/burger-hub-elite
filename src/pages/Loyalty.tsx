import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, Repeat, Star, AlertTriangle, TrendingUp, Clock, ChevronDown, ChevronUp } from "lucide-react";

// ========== بيانات حقيقية من ملف البونات (679 سجل، 11 يناير – 10 أبريل 2026) ==========

const totalRecords = 679;
const uniqueCustomers = 565;
const totalPoints = 32683;
const totalSales = 32869;
const avgTicket = 48.4;
const avgPointsPerVisit = 48.1;
const oneTimeCustomers = 496;
const repeatCustomers = 69;
const loyalCustomers = 6; // 5+ visits
const suspectedFraud = 5;
const namedCustomers = 309;
const anonymousCustomers = 256;
const registrationRate = ((namedCustomers / uniqueCustomers) * 100).toFixed(1);

// أعلى العملاء
const topCustomers = [
  { phone: "966562051824", name: "—", visits: 13, spent: 438, points: 438, tier: "ذهبي" as const },
  { phone: "966590446489", name: "يونس", visits: 8, spent: 135, points: 134, tier: "ذهبي" as const },
  { phone: "966543875233", name: "جوهرة", visits: 7, spent: 191, points: 191, tier: "فضي" as const },
  { phone: "966543700875", name: "—", visits: 5, spent: 306, points: 306, tier: "فضي" as const },
  { phone: "966507376679", name: "—", visits: 5, spent: 235, points: 235, tier: "فضي" as const },
  { phone: "966554778913", name: "فهد الجهني", visits: 5, spent: 196, points: 196, tier: "فضي" as const },
  { phone: "966592931309", name: "shog", visits: 3, spent: 153, points: 153, tier: "عادي" as const },
  { phone: "966549983257", name: "بجاد", visits: 3, spent: 168, points: 168, tier: "عادي" as const },
  { phone: "966536392402", name: "فراس", visits: 3, spent: 89, points: 89, tier: "عادي" as const },
  { phone: "966583390447", name: "ريّان العنزي", visits: 3, spent: 118, points: 118, tier: "عادي" as const },
];

// توزيع الأيام
const dayOfWeekData = [
  { day: "سبت", visits: 90, avgTicket: 49.5 },
  { day: "أحد", visits: 85, avgTicket: 44.9 },
  { day: "اثنين", visits: 100, avgTicket: 44.5 },
  { day: "ثلاثاء", visits: 120, avgTicket: 49.0 },
  { day: "أربعاء", visits: 86, avgTicket: 43.8 },
  { day: "خميس", visits: 102, avgTicket: 54.3 },
  { day: "جمعة", visits: 96, avgTicket: 51.7 },
];

// ساعات الذروة
const peakHours = [
  { hour: "8-2م", label: "ظهيرة", visits: 22, pct: 3 },
  { hour: "2-6م", label: "عصر", visits: 99, pct: 15 },
  { hour: "6-10م", label: "مساء", visits: 327, pct: 48 },
  { hour: "10م-1ص", label: "ليل", visits: 231, pct: 34 },
];

// تقسيم العملاء
const segmentData = [
  { name: "زيارة واحدة", value: 496, color: "hsl(var(--muted-foreground))" },
  { name: "2-4 زيارات", value: 63, color: "hsl(var(--primary))" },
  { name: "5+ زيارات (أوفياء)", value: 6, color: "hsl(45, 93%, 47%)" },
];

// حالات مشبوهة
const suspectedRecords = [
  { name: "عبدالباري", phone: "...4438", date: "20 مارس", amount: 52, reason: "0 نقاط مع 52 ر.س" },
  { name: "—", phone: "...8861", date: "6 مارس", amount: 50, reason: "0 نقاط مع 50 ر.س" },
  { name: "—", phone: "...9647", date: "26 يناير", amount: 29, reason: "0 نقاط مع 29 ر.س" },
  { name: "—", phone: "...8964", date: "12 يناير", amount: 54, reason: "0 نقاط مع 54 ر.س" },
  { name: "يونس", phone: "...6489", date: "11 يناير", amount: 1, reason: "طلب 1 ر.س فقط — اختبار؟" },
];

// بونات نشطة
const coupons = [
  { icon: "🍟", title: "بطاطس مجانية", desc: "عند إتمام 5 زيارات تحصل على بطاطس وسط مجاناً مع أي طلب", code: "FRIES5X", exp: "صالح لمدة 14 يوم من الاستحقاق", active: true },
  { icon: "🎂", title: "عرض عيد الميلاد", desc: "خصم 20% على أي طلب في يوم ميلادك", code: "BDAY20", exp: "صالح ليوم واحد فقط", active: true },
  { icon: "👥", title: "ادعو صديق", desc: "أحضر صديق جديد واحصل على مشروب مجاني لكليكما", code: "FRIEND2", exp: "ينتهي 30 أبريل 2026", active: true },
];

// تحليلات ذكية
const smartInsights = [
  { icon: "🔥", text: "الثلاثاء أعلى يوم بعدد الزيارات (120 زيارة) — ركّز على جودة الخدمة هذا اليوم", type: "success" },
  { icon: "💡", text: `88% من العملاء زاروا مرة واحدة فقط — فرصة كبيرة لاستراتيجية إعادة الجذب (SMS أو بونات خاصة)`, type: "warning" },
  { icon: "⏰", text: "48% من الزيارات بين 6-10 مساءً — وقت الذروة الذهبي لتفعيل العروض", type: "info" },
  { icon: "📱", text: `${registrationRate}% فقط سجّلوا أسمائهم — حفّز التسجيل بمكافأة إضافية`, type: "warning" },
  { icon: "🏆", text: "الخميس أعلى متوسط فاتورة (54.3 ر.س) — العملاء يصرفون أكثر نهاية الأسبوع", type: "success" },
  { icon: "⚠️", text: `${suspectedFraud} عمليات مشبوهة مسجلة — تحتاج مراجعة يدوية`, type: "danger" },
];

const tierColor = (tier: string) => {
  if (tier === "ذهبي") return "info" as const;
  if (tier === "فضي") return "success" as const;
  return "warning" as const;
};

const Loyalty = () => {
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "customers" | "coupons" | "fraud">("overview");

  const displayedCustomers = showAllCustomers ? topCustomers : topCustomers.slice(0, 5);

  return (
    <div>
      <PageHeader title="الولاء والبونات" subtitle="بيانات حقيقية · 679 سجل · 11 يناير – 10 أبريل 2026" badge={`${uniqueCustomers} عميل`} />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard label="عملاء فريدين" value={uniqueCustomers.toString()} sub={`${namedCustomers} مسجّل · ${anonymousCustomers} مجهول`} subColor="success" />
        <MetricCard label="إجمالي النقاط" value={totalPoints.toLocaleString()} sub={`${avgPointsPerVisit} نقطة/زيارة`} />
        <MetricCard label="متوسط الفاتورة" value={`${avgTicket} ر.س`} sub={`إجمالي ${totalSales.toLocaleString()} ر.س`} subColor="success" />
        <MetricCard label="معدل الولاء" value={`${((repeatCustomers / uniqueCustomers) * 100).toFixed(1)}%`} sub={`${repeatCustomers} عميل متكرر · ${loyalCustomers} وفيّ`} subColor="warning" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-surface border border-border rounded-lg p-1">
        {[
          { id: "overview" as const, label: "نظرة عامة", icon: TrendingUp },
          { id: "customers" as const, label: "العملاء", icon: Users },
          { id: "coupons" as const, label: "البونات", icon: Star },
          { id: "fraud" as const, label: "مشبوهة", icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
            {tab.id === "fraud" && <span className="text-[9px] bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center">{suspectedFraud}</span>}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Smart Insights */}
          <div className="bg-surface border border-border rounded-lg p-4 mb-4">
            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">💡 تحليلات ذكية</div>
            <div className="grid grid-cols-2 gap-2">
              {smartInsights.map((insight, i) => (
                <div key={i} className={`p-2.5 rounded-lg text-[11px] leading-relaxed border ${
                  insight.type === "success" ? "bg-emerald-500/5 border-emerald-500/20 text-foreground" :
                  insight.type === "warning" ? "bg-amber-500/5 border-amber-500/20 text-foreground" :
                  insight.type === "danger" ? "bg-destructive/5 border-destructive/20 text-foreground" :
                  "bg-primary/5 border-primary/20 text-foreground"
                }`}>
                  {insight.icon} {insight.text}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Customer Segments Pie */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">📊 تقسيم العملاء</div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={segmentData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {segmentData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} عميل`, ""]} contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, direction: "rtl" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {segmentData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{s.value} <span className="text-muted-foreground font-normal">({((s.value / uniqueCustomers) * 100).toFixed(0)}%)</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day of Week Bar Chart */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">📅 الزيارات حسب اليوم</div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekData} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      formatter={(v: number, name: string) => [name === "visits" ? `${v} زيارة` : `${v} ر.س`, name === "visits" ? "الزيارات" : "متوسط الفاتورة"]}
                      contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, direction: "rtl" }}
                    />
                    <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">أعلى يوم</div>
                  <div className="text-[14px] font-bold text-foreground">الثلاثاء</div>
                  <div className="text-[10px] text-emerald-400">120 زيارة</div>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">أعلى فاتورة</div>
                  <div className="text-[14px] font-bold text-foreground">الخميس</div>
                  <div className="text-[10px] text-amber-400">54.3 ر.س</div>
                </div>
              </div>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-surface border border-border rounded-lg p-4 mb-4">
            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">⏰ ساعات الذروة</div>
            <div className="grid grid-cols-4 gap-2">
              {peakHours.map((h) => (
                <div key={h.label} className={`rounded-lg p-3 text-center border ${h.pct >= 40 ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border"}`}>
                  <Clock size={14} className={`mx-auto mb-1 ${h.pct >= 40 ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-[12px] font-bold text-foreground">{h.label}</div>
                  <div className="text-[10px] text-muted-foreground">{h.hour}</div>
                  <div className={`text-[16px] font-bold mt-1 ${h.pct >= 40 ? "text-primary" : "text-foreground"}`}>{h.pct}%</div>
                  <div className="text-[9px] text-muted-foreground">{h.visits} زيارة</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <>
          {/* Loyalty Card for top customer */}
          <div className="bg-foreground rounded-2xl p-6 mb-4 relative overflow-hidden text-primary-foreground">
            <div className="absolute -top-[30px] -right-[30px] w-[200px] h-[200px] rounded-full bg-primary/20 pointer-events-none" />
            <div className="absolute -bottom-[40px] -left-[10px] w-[140px] h-[140px] rounded-full bg-primary/15 pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative">
              <div>
                <div className="text-[11px] font-bold text-primary-foreground/50 tracking-wider uppercase">برجرهم · أكثر عميل ولاءً</div>
                <div className="text-[18px] font-extrabold mt-1">العميل #...1824</div>
                <div className="text-[11px] text-primary-foreground/60 mt-0.5">13 زيارة · 438 ر.س إجمالي إنفاق</div>
              </div>
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">👑 الأكثر ولاءً</span>
            </div>
            <div className="flex gap-1.5 mb-3 relative">
              {Array.from({ length: 13 }).map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] ${
                  (i + 1) % 5 === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-500" : "bg-primary border-2 border-primary"
                }`}>
                  {(i + 1) % 5 === 0 ? "★" : "●"}
                </div>
              ))}
            </div>
            <div className="text-[11px] text-primary-foreground/50 relative">13 زيارة = مكافأتان مجانيتان 🍟🍟 + 3 طوابع للمكافأة القادمة</div>
          </div>

          {/* Customer Table */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">🏆 أفضل العملاء حسب الزيارات</div>
            <div className="border border-border rounded-lg overflow-hidden bg-border space-y-px">
              <div className="grid bg-background" style={{ gridTemplateColumns: "40px 1fr 80px 90px 90px 70px" }}>
                {["#", "العميل", "الزيارات", "الإنفاق", "النقاط", "الفئة"].map((h) => (
                  <div key={h} className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">{h}</div>
                ))}
              </div>
              {displayedCustomers.map((c, i) => (
                <div key={c.phone} className="grid bg-surface items-center hover:bg-muted/30 transition-colors" style={{ gridTemplateColumns: "40px 1fr 80px 90px 90px 70px" }}>
                  <div className="px-3 py-2.5 text-[12px] font-bold text-muted-foreground">{i + 1}</div>
                  <div className="px-3 py-2.5">
                    <div className="text-[12px] font-bold text-foreground">{c.name}</div>
                    <div className="text-[9px] text-muted-foreground">...{c.phone.slice(-4)}</div>
                  </div>
                  <div className="px-3 py-2.5">
                    <span className="text-[12px] font-bold text-foreground">{c.visits}</span>
                    <span className="text-[10px] text-muted-foreground"> زيارة</span>
                  </div>
                  <div className="px-3 py-2.5 text-[12px] font-medium text-foreground">{c.spent} ر.س</div>
                  <div className="px-3 py-2.5 text-[12px] font-medium text-primary">{c.points} ⭐</div>
                  <div className="px-3 py-2.5">
                    <StatusBadge variant={tierColor(c.tier)} className="text-[9px]">{c.tier}</StatusBadge>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAllCustomers(!showAllCustomers)}
              className="w-full mt-2 text-[11px] text-primary hover:underline flex items-center justify-center gap-1 py-1.5"
            >
              {showAllCustomers ? <>عرض أقل <ChevronUp size={12} /></> : <>عرض الكل (10) <ChevronDown size={12} /></>}
            </button>
          </div>

          {/* Registration Rate */}
          <div className="bg-surface border border-border rounded-lg p-4 mt-3">
            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">📱 نسبة التسجيل بالاسم</div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${registrationRate}%` }} />
                </div>
              </div>
              <span className="text-[14px] font-bold text-foreground">{registrationRate}%</span>
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
              <span>✅ {namedCustomers} مسجّل بالاسم</span>
              <span>❓ {anonymousCustomers} بدون اسم</span>
            </div>
            <div className="mt-2 p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg text-[10px] text-foreground">
              💡 نصيحة: أضف 10 نقاط إضافية لمن يسجّل اسمه — هذا يرفع نسبة التسجيل ويساعدك في التسويق المخصص
            </div>
          </div>
        </>
      )}

      {/* Coupons Tab */}
      {activeTab === "coupons" && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">🎫 البونات النشطة</div>
          <div className="grid grid-cols-3 gap-2.5">
            {coupons.map((c) => (
              <div key={c.code} className="border-[1.5px] border-dashed border-border rounded-xl p-4 relative overflow-hidden transition-colors hover:border-primary/30">
                <span className="absolute top-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">نشط</span>
                <div className="text-[22px] mb-2">{c.icon}</div>
                <div className="text-[14px] font-bold text-foreground mb-1">{c.title}</div>
                <div className="text-[11px] text-muted-foreground mb-2 leading-relaxed">{c.desc}</div>
                <span className="text-[11px] font-bold text-primary tracking-wider bg-destructive/10 px-2.5 py-0.5 rounded-md inline-block">{c.code}</span>
                <div className="text-[10px] text-muted-foreground mt-1.5">{c.exp}</div>
              </div>
            ))}
          </div>

          {/* Reward Eligibility */}
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="text-[11px] font-bold text-foreground mb-2">🎁 مستحقون للمكافأة حالياً</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-background rounded-lg p-2 border border-border">
                <div className="text-[18px] font-bold text-primary">{loyalCustomers}</div>
                <div className="text-[9px] text-muted-foreground">أتموا 5+ زيارات</div>
              </div>
              <div className="bg-background rounded-lg p-2 border border-border">
                <div className="text-[18px] font-bold text-foreground">{repeatCustomers}</div>
                <div className="text-[9px] text-muted-foreground">في طريقهم (2-4)</div>
              </div>
              <div className="bg-background rounded-lg p-2 border border-border">
                <div className="text-[18px] font-bold text-muted-foreground">{oneTimeCustomers}</div>
                <div className="text-[9px] text-muted-foreground">زيارة واحدة فقط</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fraud Tab */}
      {activeTab === "fraud" && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">⚠️ عمليات مشبوهة ({suspectedFraud})</div>
          <div className="space-y-2">
            {suspectedRecords.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div>
                  <div className="text-[12px] font-bold text-foreground">{r.name} <span className="text-muted-foreground font-normal text-[10px]">{r.phone}</span></div>
                  <div className="text-[10px] text-muted-foreground">{r.date} · {r.amount} ر.س</div>
                </div>
                <div className="text-left">
                  <StatusBadge variant="danger" className="text-[9px]">مشبوه</StatusBadge>
                  <div className="text-[9px] text-destructive mt-0.5">{r.reason}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg text-[10px] text-foreground">
            🔍 ملاحظة: هذه العمليات سُجّلت كـ "suspected" في النظام — يُنصح بمراجعة الكاميرا والتأكد يدوياً. العميل "يونس" (موظف كاشير) سجّل طلب 1 ر.س — قد يكون اختبار أو استخدام شخصي.
          </div>
        </div>
      )}
    </div>
  );
};

export default Loyalty;
