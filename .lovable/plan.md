# Tooltips تفصيلية + مزامنة الكاشير + تصفية التواريخ لمؤشر المبيعات

## الهدف
إضافة 3 ميزات لصفحة `مؤشر المبيعات` (`/sales-indicator`):
1. **Tooltips تفصيلية** على بطاقات KPI الستة (إجمالي، صافي، متوسط يومي، أعلى يوم، أدنى يوم، خصومات) — توضح المعنى وطريقة الحساب.
2. **زر مزامنة الكاشير** في رأس الصفحة (يفتح `PosSyncDialog` الموجود، إعادة استخدام بدون تكرار).
3. **تصفية نطاق التواريخ** (من / إلى) في رأس الصفحة، تطبّق على كل المؤشرات والجداول.

---

## التغييرات بالتفصيل

### 1) `src/hooks/useSalesIndicator.ts` — قبول نطاق تواريخ
- يستقبل `{ fromDate?, toDate? }` ويمررها لـ `useDailySalesSummary`.
- يضيف داخل `kpis` ثلاث قيم مساعدة للـ Tooltips:
  - `bestDayLabel`, `bestDayDate`
  - `worstDayLabel`, `worstDayDate`
  - `discountPct` — نسبة الخصم الكلية
- بدون كسر العقد الحالي للحقول الموجودة.

### 2) `src/pages/SalesIndicator.tsx` — رأس صفحة جديد + Tooltips
- **State محلي**: `fromDate`, `toDate`, `posSyncOpen`.
- **شريط أدوات** بمحاذاة يمين تحت `PageHeader`:
  - حقلا `<Input type="date" />` لـ "من" و"إلى".
  - زر "إعادة تعيين" يصفّر النطاق.
  - زر **"🔄 مزامنة الكاشير"** بنمط `bg-primary` يفتح `PosSyncDialog`.
  - عند نجاح المزامنة (`onSynced`) يعمل `queryClient.invalidateQueries(["daily-sales-summary"])`.
- **Tooltips على بطاقات KPI** باستخدام `Tooltip` من `@/components/ui/tooltip` (موجود):
  - **🧾 إجمالي المبيعات**: مجموع قيمة الفواتير قبل الخصومات والمسترد — `gross_sales` من الكاشير.
  - **💵 صافي المبيعات**: إجمالي − الخصومات − المسترد. الإيراد الفعلي.
  - **📊 متوسط يومي**: إجمالي ÷ عدد الأيام المسجّلة ({daysCount} يوم).
  - **🏆 أعلى يوم**: أعلى مبيعات يومية ({bestDayLabel} - {bestDayDate}).
  - **📉 أدنى يوم فعلي**: أقل يوم فيه مبيعات > 0 (يتجاهل أيام الإغلاق) — {worstDayLabel}.
  - **🏷️ إجمالي الخصومات**: مجموع الخصومات. النسبة {discountPct}% — يفضّل تحت 2%.

### 3) لا تعديلات على Supabase
- `useDailySalesSummary` يدعم `fromDate/toDate` أصلاً.

---

## نقاط مهمة
- RTL محفوظ (شريط الأدوات `justify-start` بمحاذاة العنوان من اليمين).
- إعادة استخدام `PosSyncDialog` بدون نسخ.
- Tooltips من shadcn — صفر تبعيات جديدة.
- KPIs والشهور وأيام الأسبوع تتحدث تلقائياً عبر `useMemo` عند تغيير النطاق.

## الملفات
- ✏️ `src/hooks/useSalesIndicator.ts`
- ✏️ `src/pages/SalesIndicator.tsx`