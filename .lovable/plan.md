# المشكلة

شريط النطاق الزمني (`TimeRangeBar`) في صفحة **مركز القيادة** يكتب القيمة في رابط الصفحة (`?range=7`) ويغيّر مظهر الزر فقط، لكن **لا أحد من الكروت يقرأ هذه القيمة**. كل مكوّن داخلي يجلب بياناته بشكل مستقل:

- `DailyStoryCard` يقرأ **اليوم فقط** دائماً (مفلتر بـ `todayStr`).
- `SalesLogCard` يقرأ آخر **30 يوم ثابتة** (`limit: 30`).
- `Dashboard` (نظرة عامة), `SalesIndicator`, `ProjectStatus`, `Behavior` كلها تستخدم `useState` محلي خاص بها للنطاق وتتجاهل الـ URL.

النتيجة: ضغط "أمس" أو "7 أيام" أو "90+" يُحدّث اللون فقط بدون أي تأثير على الأرقام.

# الحل

جعل `useRangeDays` (الموجود في `TimeRangeBar.tsx`) هو **مصدر الحقيقة الوحيد** للنطاق الزمني داخل مركز القيادة، ثم تمرير `fromDate / toDate` المحسوبة لكل الكروت.

## الخطوات

### 1. توحيد منطق حساب النطاق
إنشاء `src/lib/dateRange.ts` يحتوي:
- `computeRange(rangeDays)` يُرجع `{ fromDate, toDate, label }` بصيغة `YYYY-MM-DD` بتوقيت الرياض.
- المنطق:
  - `1` → اليوم فقط (from = to = اليوم)
  - `-1` → أمس فقط (from = to = أمس)
  - `7` → آخر 7 أيام (to = اليوم، from = اليوم - 6)
  - `30` → آخر 30 يوم
  - `0` → بدون فلتر (90+ يوم / كل البيانات)

### 2. تحديث `useRangeDays` في `TimeRangeBar.tsx`
إضافة دالة مساعدة `useDateRange()` تستدعي `useRangeDays` ثم `computeRange` وتُرجع `{ rangeDays, fromDate, toDate }` جاهزة للاستخدام.

### 3. تحديث الكروت لاستهلاك النطاق

**أ. `DailyStoryCard.tsx`**
- بدل قراءة `todayStr` ثابتة، يقرأ `useDateRange()`.
- إذا `rangeDays === 1` → يبقى نفس السلوك (يوم واحد).
- إذا نطاق متعدد الأيام → يجمع `total_sales / net_sales / orders_count` من `daily_sales` بين `fromDate` و `toDate`، ويعرض القصة بصيغة "خلال آخر X يوم: …" بدل "اليوم".

**ب. `SalesLogCard.tsx`**
- استبدال `useDailySalesSummary({ limit: 30 })` بـ `useDailySalesSummary({ fromDate, toDate, limit: 90 })` المأخوذتين من `useDateRange()`.
- في حالة `rangeDays === 1` أو `-1` يُختار اليوم/الأمس تلقائياً كالتاريخ الافتراضي للسجل.

**ج. `Dashboard.tsx` (تبويب نظرة عامة)**
- البحث عن أي `useState` محلي للنطاق واستبداله بـ `useDateRange()` عند تشغيله مع `embedded`.

**د. `SalesIndicator.tsx` و `ProjectStatus.tsx`**
- نفس المعالجة: عند `embedded` يقرأ `useDateRange()` بدل `useState` المحلي، ويُخفي شريط الفلاتر الداخلي لتجنب التكرار. خارج مركز القيادة يحتفظ بالسلوك الحالي.

**هـ. `Behavior.tsx`**
- ليس داخل مركز القيادة، يبقى كما هو (شريط محلي).

### 4. مؤشّر بصري للنطاق النشط
إضافة سطر صغير تحت `PageHeader` في `CommandCenter.tsx` يعرض الفترة الفعلية المستخدمة:
`الفترة: 24 أبريل – 30 أبريل 2026 (7 أيام)` — يُحدَّث تلقائياً مع الزر.

## الملفات المتأثرة

```text
src/lib/dateRange.ts                              [جديد]
src/components/dashboard/TimeRangeBar.tsx         [إضافة useDateRange]
src/components/dashboard/DailyStoryCard.tsx       [قراءة fromDate/toDate]
src/components/dashboard/SalesLogCard.tsx         [تمرير fromDate/toDate]
src/pages/Dashboard.tsx                           [قراءة النطاق عند embedded]
src/pages/SalesIndicator.tsx                      [قراءة النطاق عند embedded]
src/pages/ProjectStatus.tsx                       [قراءة النطاق عند embedded]
src/pages/CommandCenter.tsx                       [عرض ملصق الفترة]
```

## النتيجة المتوقعة
- ضغط **أمس** → كل الكروت تعرض بيانات يوم أمس فقط.
- ضغط **7 أيام** → الكروت تجمع/تعرض آخر 7 أيام.
- ضغط **90+ يوم** → بدون فلتر تاريخي، كل البيانات.
- شريط واحد يتحكم بكل شيء في مركز القيادة.
