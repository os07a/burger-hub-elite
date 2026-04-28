
## خطة الدمج

نحافظ على كل الكود الحالي ومنطقه — فقط نُغلّف كل صفحتين/ثلاث في صفحة واحدة بتبويبات (Tabs)، ونُحدّث الشريط الجانبي والتوجيه.

### 1) المخزون + الجرد الابتدائي → صفحة "المخزون"

- إنشاء `src/pages/InventoryHub.tsx` يحتوي `Tabs`:
  - تبويب "الأصناف والمخزون" → محتوى `Inventory.tsx` الحالي
  - تبويب "الجرد الابتدائي والتعديلات" → محتوى `OpeningInventory.tsx` الحالي
- إعادة هيكلة: تحويل الصفحتين الحاليتين لمكونات (`InventoryListSection`, `OpeningInventorySection`) داخل `src/components/inventory/` — نفس المنطق دون تغيير.
- المسار: `/inventory` يفتح الصفحة الأم. `/opening-inventory` يبقى كـ redirect ⇐ `/inventory?tab=opening` للحفاظ على الروابط القديمة.

### 2) الأرشيف → داخل "الموردون"

- إنشاء `src/pages/SuppliersHub.tsx` بـ `Tabs`:
  - "الموردون والفواتير" → محتوى `Suppliers.tsx`
  - "أرشيف المستندات" → محتوى `Archive.tsx`
- تحويلهما لمكونين فرعيين.
- المسار: `/suppliers` رئيسي، `/archive` ⇐ redirect لـ `/suppliers?tab=archive`.

### 3) الحضور + الرواتب → داخل "الطاقم"

- إنشاء `src/pages/StaffHub.tsx` بـ `Tabs`:
  - "الموظفون" → `Staff.tsx`
  - "الحضور والانصراف" → `Attendance.tsx`
  - "الرواتب" → `Payroll.tsx`
- تحويلهم لمكونات فرعية تحت `src/components/staff/`.
- المسارات: `/staff` رئيسي، `/attendance` و `/payroll` ⇐ redirects.

### 4) تحديث الشريط الجانبي (`src/components/layout/Sidebar.tsx`)

إزالة العناصر المدموجة وتقليل الأقسام:

```text
الإدارة:
  - الطاقم (يحوي: موظفون / حضور / رواتب)
  - كاميرات المراقبة

المشغّل:
  - المنتجات
  - تحليل المنيو
  - المخزون (يحوي: أصناف / جرد ابتدائي)
  - الموردون (يحوي: موردون / أرشيف)
  - تطبيقات التوصيل
  - التواصل الاجتماعي

المالية:
  - الأرباح والنسب
```

(تم حذف: الجرد الابتدائي، الأرشيف، الحضور، الرواتب من الشريط — لأنها أصبحت تبويبات داخلية)

### 5) تحديث `src/App.tsx`

- استبدال 6 routes بـ 3 routes رئيسية + 3 redirects تحفظ الروابط القديمة (باستخدام `<Navigate to="..." replace />`).
- استخدام `?tab=` query param لفتح التبويب المطلوب مباشرة.

### تفاصيل تقنية

- التبويبات تستخدم `@/components/ui/tabs` (موجود بالفعل، shadcn).
- قراءة التبويب الافتراضي من `useSearchParams()` ليعمل deep-linking والـ redirects.
- لا تغييرات على قاعدة البيانات أو الـ hooks أو الـ RLS.
- لا تغييرات على الـ Edge Functions.
- الأيقونات في الشريط الجانبي تبقى كما هي للعناصر المتبقية.

### ملفات ستُنشأ
- `src/pages/InventoryHub.tsx`
- `src/pages/SuppliersHub.tsx`
- `src/pages/StaffHub.tsx`
- `src/components/inventory/InventoryListSection.tsx`
- `src/components/inventory/OpeningInventorySection.tsx`
- `src/components/suppliers/SuppliersListSection.tsx`
- `src/components/suppliers/ArchiveSection.tsx`
- `src/components/staff/StaffListSection.tsx`
- `src/components/staff/AttendanceSection.tsx`
- `src/components/staff/PayrollSection.tsx`

### ملفات ستُعدَّل
- `src/App.tsx` — routes + redirects
- `src/components/layout/Sidebar.tsx` — إزالة 4 عناصر

### ملفات ستُحذف
- `src/pages/Inventory.tsx`, `OpeningInventory.tsx`
- `src/pages/Suppliers.tsx`, `Archive.tsx`
- `src/pages/Staff.tsx`, `Attendance.tsx`, `Payroll.tsx`

(محتواها يُنقل بالكامل إلى المكونات الفرعية الجديدة دون تغيير منطقي.)

### النتيجة
- الشريط الجانبي يصبح أنظف (من ~20 إلى ~14 عنصر).
- الأقسام المرتبطة وظيفياً مدموجة ومنطقية.
- كل الروابط القديمة تستمر بالعمل عبر redirects.
