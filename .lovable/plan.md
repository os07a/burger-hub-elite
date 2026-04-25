# 🎯 الهدف
بناء تبويب جديد **"المحادثات"** داخل صفحة `/messages` يعرض:
- قائمة جهات اتصال موحّدة (عملاء بونات + أي رقم راسلنا على الواتس).
- شات ثنائي بأسلوب واتساب ويب مع إمكانية الرد على الرسائل الواردة (ضمن نافذة 24 ساعة من Meta).
- تحديث لحظي (Realtime) للرسائل الواردة والصادرة.

---

## 🗄️ 1. تعديلات قاعدة البيانات (Migration)

### أ. توسيع جدول `whatsapp_messages`
- `direction` (text, default `'outbound'`) — `'inbound'` للواردة.
- `from_phone` (text, nullable) — رقم المرسل.
- `media_url` / `media_type` (nullable) — لو فيه وسائط.

### ب. تعديل سياسات RLS
- سياسة SELECT للمصادقين تعرض كل الرسائل (الواردة `sent_by = NULL`).
- INSERT للوارد عبر Service Role من الـ webhook (يتجاوز RLS).

### ج. تفعيل Realtime
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;
```

---

## ⚙️ 2. تحديث `whatsapp-webhook` Edge Function
حالياً يعالج فقط `statuses`. نضيف معالجة `messages` (الواردة):
- استخراج `from`, `text.body`, `id`, `type`.
- ربط `customer_id` تلقائياً لو الرقم موجود في `loyalty_customers`.
- حفظ بـ `direction='inbound'`, `status='received'`.

## 🆕 3. Edge Function جديدة: `send-whatsapp-reply`
ردود نصية حرة (مو قوالب) داخل نافذة 24 ساعة:
- يتحقق من آخر رسالة inbound خلال 24 ساعة.
- يرسل عبر Meta Cloud API نوع `text`.
- يخزن النتيجة بـ `direction='outbound'`.

---

## 🪝 4. Hooks جديدة

### `useWhatsappContacts.ts`
قائمة موحّدة من:
- `loyalty_customers` (اسم + رقم + tier).
- أرقام فريدة من `whatsapp_messages` ما تطابق عميل بونات → بالرقم.
- لكل جهة: آخر رسالة، وقتها، عدد غير مقروء.

### `useWhatsappConversation.ts`
كل الرسائل لرقم محدد + Realtime subscription.

---

## 🎨 5. واجهة "المحادثات" (تخطيط واتساب ويب RTL)

تبويب جديد في `Messages.tsx`، يحتوي:

**اليمين: `ContactsList.tsx`**
- صورة/أيقونة + اسم + آخر رسالة + الوقت + شارة غير مقروء.
- بحث وترتيب حسب آخر رسالة.

**اليسار: `ChatWindow.tsx`**
- هيدر بالاسم والرقم.
- Bubbles بأسلوب iOS (صادر = قرمزي، وارد = رمادي).
- مؤشرات ✓ / ✓✓ / ✓✓ زرقاء.
- صندوق إدخال:
  - مفعّل خلال نافذة 24 ساعة.
  - معطّل خارجها مع تنبيه "العميل لازم يبدأ المحادثة أو استخدم قالب معتمد".

### Empty State
"ما وصلتك أي رسالة بعد. شارك رقم الواتساب مع عملائك."

---

## 🔔 6. Realtime
Subscribe على `whatsapp_messages` → عند inbound جديد: تحديث القائمة + توست "رسالة جديدة من [الاسم/الرقم]".

---

## ✅ الملفات

**جديدة:**
- `src/components/messages/ConversationsTab.tsx`
- `src/components/messages/ContactsList.tsx`
- `src/components/messages/ChatWindow.tsx`
- `src/components/messages/MessageBubble.tsx`
- `src/hooks/useWhatsappContacts.ts`
- `src/hooks/useWhatsappConversation.ts`
- `supabase/functions/send-whatsapp-reply/index.ts`
- Migration SQL

**معدّلة:**
- `src/pages/Messages.tsx`
- `supabase/functions/whatsapp-webhook/index.ts`

---

## ⚠️ ملاحظات مهمة
1. **نافذة 24 ساعة Meta**: ما تقدر ترسل نص حر إلا لو العميل راسلك خلال 24 ساعة، وإلا لازم قالب معتمد.
2. **Webhook subscription**: لازم حقل `messages` مفعّل في إعدادات Meta Webhook (مو فقط `message_status`)، وإلا الواردة ما توصل.
3. `WHATSAPP_APP_SECRET` اختياري لكن مستحسن للتحقق من توقيع Meta.