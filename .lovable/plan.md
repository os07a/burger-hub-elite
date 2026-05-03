# لوحة تشخيص فواتير الواتساب

إضافة تبويب جديد في صفحة **الرسائل** يعرض آخر الفواتير المستقبلة عبر الواتساب مع حالة المعالجة (نجحت / فشلت / قيد المعالجة)، عشان تكون عندك رؤية فورية على عمل النظام والكشف عن أي خطأ في الاستخراج.

## ما سيتم بناؤه

### 1. جدول تتبع جديد `whatsapp_invoice_intake`
عشان نسجّل **كل** محاولة معالجة (حتى الفاشلة منها قبل ما تُحفظ في `invoices`):

| العمود | الوصف |
|---|---|
| `id` | UUID |
| `from_phone` | رقم المرسل |
| `meta_message_id` | معرّف رسالة واتساب |
| `media_id` | معرّف الصورة في Meta |
| `image_url` | رابط الصورة بعد رفعها للتخزين |
| `status` | `processing` / `success` / `failed` |
| `invoice_id` | ربط بالفاتورة المستخرجة (إن نجحت) |
| `supplier_name` | اسم المورد المستخرج |
| `amount` | المبلغ المستخرج |
| `error_message` | تفاصيل الخطأ (إن فشلت) |
| `processing_time_ms` | كم استغرقت المعالجة |
| `created_at` / `updated_at` | التواريخ |

- RLS: عرض لكل المسجّلين، تعديل/حذف للأدمن فقط.
- تفعيل Realtime على الجدول.

### 2. تحديث Edge Function `process-whatsapp-invoice`
- في بداية التنفيذ: إنشاء سجل بحالة `processing`.
- بعد نجاح Gemini والإدراج: تحديث السجل لـ `success` + ربطه بـ `invoice_id`.
- في حالة أي فشل (تحميل الصورة، Gemini، إنشاء المورد، الإدراج): تحديث السجل لـ `failed` مع `error_message` واضح.
- قياس مدة المعالجة بالميلي ثانية.

### 3. مكوّن جديد `WhatsappInvoiceIntakeTab.tsx`
يُعرض داخل تبويب جديد في صفحة الرسائل بعنوان **"📄 فواتير الواتساب"**:

```text
┌─────────────────────────────────────────────────────┐
│  📊 ملخص اليوم                                      │
│  [مستلمة: 5] [نجحت: 4] [فشلت: 1] [قيد المعالجة: 0] │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  آخر 20 فاتورة مستقبلة                              │
├──────┬──────────┬──────┬─────────┬────────┬────────┤
│ صورة │ المرسل   │ المورد│ المبلغ │ الحالة │ الوقت  │
├──────┼──────────┼──────┼─────────┼────────┼────────┤
│ 🖼️   │ ...8834  │ تموين│ 1,250  │ ✅ نجح │ 2:30م │
│ 🖼️   │ ...4521  │  —   │   —    │ ❌ فشل │ 1:15م │
│      │          │      │         │ السبب: │       │
│      │          │      │         │ الصورة │       │
│      │          │      │         │ غير    │       │
│      │          │      │         │ واضحة  │       │
└──────┴──────────┴──────┴─────────┴────────┴────────┘
```

**ميزات المكوّن:**
- **MetricCards** علوية: إجمالي اليوم / نجحت / فشلت / قيد المعالجة.
- **جدول** بآخر 20 محاولة، مع:
  - صورة مصغّرة قابلة للنقر (تفتح `InvoiceImageViewer` الموجود).
  - StatusBadge ملوّن (success/danger/warning).
  - عرض `error_message` تحت الصف الفاشل.
  - زر **"إعادة المحاولة"** للسجلات الفاشلة (يستدعي الـ Edge Function مرة ثانية بنفس `media_id`).
  - زر **"فتح الفاتورة"** للسجلات الناجحة (ينقل لصفحة الأرشيف).
- **Realtime**: استخدام `useRealtimeInvalidate` لتحديث الجدول فوراً عند وصول فاتورة جديدة.
- **زر "تحديث"** يدوي احتياطي.

### 4. Hook جديد `useWhatsappInvoiceIntake.ts`
- `useWhatsappInvoiceIntakeList(limit=20)` — يجيب آخر السجلات.
- `useWhatsappInvoiceIntakeStats()` — يحسب إحصائيات اليوم.
- `useRetryInvoiceProcessing()` — Mutation لإعادة المحاولة.

### 5. تحديث `Messages.tsx`
- إضافة تبويب جديد في `Tabs` بعنوان **"📄 فواتير الواتساب"** بجانب التبويبات الحالية.
- إضافة عداد بجانب اسم التبويب لعدد الفواتير الفاشلة (لو موجود) كتنبيه بصري.

## التفاصيل التقنية

**SQL Migration:**
```sql
create table public.whatsapp_invoice_intake (
  id uuid primary key default gen_random_uuid(),
  from_phone text not null,
  meta_message_id text,
  media_id text not null,
  image_url text,
  status text not null default 'processing',
  invoice_id uuid references public.invoices(id) on delete set null,
  supplier_name text,
  amount numeric,
  error_message text,
  processing_time_ms integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter publication supabase_realtime add table public.whatsapp_invoice_intake;
-- + RLS policies (admin write, authenticated read)
```

**التدفق المُحدَّث:**
```text
WhatsApp Image → webhook → process-whatsapp-invoice
                              ├─ INSERT intake (processing)
                              ├─ Download → Storage
                              ├─ Gemini Vision
                              ├─ Insert supplier + invoice
                              └─ UPDATE intake (success | failed)
                                            ↓ realtime
                                   لوحة التشخيص تتحدّث فوراً
```

## الملفات المُعدَّلة/المُنشأة

**جديد:**
- `supabase/migrations/[timestamp]_whatsapp_invoice_intake_log.sql`
- `src/hooks/useWhatsappInvoiceIntake.ts`
- `src/components/messages/WhatsappInvoiceIntakeTab.tsx`

**تعديل:**
- `supabase/functions/process-whatsapp-invoice/index.ts` (إضافة تسجيل المراحل)
- `src/pages/Messages.tsx` (إضافة التبويب)

## الفوائد
- رؤية فورية لكل فاتورة دخلت النظام عبر الواتساب.
- معرفة أسباب الفشل بدقة (صورة غير واضحة، خطأ في Gemini، رقم غير مسموح، إلخ).
- إعادة المحاولة بضغطة زر بدون الحاجة لإرسال الصورة من جديد.
- تنبيه بصري على التبويب لو فيه فواتير فاشلة تحتاج مراجعة.
