
المستخدم وافق على خطة ربط Loyverse POS. أحتاج أسأله سؤالين سريعين قبل التنفيذ:
1. كيف يفرّق بين بيع داخل المحل والتوصيل في Loyverse
2. مزامنة يدوية أم تلقائية

لكن الأفضل أقدّم خطة تنفيذية مرنة تتعامل مع الحالتين، وأطلب التوكن فقط، وأضع الإعدادات قابلة للتعديل لاحقاً.

## خطة التنفيذ: ربط Loyverse POS

### 1. السرّ المطلوب
- `LOYVERSE_API_TOKEN` — تنسخه من Loyverse Back Office → Settings → Access tokens → Add access token

### 2. Edge Function: `sync-loyverse-sales`
ملف جديد: `supabase/functions/sync-loyverse-sales/index.ts`
- يتحقق من JWT + صلاحية admin
- ينادي `GET https://api.loyverse.com/v1.0/receipts?created_at_min=YYYY-MM-DDT00:00:00.000Z&created_at_max=...&limit=250` لليوم الحالي (مع pagination عبر `cursor`)
- لكل إيصال: يجمع `payments[].money_amount` ويصنّفه:
  - `payment_type.type = "CASH"` → كاش
  - `payment_type.type = "CARD"` → شبكة
  - أي شيء آخر (OTHER/store تابع للتوصيل) → توصيل
- يستخدم `service_role` لـ `upsert` في `daily_sales` بمفتاح `date`
- يُرجع: `{ orders, cash, card, delivery, total }`

### 3. تعديل قاعدة البيانات
- إضافة `unique constraint` على `daily_sales.date` لدعم upsert نظيف
- (لا migrations أخرى لازمة)

### 4. تحديث Dashboard (`src/pages/Dashboard.tsx`)
- زر جديد بجانب "إضافة": **"🔄 مزامنة من الكاشير"**
- عند الضغط: `supabase.functions.invoke("sync-loyverse-sales")` → toast بالنتيجة → invalidate الكاش
- شريط حالة صغير أسفل البطاقة: "آخر مزامنة: 12:34" (من `localStorage`)

### 5. صفحة إعدادات صغيرة (اختيارية لكن مفيدة)
بدل صفحة جديدة، أضيف dialog "إعدادات الكاشير" يفتح من زر صغير في Dashboard:
- حالة الاتصال (اختبار + استدعاء `/v1.0/merchant`)
- زر "مزامنة الآن"
- شرح بسيط لكيفية الحصول على التوكن

### تدفق العمل
```text
المستخدم  →  زر "مزامنة من الكاشير"
              │
              ▼
       Edge Function (admin only)
              │
              ▼
     Loyverse API: /receipts?today
              │
              ▼
   تصنيف: cash / card / delivery
              │
              ▼
     UPSERT daily_sales (date)
              │
              ▼
      Dashboard يحدّث الأرقام
```

### ملاحظات
- **التوصيل**: حالياً سأعتبر أي payment_type ≠ CASH/CARD = توصيل. لو كان عندك متجر منفصل في Loyverse للتوصيل، أحتاج `store_id` لاحقاً لتصنيف أدق.
- **الأمان**: التوكن يبقى في secrets فقط، ما يوصل للفرونت.
- **مزامنة تلقائية**: أتركها للمرحلة الثانية (نضيف pg_cron لاحقاً لو حبيت).

### الخطوات بالترتيب
1. طلب `LOYVERSE_API_TOKEN` منك
2. migration: unique constraint على `daily_sales.date`
3. إنشاء `supabase/functions/sync-loyverse-sales/index.ts`
4. إضافة زر المزامنة + Dialog الإعدادات في Dashboard
5. اختبار: مزامنة → التحقق من الأرقام في البطاقات

جاهز أبدأ بمجرد ما توافق وتعطيني التوكن.
