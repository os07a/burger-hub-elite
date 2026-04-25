## 🎯 الهدف

ربط نظام الرسائل بـ Meta WhatsApp Cloud API لسحب القوالب المعتمدة فعلياً، مع توفير **محتوى احترافي جاهز** (تعبئة ذكية من بيانات العميل + اقتراحات نصية للنصوص الثابتة)، بالإضافة لدليل إنشاء قوالب جديدة في حال عدم وجودها.

---

## 1. إضافة Secret جديد

سيتم طلب إضافة `WHATSAPP_BUSINESS_ACCOUNT_ID` (WABA ID) عبر أداة الـ Secrets قبل أي تعديل بالكود. الموقع في Meta:
- **Meta Business Suite → Settings → Business Assets → WhatsApp Accounts → [حسابك] → Account Info**
- رقم مكوّن من 15-16 خانة.

---

## 2. Edge Functions جديدة/معدّلة

### 2.1 `list-whatsapp-templates` (جديدة)
- تستدعي: `GET https://graph.facebook.com/v21.0/{WABA_ID}/message_templates`
- ترجع: قائمة القوالب مع `name`, `language`, `status`, `category`, `components` (لاستخراج المتغيرات `{{1}}`, `{{2}}`...)
- تُفلتر القوالب: تعرض **APPROVED** فقط للإرسال، مع شارات بصرية للحالات الأخرى (PENDING, REJECTED).
- Auth: تتطلب JWT (تستخدم `userClient.auth.getClaims`).
- Cache: 5 دقائق client-side عبر React Query.

### 2.2 `send-whatsapp-message` (تحديث)
تحويلها لـ Discriminated Union schema:
```ts
// kind: "text"  → الوضع الحالي (24h window)
// kind: "template" → جديد
{
  kind: "template",
  to: string,
  template_name: string,
  language: string,           // مثل "ar" أو "en_US"
  parameters: string[]        // قيم {{1}}, {{2}}, ... بالترتيب
}
```
- بناء `components` حسب صيغة Meta.
- تخزين الرسالة في `whatsapp_messages` مع `template_name` والمتغيرات.
- التحقق السيرفري إن عدد الـ parameters يطابق متغيرات القالب.

---

## 3. الواجهة (`src/pages/Messages.tsx`)

### الهيكل النهائي
```
[KPIs ×4] (يبقى)
[Webhook Configuration] (يبقى)

╔══ بطاقة "إنشاء رسالة" ══╗
║ Tabs: [📋 قالب معتمد] [💬 رد سريع 24h]
║
║ ── تبويب "قالب معتمد" ──
║   • Dropdown قوالب Meta (APPROVED فقط، مع شارات الحالة)
║   • معاينة Bubble أخضر مع المتغيرات مستبدلة
║   • نموذج ديناميكي للمتغيرات:
║     - تعبئة تلقائية من بيانات العميل المختار (الاسم/النقاط/الزيارات)
║     - اقتراحات نصية لكل متغير ثابت (chips قابلة للنقر)
║   • اختيار العميل (Combobox من loyalty_customers) أو إدخال يدوي
║   • زر إرسال (disabled حتى تكتمل المتغيرات)
║
║ ── تبويب "رد سريع 24h" ──
║   • تنبيه أصفر للـ window
║   • حقل رقم + Textarea + عداد أحرف (4096)
║   • زر إرسال نص حر
╚══════════════════════════╝

[سجل الرسائل ×47] (يبقى)

╔══ بطاقة "ما عندك قوالب؟" (تظهر فقط إذا 0 APPROVED) ══╗
║ • دليل مختصر: كيف تنشئ قالب في WhatsApp Manager (3 خطوات + رابط مباشر)
║ • 5 قوالب احترافية مقترحة جاهزة للنسخ:
║   1. welcome_burgerhum (ترحيب عميل جديد)
║   2. loyalty_points_update (تحديث نقاط الولاء)
║   3. special_offer_promo (عرض ترويجي)
║   4. visit_reminder (تذكير بالزيارة)
║   5. thank_you_after_visit (شكر بعد الزيارة)
║ • لكل قالب: زر نسخ النص + زر نسخ الاسم + ملاحظة الفئة (MARKETING/UTILITY)
╚════════════════════════════════════════════════════════╝
```

### مكوّن `TemplateSmartForm.tsx` (جديد) — قلب فكرة "المحتوى الجاهز"

لكل متغير `{{N}}` في القالب نعرض حقل إدخال + **شريحتين فوقه**:

| نوع المتغير | الاكتشاف | السلوك |
|---|---|---|
| **اسم العميل** | لو الـ component label يحتوي "name" أو متغير {{1}} في قالب فيه placeholder ترحيبي | تعبئة تلقائية من العميل + اقتراحات: "العميل الكريم"، "أخي العزيز"، "ضيفنا الكريم" |
| **عدد النقاط** | كلمة "points" | تعبئة من `total_points` |
| **عدد الزيارات** | كلمة "visits" | تعبئة من `total_visits` |
| **عرض/خصم** | كلمة "offer/discount" | اقتراحات: "خصم 20%"، "وجبة مجانية"، "ضعف النقاط" |
| **تاريخ** | كلمة "date" | اقتراحات: "اليوم"، "نهاية الأسبوع"، تاريخ مخصص |
| **عام** | لا يوجد كلمة معروفة | حقل حر + 3 اقتراحات احترافية باللهجة السعودية المهذبة |

### مكوّن `TemplateSuggestionsCard.tsx` (جديد)
بطاقة الـ 5 قوالب الجاهزة. كل قالب:
- اسم مقترح (snake_case)
- الفئة (UTILITY أو MARKETING)
- اللغة (ar)
- النص الكامل الجاهز للصق في WhatsApp Manager
- زر "نسخ النص" + زر "نسخ الاسم"

---

## 4. Hooks جديدة

### `useWhatsappTemplates.ts`
```ts
// React Query: queryKey ['whatsapp-templates']
// staleTime: 5min
// يستدعي list-whatsapp-templates
// يرجع: { templates, approvedOnly, isLoading, error }
```

### `useSendWhatsappTemplate.ts`
```ts
// Mutation تستدعي send-whatsapp-message بـ kind:"template"
// onSuccess: refetch ['whatsapp-messages'] + toast نجاح
// onError: toast بالخطأ من Meta
```

---

## 5. ملفات سيتم إنشاؤها/تعديلها

**جديدة:**
- `supabase/functions/list-whatsapp-templates/index.ts`
- `src/hooks/useWhatsappTemplates.ts`
- `src/hooks/useSendWhatsappTemplate.ts`
- `src/components/messages/TemplateSmartForm.tsx`
- `src/components/messages/TemplateSuggestionsCard.tsx`
- `src/components/messages/TemplatePreviewBubble.tsx`
- `src/lib/templateUtils.ts` (parsing components, استخراج متغيرات، detection للنوع)

**معدّلة:**
- `supabase/functions/send-whatsapp-message/index.ts` (إضافة kind:"template")
- `src/pages/Messages.tsx` (دمج Tabs + المكوّنات الجديدة)

---

## 6. خطوات التنفيذ بالترتيب

1. طلب إضافة `WHATSAPP_BUSINESS_ACCOUNT_ID` كـ Secret + انتظار الموافقة.
2. إنشاء Edge Function `list-whatsapp-templates` ونشرها.
3. اختبارها عبر `curl_edge_functions` للتأكد من رجوع القوالب.
4. تحديث `send-whatsapp-message` لدعم template mode.
5. بناء الـ Hooks والمكوّنات الجديدة.
6. دمج Tabs في صفحة Messages مع الحفاظ على KPIs والسجل (47 رسالة).
7. اختبار الفلو كاملاً: اختيار قالب → تعبئة ذكية → معاينة → إرسال.

---

## 7. المحتوى الاحترافي الجاهز للقوالب الـ 5

سيتم تضمينها داخل `TemplateSuggestionsCard` بالصياغة الكاملة (لهجة سعودية مهذبة، RTL، مع emojis مدروسة، تحت 1024 حرف لكل قالب حسب حد Meta). أمثلة مختصرة:

1. **welcome_burgerhum** (UTILITY): «أهلاً وسهلاً {{1}} 👋 شرّفتنا في عائلة برجرهم 🍔 رصيدك: {{2}} نقطة بدايةً. بانتظارك دايماً!»
2. **loyalty_points_update** (UTILITY): «{{1}} العزيز، رصيدك تحدّث إلى {{2}} نقطة بعد زيارتك الـ{{3}} 🌟»
3. **special_offer_promo** (MARKETING): «{{1}} 🔥 عرض حصري: {{2}} لين {{3}} — لا يفوتك!»
4. **visit_reminder** (MARKETING): «اشتقنالك يا {{1}} 💚 آخر زيارة لك كانت قبل فترة، تعال جرّب جديدنا!»
5. **thank_you_after_visit** (UTILITY): «شكراً {{1}} على زيارتك اليوم 🙏 رصيدك الحالي: {{2}} نقطة. نتشرف بعودتك!»

---

## ⚠️ ملاحظات مهمة
- لن يتم لمس ملفات الكلاينت Supabase (`client.ts`, `types.ts`).
- لن يتم تعديل `supabase/config.toml` على مستوى المشروع (فقط إضافة block للـ function الجديدة عند الحاجة).
- الـ 47 رسالة في السجل تبقى كـ fallback إذا قاعدة البيانات فاضية.
- شارات الحالة: ✅ APPROVED (أخضر) / ⏳ PENDING (أصفر) / ❌ REJECTED (أحمر).