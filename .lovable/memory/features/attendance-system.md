---
name: Attendance System (Smart GPS)
description: نظام حضور وانصراف ذكي ببصمة GPS (نطاق 200م)، حساب تلقائي للتأخير والإضافي، تسجيل استئذان مباشر، وسجل تعديلات شفاف لمنع التلاعب
type: feature
---

نظام الحضور الجديد يعتمد على:

**البصمة الذكية (GPS):**
- المتصفح يطلب الموقع → يحسب المسافة من إحداثيات المحل (Haversine).
- داخل 200م = بصمة معتمدة 📍، خارج النطاق = ممنوع + خيار تسجيل استئذان.
- إعدادات المحل (latitude/longitude/radius) في جدول `restaurant_settings` (سطر واحد). الأدمن يضبطها مرة من جوال داخل المحل.

**الحسابات التلقائية (عند البصمة):**
- `late_minutes` = check_in - shift_start_time (موجبة فقط).
- `early_leave_minutes` = shift_end_time - check_out.
- `overtime_minutes` = check_out - shift_end_time.
- الحقول مخزّنة في `attendance` نفسها.

**الاستئذان:**
- أي موظف يقدر يسجل مباشرة (إذن/مرضي/طارئ) — بدون workflow اعتماد.
- يتخزّن كسجل في `attendance` بـ`request_type` و`status` مناسب.

**سجل التعديلات (anti-tampering):**
- جدول `attendance_audit` يلتقط كل تعديل: من، أي حقل، القيمة قبل/بعد، متى.
- يكتب تلقائياً عند استخدام `useUpdateAttendance` hook.
- يُعرض في تاب "سجل التعديلات" للأدمن فقط.

**حاسبة الراتب:**
- لم تتغير: خصم الغياب فقط (أساسي/30 لكل يوم غياب).
- التأخير والإضافي يُعرضان فقط للمتابعة، بدون خصم/علاوة تلقائية.

**ما لم يُبنى بشكل متعمّد:**
- ❌ workflow اعتماد للاستئذانات (تسجيل مباشر).
- ❌ خصم تأخير/انصراف مبكر تلقائي.
- ❌ علاوة إضافي ×1.5 تلقائية.
- ❌ فروع متعددة، مهام ميدانية، تطبيق Capacitor.

**الملفات الرئيسية:**
- `src/pages/Attendance.tsx`
- `src/hooks/useAttendance.ts`, `src/hooks/useRestaurantSettings.ts`
- `src/lib/geo.ts`, `src/lib/attendanceCalc.ts`
- `src/components/attendance/*`
