## الهدف
تحسين صفحة **تحليل المنيو** بحيث:
1. تشيل كل الإيموجيات وتُستبدل بمؤشرات بصرية احترافية (نقاط ملونة، شرائط، وسوم نصية).
2. تتحدث تلقائياً من الكاشير (Loyverse) عبر مزامنة دورية + تحديث فوري للواجهة.
3. تعرض **مقارنة مع الفترة السابقة** (آخر 7/30/90 يوم مقابل الفترة السابقة لها) لرؤية الاتجاه.

---

## 1) إزالة الإيموجيات وتحسين الشكل البصري

في `src/hooks/useMenuEngineering.ts`:
- إزالة حقل `emoji` من `QUADRANT_META` واستبداله بـ `dot` (نقطة ملونة CSS) أو أيقونة Lucide مناسبة:
  - النجوم → `Star` (lucide)
  - الجياد → `Zap`
  - الألغاز → `Puzzle`
  - الخاسرات → `TrendingDown`

في `src/pages/MenuAnalysis.tsx`:
- بطاقات الـ4 quadrants: استبدال الإيموجي الكبير بـ **أيقونة Lucide داخل دائرة ملونة خفيفة** (12-14px) + شريط جانبي ملون يمين.
- جدول التصنيف: استبدال `<span>{meta.emoji}</span>` بنقطة `<span className="w-1.5 h-1.5 rounded-full" style={{background: meta.color}} />`.
- Tooltip في المصفوفة: إزالة الإيموجي، إبقاء اسم المنتج بخط بولد + الوسم الملوّن.
- إزالة الإيموجيات من prompt الـ AI في `supabase/functions/menu-engineering-advice/index.ts` (تستبدل بـ `[نجوم]`, `[جياد]`, `[ألغاز]`, `[خاسرات]`) عشان التوصيات ما ترجع نص فيه إيموجي.

---

## 2) ربط مباشر بالكاشير + تحديث تلقائي

حالياً المزامنة يدوية من زر في الداشبورد. سنضيف:

**أ. مزامنة تلقائية في الخلفية عند فتح الصفحة:**
- في `MenuAnalysis.tsx` نضيف `useEffect` يستدعي `supabase.functions.invoke("sync-loyverse-sales", { body: { date: today } })` بصمت عند أول فتح، ثم يعيد جلب البيانات (`refetch`).
- حالة "آخر تحديث: قبل X دقيقة" تظهر بجانب العنوان مع زر تحديث يدوي صغير (`RefreshCw`).

**ب. Realtime على جدول `pos_receipt_items`:**
- في `useMenuEngineering` نشترك في Postgres Changes على `pos_receipt_items` (insert/update) ونعمل `queryClient.invalidateQueries(["menu_engineering"])` عند أي تغيير → الواجهة تتحدث فوراً عند دخول إيصال جديد.
- يتطلب: تشغيل Realtime على الجدول عبر migration:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_receipt_items;
  ```

**ج. Auto-refresh كل دقيقتين كاحتياط:**
- إضافة `refetchInterval: 120000` و `refetchOnWindowFocus: true` على `useQuery` في `useMenuEngineering`.

---

## 3) مقارنة مع الفترة السابقة

تحديث `useMenuEngineering` ليجلب **فترتين**:
- الفترة الحالية: `now - days` → `now`
- الفترة السابقة: `now - 2*days` → `now - days`

ويرجع لكل صنف بالإضافة للحقول الحالية:
- `prev_units_sold`, `prev_total_margin`, `prev_net_revenue`
- `units_change_pct`, `margin_change_pct`

وعلى مستوى الإجمالي:
- `prev_total_revenue`, `prev_total_margin`, `revenue_change_pct`, `margin_change_pct`.

في الواجهة:
- بطاقات KPI الأربع: إضافة سطر صغير "▲ 12% من الفترة السابقة" بالأخضر/الأحمر تحت الرقم (نستخدم `MetricCard`'s `sub` أو نضيف badge صغير).
- في الجدول: عمود جديد **"الاتجاه"** يعرض سهم + نسبة التغير في الوحدات (أخضر صاعد / أحمر نازل / رمادي ثابت).
- في الـ AI prompt: إضافة سياق المقارنة عشان التوصيات تكون مبنية على الاتجاه (مثلاً "البرجر الكلاسيك نزل 30% — راجع الجودة أو السعر").

---

## التفاصيل التقنية (للمطور)

**ملفات معدّلة:**
- `src/hooks/useMenuEngineering.ts` — إضافة استعلام للفترة السابقة + Realtime subscription + auto-refetch.
- `src/pages/MenuAnalysis.tsx` — استبدال الإيموجيات بأيقونات Lucide، إضافة عمود الاتجاه، شارة "آخر تحديث"، استدعاء auto-sync.
- `supabase/functions/menu-engineering-advice/index.ts` — إزالة الإيموجيات من prompt + استقبال بيانات المقارنة.

**Migration واحد:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_receipt_items;
ALTER TABLE public.pos_receipt_items REPLICA IDENTITY FULL;
```

**ملاحظة على الأداء:** استعلام الفترة السابقة يُنفّذ بالتوازي مع الحالي عبر `Promise.all` داخل `queryFn` — ما يضيف latency يذكر.

---

## النتيجة المتوقعة
- شكل أنظف وأكثر احترافية بدون إيموجيات.
- البيانات تتحدث تلقائياً بدون ما يحتاج المستخدم يضغط مزامنة.
- رؤية واضحة للاتجاه: أي صنف يصعد، أي صنف ينزل.
