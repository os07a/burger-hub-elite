# مزامنة الكاشير التلقائية (بدون زر)

الهدف: لما يتباع أي شي في Loyverse، يظهر في النظام مباشرة بدون ما تضغط زر "مزامنة الآن".

## كيف راح يشتغل

Loyverse API ما يدعم Webhooks مباشرة لجميع الحسابات، فالحل الأنسب والأمتن:

1. **استدعاء تلقائي كل دقيقة** عبر `pg_cron` + `pg_net` يستدعي `sync-loyverse-sales` في الخلفية.
2. **Realtime على الجداول** (`pos_receipts`, `pos_receipt_items`, `daily_sales`) — أي صف جديد يتسجل، الواجهة تتحدّث فوراً بدون refresh.
3. **مؤشر "آخر مزامنة"** صغير في الهيدر يبيّن آخر وقت تمت فيه المزامنة + Pulse أخضر إذا فيه فاتورة جديدة.

النتيجة: متوسط زمن ظهور البيع في النظام = 30 ثانية تقريباً (نص دورة الدقيقة) بدون أي تدخل يدوي.

## الخطوات التقنية

### 1) تفعيل الإضافات والجدولة (insert tool)
```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'auto-sync-loyverse-sales',
  '* * * * *',  -- كل دقيقة
  $$
  select net.http_post(
    url := 'https://bjfhrrtajyvvdcsrpwqb.supabase.co/functions/v1/sync-loyverse-sales',
    headers := '{"Content-Type":"application/json","apikey":"<ANON_KEY>","Authorization":"Bearer <ANON_KEY>"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

### 2) Realtime migration
```sql
alter publication supabase_realtime add table public.pos_receipts;
alter publication supabase_realtime add table public.pos_receipt_items;
alter publication supabase_realtime add table public.daily_sales;
```

### 3) تعديلات الواجهة
- `Dashboard.tsx`: استخدم `useRealtimeInvalidate` على الجداول الثلاثة لتحديث:
  - `daily_sales` summary (الكاش/الشبكة/الإجمالي)
  - `pos_receipts` (آخر الفواتير)
  - عدّاد الفواتير اليوم
- `PosSyncDialog.tsx`: يبقى للاختبار اليدوي، لكن نضيف شارة "مزامنة تلقائية مفعّلة ✓".
- مؤشر صغير في `CommandCenter` header: "آخر مزامنة قبل X ثانية" مع نقطة خضراء نابضة.

### 4) حماية من الازدحام
- داخل `sync-loyverse-sales`: لو آخر استدعاء كان قبل أقل من 20 ثانية، يرجع فوراً بدون مناداة Loyverse (rate-limit guard) — يمنع أي تداخل مع الكرون أو الزر اليدوي.

## ملاحظات

- **التوصيل (Delivery)** يبقى يدوي كما هو (memory محفوظ) — التلقائي يخص الكاش/الشبكة/الخصومات/الضرائب فقط.
- استهلاك Loyverse API: 60 طلب/ساعة فقط من الكرون، أقل بكثير من الحد المسموح (300/دقيقة).
- لو أبغيت تأخير أقل (كل 30 ثانية بدل دقيقة) ممكن، لكن دقيقة هي التوازن المثالي بين السرعة وعدم إرهاق API.

## الملفات المعدّلة

- `supabase/migrations/...` — Realtime publication
- insert SQL — pg_cron job
- `supabase/functions/sync-loyverse-sales/index.ts` — rate-limit guard
- `src/pages/Dashboard.tsx` — realtime hooks للفواتير
- `src/pages/CommandCenter.tsx` — مؤشر آخر مزامنة
- `src/components/dashboard/PosSyncDialog.tsx` — شارة "تلقائي مفعّل"
