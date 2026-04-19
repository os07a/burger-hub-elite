
المستخدم اختار **WhatsApp Cloud API من Meta** بدل Twilio. الخطة: نستبدل واجهة Twilio بواجهة Meta، نضيف Edge Function للإرسال، ونطلب الأسرار اللازمة.

## الخطة

### 1) الأسرار المطلوبة من المستخدم
بعد الموافقة، نطلب عبر `add_secret`:
- `WHATSAPP_ACCESS_TOKEN` — توكن دائم من Meta Business (System User Token).
- `WHATSAPP_PHONE_NUMBER_ID` — معرّف رقم واتساب من Meta WhatsApp Manager.
- `WHATSAPP_BUSINESS_ACCOUNT_ID` — اختياري، لجلب القوالب المعتمدة لاحقاً.

سأشرح للمستخدم في الشات (قبل add_secret) خطوات الحصول على القيم:
1. business.facebook.com → WhatsApp → API Setup.
2. ينشئ App + WhatsApp Product.
3. ياخذ Phone Number ID والـ Access Token.

### 2) Edge Function جديدة: `send-whatsapp`
`supabase/functions/send-whatsapp/index.ts`:
- تستقبل: `{ to: string, message: string, template_name?: string, template_params?: string[] }`.
- تتحقق JWT.
- تنادي Meta Graph API:
  ```
  POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages
  ```
- نوعان:
  - **Free-form text** (يشتغل فقط داخل نافذة 24 ساعة من رد العميل).
  - **Template message** (للإرسال الابتدائي — يحتاج قالب معتمد من Meta).
- تسجّل الرسالة في جدول جديد `whatsapp_messages`.
- إرجاع: `{ success, message_id, status }`.

### 3) جدول قاعدة بيانات جديد
migration: `whatsapp_messages` (id, to_phone, body, template_name, status, meta_message_id, sent_by, sent_at, error) + RLS (admin يقرأ الكل، الموظف يقرأ رسائله فقط).

### 4) تحديث صفحة الرسائل (`src/pages/Messages.tsx`)
- تغيير الـ subtitle من "Twilio" إلى "WhatsApp Cloud API · Meta".
- زر "ربط Twilio الآن" → "تحقّق من ربط واتساب" (يستدعي endpoint اختبار).
- زر "إرسال واتساب" يستدعي `supabase.functions.invoke('send-whatsapp', { body })`.
- إزالة زر "إرسال SMS" (Meta لا تدعم SMS) أو إبقاؤه معطّل مع شرح.
- استبدال `recentMessages` الوهمي بـ query من `whatsapp_messages` عبر hook جديد `useWhatsappMessages`.
- إضافة toast نجاح/فشل.

### 5) ملاحظة مهمة للمستخدم في الواجهة
إضافة شارة تنبيه: "للإرسال الابتدائي للعملاء (خارج نافذة 24 ساعة) تحتاج قالب معتمد من Meta. الردود والمحادثات الجارية تشتغل مباشرة بنص حر."

### الملفات
- جديد: `supabase/functions/send-whatsapp/index.ts`
- جديد: `src/hooks/useWhatsappMessages.ts`
- معدّل: `src/pages/Messages.tsx`
- migration: جدول `whatsapp_messages` + RLS
- تحديث: `mem://features/messaging-system` (تغيير من Twilio إلى Meta)

### المقارنة السريعة (للتأكيد)
| | Meta Cloud API | Twilio |
|---|---|---|
| سعر أول 1000 محادثة/شهر | **مجاني** | ~40$ |
| رقم سعودي | ✅ مباشر | محدود |
| Connector جاهز | ❌ يدوي | ✅ |
| SMS | ❌ | ✅ |

بعد الموافقة سأطلب الأسرار الثلاثة وأبدأ التنفيذ.
