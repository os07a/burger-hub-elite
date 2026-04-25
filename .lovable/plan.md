الخطة لمعالجة المشكلة بدون تغيير واجهة Messages أو الربط الحالي:

1. عدم استخدام التوكن المنسوخ الآن لأنه غالباً هو نفس التوكن المؤقت القديم المنتهي.

2. إنشاء توكن جديد بالكامل من Meta:
   - Business Settings
   - Users → System Users
   - اختر System User بصلاحية Admin
   - Generate New Token
   - اختر التطبيق المرتبط بالواتساب
   - Expiration: Never
   - الصلاحيات:
     - whatsapp_business_messaging
     - whatsapp_business_management

3. إذا زر النسخ ينسخ القديم أو لا يعمل، استخدم النسخ من نافذة التوكن الجديد فقط قبل إغلاقها. لو احتجت طريقة Console، استخدم أمر يلتقط أطول قيمة توكن ظاهرة بدلاً من أول input:

```js
copy([...document.querySelectorAll('input, textarea')]
  .map(el => el.value)
  .filter(v => v && v.length > 100)
  .sort((a, b) => b.length - a.length)[0])
```

4. بعد ما يكون معك التوكن الجديد، لا ترسله في المحادثة. سأفتح لك نموذج آمن لتحديث السر `WHATSAPP_ACCESS_TOKEN`.

5. بعد التحديث سأختبر الاتصال عبر دالة جلب قوالب واتساب للتأكد أن الخطأ القديم انتهى وأن الربط عبر Meta API ما زال يعمل.

ملاحظة مهمة: Meta لا تسمح باسترجاع توكن جديد بعد إغلاق نافذة إنشائه. إذا النافذة الحالية تعرض القديم، الأفضل توليد Token جديد مرة ثانية من System User.