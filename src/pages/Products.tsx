import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { ChevronDown } from "lucide-react";

import burgerDoubleImg from "@/assets/burger-double.jpg";
import burgerChickenImg from "@/assets/burger-chicken.jpg";
import burgerSmokeImg from "@/assets/burger-smoke.jpg";
import mealCompleteImg from "@/assets/meal-complete.jpg";
import friesImg from "@/assets/fries.jpg";

const products = [
  { name: "آنجوس لحم", emoji: "🥩", desc: "لحم بريسكت + نشاك · جبن أمريكي ×2 · صلصة · خس وطماطم", price: 22, cost: 13.74, margin: 37.6, netProfit: -0.93, netMargin: -4.2, rating: "مقبول", ratingVariant: "warning" as const, img: burgerDoubleImg, salesPct: 34, tip: "هامش منخفض — فكّر برفع السعر 2-3 ر.س أو تقليل الجبن" },
  { name: "كريسبي الدجاج", emoji: "🍗", desc: "صدور دجاج مقرمش · دقيق تتبيلة · صوص سبايسي · خس وطماطم", price: 19, cost: 6.99, margin: 63.2, netProfit: 2.82, netMargin: 14.8, rating: "ممتاز", ratingVariant: "success" as const, img: burgerChickenImg, salesPct: 19, tip: "أفضل منتج من ناحية الهامش — ركّز عليه في التسويق" },
  { name: "ناشفيل الدجاج", emoji: "🌶️", desc: "صدور دجاج · جبن أمريكي · صوص ناشفيل · مخلل", price: 24, cost: 9.16, margin: 61.9, netProfit: 5.65, netMargin: 23.6, rating: "ممتاز", ratingVariant: "success" as const, img: burgerSmokeImg, salesPct: 12, tip: "أعلى صافي ربح — لو زادت مبيعاته 10% يرتفع الربح الشهري 500+ ر.س" },
];

const otherItems = [
  { cat: "🍟 الجوانب", items: [
    { name: "بطاطس منفردة", price: 5, cost: 3.63, margin: 27.3, rating: "مراجعة", ratingVariant: "danger" as const, img: friesImg },
    { name: "بطاطس بالجبن", price: 15, cost: 9.86, margin: 34.2, rating: "مقبول", ratingVariant: "warning" as const, img: friesImg },
  ]},
  { cat: "🥤 المشروبات", items: [
    { name: "بيبسي 250مل", price: 4, cost: 1.81, margin: 54.8, rating: "جيد", ratingVariant: "info" as const },
    { name: "ماء معدني", price: 1, cost: 0.50, margin: 50.0, rating: "جيد", ratingVariant: "info" as const },
  ]},
  { cat: "🍔 الوجبات", items: [
    { name: "وجبة آنجوس", price: 31, cost: 19.16, margin: 38.2, rating: "مقبول", ratingVariant: "warning" as const, img: mealCompleteImg },
    { name: "وجبة كريسبي", price: 28, cost: 12.31, margin: 56.1, rating: "ممتاز", ratingVariant: "success" as const, img: mealCompleteImg },
    { name: "وجبة ناشفيل", price: 33, cost: 14.48, margin: 56.1, rating: "ممتاز", ratingVariant: "success" as const, img: mealCompleteImg },
  ]},
  { cat: "📦 التغليف", items: [
    { name: "برجر منفرد", price: 0, cost: 1.005, margin: 0, note: "علبة + ورق قصدير + كيس" },
    { name: "بطاطس منفردة", price: 0, cost: 0.880, margin: 0, note: "علبة + كيس" },
    { name: "وجبة كاملة", price: 0, cost: 1.435, margin: 0, note: "علبتان + ورق + كيس مشترك" },
  ]},
];

const getMarginColor = (margin: number) => {
  if (margin >= 55) return "text-success";
  if (margin >= 35) return "text-warning";
  return "text-danger";
};

const getRatingBg = (variant: string) => {
  if (variant === "success") return "bg-success-bg text-success";
  if (variant === "warning") return "bg-warning-bg text-warning";
  if (variant === "danger") return "bg-danger-bg text-danger";
  return "bg-info-bg text-info";
};

const Products = () => {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <div className="animate-fade-in">
      <PageHeader title="المنتجات" subtitle="تحليل التكاليف وهوامش الربح — بيانات حقيقية" badge="7 منتجات" />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="💰 مبيعات شهرية" value="25,500" sub="~850 يومياً" showRiyal />
        <MetricCard label="🏆 أعلى هامش خام" value="ناشفيل" sub="↑ 61.9% هامش" subColor="success" />
        <MetricCard label="📈 صافي ربح شهري" value="6,817" sub="✅ هامش 26.7%" subColor="success" showRiyal />
        <MetricCard label="⚖️ نقطة التعادل" value="15,761" sub="⏳ ~19 يوم عمل" subColor="warning" showRiyal />
      </div>

      {/* البرجر — البطاقات الرئيسية */}
      <div className="ios-card mb-6">
        <div className="text-[11px] font-medium text-muted-foreground mb-4">🍔 البرجر — تحليل التكلفة والهامش</div>
        <div className="grid grid-cols-3 gap-4">
          {products.map((p) => {
            const isExpanded = expandedProduct === p.name;
            return (
              <div
                key={p.name}
                onClick={() => setExpandedProduct(isExpanded ? null : p.name)}
                className="rounded-2xl border border-border overflow-hidden bg-background cursor-pointer hover:shadow-md transition-all group"
              >
                {/* الصورة */}
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img src={p.img} alt={p.name} loading="lazy" width={512} height={512} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${getRatingBg(p.ratingVariant)}`}>
                    {p.rating}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2.5 right-3 text-[10px] text-white/80 font-medium">
                    {p.salesPct}% من الطلبات
                  </div>
                </div>

                {/* المعلومات */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px] font-bold text-foreground">{p.emoji} {p.name}</div>
                    <div className="text-[16px] font-bold text-primary flex items-center gap-1">{p.price} <RiyalIcon size={11} /></div>
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed mb-3">{p.desc}</div>

                  {/* الهوامش */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/50 rounded-xl py-2">
                      <div className="text-[10px] text-muted-foreground mb-0.5">التكلفة</div>
                      <div className="text-[13px] font-bold text-foreground">{p.cost}</div>
                    </div>
                    <div className="bg-muted/50 rounded-xl py-2">
                      <div className="text-[10px] text-muted-foreground mb-0.5">هامش خام</div>
                      <div className={`text-[13px] font-bold ${getMarginColor(p.margin)}`}>{p.margin}%</div>
                    </div>
                    <div className="bg-muted/50 rounded-xl py-2">
                      <div className="text-[10px] text-muted-foreground mb-0.5">صافي</div>
                      <div className={`text-[13px] font-bold ${p.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {p.netProfit >= 0 ? '+' : ''}{p.netProfit}
                      </div>
                    </div>
                  </div>

                  {/* التفاصيل الموسعة */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border animate-fade-in">
                      {/* شريط الهامش المرئي */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>تكلفة</span>
                          <span>ربح</span>
                        </div>
                        <div className="w-full h-3 bg-success/20 rounded-full overflow-hidden flex">
                          <div className="h-full bg-danger/60 rounded-r-full" style={{ width: `${100 - p.margin}%` }} />
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-xl px-3 py-2 text-[10px] text-muted-foreground leading-relaxed">
                        💡 {p.tip}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* الأقسام الأخرى — Accordion */}
      <div className="space-y-3">
        {otherItems.map((section) => {
          const isOpen = expandedCat === section.cat;
          return (
            <div key={section.cat} className="ios-card !p-0 overflow-hidden">
              <div
                onClick={() => setExpandedCat(isOpen ? null : section.cat)}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-foreground">{section.cat}</span>
                  <span className="text-[10px] text-muted-foreground">{section.items.length} أصناف</span>
                </div>
                <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </div>
              {isOpen && (
                <div className="border-t border-border animate-fade-in">
                  {section.items.map((item, i) => (
                    <div key={item.name} className={`flex items-center gap-3 px-5 py-3 ${i < section.items.length - 1 ? "border-b border-border" : ""}`}>
                      {'img' in item && item.img ? (
                        <img src={item.img} alt={item.name} loading="lazy" width={512} height={512} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-[16px] flex-shrink-0">
                          {section.cat.split(" ")[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-foreground">{item.name}</div>
                        {'note' in item && item.note ? (
                          <div className="text-[10px] text-muted-foreground">{item.note}</div>
                        ) : (
                          <div className="text-[10px] text-muted-foreground">
                            تكلفة: {item.cost} ر
                            {item.margin > 0 && <span className={` mr-2 font-semibold ${getMarginColor(item.margin)}`}>هامش: {item.margin}%</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.price > 0 && (
                          <span className="text-[14px] font-bold text-primary flex items-center gap-0.5">{item.price} <RiyalIcon size={10} /></span>
                        )}
                        {item.price === 0 && (
                          <span className="text-[12px] font-bold text-muted-foreground flex items-center gap-0.5">{item.cost} <RiyalIcon size={9} /></span>
                        )}
                        {'ratingVariant' in item && item.ratingVariant && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getRatingBg(item.ratingVariant)}`}>
                            {item.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Products;
