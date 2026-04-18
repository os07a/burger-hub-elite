
المستخدم يبي يظهر رقم الإيصال (receipt_number) من Loyverse في الداشبورد لكل طلب. حالياً النظام يخزّن فقط الإجماليات اليومية في `daily_sales` بدون تفاصيل الإيصالات الفردية.

## الخطة: حفظ وعرض أرقام إيصالات Loyverse

### 1. جدول جديد `pos_receipts`
migration ينشئ جدول لحفظ كل إيصال على حدة:
- `id` uuid PK
- `receipt_number` text UNIQUE NOT NULL
- `receipt_date` date NOT NULL
- `created_at_pos` timestamptz (وقت الإيصال من Loyverse)
- `receipt_type` text (SALE/REFUND)
- `total` numeric
- `cash` numeric, `card` numeric, `delivery` numeric
- `synced_at` timestamptz default now()
- RLS: SELECT للمصادقين، INSERT/UPDATE/DELETE للأدمن
- index على `receipt_date`

### 2. تحديث `sync-loyverse-sales`
- بعد التجميع، نعمل `upsert` بكل إيصال في `pos_receipts` بمفتاح `receipt_number` (`onConflict: "receipt_number"`)
- نضيف `console.log("receipts", receipts.length)` للتحقق
- نُرجع `receipts_saved` في الاستجابة

### 3. عرض في Dashboard
- hook جديد `usePosReceipts(date)` يجلب آخر إيصالات اليوم من `pos_receipts` مرتبة DESC
- بطاقة جديدة تحت بطاقة الدخل اليومي: **"إيصالات اليوم من الكاشير"**
  - جدول مختصر: `رقم الإيصال | الوقت | النوع | الإجمالي`
  - يعرض `receipt_number` (مثل `1-1234`) بدلاً من id داخلي
  - حد أقصى 20 سطر مع scroll

### تدفق
```text
Loyverse /receipts
      │
      ▼
sync-loyverse-sales:
  - aggregate → daily_sales
  - upsert each → pos_receipts (receipt_number)
      │
      ▼
Dashboard:
  - بطاقات إجمالية (كما هي)
  - جدول الإيصالات الجديد ← receipt_number
```

### الملفات
- migration: إنشاء `pos_receipts` + RLS + index
- `supabase/functions/sync-loyverse-sales/index.ts` — إضافة upsert الإيصالات
- `src/hooks/usePosReceipts.ts` — جديد
- `src/components/dashboard/PosReceiptsTable.tsx` — جديد
- `src/pages/Dashboard.tsx` — إدراج الجدول
