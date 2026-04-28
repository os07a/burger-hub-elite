# تطبيق إرشادات OWASP الأمنية

## الهدف
رفع مستوى الأمان وفق OWASP بدون كسر أي وظيفة قائمة، مع تركيز على ما هو ناقص فعلاً (التحقق من المدخلات في الواجهة + Edge Functions).

---

## الخطوات

### 1. طبقة Validation موحّدة (ملفان جديدان)
- `src/lib/validation/schemas.ts` — مخططات Zod مركزية لكل النماذج الحساسة:
  - Product (name, price, cost, category)
  - Inventory item (name, quantity, unit, cost_per_unit)
  - Employee (name, phone SA, IBAN, salary)
  - Supplier (name, phone, email)
  - Invoice (amount, date, doc_type)
  - Employee doc (doc_number, dates)
  - Recipe (quantity_per_unit, waste_percentage)
- `src/lib/validation/sanitize.ts` — دوال:
  - `sanitizeText()` — يقصّ المسافات ويزيل أحرف التحكم
  - `escapePostgrestLike()` — يهرب `% _ , ( )` لاستعلامات `.ilike()` و `.or()` (حماية من حقن PostgREST)
  - `safeRedirect()` — يمنع open-redirect

### 2. ربط Zod بنماذج الواجهة (7 ملفات معدّلة)
استخدام `zodResolver` مع `react-hook-form` (موجود مسبقاً) في:
- `src/components/products/ProductFormDialog.tsx`
- `src/components/inventory/InventoryFormDialog.tsx`
- `src/components/staff/EmployeeFormDialog.tsx`
- `src/components/staff/DocFormDialog.tsx`
- `src/components/suppliers/SupplierFormDialog.tsx`
- `src/components/suppliers/InvoiceFormDialog.tsx`
- `src/components/products/RecipeDialog.tsx`

تطبيق `escapePostgrestLike()` في كل البحث/الفلترة (Products, Inventory, Suppliers, Loyalty, Messages).

### 3. Validation داخل Edge Functions (8 دوال)
إضافة Zod من `https://esm.sh/zod@3.23.8` + إرجاع 400 مع `error.flatten()` فقط (بدون stack/SQLSTATE):
- `menu-engineering-advice` — items array, period_days, counts
- `business-advisor` — question, context
- `transcribe-audio` — audioBase64 (حد أقصى للحجم)، mimeType (whitelist)
- `sync-loyverse-sales` — date params
- `sync-loyverse-customers` — لا مدخلات لكن نتأكد من JWT
- `extract-iqama-data` — imageBase64 + mimeType
- `analyze-social-insights` — period
- `list-whatsapp-templates` — لا مدخلات (JWT فقط)

### 4. JWT Validation للدوال الناقصة
الدوال التي لا تتحقق من JWT حالياً ستُضاف لها `getClaims()`:
- `transcribe-audio` ✗ → يضاف
- `business-advisor` ✗ → يضاف
- `menu-engineering-advice` ✗ → يضاف
- `analyze-social-insights` ✗ → يضاف (إن لزم)
- `extract-iqama-data` ✗ → يضاف

استثناء: `whatsapp-webhook` يبقى عام (يستخدم `WHATSAPP_VERIFY_TOKEN` كتوقيع).

### 5. منع تسرّب أخطاء حسّاسة
استبدال كل `error: e.message` و `details: SQLSTATE` للمستخدم بـ:
- رسالة عامة للعميل: `"حدث خطأ، حاول لاحقاً"`
- `console.error()` للسجلات الكاملة (تظل في Edge Function logs فقط)

### 6. مراجعة عدم تسرّب مفاتيح
- فحص `rg "sk_|api[_-]?key|secret" src/` للتأكد من عدم وجود مفاتيح خاصة في الكود
- التأكد أن `.env` يحتوي فقط على `VITE_SUPABASE_*` (publishable — آمن)

### 7. Rate Limiting (Documentation فقط)
لا توجد بنية rate limiting في Supabase Edge Functions بشكل ناتيف يمكن تطبيقه احترافياً بدون Redis. سأكتفي بإضافة:
- تحديد حجم الـ payload في كل Edge Function (مثلاً audioBase64 ≤ 25MB)
- توثيق في `README.md` بأن rate limiting يعتمد على Cloudflare layer من Supabase

### 8. تشغيل الفحوصات النهائية
- `security--run_security_scan`
- `supabase--linter`
- اختبار سريع لـ 2-3 نماذج من الواجهة + 1 edge function

---

## ما لن يتم عمله (ومبرراته)
| البند | السبب |
|------|--------|
| Rate limiting احترافي per-IP | يحتاج Redis/Upstash؛ لا يوجد في Supabase ناتيف |
| تعديل client.ts/types.ts | مولّدة تلقائياً |
| تشفير حقول DB إضافية | لا يوجد PII حسّاس مكشوف بعد المراجعة |
| تغيير RLS الحالي | كله مبني على `has_role()` وسليم |
| إضافة CSRF tokens | Supabase JWT في Authorization header (ليس cookie) → لا حاجة |

---

## التقدير
- ملفات جديدة: **2**
- ملفات واجهة معدّلة: **~10** (7 نماذج + 3 صفحات بحث)
- Edge Functions معدّلة: **~8**
- بدون أي migration على DB
- بدون تغيير أي وظيفة قائمة (تحقق فقط، ليس منطق)

## التقرير النهائي
بعد التنفيذ سأعطيك:
- جدول: ملف | نوع التغيير | عدد الحقول المحمية
- نتيجة security scan + linter
- قائمة الدوال التي أصبحت تتطلب JWT
