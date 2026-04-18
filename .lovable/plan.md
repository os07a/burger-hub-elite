
المستخدم أكّد إن بونات مربوط بالكاشير (Loyverse) عنده. ممتاز — يعني نقدر نسحب بيانات العملاء والولاء من Loyverse Customers API مباشرة بدون أي تكامل إضافي مع بونات.

## خطة: ربط الولاء عبر Loyverse Customers API

### 1. جدول `loyalty_customers`
- `id` uuid PK
- `loyverse_customer_id` text UNIQUE
- `name`, `phone`, `email` text
- `total_visits` int، `total_points` numeric، `total_spent` numeric
- `tier` text (gold/silver/regular) — محسوب من الزيارات
- `first_visit`, `last_visit` timestamptz
- `synced_at` timestamptz default now()
- RLS: SELECT للمصادقين، CUD للأدمن
- index على `last_visit` و `tier`

### 2. Edge Function `sync-loyverse-customers`
- يستخدم `LOYVERSE_API_TOKEN` الموجود
- يستدعي `GET /v1.0/customers` مع pagination (cursor)
- يحسب `tier`:
  - `gold` لو visits ≥ 10
  - `silver` لو visits ≥ 5
  - `regular` غير ذلك
- `upsert` بمفتاح `loyverse_customer_id`
- يُرجع `{ customers_synced, gold, silver, regular }`

### 3. تحديث `src/pages/Loyalty.tsx`
- زر **"مزامنة من بونات/الكاشير"** أعلى الصفحة
- Hook `useLoyaltyCustomers()` يقرأ من الجدول
- البطاقات الإحصائية تتحدث من البيانات الفعلية:
  - إجمالي العملاء، ذهبي، فضي، عاديون
  - عدّاد المؤهلين لمكافأة الزيارة الخامسة (`visits >= 5`)
- جدول العملاء: الاسم، الهاتف، الزيارات، آخر زيارة، التصنيف، الإنفاق

### 4. التحديث التلقائي (Up-to-date)
خياران للتحديث المستمر:
- **زر يدوي + auto-refetch كل 5 دقائق** عند فتح الصفحة (الأبسط، نبدأ به)
- لاحقاً: Cron job (pg_cron) كل ساعة لاستدعاء الـ Edge Function تلقائياً

### تدفق
```text
Loyverse Customers API
        │ (LOYVERSE_API_TOKEN)
        ▼
sync-loyverse-customers
        │ (احسب tier)
        ▼
loyalty_customers
        │
        ▼
Loyalty.tsx → بطاقات + جدول حي
```

### الملفات
- migration: `loyalty_customers` + RLS + indexes
- `supabase/functions/sync-loyverse-customers/index.ts` — جديد
- `src/hooks/useLoyaltyCustomers.ts` — جديد
- `src/components/loyalty/SyncLoyverseCustomersButton.tsx` — جديد
- تحديث `src/pages/Loyalty.tsx`

### ملاحظة
بونات نفسها ما عندها API عام، بس بما إنها مربوطة بـ Loyverse، أي عميل يسجّل/يصرف نقاط في بونات بيظهر كـ customer في Loyverse مع `total_visits` و `total_points` محدّثة. يعني نفس البيانات بالضبط تجي عبر Loyverse.
