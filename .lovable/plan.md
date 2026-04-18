
## فهمي
الصفحة حالياً تعتمد `ios-card` أبيض على أبيض. تبيها تنضرب بنفس هوية برجرهم: قرمزي #B03030، ذهبي #C4A265، فحم داكن #2C2C2C، مع تباين iOS 18 وأيقونات Lucide بدل الإيموجي العشوائي.

## الخطة المختصرة لإعادة بناء `/project-status`

### 1) لغة بصرية موحّدة (نفس الأقسام الأخرى)
- خلفيات البطاقات: `bg-card` + `border border-border` + `rounded-2xl` (نفس Profits بعد التوحيد).
- شريط لوني علوي رفيع (2px) داخل البطاقات الرئيسية باللون الدلالي (primary/accent/success) — ثابت داخل البطاقة، مو إطار أحمر كامل.
- أيقونات Lucide داخل دائرة ملوّنة خفيفة (`bg-primary/10 text-primary`) بدل الإيموجي 🔴🟢🟠.
- أرقام لاتينية عبر `fmt()` من `src/lib/format.ts`، عملة عبر `RiyalIcon`.

### 2) بنية الصفحة الذكية (4 طبقات)

**Hero KPIs (5 بطاقات)** — كل بطاقة فيها أيقونة دائرية + رقم كبير + Sparkline صغير:
- إجمالي المبيعات | الصافي | المتوسط اليومي | معدل الخصم | الرصيد البنكي
- ألوان الـ sub: success/warning/danger حسب الاتجاه

**شريط الزخم (Momentum Bar)** — بطاقة عريضة فيها:
- أداء آخر 30 يوم vs الـ 30 قبلها (نسبة + سهم اتجاه)
- مؤشر "Burn rate" مقابل "Income rate" بشريطين متقابلين
- توقع تاريخ نفاد السيولة بأيقونة 🕐 → Clock من Lucide

**شبكة التحليلات (3 أعمدة)**:
- *المبيعات الشهرية*: شريط مزدوج (gross شفاف + net قرمزي) لكل شهر + ميني-أيقونة TrendingUp/Down
- *أيام الأسبوع*: Heatmap عمودي (7 أعمدة) — كثافة لون قرمزي حسب المتوسط، مع تمييز الجمعة بإطار ذهبي
- *النمو الشهري*: Stepper عمودي بأيقونات ArrowUp/Down وتدرّج لوني

**التحليل الذكي (3 بطاقات بـ Tabs أو Accordion)**:
- نقاط الضعف (AlertTriangle قرمزي)
- الفجوات والعجز (TrendingDown ذهبي)
- التوقعات (Sparkles success)
- كل بند فيه أيقونة دائرية + عنوان + رقم بارز + سطر شرح

**القاع**: البنك vs الكاشير في بطاقة واحدة بـ Diverging Bar Chart + توزيع المصروفات بـ Donut/Stacked Bar (نفس نمط Profits).

### 3) الأيقونات (استبدال الإيموجي)
استخدام Lucide: `TrendingUp/Down`, `AlertTriangle`, `Target`, `Clock`, `Wallet`, `ShoppingCart`, `Zap`, `FileText`, `Truck`, `CreditCard`, `Calendar`, `Sparkles`, `Activity`.
الأيقونة دايماً داخل `<div className="w-9 h-9 rounded-full bg-{color}/10 flex items-center justify-center">` — نفس نمط MetricCardPro في Delivery.

### 4) ربط ذكي بالبيانات
- يبقى البيانات الحالية (real numbers) — لكن نستخرج المنطق في hook `useProjectStatusInsights.ts` يحسب: trend, burn rate, runway days, weekday heatmap, anomalies.
- إضافة بطاقة "Health Score" (0-100) محسوبة من: liquidity + growth + discount control + day distribution.

### 5) الملفات
- `src/pages/ProjectStatus.tsx` — إعادة بناء كاملة
- `src/hooks/useProjectStatusInsights.ts` — جديد، منطق التحليل
- `src/components/project-status/InsightCard.tsx` — بطاقة موحّدة بأيقونة دائرية
- `src/components/project-status/WeekdayHeatmap.tsx` — heatmap الأيام
- `src/components/project-status/MomentumBar.tsx` — شريط الزخم
- `src/components/project-status/HealthScore.tsx` — مؤشر الصحة العام

### 6) القيود
- بدون ألوان نيون أو تدرّجات صاخبة — فقط القرمزي/الذهبي/الفحم على خلفية card.
- بدون `border-r-primary` (محظور بعد آخر توحيد).
- كل الأرقام `fmt(n)` لاتينية، التواريخ `en-GB`.
