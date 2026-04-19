
## السؤال
المستخدم يسأل: وين تتخزن بيانات النظام؟ هل في SQL؟ هل في ملفات Excel؟ وين الـ APIs؟

هذا سؤال **توضيحي** (مو طلب تنفيذ) — الجواب مباشر بدون خطة تعديل.

## الجواب

### 1) قاعدة البيانات — PostgreSQL (SQL حقيقي)
كل البيانات محفوظة في **قاعدة بيانات PostgreSQL** مُدارة عبر **Lovable Cloud** (المبني على Supabase) في **منطقة أوروبا**.

**الجداول الموجودة فعلياً (24 جدول):**
- **المبيعات والكاشير**: `daily_sales`, `pos_receipts`, `pos_receipt_items`
- **الموظفين والـ HR**: `employees`, `employee_docs`, `employee_qualifications`, `employee_leaves`, `employee_penalties`, `employee_rewards`, `employee_evaluations`
- **الحضور**: `attendance`, `attendance_audit`, `restaurant_settings`
- **الشركاء والأرباح**: `partner_shares`, `monthly_distributions`, `share_milestones`
- **المنتجات والمخزون**: `products`, `inventory_items`
- **الموردين**: `suppliers`, `invoices`
- **الولاء والرسائل**: `loyalty_customers`, `messages`, `whatsapp_messages`
- **المستخدمين**: `profiles`, `user_roles` (للصلاحيات Admin/Employee)

كل جدول محمي بسياسات **RLS (Row-Level Security)** — يعني الأدمن يقدر يعدّل، الموظف قراءة فقط.

### 2) ملفات Excel — ❌ غير مستخدمة في التشغيل
ملفات الإكسل اللي شاركتها سابقاً (مبيعات، تأسيس، مصاريف) **استُخدمت مرة وحدة فقط كـ Seed Data** (بيانات أولية للتعبئة) — أرقام مثل:
- تكاليف التأسيس 292,405 ر.س
- صافي المبيعات 91,870 ر.س
- نقطة التعادل 15,761 ر.س

هذي محفوظة الآن **داخل قاعدة البيانات** + بعضها في **ذاكرة المشروع** (`mem://financials/benchmarks`) كمراجع. النظام **لا يقرأ من Excel** أبداً وقت التشغيل.

### 3) ملفات التخزين (Storage Buckets)
للملفات الثنائية (صور/PDF):
- `product-images` (عام) — صور المنتجات
- `employee-docs` (خاص) — مستندات الموظفين (هويات، عقود)

### 4) الـ APIs (Edge Functions)
4 دوال Serverless تعمل على Lovable Cloud:
| الدالة | الوظيفة |
|--------|---------|
| `sync-loyverse-sales` | جلب المبيعات من كاشير Loyverse |
| `sync-loyverse-customers` | جلب عملاء الولاء |
| `business-advisor` | المستشار الذكي (Lovable AI) |
| `extract-iqama-data` | استخراج بيانات الإقامة من الصور |
| `transcribe-audio` | تحويل الصوت لنص |

### 5) APIs خارجية
- **Loyverse POS** (عبر `LOYVERSE_API_TOKEN`) — مصدر بيانات المبيعات
- **Lovable AI Gateway** (`LOVABLE_API_KEY`) — Gemini للذكاء الاصطناعي
- **Twilio WhatsApp** — للرسائل (مخطط)
- ❌ **لا يوجد** ربط بنكي مباشر (Open Banking)

### 6) المصادقة (Auth)
نظام Supabase Auth — أول مستخدم يصير **Admin** تلقائياً عبر دالة `handle_new_user()`، الباقي **Employee**.

## الخلاصة
```
المتصفح (React) ──HTTPS──► Lovable Cloud
                              ├─ PostgreSQL (24 جدول SQL)
                              ├─ Storage (صور + PDF)
                              ├─ Edge Functions (5 APIs)
                              └─ Auth (تسجيل الدخول)
                                       │
                                       └──► Loyverse API + Lovable AI
```
**ما فيه ملفات Excel ولا JSON محلية** — كل شي SQL في السحابة.
