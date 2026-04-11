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

const burgers = [
  { name: "برجر دبل", desc: "لحمتين · جبن · صلصة خاصة · خس · طماطم", price: "35 ر", status: "نشط", variant: "success" as const, img: burgerDoubleImg },
  { name: "برجر كلاسيك", desc: "لحمة · خضار · صلصة بيبر", price: "25 ر", status: "نشط", variant: "success" as const, img: burgerClassicImg },
  { name: "تشيكن برجر", desc: "دجاج مقلي مقرمش · مايونيز · خس", price: "28 ر", status: "نشط", variant: "success" as const, img: burgerChickenImg },
  { name: "برجر مشروم", desc: "لحمة · جبن · مشروم مشوي", price: "32 ر", status: "نشط", variant: "success" as const, img: burgerMushroomImg },
  { name: "سموك برجر", desc: "لحمة · جبن مدخن · بيكون بقري · BBQ", price: "38 ر", status: "موسمي", variant: "warning" as const, img: burgerSmokeImg },
];

const meals = [
  { name: "واجبة كلاسيك", desc: "برجر + بطاطس + مشروب", price: "42 ر", img: mealCompleteImg },
  { name: "واجبة دبل", desc: "برجر دبل + بطاطس + مشروب", price: "52 ر", img: mealCompleteImg },
  { name: "واجبة عائلية", desc: "4 برجر + 2 بطاطس كبير + 4 مشروبات", price: "149 ر", img: mealCompleteImg },
];

const extras = [
  { name: "بطاطس", desc: "وسط / كبير", price: "8 / 12 ر", img: friesImg },
  { name: "مشروب غازي", desc: "وسط / كبير", price: "6 / 9 ر" },
  { name: "ميلك شيك", desc: "شوك · فانيلا · فراولة", price: "18 ر", img: milkshakeImg },
  { name: "جبن إضافي", desc: "شيدر / موزاريلا", price: "4 ر" },
  { name: "صلصات", desc: "حارة · بيبر · BBQ", price: "2 ر" },
];

const Products = () => (
  <div>
    <PageHeader title="المنتجات" subtitle="قائمة الأصناف والأسعار والتصنيفات" badge="26 منتج" />

    <div className="grid grid-cols-3 gap-3 mb-5">
      <MetricCard label="إجمالي الأصناف" value="26" sub="صنف نشط" />
      <MetricCard label="متوسط سعر الطلب" value="35" sub="ريال" />
      <MetricCard label="أعلى صنف مبيعاً" value="برجر دبل" sub="34% من الطلبات" subColor="success" />
    </div>

    {/* البرجر - عرض بطاقات */}
    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary mb-4">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-4">البرجر</div>
      <div className="grid grid-cols-5 gap-3">
        {burgers.map((b) => (
          <div key={b.name} className="rounded-xl border border-border overflow-hidden bg-background hover:shadow-md transition-shadow group">
            <div className="aspect-square overflow-hidden">
              <img
                src={b.img}
                alt={b.name}
                loading="lazy"
                width={512}
                height={512}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between mb-1">
                <div className="text-[13px] font-bold text-foreground">{b.name}</div>
                <StatusBadge variant={b.variant} className="text-[9px] flex-shrink-0">{b.status}</StatusBadge>
              </div>
              <div className="text-[11px] text-gray leading-relaxed mb-2">{b.desc}</div>
              <div className="text-[15px] font-bold text-primary">{b.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      {/* الوجبات الكاملة */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">الوجبات الكاملة</div>
        <div className="space-y-2.5">
          {meals.map((m) => (
            <div key={m.name} className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-background/50 transition-colors">
              <img src={m.img} alt={m.name} loading="lazy" width={512} height={512} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-foreground">{m.name}</div>
                <div className="text-[11px] text-gray">{m.desc}</div>
              </div>
              <div className="text-[14px] font-bold text-primary whitespace-nowrap">{m.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* الإضافات والمشروبات */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">الإضافات والمشروبات</div>
        <div className="space-y-2.5">
          {extras.map((e) => (
            <div key={e.name} className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-background/50 transition-colors">
              {e.img ? (
                <img src={e.img} alt={e.name} loading="lazy" width={512} height={512} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center text-[18px] flex-shrink-0">
                  {e.name === "مشروب غازي" ? "🥤" : e.name === "جبن إضافي" ? "🧀" : "🫙"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-foreground">{e.name}</div>
                <div className="text-[11px] text-gray">{e.desc}</div>
              </div>
              <div className="text-[14px] font-bold text-primary whitespace-nowrap">{e.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Products;
