
## الهدف
دمج ثلاث صفحات (`/`, `/sales-indicator`, `/project-status`) في **مركز قيادة (Command Center)** واحد على المسار `/`، مع توحيد ألوان البطاقات وإلغاء التكرار.

## التغييرات الرئيسية

### 1) صفحة موحّدة جديدة: `src/pages/CommandCenter.tsx`
بنية الصفحة من الأعلى للأسفل:

```text
┌──────────────────────────────────────────────────┐
│ شريط زمني علوي:  [اليوم] [7أيام] [30يوم] [90+]  │  ← يتحكم بكل البيانات
├──────────────────────────────────────────────────┤
│ 📖 بطاقة "قصة اليوم"  (Daily Story Card)         │
│  جملة سردية ذكية + 3 أرقام مفتاحية               │
├──────────────────────────────────────────────────┤
│ تبويبات داخلية: [نظرة عامة] [المبيعات] [الحالة] │
└──────────────────────────────────────────────────┘
```

- **نظرة عامة** = ملخّص اليوم (دخل اليوم، تنبيهات مخزون، حالة الطاقم) + Health Score + Momentum.
- **المبيعات** = محتوى `SalesIndicator` (KPIs، الأداء الشهري، أفضل/أضعف أيام، خريطة الأسبوع، الخصومات، التوقعات).
- **الحالة** = محتوى `ProjectStatus` (نقاط الضعف، الفجوات، البنك vs الكاشير، توزيع الاستثمار).

التبويبات تُزامَن مع `?tab=` (مثل StaffHub) للحفاظ على الروابط.

### 2) حذف الصف الثاني المكرر في لوحة التحكم
الصف المكرر هو `<div className="mb-6 grid grid-cols-5 gap-4">` (السطور 174-186 في `Dashboard.tsx`) لأن نفس المعلومات (متوسط يومي، صافي، تنبيهات مخزون) تتكرر في لوحات `ProjectStatus` و `SalesIndicator`. يُستبدَل بـ:
- بطاقة "قصة اليوم" الواحدة في الأعلى.
- بطاقة "دخل اليوم" التفاعلية فقط (التي فيها زر الإضافة والمزامنة).

### 3) توحيد لون البطاقات (Design Tokens فقط)
المشكلة الحالية: `text-red-400`, `text-orange-400`, `text-blue-400`, `text-green-400`, `bg-red-500/10`, `bg-orange-500/10`… مبعثرة.

**النظام الموحّد** (يستخدم متغيرات `index.css` الموجودة فقط):
| الدلالة | اللون | الاستخدام |
|---|---|---|
| محايد/رئيسي | `text-foreground` / `bg-card` | الأرقام الرئيسية، عناوين البطاقات |
| إيجابي | `text-success` / `bg-success/10` | نمو، أعلى يوم، توقعات إيجابية |
| تحذير | `text-warning` / `bg-warning/15` | خصومات، تأخير، فجوات متوسطة |
| خطر | `text-danger` / `bg-danger/10` | عجز، أضعف يوم، تنبيهات حرجة |
| معلوماتي | `text-info` / `bg-info/10` | مقارنات، تحليل تنبؤي |
| ثانوي | `text-muted-foreground` / `bg-muted` | تسميات، نصوص فرعية |

كل البطاقات تستخدم `ios-card` (نفس الخلفية والظل والـradius) — لا حدود ملوّنة. النبرة فقط في الأيقونة الدائرية الصغيرة والرقم.

### 4) بطاقة "قصة اليوم" — مكوّن جديد
`src/components/dashboard/DailyStoryCard.tsx`:
- يقرأ من: `daily_sales` (اليوم) + `useSalesIndicator` (7 أيام) + `useProjectStatusInsights`.
- يولّد جملة سردية واحدة بالعربية، مثلاً:
  > "اليوم الجمعة — أقوى أيامك. الإيراد حتى الآن **820 ر.س**، أعلى من متوسطك بـ **17%**. السيولة تكفي **3 أيام**، وعندك **4 تنبيهات مخزون** تحتاج اهتمامك."
- 3 شارات سفلية: دخل اليوم · مقارنة بالمتوسط · حالة السيولة.
- نبرة البطاقة (success/warning/danger) تُحسب تلقائياً حسب أداء اليوم.

### 5) الشريط الزمني العلوي
`src/components/dashboard/TimeRangeBar.tsx` — مكوّن مشترك:
- أزرار: اليوم / 7أيام / 30يوم / 90+يوم.
- يحفظ الاختيار في URL (`?range=7`).
- يُمرَّر للتبويبات الثلاثة، فيُعاد حساب KPIs و الرسوم تلقائياً.

### 6) التوجيه (Routing)
في `src/App.tsx`:
- `/` → `CommandCenter` (الافتراضي = تبويب نظرة عامة).
- `/sales-indicator` → `<Navigate to="/?tab=sales" replace />`.
- `/project-status` → `<Navigate to="/?tab=status" replace />`.

في `src/components/layout/Sidebar.tsx`:
- حذف عنصرَي "حالة المشروع" و "مؤشر المبيعات".
- "لوحة التحكم" تصبح "مركز القيادة".
- النتيجة: 3 عناصر → 1 عنصر في مجموعة "الرئيسية".

### 7) إعادة تنظيم الكود (بدون تغيير المنطق)
- نقل جسم `SalesIndicator.tsx` إلى `src/components/command-center/SalesTab.tsx`.
- نقل جسم `ProjectStatus.tsx` إلى `src/components/command-center/StatusTab.tsx`.
- نقل لوحة "دخل اليوم" + الجداول من `Dashboard.tsx` إلى `src/components/command-center/OverviewTab.tsx`.
- الصفحات القديمة `Dashboard.tsx` / `SalesIndicator.tsx` / `ProjectStatus.tsx` تُحذف.

### 8) تطبيق التوحيد اللوني
استبدالات داخل `SalesTab` و `StatusTab` فقط (لا تُغيَّر الـ hooks):
- `text-red-400` → `text-danger`
- `text-orange-400` / `text-orange-500` → `text-warning`
- `text-blue-400` / `text-blue-500` → `text-info`
- `text-green-400` / `text-green-500` → `text-success`
- `bg-red-500/10` → `bg-danger/10`، وهكذا
- `border-red-500/30` → `border-danger/30`
- إزالة `text-black` صريحاً → `text-foreground` (يعمل في الوضع الداكن).

## الملفات المتأثرة
**جديدة**:
- `src/pages/CommandCenter.tsx`
- `src/components/command-center/OverviewTab.tsx`
- `src/components/command-center/SalesTab.tsx`
- `src/components/command-center/StatusTab.tsx`
- `src/components/dashboard/DailyStoryCard.tsx`
- `src/components/dashboard/TimeRangeBar.tsx`

**معدّلة**:
- `src/App.tsx` (مسارات + redirects)
- `src/components/layout/Sidebar.tsx` (تنظيف القائمة)

**محذوفة**:
- `src/pages/Dashboard.tsx`
- `src/pages/SalesIndicator.tsx`
- `src/pages/ProjectStatus.tsx`

## التحقق بعد التنفيذ
- زيارة `/` تعرض الواجهة الجديدة بالتبويبات الثلاثة.
- `/sales-indicator` و `/project-status` يُعاد توجيههما تلقائياً.
- لا توجد ألوان `red-400/orange-400/blue-400/green-400` متبقية في صفحات Command Center.
- الشريط الزمني يغيّر البيانات في كل التبويبات.
- بطاقة قصة اليوم تظهر في أعلى كل تبويب.
- الوضع الداكن يعمل بشكل صحيح (لا `text-black` صريح).
