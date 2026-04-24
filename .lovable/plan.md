
## تحديث قسم التواصل الاجتماعي بالقراءات الفعلية

### 1) تغيير الاسم في كل مكان
- **`src/components/layout/Sidebar.tsx`**: `"سيكتور سوشل ميديا"` → `"التواصل الاجتماعي"`
- **`src/pages/SocialMedia.tsx`** (PageHeader): `"سيكتور سوشل ميديا"` → `"التواصل الاجتماعي"`
- المسار `/social-media` يبقى كما هو

### 2) إضافة حقل جديد للجدول `social_insights`
الصور تحوي مقياسين غير موجودين حالياً في الـ schema:
- `views` (int) — المشاهدات (مختلف عن impressions في Meta الجديد)
- `link_clicks` (int) — نقرات الرابط
- `content_interactions` (int) — التفاعلات الكلية (لايك+تعليق+حفظ+مشاركة مجتمعة)
- `reach_change_pct`, `views_change_pct`, `visits_change_pct`, `interactions_change_pct`, `link_clicks_change_pct` (numeric) — نسب التغير المعروضة في Meta

→ Migration بسيطة `ALTER TABLE social_insights ADD COLUMN ...`

### 3) حذف بيانات الـ Seed التجريبية القديمة
```sql
DELETE FROM social_posts WHERE insight_id IN (SELECT id FROM social_insights);
DELETE FROM social_insights;
```

### 4) إدراج البيانات الفعلية من Instagram
**سجل واحد** (الفترة 27 مارس - 21 أبريل 2026 على Instagram):
```sql
INSERT INTO social_insights (
  week_start, platform, reach, impressions, views,
  profile_visits, content_interactions, link_clicks,
  new_followers, total_followers, engagement_rate, posts_count,
  reach_change_pct, views_change_pct, visits_change_pct,
  interactions_change_pct, link_clicks_change_pct,
  best_post_time, source
) VALUES (
  '2026-03-27', 'instagram', 104, 873, 873,
  144, 16, 0,
  0, 0, 15.4, 0,
  -72.3, -53.3, -8.9, -52.9, 0,
  'الجمعة 27 مارس', 'manual'
);
```

### 5) استدعاء Edge Function `analyze-social-insights`
- يقرأ السجل الجديد
- يستدعي Lovable AI (Gemini Flash) لتوليد:
  - `ai_summary`: "📉 وصلت لـ 104 شخص آخر 4 أسابيع — تراجع 72% عن الفترة اللي قبلها. لكن نسبة التفاعل 15.4% ممتازة جداً والجمهور اللي معك مخلص (كل شخص شاف 8 مرات بالمتوسط). المشكلة: ما توصل لناس جدد. الحل: محتوى Reels لأنه يكسر خوارزمية الوصول."
  - `ai_suggestions` (4-5 اقتراحات قابلة للتنفيذ مبنية على الأرقام الفعلية)
  - `sales_correlation` بربطها مع `daily_sales` للفترة

### 6) تحديث UI لعرض المقاييس الجديدة
- **`SocialKpiGrid.tsx`**: إضافة بطاقتين جديدتين (Views, Link Clicks) → يصبح 6 بطاقات بدل 4، أو استبدال بعضها
- إضافة **شارة تغير %** بجانب كل رقم (سهم أحمر/أخضر مع النسبة) — مطابق لـ Meta exactly
- **`InsightHeroCard.tsx`**: إبراز "تراجع 72.3% في الوصول" بصرياً
- إضافة **`InteractionRateCard`**: بطاقة مميزة تشرح "نسبة التفاعل 15.4% — جودة جمهورك ممتازة رغم قلة الوصول"

### 7) تحديث `useSocialInsights.ts`
إضافة الحقول الجديدة إلى TypeScript interface.

### 8) تحديث الذاكرة
- `mem://features/social-media-insights`: تغيير الاسم وإضافة الحقول الجديدة
- `mem://index.md`: تحديث المرجع

---

### ملاحظات مهمة
- البيانات على **Instagram فقط** (الصور ما فيها فيسبوك) → سأضع `platform = 'instagram'`
- **لا يوجد بيانات منشورات فردية** في الصور → لن أضيف `social_posts`. النظام جاهز لإضافتها لاحقاً يدوياً
- **المتابعون الجدد غير ظاهرين** في الصور المرفقة → سأتركها 0 أو أطلب منك الرقم لاحقاً
- بعد التنفيذ: الصفحة `/social-media` ستعرض القراءات الفعلية مطابقة 100% لـ Meta + ملخص ذكي + اقتراحات AI مبنية على الأرقام الحقيقية
