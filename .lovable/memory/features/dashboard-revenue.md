---
name: Dashboard Revenue
description: Daily income entry — Network/Cash from Loyverse sync, Delivery is manual only
type: feature
---

نظام تسجيل الدخل اليومي في لوحة التحكم:

**ترتيب البطاقات (RTL، من اليمين):** الشبكة → الكاش → التوصيل → الخصومات → المرتجع.

**مصادر البيانات:**
- **الكاش + الشبكة**: تأتي تلقائياً من مزامنة Loyverse POS.
- **التوصيل**: مدخل يدوي فقط — Loyverse ما فيه طريقة دفع HungerStation/Keeta، فأي شي مو كاش في الكاشير = شبكة.
- **الخصومات + المرتجع + الضرائب**: من مزامنة Loyverse.

**قاعدة التصنيف في sync-loyverse-sales:**
- `payment_type === "CASH"` → كاش
- أي شي ثاني (CARD, OTHER, مدى, Apple Pay, مخصص) → **شبكة**
- التوصيل من المزامنة = صفر دائماً

**حماية الإدخال اليدوي:** عند المزامنة يتم قراءة `delivery_sales` الحالي والاحتفاظ به، ويُحسب `total_sales = net_sales + delivery_sales_manual`.
