
المستخدم وافق على المواصفات: **Phase 1 فقط + GPS إلزامي 200م + خصم غياب فقط + تسجيل استئذان مباشر بدون اعتماد**. كل الشغل يتركّز في قسم "الحضور والانصراف" (`/attendance`).

## نطاق التنفيذ المعتمد

### 1) قاعدة البيانات (Migration)
**توسيع `attendance`:**
- `check_in_lat, check_in_lng, check_in_verified` (boolean)
- `check_out_lat, check_out_lng, check_out_verified`
- `late_minutes, early_leave_minutes, overtime_minutes` (محسوبة عند البصمة)
- `request_type` (none/permission/sick/emergency) — افتراضي none
- `edited_by, edited_at` (لمعرفة آخر تعديل)

**توسيع `employees`:**
- `shift_start_time` (time)، `shift_end_time` (time)

**جدول جديد `restaurant_settings`** (سطر واحد): `latitude, longitude, radius_meters` (افتراضي 200).

**جدول جديد `attendance_audit`:** `attendance_id, changed_by, field_name, old_value, new_value, changed_at` — يسجّل كل تعديل بعد الإدخال الأولي.

RLS: الموظف المصادَق يقدر يبصم لنفسه فقط، الأدمن يعدّل أي شيء، الكل يقرأ.

### 2) المنطق (lib + hooks)
- `src/lib/geo.ts` — Haversine distance.
- `src/lib/attendanceCalc.ts` — يحسب `late/early/overtime` من check_in/out × shift.
- `src/hooks/useAttendance.ts` — قراءة + إضافة + تعديل + audit + إعدادات المحل.

### 3) الواجهة — صفحة `/attendance` كاملة
استبدال البيانات الوهمية الحالية ببيانات حقيقية مع:

**A) شريط تنبيهات فوري (أعلى الصفحة):**
🔴 غائبون اليوم • 🟡 متأخرون • 🟢 ساعات إضافية • 🔵 استئذانات اليوم.

**B) زر "بصمة سريعة" بارز:**
- يطلب GPS من المتصفح → يقيس المسافة من إحداثيات المحل.
- داخل 200م: يسجّل دخول/خروج + يحسب التأخير/الإضافي تلقائياً + شارة 📍 خضراء.
- خارج 200م: رفض + رسالة "خارج نطاق المحل" + خيار "تسجيل استئذان".

**C) جدول حضور اليوم (حقيقي):**
أعمدة: الموظف • الدوام • دخول • خروج • ساعات • تأخير • انصراف مبكر • إضافي • موقع 📍 • الحالة • [✏️ تعديل أدمن].

**D) زر "تسجيل استئذان"** (لأي موظف بدون اعتماد):
نموذج: نوع (إذن/مرضي/طارئ) + التاريخ + ملاحظة → يدخل مباشرة في `attendance` بـ`request_type`.

**E) تاب "سجل التعديلات" (للأدمن):**
يعرض من `attendance_audit`: من، متى، أي حقل، القيمة قبل/بعد. شفافية كاملة anti-tampering.

**F) قسم "إعدادات المحل" داخل الصفحة (للأدمن):**
زر صغير "📍 تحديث موقع المحل" → يلتقط GPS الحالي + يحفظ في `restaurant_settings`. يُضبط مرة واحدة.

**G) ملخص الأسبوع:**
يبقى لكن من بيانات حقيقية + إضافة عمود "ساعات إضافية".

### 4) ربط بحاسبة الراتب
`computePayroll` في `src/lib/hr.ts` يبقى **زي ما هو** (خصم غياب فقط حسب اختيارك). نضيف فقط عرض الإضافي/التأخير في تاب الراتب للمتابعة بدون خصم تلقائي.

### 5) Memory
تحديث `mem://features/attendance-system` بالنظام الجديد.

## ما لن نبنيه (مؤجل صراحة)
- ❌ workflow اعتماد الاستئذان (تسجيل مباشر).
- ❌ خصم التأخير/الانصراف المبكر التلقائي (يُعرض فقط).
- ❌ علاوة الإضافي ×1.5 (تُعرض فقط).
- ❌ ربط بالمهام/الإنتاجية، فروع، تطبيق Capacitor.

## الملفات
**Migration:** توسيع `attendance` + `employees` + جدولين جديدين + RLS.
**جديد:**
- `src/lib/geo.ts`
- `src/lib/attendanceCalc.ts`
- `src/hooks/useAttendance.ts`
- `src/hooks/useRestaurantSettings.ts`
- `src/components/attendance/QuickPunchButton.tsx`
- `src/components/attendance/PermissionRequestDialog.tsx`
- `src/components/attendance/AttendanceEditDialog.tsx`
- `src/components/attendance/AttendanceAuditTab.tsx`
- `src/components/attendance/RestaurantLocationSettings.tsx`
- `src/components/attendance/AttendanceAlertsBar.tsx`

**معدّل:**
- `src/pages/Attendance.tsx` (استبدال mock كامل)
- `src/components/staff/EmployeeFormDialog.tsx` (إضافة حقلَي shift_start/end)

## ملاحظة مهمة قبل البدء
GPS يحتاج **HTTPS** للعمل في المتصفح — البريفيو والنشر على Lovable يدعمونه افتراضياً ✅.
