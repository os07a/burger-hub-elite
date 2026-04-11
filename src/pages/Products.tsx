import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

import burgerDoubleImg from "@/assets/burger-double.jpg";
import burgerClassicImg from "@/assets/burger-classic.jpg";
import burgerChickenImg from "@/assets/burger-chicken.jpg";
import burgerMushroomImg from "@/assets/burger-mushroom.jpg";
import burgerSmokeImg from "@/assets/burger-smoke.jpg";
import mealCompleteImg from "@/assets/meal-complete.jpg";
import friesImg from "@/assets/fries.jpg";
import milkshakeImg from "@/assets/milkshake.jpg";

const products = [
  { name: "آنجوس لحم", emoji: "🥩", desc: "لحم بريسكت + نشاك · جبن أمريكي ×2 · صلصة · خس وطماطم", price: 22, cost: 13.74, margin: 37.6, netProfit: -0.93, netMargin: -4.2, rating: "مقبول", ratingVariant: "warning" as const, img: burgerDoubleImg },
  { name: "كريسبي الدجاج", emoji: "🍗", desc: "صدور دجاج مقرمش · دقيق تتبيلة · صوص سبايسي · خس وطماطم", price: 19, cost: 6.99, margin: 63.2, netProfit: 2.82, netMargin: 14.8, rating: "ممتاز", ratingVariant: "success" as const, img: burgerChickenImg },
  { name: "ناشفيل الدجاج", emoji: "🌶️", desc: "صدور دجاج · جبن أمريكي · صوص ناشفيل · مخلل", price: 24, cost: 9.16, margin: 61.9, netProfit: 5.65, netMargin: 23.6, rating: "ممتاز", ratingVariant: "success" as const, img: burgerSmokeImg },
];

const sides = [
  { name: "بطاطس منفردة", emoji: "🍟", price: 5, cost: 3.63, margin: 27.3, netMargin: -156.5, rating: "مراجعة", ratingVariant: "danger" as const, img: friesImg },
  { name: "بطاطس بالجبن", emoji: "🧀", price: 15, cost: 9.86, margin: 34.2, netMargin: -27.0, rating: "مقبول", ratingVariant: "warning" as const, img: friesImg },
];

const drinks = [
  { name: "بيبسي 250مل", emoji: "🥤", price: 4, cost: 1.81, margin: 54.8, rating: "جيد", ratingVariant: "info" as const },
  { name: "ماء معدني", emoji: "💧", price: 1, cost: 0.50, margin: 50.0, rating: "جيد", ratingVariant: "info" as const },
];

const meals = [
  { name: "وجبة آنجوس", desc: "آنجوس لحم + بطاطس + مشروب", price: 31, img: mealCompleteImg },
  { name: "وجبة كريسبي", desc: "كريسبي الدجاج + بطاطس + مشروب", price: 28, img: mealCompleteImg },
  { name: "وجبة ناشفيل", desc: "ناشفيل الدجاج + بطاطس + مشروب", price: 33, img: mealCompleteImg },
];

const packaging = [
  { type: "برجر منفرد", cost: 1.005, items: "علبة + ورق قصدير + كيس" },
  { type: "بطاطس منفردة", cost: 0.880, items: "علبة + كيس" },
  { type: "وجبة كاملة", cost: 1.435, items: "علبتان + ورق + كيس مشترك" },
];

const getMarginColor = (margin: number) => {
  if (margin >= 55) return "text-green-400";
  if (margin >= 35) return "text-yellow-400";
  return "text-red-400";
};

const getRatingBg = (variant: string) => {
  if (variant === "success") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (variant === "warning") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  if (variant === "danger") return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
};

const Products = () => (
  <div>
    <PageHeader title="المنتجات" subtitle="دراسة التكاليف وهوامش الربح — بيانات حقيقية من ملف التحليل" badge="7 منتجات" />

    <div className="grid grid-cols-4 gap-3 mb-5">
      <MetricCard label="مبيعات شهرية" value="25,500" sub="ر.س / ~850 يومياً" />
      <MetricCard label="أعلى هامش خام" value="ناشفيل" sub="61.9% هامش" subColor="success" />
      <MetricCard label="صافي ربح شهري" value="6,817" sub="ر.س · هامش 26.7%" subColor="success" />
      <MetricCard label="نقطة التعادل" value="15,761" sub="ر.س · ~19 يوم عمل" subColor="warning" />
    </div>

    {/* البرجر - بطاقات مع تحليل الهامش */}
    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary mb-4">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-4">🍔 البرجر — تحليل التكلفة والهامش</div>
      <div className="grid grid-cols-3 gap-3">
        {products.map((p) => (
          <div key={p.name} className="rounded-xl border border-border overflow-hidden bg-background hover:shadow-md transition-shadow group">
            <div className="aspect-[16/10] overflow-hidden relative">
              <img src={p.img} alt={p.name} loading="lazy" width={512} height={512} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full border ${getRatingBg(p.ratingVariant)}`}>
                {p.rating}
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between mb-1">
                <div className="text-[13px] font-bold text-foreground">{p.emoji} {p.name}</div>
                <div className="text-[15px] font-bold text-primary">{p.price} ر</div>
              </div>
              <div className="text-[10px] text-gray leading-relaxed mb-3">{p.desc}</div>
              
              {/* شريط الهامش */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray">تكلفة المواد</span>
                  <span className="text-foreground font-medium">{p.cost} ر</span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${100 - p.margin}%` }} />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray">هامش خام</span>
                  <span className={`font-bold ${getMarginColor(p.margin)}`}>{p.margin}%</span>
                </div>
                <div className="flex justify-between text-[10px] border-t border-border pt-1.5">
                  <span className="text-gray">صافي الربح / وحدة</span>
                  <span className={`font-bold ${p.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {p.netProfit >= 0 ? '+' : ''}{p.netProfit} ر ({p.netMargin}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-4">
      {/* الجوانب */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">🍟 الجوانب</div>
        <div className="space-y-2.5">
          {sides.map((s) => (
            <div key={s.name} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-background/50 transition-colors">
              {s.img ? (
                <img src={s.img} alt={s.name} loading="lazy" width={512} height={512} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center text-[18px] flex-shrink-0">{s.emoji}</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-foreground">{s.name}</div>
                <div className="flex gap-3 text-[10px] text-gray mt-0.5">
                  <span>تكلفة: {s.cost} ر</span>
                  <span className={getMarginColor(s.margin)}>هامش: {s.margin}%</span>
                </div>
              </div>
              <div className="text-left flex-shrink-0">
                <div className="text-[14px] font-bold text-primary">{s.price} ر</div>
                <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 inline-block ${getRatingBg(s.ratingVariant)}`}>{s.rating}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* المشروبات */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">🥤 المشروبات</div>
        <div className="space-y-2.5">
          {drinks.map((d) => (
            <div key={d.name} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-background/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center text-[18px] flex-shrink-0">{d.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-foreground">{d.name}</div>
                <div className="flex gap-3 text-[10px] text-gray mt-0.5">
                  <span>تكلفة: {d.cost} ر</span>
                  <span className={getMarginColor(d.margin)}>هامش: {d.margin}%</span>
                </div>
              </div>
              <div className="text-[14px] font-bold text-primary">{d.price} ر</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      {/* الوجبات */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">🍔 الوجبات الكاملة</div>
        <div className="space-y-2.5">
          {meals.map((m) => (
            <div key={m.name} className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-background/50 transition-colors">
              <img src={m.img} alt={m.name} loading="lazy" width={512} height={512} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-foreground">{m.name}</div>
                <div className="text-[11px] text-gray">{m.desc}</div>
              </div>
              <div className="text-[14px] font-bold text-primary whitespace-nowrap">{m.price} ر</div>
            </div>
          ))}
        </div>
      </div>

      {/* التغليف */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">📦 تكلفة التغليف</div>
        <div className="space-y-2.5">
          {packaging.map((p) => (
            <div key={p.type} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-background/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-[16px] flex-shrink-0">📦</div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-foreground">{p.type}</div>
                <div className="text-[10px] text-gray">{p.items}</div>
              </div>
              <div className="text-[13px] font-bold text-primary whitespace-nowrap">{p.cost} ر</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Products;
