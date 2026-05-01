## المشكلة

بطاقة **"👥 حالة الطاقم اليوم"** في مركز القيادة (داخل `src/pages/Dashboard.tsx` السطور 350-370) مكتوبة بأسماء وهمية ثابتة في الكود:
- 4 موظفين ثابتين (يونس، شيمول، ميراج، ريان) بحالات وهمية
- إجمالي رواتب ثابت = 10,400 ريال
- متوسط يومي ثابت = 696 ريال

لذلك أي إضافة/تعديل/حذف في صفحة الطاقم **لا ينعكس** أبداً في مركز القيادة.

## الحل

### 1) ربط البطاقة بالموظفين الفعليين
- استبدال المصفوفة الثابتة باستخدام `useEmployees()` الموجود مسبقاً.
- عرض كل الموظفين النشطين، مع اسم مختصر (أول كلمة) ومسمى وظيفي مختصر (`role_short` أو أول 8 أحرف من `role`).
- تخطيط شبكي متجاوب (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4`) عشان يستوعب 5+ موظفين بدون كسر.

### 2) ربط حالة الحضور الحقيقية
- جلب سجلات `attendance` لتاريخ اليوم عبر hook بسيط (`useTodayAttendance`).
- لكل موظف: 
  - إذا فيه `check_in` بدون `late_minutes` → "حاضر" (success)
  - إذا `late_minutes > 0` → "تأخر Xد" (warning)
  - إذا ما فيه سجل لليوم → "غائب" (danger)
  - إذا فيه إجازة معتمدة في `employee_leaves` تشمل اليوم → "إجازة" (info)

### 3) حساب الرواتب الفعلية
- `totalSalaries = sum(employees.salary)` بدل القيمة الثابتة 10,400.
- `avgDaily` يُجلب من `daily_sales` آخر 30 يوم (متوسط `total_sales`) بدل 696 الثابت — موجود فعلاً عبر `useDailySalesSummary`.

### 4) تحديث فوري (Realtime)
- تفعيل Realtime على الجداول: `employees`, `attendance`, `employee_leaves` عبر migration:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_leaves;
  ```
- إضافة hook عام `useRealtimeInvalidate(table, queryKey)` في `src/hooks/useRealtime.ts` يعمل subscribe ويستدعي `queryClient.invalidateQueries` عند أي تغيير، مع تنظيف القناة عند unmount.
- استدعاؤه داخل `Dashboard.tsx` لكل من: `employees`, `attendance` → كل تغيير في صفحة الطاقم يحدّث مركز القيادة فوراً بدون reload.

## الملفات المتأثرة

| الملف | التغيير |
|---|---|
| `supabase/migrations/<new>.sql` | تفعيل Realtime على 3 جداول |
| `src/hooks/useRealtime.ts` (جديد) | hook عام للاشتراك بـ Realtime |
| `src/hooks/useTodayAttendance.ts` (جديد) | جلب حضور اليوم |
| `src/pages/Dashboard.tsx` | استبدال البطاقة الثابتة بمكون ديناميكي + اشتراك Realtime |

## ملاحظات
- ما بنغيّر التصميم البصري (نفس `ios-card` و `StatusBadge`) — فقط البيانات تصير حقيقية.
- لو عدد الموظفين كبير (>8)، البطاقة تتحول لقائمة قابلة للتمرير الأفقي.
