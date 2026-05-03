## الفكرة الأساسية

كل فاتورة تدخل المحل (سواءً ورقية، إلكترونية، أو واتساب) → تنتهي في **مكان واحد موحد** (الأرشيف + جدول الموردين) بدون إدخال يدوي. الحفظ تلقائي مباشر مع إشعار للمراجعة.

---

## القنوات الثلاث

```text
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│  📷 كاميرا/صورة     │    │  🔲 ZATCA QR Code   │    │  💬 واتساب (موجود)   │
│  Gemini Vision     │    │  Base64 TLV Parser │    │  Gemini Vision     │
└─────────┬──────────┘    └─────────┬──────────┘    └─────────┬──────────┘
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    ▼
                    ┌─────────────────────────────────┐
                    │  Edge Function موحدة:            │
                    │  process-supplier-invoice        │
                    │  • استخراج/تحليل                  │
                    │  • إنشاء/مطابقة المورد           │
                    │  • حفظ الفاتورة + الأصناف        │
                    │  • تسجيل في intake للمراقبة      │
                    └────────────────┬─────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │  📁 الأرشيف + 🚚 الموردين        │
                    │  + إشعار في صفحة الرسائل         │
                    └─────────────────────────────────┘
```

---

## ما سيتم بناؤه

### 1. صفحة جديدة: "استقبال الفواتير" (`/invoice-intake`)

تبويب جديد داخل **SuppliersHub** بعنوان "📥 استقبال فاتورة"، يحتوي على 3 طرق إدخال جنباً إلى جنب:

```text
┌──────────────────────────────────────────────────────────┐
│  📥 استقبال فاتورة جديدة                                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│   │  📷        │  │  🔲        │  │  📤        │        │
│   │  تصوير     │  │  مسح QR    │  │  رفع صورة  │        │
│   │  مباشر     │  │  ضريبي     │  │  / PDF     │        │
│   └────────────┘  └────────────┘  └────────────┘        │
│                                                          │
│   آخر 5 فواتير مستقبلة (real-time):                       │
│   ✅ بقالة الراشد — 1,250 ر.س — قبل 3 د                  │
│   ✅ مطعم القهوة — 340 ر.س — قبل 12 د                    │
│   ⏳ قيد المعالجة...                                      │
└──────────────────────────────────────────────────────────┘
```

### 2. مكوّن "تصوير مباشر بالكاميرا"

- يفتح كاميرا الجوال/اللابتوب باستخدام `navigator.mediaDevices.getUserMedia`
- زر "التقاط" → يحوّل اللقطة إلى Base64 → يرسلها للـ Edge Function
- إطار أصفر يساعد المستخدم على محاذاة الفاتورة
- يعمل كذلك من سطح المكتب (يستخدم الكاميرا الأمامية)

### 3. مكوّن "مسح QR ضريبي ZATCA"

- يستخدم مكتبة `@zxing/library` لقراءة QR من الكاميرا أو من صورة مرفوعة
- يفك ترميز TLV (Tag-Length-Value) المعتمد من هيئة الزكاة:
  - Tag 1: اسم البائع
  - Tag 2: الرقم الضريبي
  - Tag 3: التاريخ والوقت
  - Tag 4: الإجمالي مع الضريبة
  - Tag 5: قيمة الضريبة
- **استخراج فوري بدقة 100%** (بدون AI، البيانات داخل QR نفسها)
- لا يحتاج صورة كاملة للفاتورة — فقط الـ QR

### 4. مكوّن "رفع يدوي مع استخراج تلقائي"

- يستبدل الفورم اليدوي الحالي في `InvoiceFormDialog`
- المستخدم يرفع صورة/PDF فقط → الـ AI يعبّي الحقول
- يدعم Multi-page PDF (كل صفحة فاتورة منفصلة)

### 5. Edge Function موحدة: `process-supplier-invoice`

تحلّ محل `process-whatsapp-invoice` وتُعمَّم:

**Input:**
```typescript
{
  source: "camera" | "upload" | "whatsapp" | "zatca_qr",
  image_base64?: string,           // للكاميرا والرفع
  image_url?: string,              // للواتساب
  zatca_qr_data?: string,          // للـ QR (Base64 TLV)
  from_phone?: string,             // للواتساب
}
```

**Pipeline:**
1. إنشاء سجل في `whatsapp_invoice_intake` (سيُعاد تسميته لـ `invoice_intake`)
2. **لو ZATCA QR**: فك TLV مباشرة → بيانات أساسية مضمونة
3. **لو صورة**: رفع للتخزين → Gemini Vision مع structured output
4. **مطابقة المورد**: بحث fuzzy في `suppliers` بالاسم + الرقم الضريبي → ينشئ مورد جديد لو ما لقاه
5. إنشاء سجل في `invoices` + سجلات في جدول جديد `invoice_line_items`
6. تحديث intake لـ `success`
7. إشعار realtime يظهر في صفحة الرسائل

**Gemini Prompt (Tool Calling):**
يستخرج structured object يحتوي:
- `supplier_name`, `supplier_tax_number`
- `invoice_number`, `invoice_date`
- `subtotal`, `vat_amount`, `discount`, `total`
- `line_items[]`: `{ name, quantity, unit, unit_price, total }`
- `confidence_score` (0-1) لكل حقل

### 6. جدول جديد: `invoice_line_items`

```sql
create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  item_name text not null,
  quantity numeric not null default 1,
  unit text,
  unit_price numeric not null default 0,
  total numeric not null default 0,
  inventory_item_id uuid references inventory_items(id),  -- ربط بالمخزون
  matched_automatically boolean default false,
  created_at timestamptz default now()
);
```

- RLS: عرض للمسجّلين، تعديل للأدمن
- **Auto-match مع المخزون**: لو اسم الصنف يطابق `inventory_items.name` بنسبة >80% → ربط تلقائي + تحديث `cost_per_unit` و `last_restock` و `quantity`

### 7. تحديث `suppliers`

إضافة عمودين:
- `tax_number text` — الرقم الضريبي (للمطابقة الذكية)
- `last_invoice_at timestamptz` — آخر فاتورة لتنبيه الموردين الخاملين

### 8. توسعة `invoices`

إضافة:
- `subtotal numeric` (قبل الضريبة)
- `vat_amount numeric` (الضريبة)
- `discount numeric` (الخصم)
- `source text` — `camera | upload | whatsapp | zatca_qr | manual`
- `confidence_score numeric` — ثقة الـ AI (للفلترة لاحقاً)

### 9. سياسة الحفظ التلقائي + الإشعار

- كل فاتورة تُحفظ مباشرة بدون مراجعة (حسب اختيارك)
- يظهر إشعار toast: "✅ تمت إضافة فاتورة من [المورد] بمبلغ [X] ر.س — [مراجعة]"
- زر "مراجعة" يفتح dialog فيها تعدّل الحقول لو فيه خطأ
- الفواتير ذات `confidence_score < 0.6` تُعلّم بـ شارة برتقالية "⚠️ يحتاج مراجعة" في الأرشيف

---

## التفاصيل التقنية

### المكتبات الجديدة
- `@zxing/browser` — لقراءة QR من الكاميرا والصور
- `@zxing/library` — لفك ترميز TLV الخاص بـ ZATCA

### بنية الملفات الجديدة

**جديد:**
- `src/pages/InvoiceIntake.tsx` — الصفحة الرئيسية بالطرق الثلاث
- `src/components/invoice-intake/CameraCaptureCard.tsx`
- `src/components/invoice-intake/ZatcaQrScannerCard.tsx`
- `src/components/invoice-intake/UploadInvoiceCard.tsx`
- `src/components/invoice-intake/InvoiceReviewDialog.tsx` — للمراجعة الاختيارية
- `src/components/invoice-intake/RecentIntakeList.tsx` — قائمة آخر 5
- `src/lib/zatcaQrParser.ts` — فك TLV
- `src/hooks/useInvoiceIntake.ts` — Mutations للقنوات الثلاث
- `supabase/functions/process-supplier-invoice/index.ts` — الـ Function الموحّدة
- `supabase/migrations/[ts]_invoice_intake_unified.sql`

**تعديل:**
- `src/pages/SuppliersHub.tsx` — إضافة تبويب "📥 استقبال"
- `src/pages/Archive.tsx` — عرض شارة `confidence_score` و `source`
- `supabase/functions/process-whatsapp-invoice/index.ts` — يصبح wrapper يستدعي الـ Function الموحّدة
- جدول `suppliers`, `invoices` — إضافة الأعمدة

### تدفق ZATCA QR التقني

```text
QR Image → @zxing scan → Base64 string
                      ↓
           atob() → Uint8Array
                      ↓
           Loop bytes: [tag, length, value]
                      ↓
   { sellerName, vatNumber, timestamp, total, vat }
                      ↓
       حفظ مباشر في invoices (بدون AI، 100% دقة)
```

### تكامل Gemini Vision

نموذج: `google/gemini-2.5-flash` (متوازن سرعة/دقة)
- Tool calling لـ structured output
- يدعم العربية والإنجليزية
- يفهم خط اليد والفواتير الورقية الباهتة

---

## الفوائد للمحل

1. **3 طرق مرنة** حسب الموقف: مورد جالس قدامك → كاميرا، فاتورة ضريبية → QR (أسرع وأدق)، فاتورة قديمة في الجوال → رفع
2. **صفر إدخال يدوي** للحقول المتكررة
3. **ربط تلقائي بالمخزون** — تحديث الكميات والتكاليف بدون تدخل
4. **تتبع كامل** عبر `intake table` لمعرفة أي محاولة فشلت ولماذا
5. **فواتير ضريبية مضمونة** عبر QR (مهم للتقارير الضريبية ZATCA)
6. **مكان واحد موحد** بدل تشتت بين Suppliers/Archive/Messages

---

## ما لن يتغيّر

- نظام الواتساب الحالي يبقى يشتغل بنفس الطريقة (نفس الويبهوك ونفس الـ allowed_senders)
- البيانات الموجودة في `invoices` و `suppliers` تبقى كما هي
- `process-whatsapp-invoice` يصير wrapper رفيع يستدعي الـ Function الجديدة الموحّدة
