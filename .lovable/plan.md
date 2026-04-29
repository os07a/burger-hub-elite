# إصلاح محاذاة سجل الإيصالات + تفاصيل الطلب عند الضغط

## المشاكل الحالية
1. أعمدة جدول الإيصالات (رقم/الوقت/النوع/المبلغ) تظهر بمسافات كبيرة وغير منسقة في RTL — كل عمود ياخذ مساحة عشوائية لأن الجدول بدون عرض ثابت للأعمدة وبدون توسيط لشارة "النوع".
2. لما يضغط المستخدم على إيصال، ما يحصل شيء — يبي يشوف تفاصيل الأصناف داخل ذلك الإيصال.

## التغييرات

### 1) إصلاح المحاذاة في `src/components/dashboard/SalesLogCard.tsx`

داخل `<table>` تحت تبويب "الإيصالات":
- إضافة `table-fixed` وتحديد عرض كل عمود عبر `<colgroup>`:
  - رقم: 22%
  - الوقت: 22%
  - النوع: 26% (وسط)
  - المبلغ: 30% (يسار)
- توسيط عمود "النوع" بـ `text-center` للهيدر والخلية، وإلغاء `inline-flex` على الـ StatusBadge بحيث ما تتمدد.
- التأكد من `text-right` و`text-left` يطبقون فعلاً (الجدول داخل `dir="rtl"` من السايدبار، لكن نضمن المحاذاة بكلاسات صريحة).

### 2) صف قابل للتوسعة لعرض تفاصيل الإيصال

- إضافة state محلية: `const [expanded, setExpanded] = useState<string | null>(null)` (نخزن `receipt_number`).
- تحويل صف الإيصال (`<tr>`) لزر قابل للضغط (cursor-pointer + aria-expanded). الضغط يبدّل `expanded`.
- إضافة أيقونة Chevron (ChevronDown/ChevronLeft) في بداية الصف تتدوّر عند التوسع.
- عند التوسع: إضافة `<tr>` ثاني بـ `colSpan={4}` يعرض الأصناف الخاصة بهذا الإيصال:
  - استخدام البيانات الموجودة في `items` (المُجمَّعة باليوم) **لا يكفي** — لأنها مُجمَّعة لكل اليوم بدون `receipt_number`.
  - الحل: إنشاء hook جديد `useReceiptItemsByReceipt(receiptNumber)` يجلب من `pos_receipt_items` بـ `eq("receipt_number", n)` ويعرض: اسم الصنف، الكمية، السعر، الإجمالي.
  - يستعمل `enabled: !!receiptNumber` بحيث ما يجلب إلا للإيصال الموسَّع.
- تصميم لوحة التفاصيل: خلفية `bg-muted/20`, padding خفيف, جدول داخلي صغير بأعمدة (الصنف / الكمية / المبلغ).

### 3) ملف جديد: `src/hooks/useReceiptItemByReceipt.ts`

```ts
useQuery({
  queryKey: ["pos_receipt_items_by_receipt", receiptNumber],
  enabled: !!receiptNumber,
  queryFn: () => supabase.from("pos_receipt_items")
    .select("item_name, variant_name, quantity, price, net_total")
    .eq("receipt_number", receiptNumber)
    .order("item_name")
})
```

## ملفات ستتغير
- `src/components/dashboard/SalesLogCard.tsx` — تعديل
- `src/hooks/useReceiptItemByReceipt.ts` — إنشاء

## النتيجة المتوقعة
- جدول الإيصالات منظَّم بأعمدة متساوية وشارة "النوع" في الوسط.
- الضغط على أي إيصال يفتح أسفله تفاصيل الأصناف (اسم/كمية/سعر) فوراً، والضغط مرة ثانية يطويه.
- ضغط إيصال آخر يطوي السابق ويفتح الجديد (تجربة accordion).
