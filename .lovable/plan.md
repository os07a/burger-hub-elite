## الهدف
صفحة المخزون حالياً مفككة: التبويبات في الأعلى مباشرة بدون عنوان، KPIs مكدّسة بدون ترتيب، الجدول الطويل بدون فلترة، وتنبيه نصي طويل في النهاية. الحل: نقلّد بنية مركز القيادة (PageHeader + شريط فرعي + بطاقة قصة + Tabs) مع تنظيم بصري RTL واضح.

## البنية الجديدة لـ InventoryHub

```text
┌─ PageHeader: "المخزون" + تاريخ اليوم + شارة "{N} صنف"
├─ InventoryTimelineBar (مثل TimeRangeBar): فلاتر سريعة
│    [الكل] [حرج] [منخفض] [كافٍ]   |   بحث   |   تصنيفات (chips)
├─ InventoryStoryCard (مثل DailyStoryCard):
│    ملخص ذكي بالعربية: "لديك 3 أصناف حرجة و7 منخفضة. القيمة الإجمالية للمخزون X ريال."
│    + 4 KPI داخل البطاقة (إجمالي/كافٍ/منخفض/حرج) بنفس نمط ios-card
├─ Tabs:
│    [📦 الأصناف] [🚨 يحتاج طلب] [📋 الجرد والتعديلات]
│    ── الأصناف: جدول مفلتر بالـ status/category/search
│    ── يحتاج طلب: قائمة الأصناف الحرجة + المنخفضة مجمّعة بالمورد (لتسهيل الطلب)
│    ── الجرد والتعديلات: محتوى OpeningInventory الحالي
```

## التغييرات الملفية

### 1) `src/pages/InventoryHub.tsx` (إعادة كتابة)
- إضافة `PageHeader` على مستوى الـ Hub (بدل أن يكون داخل كل صفحة فرعية).
- إضافة `InventoryStoryCard` و `InventoryFilterBar` فوق الـ Tabs.
- ثلاثة تبويبات: `items`, `reorder`, `opening`.
- مزامنة الفلتر (status/search/category) عبر `useState` ثم تمريرها كـ props لـ `Inventory`.

### 2) `src/components/inventory/InventoryStoryCard.tsx` (جديد)
- يستهلك `useInventory()` ويحسب: عدد الحرج/المنخفض/الكافٍ + قيمة المخزون (`Σ quantity × cost_per_unit`) + أعلى مورد بقيمة أصناف ناقصة.
- جملة قصة عربية ذكية (مثل DailyStoryCard) + شريط 4 KPIs مدمج.

### 3) `src/components/inventory/InventoryFilterBar.tsx` (جديد)
- شارات فلترة بالحالة (الكل/كافٍ/منخفض/حرج) مع عدّاد لكل حالة.
- حقل بحث (`Input` مع أيقونة Search).
- Chips للتصنيفات (قابلة للضغط للتفعيل/الإلغاء).

### 4) `src/pages/Inventory.tsx` (تنظيف)
- إزالة `PageHeader` و KPIs (انتقلت للـ Hub/StoryCard).
- إزالة شريط التنبيه السفلي (انتقل لتبويب "يحتاج طلب").
- استقبال props: `statusFilter`, `searchQuery`, `categoryFilter` وتطبيقها على الجدول.
- تحسين رؤوس الجدول (sticky + tighter padding RTL).

### 5) `src/components/inventory/ReorderTab.tsx` (جديد)
- يجمع الأصناف غير الكافية حسب المورد.
- لكل مورد: عدد الأصناف، إجمالي الكميات الناقصة (min - qty)، زر "نسخ قائمة الطلب" (clipboard).
- بطاقات بنمط ios-card، ترتيب حسب الحرجية أولاً.

### 6) `src/pages/OpeningInventory.tsx` (تنظيف بسيط)
- إزالة `PageHeader` المكرر (تركه على مستوى الـ Hub).
- الإبقاء على باقي البنية كما هي.

## مبادئ التصميم
- اتجاه RTL واضح: العنوان والشارات يمين، الإجراءات/البحث يسار.
- استخدام نفس tokens ومسافات مركز القيادة (`mb-7`, `mb-5`, `gap-4`, `ios-card`).
- ألوان محدودة: success/warning/danger/muted فقط (نفس قاعدة Menu Analysis الأخيرة).
- لا أيقونات زائدة، Emoji للعناوين الكبيرة فقط.
- بدون كسر روابط: `/inventory` و `/inventory?tab=opening` يستمران بالعمل، نضيف `?tab=reorder`.

## ما لن يتغير
- `useInventory.ts`، RLS، أو أي جدول قاعدة بيانات.
- مكونات `InventoryFormDialog` و `OpeningInventory` الداخلية.
- التريغر وحالته في تبويب الجرد.
