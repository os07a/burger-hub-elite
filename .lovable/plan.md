## ربط مؤشر المبيعات ببيانات Loyverse الحقيقية

### الهدف
استبدال القيم الثابتة في `src/pages/SalesIndicator.tsx` ببيانات حقيقية من جدول `daily_sales` (Loyverse) عبر Supabase، مع حسابات ديناميكية لكل الأقسام.

### ملاحظة حول البيانات المتاحة
حالياً جدول `daily_sales` يحتوي **37 يوم فقط** (20 مارس → 26 أبريل 2026). الأرقام الثابتة الحالية تغطي ديسمبر→أبريل (132 يوم) — لذلك ستظهر فعلياً فقط الفترة المتاحة، مع subtitle ديناميكي يعكس النطاق الحقيقي.

### التغييرات

**1. هوك جديد `src/hooks/useSalesIndicator.ts`**
يستخدم `useDailySalesSummary` ويُرجع بيانات محسوبة:
- **KPIs**: totalGross, totalNet, dailyAvg, bestDay, worstDay (استثناء الأيام = 0)، totalDiscounts
- **monthlyBreakdown**: تجميع حسب الشهر العربي (gross, net, days, avg, discounts, discPct, rating)
- **bestDays / worstDays**: top 5 / bottom 5 (مع استثناء الأيام صفر من الأسوأ)
- **weekdayAverages**: متوسط `gross_sales` لكل يوم أسبوع
- **forecasts**: توقع الشهر = dailyAvg × أيام الشهر، هدف +15%، نقطة التعادل ~16,500

**2. تعديل `src/pages/SalesIndicator.tsx`**
- إزالة كل المصفوفات الثابتة (bestDays, worstDays, salesMonths, weekdays)
- استدعاء `useSalesIndicator()` بدلاً منها
- subtitle ديناميكي: `"تقرير الكاشير · {N} يوم · {minDate} – {maxDate}"`
- حالة فارغة عند عدم وجود بيانات + توجيه لمزامنة Loyverse
- Skeleton أثناء التحميل
- الحفاظ على نفس التصميم RTL والألوان والأيقونات بالكامل بدون أي تغيير بصري

**3. مساعدات تنسيق في `src/lib/format.ts`**
- `getArabicMonth(date)` → "يناير", "فبراير"...
- `getArabicWeekday(date)` → "الجمعة", "الأحد"...
- `formatArabicDayMonth(date)` → "2 يناير"

### النتيجة
- كل الأرقام في الصفحة تأتي من `daily_sales` بشكل حي
- تحديث تلقائي عند مزامنة Loyverse جديدة (React Query)
- نفس الشكل البصري والـ RTL بدون أي تغيير في التصميم