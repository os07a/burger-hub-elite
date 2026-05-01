# المشكلة

المستشار الذكي يرجع خطأ 500 ويعرض "حدث خطأ، حاول لاحقاً" عند إرسال أي رسالة.

السبب من سجلات Edge Function:
```
TypeError: userClient.auth.getClaims is not a function
  at business-advisor/index.ts:121
```

دالة `auth.getClaims()` غير موجودة في مكتبة Supabase JS المستخدمة في الـ edge function، لذا كل طلب يفشل في خطوة التحقق من الهوية ويرجع 500.

# الحل

استبدال `userClient.auth.getClaims(token)` في `supabase/functions/business-advisor/index.ts` بـ `userClient.auth.getUser(token)` وهي الطريقة القياسية للتحقق من الـ JWT والحصول على المستخدم.

## التغيير

في `supabase/functions/business-advisor/index.ts` (سطور ~121-127):

```ts
const token = authHeader.replace("Bearer ", "");
const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
if (userErr || !user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

لا تغييرات في الواجهة. ستُنشر الدالة تلقائياً بعد الحفظ.

## النتيجة

- المستشار الذكي يرد على الرسائل بدون خطأ 500.
- التحقق من الهوية يبقى سليماً (JWT صالح من مستخدم مسجّل).

## الملفات المتأثرة

- `supabase/functions/business-advisor/index.ts`
