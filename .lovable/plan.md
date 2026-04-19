
## مراجعة شاملة — ما اكتشفته

### 🔴 مشاكل توافقية حقيقية

**1) صفحة `/payroll` ما تزال mock data بالكامل**
- تستخدم 4 موظفين ثابتين، مفصولة تماماً عن `useEmployees` و `useAttendance`.
- الخصم التلقائي للغياب اللي اتفقنا عليه **مش مربوط** بالصفحة الرئيسية للرواتب.
- `computePayroll` موجودة ومستخدمة في `Staff.tsx` و `EmployeeProfileCard` فقط، لكن صفحة الرواتب نفسها لا تستفيد منها.

**2) `Attendance.tsx` ما يجيب بيانات الشهر الكامل للحساب**
- يجيب فقط `useTodayAttendance` + `useWeekAttendance` (آخر 7 أيام)، بينما `computePayroll` يحتاج بيانات الشهر كامل لحساب الغياب.
- يحتاج hook جديد `useMonthAttendance(monthYM)` أو توسيع الموجود.

**3) جدول حضور اليوم — عمود فارغ في الهيدر**
- في `Attendance.tsx` السطر 134: العمود الأخير عنوانه `""` (فاضي). يبين كزحمة بصرية بدون عنوان. لازم يكون `"إجراء"` أو يتشال بالكامل.
- نفس السطر يستخدم `(_, i) => key={i}` — مفتاح غير ثابت لازم يستخدم النص.

**4) قاعدة الموظف الغائب يُكمل الـ count حتى لو اليوم ما خلص**
- `absentCount` في السطر 53 يحسب أي موظف مجدول ما بصم بعد كغائب — حتى الساعة 8 صباحاً قبل بداية الدوام. لازم يحسب فقط بعد انتهاء وقت بداية الدوام بساعة (grace period) أو في نهاية اليوم.

**5) RestaurantLocationSettings — حقل Radius يبدأ فاضي**
- `useState(settings?.radius_meters?.toString() || "200")` يشتغل مرة وحدة قبل وصول البيانات → يبقى "200" حتى لو المخزن مختلف. يحتاج `useEffect` للمزامنة.

**6) Status mapping ينقصه حالة "تأخر" التلقائية**
- في `usePunchIn` يحسب الـ`status = "تأخر" إذا late > 0`. ✅ تمام.
- لكن `variantOf` في Attendance.tsx فيه فقط 4 حالات. يحتاج "استئذان" / "إجازة مرضية" / "طارئ" → يرجعون `info` افتراضياً ✅ مغطّى.

**7) خطأ console موجود (مش متعلق بالحضور)**
- `MetricCard` و `StatusBadge` يستقبلون refs بدون `forwardRef` في صفحة Payroll. تحذير React بس مش يكسر شي. نتجاهله الآن (ليس من نطاق المهمة).

**8) ملف Memory ضاع بين الإصدارات**
- في الـsummary مذكور `created .lovable/memory/features/attendance-system.md` لكن في `mem://index.md` ما زال يظهر النسخة القديمة الموجزة. يحتاج تحديث الـindex بنفس الفقرة الجديدة.

### ✅ ما يعمل بشكل صحيح
- RLS لكل الجداول الجديدة ✅
- ربط `useAttendance` مع `useEmployees` للتحقق من `shift_start/end` ✅
- `attendance_audit` يكتب تلقائياً عند التعديل من `useUpdateAttendance` ✅
- GPS Haversine + رسائل خطأ عربية ✅
- Tab "إعدادات" و"سجل التعديلات" محميين بـ`isAdmin` ✅

---

## خطة الإصلاح (تركّز فقط على نطاق الحضور والتوافقية)

### 1) ربط صفحة الرواتب بالنظام الحقيقي
- استبدال البيانات الوهمية في `src/pages/Payroll.tsx` بـ`useEmployees()` + `useMonthAttendance(currentMonthYM())`.
- حساب الراتب لكل موظف عبر `computePayroll` (يستفيد من خصم الغياب التلقائي اللي اتفقنا عليه).
- عرض عمود "الغياب" + "الخصم" + "الصافي" بدل ما هو موجود حالياً.
- المؤشرات العلوية تُحسب من قيم حقيقية (إجمالي الرواتب، نسبة العمالة من إيرادات الشهر الفعلي من `daily_sales`).

### 2) إضافة hook `useMonthAttendance`
- في `src/hooks/useAttendance.ts` — دالة جديدة تجيب صفوف الحضور لشهر معيّن (`gte` و `lt`).

### 3) إصلاح صغير لـAttendance.tsx
- إعطاء عنوان للعمود الأخير ("إجراء" للأدمن، يُخفى لغير الأدمن).
- مفاتيح ثابتة في `map`.
- تحسين منطق `absentCount`: نحسب الموظف غائب فقط لو الوقت الحالي > `shift_start_time` + 30 د (grace period) أو إذا اليوم انتهى.

### 4) إصلاح RestaurantLocationSettings
- إضافة `useEffect` لمزامنة قيمة `radius` مع `settings.radius_meters` بعد التحميل.

### 5) تحديث `mem://index.md`
- تحديث وصف "Attendance System" ليعكس النظام الذكي الجديد (GPS، حسابات تلقائية، audit، استئذان مباشر).

### الملفات المعدّلة
- `src/pages/Payroll.tsx` (استبدال mock بالكامل)
- `src/pages/Attendance.tsx` (إصلاحات صغيرة)
- `src/hooks/useAttendance.ts` (إضافة `useMonthAttendance`)
- `src/components/attendance/RestaurantLocationSettings.tsx` (مزامنة radius)
- `mem://index.md` (تحديث وصف الميزة)

### ما لن نلمسه (بقصد)
- ❌ الـ`MetricCard`/`StatusBadge` ref warning — خارج نطاق "ربط الأقسام".
- ❌ تطوير سجل تعديلات إضافي أو اعتمادات (مؤجل بقرارك السابق).
- ❌ خصم تأخير/علاوة إضافي (قرارك: غياب فقط).

### النتيجة
- صفحة الرواتب تصبح "مرآة" حقيقية للنظام المالي للموظفين، مربوطة بالحضور.
- زوال آخر بيانات وهمية في القسم.
- توحيد منطق الحساب (مكان واحد: `computePayroll`).

