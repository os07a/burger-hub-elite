# ربط واتساب عبر Meta Cloud API + إعادة بناء فلو الرسائل

## الهدف
ربط فعلي مع **Meta WhatsApp Cloud API** (بدون Twilio) + إعادة بناء صفحة `/messages` لتشتغل ببيانات حقيقية من قاعدة الولاء، مع إرسال فعلي وتتبع حالة التوصيل.

---

## 📘 المرحلة 0 — دليل استخراج القيم الـ 5 من Meta (تسوّيها بالتوازي)

### الخطوات السريعة:
1. **افتح** developers.facebook.com → My Apps → Create App → اختار **Business**
2. داخل التطبيق: Add Product → اختار **WhatsApp** → Set up
3. هيظهر لك Test number مجاني تلقائياً (تقدر ترسل لـ 5 أرقام تجريبية)

### القيم الـ 5 ووين تجيبها:

| Secret Name | المكان |
|-------------|--------|
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp → API Setup → "Temporary access token" (للتجربة، 24h). للإنتاج: System Users → Generate permanent token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp → API Setup → تحت "From" |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp → API Setup → "WhatsApp Business Account ID" |
| `WHATSAPP_VERIFY_TOKEN` | **تختاره أنت** — أي نص (مثل `burgerhum_secret_2025`) |
| `WHATSAPP_APP_SECRET` | App Settings → Basic → "App Secret" → Show |

### إضافة الأرقام التجريبية (مهم!):
WhatsApp → API Setup → To → Manage phone number list → أضف رقمك ورقمين تجريبيين

---

## 🔧 المرحلة 1 — Edge Functions

### `send-whatsapp-message` (جديد)
- يستقبل: `{ to, message, template_name?, customer_id? }`
- يطبّع الرقم السعودي: `05x...` → `9665x...`
- يستدعي `POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages`
- يحفظ في `whatsapp_messages` (status: sent/failed)
- JWT validation + Zod input validation

### `whatsapp-webhook` (جديد)
- `verify_jwt = false` (Meta يستدعيه بدون auth)
- **GET**: تحقّق `hub.verify_token` ضد `WHATSAPP_VERIFY_TOKEN`
- **POST**: يستقبل تحديثات الحالة (delivered/read/failed) ويحدّث السجل
- يتحقق من توقيع `X-Hub-Signature-256` بـ `WHATSAPP_APP_SECRET`

### تحديث `supabase/config.toml`:
إضافة block للـ webhook بـ `verify_jwt = false`

---

## 🗄️ المرحلة 2 — Migration

تحديث `whatsapp_messages`:
- إضافة `customer_id` (uuid, nullable) للربط مع `loyalty_customers`
- إضافة `delivered_at`, `read_at` (timestamptz, nullable)
- توسيع `status` ليدعم: `sent | delivered | read | failed | error`

---

## 🎨 المرحلة 3 — إعادة بناء `/messages`

### مكوّنات جديدة:

**`src/lib/phoneNormalize.ts`** — `normalizeSaudiPhone(raw)` يحوّل `05xxx`/`5xxx`/`+9665xxx` → `9665xxxxxxxx`، يرجّع `null` للأرقام الخاطئة.

**`src/lib/messageTemplates.ts`** — 4 قوالب ثابتة (ترحيب، مكافأة ولاء، عرض خاص، تذكير زيارة) مع متغيرات `{name}`, `{points}`, `{visits}`.

**`src/hooks/useLoyaltyCustomersForMessaging.ts`** — جلب العملاء بأرقام صحيحة فقط مع تصنيف VIP/Regular/Inactive.

**`src/hooks/useWhatsappMessages.ts`** — آخر 20 رسالة + Realtime subscription.

**`src/components/messages/RecipientsList.tsx`** — قائمة عملاء مع checkbox، "اختر/إلغاء الكل"، شارة صحة الرقم، عداد "X من Y".

**`src/components/messages/MessagePreview.tsx`** — معاينة حية لأول 3 عملاء بعد استبدال المتغيرات.

**`src/components/messages/SendProgress.tsx`** — Modal أثناء الإرسال الجماعي مع Progress bar فعلي وقائمة نتائج.

**`src/components/messages/EmptyCustomersState.tsx`** — يظهر لما `loyalty_customers` فاضي مع زر "🔄 مزامنة عملاء بونات".

### تعديل `src/pages/Messages.tsx`:
- حذف كل البيانات الوهمية
- KPIs فعلية من DB
- شيل dropdown القوالب المكرر (السايدبار فقط)
- إخفاء زر SMS (شارة "قريباً")
- زر جدولة → disabled
- زر "📱 إرسال واتساب" يصير فعلي عبر `send-whatsapp-message`

---

## 🔐 المرحلة 4 — Secrets

سأطلب إضافة 5 secrets:
`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`

---

## 🔗 المرحلة 5 — ربط Webhook في Meta

بعد النشر، URL الـ Webhook:
`https://bjfhrrtajyvvdcsrpwqb.supabase.co/functions/v1/whatsapp-webhook`

تحطه في: Meta App → WhatsApp → Configuration → Webhook
- Callback URL: الرابط أعلاه
- Verify token: نفس `WHATSAPP_VERIFY_TOKEN`
- Subscribe to: `messages`

---

## 🧪 المرحلة 6 — اختبار

1. مزامنة بونات يدوياً من الزر
2. اختر عميل واحد (رقمك التجريبي)
3. اختر قالب "ترحيب"
4. تحقق من المعاينة الحية
5. اضغط إرسال → يصلك واتساب فعلياً
6. الحالة تتحدّث (sent → delivered → read)

---

## 📦 الملفات

**جديدة:**
- `supabase/functions/send-whatsapp-message/index.ts`
- `supabase/functions/whatsapp-webhook/index.ts`
- `src/lib/phoneNormalize.ts`
- `src/lib/messageTemplates.ts`
- `src/hooks/useLoyaltyCustomersForMessaging.ts`
- `src/hooks/useWhatsappMessages.ts`
- `src/components/messages/RecipientsList.tsx`
- `src/components/messages/MessagePreview.tsx`
- `src/components/messages/SendProgress.tsx`
- `src/components/messages/EmptyCustomersState.tsx`

**معدّلة:** `src/pages/Messages.tsx` (إعادة بناء), `supabase/config.toml`

**Migration:** تحديث `whatsapp_messages`

---

## ⚠️ ملاحظات

1. الرقم التجريبي المجاني: 1,000 محادثة/شهر + 5 أرقام مستقبلين فقط
2. للإرسال بدون قيود → رقم إنتاج موثّق + قوالب معتمدة (لاحقاً)
3. Access Token المؤقت يخلص بعد 24h — للإنتاج: System User token دائم
4. `loyalty_customers` فاضي حالياً — تزامن قبل الاختبار

---

## 🎁 النتيجة

- زر "إرسال واتساب" يرسل **فعلياً** عبر Meta API
- معاينة حية قبل الإرسال
- عداد إرسال جماعي شفاف
- سجل حقيقي مع حالة التوصيل والقراءة
- بنية جاهزة لترقية رقم إنتاج لاحقاً