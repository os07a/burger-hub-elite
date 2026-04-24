---
name: Social Media Insights
description: قسم سيكتور سوشل ميديا تحت "المشغّل" — تحليل أسبوعي لـ Meta (Facebook + Instagram) بإدخال يدوي ذكي + AI + ربط بالمبيعات
type: feature
---
قسم `/social-media` تحت مجموعة "المشغّل" بأيقونة Share2.

**النهج**: هجين — إدخال يدوي اليوم + جدول `meta_connection` جاهز لـ Meta Graph API لاحقاً (بدون إعادة بناء).

**الجداول**:
- `social_insights` (أسبوعي per platform: facebook/instagram/both) — reach, impressions, profile_visits, new_followers, total_followers, engagement_rate, posts_count, best_post_time, ai_summary, ai_suggestions (jsonb), sales_correlation (jsonb), source.
- `social_posts` (مرتبط بـ insight) — post_text, post_type (image/video/reel/story/carousel), reach, likes, comments, shares, saves, engagement_score, ai_analysis.
- `meta_connection` — fb_page_id, ig_business_id, access_token_encrypted, token_expires_at, last_sync_at, is_active.

**Edge Function**: `analyze-social-insights` — يقرأ `daily_sales` للأسبوع، يحسب SAR per 1000 reach، يستدعي Lovable AI (gemini-2.5-flash) لتوليد ai_summary + ai_suggestions (4) + posts_analysis، يـ upsert في social_insights ويستبدل posts.

**UI**: Hero (الملخص الذكي) + Tabs (الكل/Facebook/Instagram) + KPI Grid مشروح بسيط + SalesCorrelationCard (شريط مزدوج آخر 4 أسابيع) + AiSuggestionsCard + TopPostsTable (3 أفضل + 1 أضعف) + SocialTrendChart (Line آخر 8 أسابيع) + MetaConnectionPlaceholder (زر "قريباً").

**Modal الإدخال**: 7 حقول رئيسية + Repeater للمنشورات + زر "تحليل بالـ AI".

**RLS**: المدير CRUD، الموظف Read فقط. meta_connection: Admin only.

**Seeded**: 3 أسابيع تجريبية + 4 منشورات للأسبوع الأخير.