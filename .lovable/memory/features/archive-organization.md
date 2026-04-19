---
name: Archive Organization
description: Invoices stored in DB (invoices table) with images in invoice-images bucket; Archive page reads live data
type: feature
---

صفحة الأرشيف تقرأ من قاعدة البيانات مباشرة (مو Hardcoded):

**الجداول:**
- `invoices` — يحتوي حقول: `image_url`, `account`, `recipient`, `month_label`, `doc_type`, `notes`, `amount`, `date`, `status`, `supplier_id`
- `suppliers` — مرتبط عبر FK `supplier_id`

**Storage:**
- Bucket: `invoice-images` (خاص، Signed URL مدة ساعة)
- Path pattern: `{invoice_id}/{timestamp}.{ext}`
- RLS: View للجميع (authenticated)، Insert/Update/Delete للأدمن فقط

**الأنواع (`doc_type`):**
- `supply-invoice` → فاتورة تموينية (أخضر)
- `tax-invoice`, `invoice`, `receipt`, `quote`, `approval`, `other` → فواتير الأصول (برتقالي)

**التقسيم البصري:**
- التموينية: مجمعة حسب اسم المورد
- الأصول: مجمعة حسب الحساب (`account`)

**رفع الصور:**
- زر "اضغط لرفع مستند" (أعلى الصفحة): ينشئ سجل فاتورة جديد + يرفع الصورة فوراً
- زر "📤 رفع" بجانب كل فاتورة: يرفع/يستبدل صورة لفاتورة موجودة
- يدعم: JPG, PNG, PDF (PDF يُعرض كرابط، الصور inline)
- الحد الأقصى: 10MB

**Seed أولي:** 67 فاتورة + 11 مورد (التموين + الأصول) من البيانات التاريخية.
