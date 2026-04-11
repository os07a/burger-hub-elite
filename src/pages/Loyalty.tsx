import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

const members = [
  { name: "أحمد العمري", visits: "17 زيارة", stamps: [1,1,1,1,1,"r"], reward: "جاهزة 🍟", rewardVariant: "success" as const, tier: "ذهبي", tierVariant: "info" as const },
  { name: "سارة الزهراني", visits: "9 زيارات", stamps: [1,1,1,0,0,0], reward: "زيارتين باقيتين", tier: "فضي", tierVariant: "success" as const },
  { name: "فهد الأنصاري", visits: "5 زيارات", stamps: [1,1,1,1,1,"r"], reward: "جاهزة 🍟", rewardVariant: "success" as const, tier: "عادي", tierVariant: "warning" as const },
  { name: "محمد الغامدي", visits: "3 زيارات", stamps: [1,1,1,0,0,0], reward: "زيارتين باقيتين", tier: "عادي", tierVariant: "warning" as const },
];

const coupons = [
  { icon: "🍟", title: "بطاطس مجانية", desc: "عند إتمام 5 زيارات تحصل على بطاطس وسط مجاناً مع أي طلب", code: "FRIES5X", exp: "صالح لمدة 14 يوم من الاستحقاق", active: true },
  { icon: "🎂", title: "عرض عيد الميلاد", desc: "خصم 20% على أي طلب في يوم ميلادك", code: "BDAY20", exp: "صالح ليوم واحد فقط", active: true },
  { icon: "👥", title: "ادعو صديق", desc: "أحضر صديق جديد واحصل على مشروب مجاني لكليكما", code: "FRIEND2", exp: "ينتهي 30 أبريل 2026", active: true },
  { icon: "🍔", title: "برجر ثاني بنص السعر", desc: "اشتر برجر واحصل على الثاني بخصم 50%", code: "BOGOF50", exp: "انتهى 5 أبريل 2026", active: false },
];

const Loyalty = () => (
  <div>
    <PageHeader title="الولاء" subtitle="بطاقات الولاء · البونات · المستهلكون" badge="48 عضو" />

    <div className="grid grid-cols-3 gap-3 mb-5">
      <MetricCard label="إجمالي الأعضاء" value="48" sub="↑ 6 هذا الشهر" subColor="success" />
      <MetricCard label="بطاطس مجانية مُصرَّفة" value="31" sub="هذا الشهر" />
      <MetricCard label="بونات نشطة" value="12" sub="تنتهي قريباً 3" subColor="warning" />
    </div>

    {/* Loyalty Card */}
    <div className="bg-foreground rounded-2xl p-6 mb-4 relative overflow-hidden text-primary-foreground">
      <div className="absolute -top-[30px] -right-[30px] w-[200px] h-[200px] rounded-full bg-primary/20 pointer-events-none" />
      <div className="absolute -bottom-[40px] -left-[10px] w-[140px] h-[140px] rounded-full bg-primary/15 pointer-events-none" />
      <div className="flex justify-between items-start mb-5 relative">
        <div>
          <div className="text-[11px] font-bold text-primary-foreground/50 tracking-wider uppercase">برجرهم · بطاقة الولاء</div>
          <div className="text-[18px] font-extrabold mt-1">أحمد العمري</div>
        </div>
        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">عضو ذهبي</span>
      </div>
      <div className="flex gap-2 mb-5 relative">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="w-[38px] h-[38px] rounded-full bg-primary border-2 border-primary flex items-center justify-center text-[16px]">●</div>
        ))}
        <div className="w-[38px] h-[38px] rounded-full border-2 border-amber-500 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[16px]">★</div>
        {[7,8,9,10].map((i) => (
          <div key={i} className="w-[38px] h-[38px] rounded-full border-2 border-primary-foreground/20 bg-primary-foreground/5 flex items-center justify-center" />
        ))}
      </div>
      <div className="flex justify-between items-center relative">
        <div className="text-[11px] text-primary-foreground/50">5 من 5 زيارات — استحق مكافأته</div>
        <div className="text-[12px] font-bold text-amber-400">🍟 بطاطس مجانية جاهزة</div>
      </div>
    </div>

    {/* Coupons */}
    <div className="bg-surface border border-border rounded-lg p-4 mb-4">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">البونات النشطة</div>
      <div className="grid grid-cols-2 gap-2.5">
        {coupons.map((c) => (
          <div key={c.code} className={`border-[1.5px] border-dashed border-border rounded-xl p-4 relative overflow-hidden transition-colors hover:border-primary/30 ${!c.active ? "opacity-50" : ""}`}>
            <span className={`absolute top-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${c.active ? "bg-success-bg text-success" : "bg-background text-gray-light"}`}>
              {c.active ? "نشط" : "مستخدم"}
            </span>
            <div className="text-[22px] mb-2">{c.icon}</div>
            <div className="text-[14px] font-bold text-foreground mb-1">{c.title}</div>
            <div className="text-[11px] text-gray mb-2 leading-relaxed">{c.desc}</div>
            <span className="text-[11px] font-bold text-primary tracking-wider bg-danger-bg px-2.5 py-0.5 rounded-md inline-block">{c.code}</span>
            <div className="text-[10px] text-gray-light mt-1.5">{c.exp}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Members Table */}
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">أعضاء الولاء</div>
      <div className="border border-border rounded-lg overflow-hidden bg-border space-y-px">
        <div className="grid bg-background" style={{ gridTemplateColumns: "1fr 90px 90px 100px 80px" }}>
          {["المستهلك", "الزيارات", "البطاقة", "المكافأة", "الحالة"].map((h) => (
            <div key={h} className="text-[9px] font-semibold text-gray-light uppercase tracking-wide px-3 py-2">{h}</div>
          ))}
        </div>
        {members.map((m) => (
          <div key={m.name} className="grid bg-surface items-center hover:bg-background/50" style={{ gridTemplateColumns: "1fr 90px 90px 100px 80px" }}>
            <div className="px-3 py-2.5 text-[12px] font-bold text-foreground">{m.name}</div>
            <div className="px-3 py-2.5 text-[12px] font-medium text-foreground">{m.visits}</div>
            <div className="px-3 py-2.5">
              <div className="flex gap-1">
                {m.stamps.map((s, i) => (
                  <div key={i} className={`w-5 h-3.5 rounded-sm border-[1.5px] ${s === "r" ? "bg-amber-500 border-amber-500" : s === 1 ? "bg-primary border-primary" : "bg-background border-border"}`} />
                ))}
              </div>
            </div>
            <div className="px-3 py-2.5">
              {m.rewardVariant ? (
                <StatusBadge variant={m.rewardVariant} className="text-[10px]">{m.reward}</StatusBadge>
              ) : (
                <span className="text-[11px] text-gray-light">{m.reward}</span>
              )}
            </div>
            <div className="px-3 py-2.5">
              <StatusBadge variant={m.tierVariant} className="text-[10px]">{m.tier}</StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Loyalty;
