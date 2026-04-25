import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Send, MessageSquare, Clock, ChevronDown, Copy, Check, Loader2, MessagesSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWhatsappMessages, useWhatsappStats } from "@/hooks/useWhatsappMessages";
import { formatSaudiPhoneDisplay } from "@/lib/phoneNormalize";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ConversationsTab from "@/components/messages/ConversationsTab";
import { useWhatsappContacts } from "@/hooks/useWhatsappContacts";

const templates = [
  { id: "welcome", name: "ترحيب عميل جديد", emoji: "👋", body: "أهلاً {name}! شكراً لزيارتك برقرهم 🍔 نتمنى تكون تجربتك ممتازة. تابعنا لعروض حصرية!" },
  { id: "loyalty", name: "تحديث نقاط الولاء", emoji: "⭐", body: "مرحباً {name}! عندك {points} نقطة في برقرهم. زيارة واحدة كمان وتحصل على وجبة مجانية! 🎁" },
  { id: "promo", name: "عرض خاص", emoji: "🎉", body: "عرض حصري لعملاء برقرهم! خصم 20% على جميع الوجبات يوم الاثنين 🔥 الكود: BURG20" },
  { id: "new-item", name: "منتج جديد", emoji: "🍔", body: "جديد في برقرهم! جرّب {product} الجديد — طعم ما يتوصف 🤤 متوفر الحين في الفرع." },
  { id: "feedback", name: "طلب تقييم", emoji: "📝", body: "شكراً لزيارتك برقرهم {name}! نحب نسمع رأيك 💬 قيّمنا من هنا: {link}" },
  { id: "birthday", name: "تهنئة عيد ميلاد", emoji: "🎂", body: "كل عام وأنت بخير {name}! 🎂 هديتنا لك: وجبة مجانية من برقرهم. أبرز هالرسالة عند الكاشير ❤️" },
];

const recentMessages = [
  { to: "عبدالرحمن", phone: "...4521", template: "عرض خاص", status: "delivered", time: "اليوم 2:30م", emoji: "🎉" },
  { to: "محمد الشهري", phone: "...8834", template: "تحديث نقاط", status: "delivered", time: "اليوم 1:15م", emoji: "⭐" },
  { to: "يوسف", phone: "...6612", template: "ترحيب عميل", status: "delivered", time: "أمس 9:00م", emoji: "👋" },
  { to: "عبدالباري", phone: "...4438", template: "عرض خاص", status: "read", time: "أمس 6:45م", emoji: "🎉" },
  { to: "سلطان", phone: "...7721", template: "منتج جديد", status: "failed", time: "أمس 3:20م", emoji: "🍔" },
];

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
  delivered: { label: "تم التوصيل", variant: "success" },
  read: { label: "مقروءة", variant: "info" },
  sent: { label: "أُرسلت", variant: "warning" },
  failed: { label: "فشلت", variant: "danger" },
};

const customerSegments = [
  { label: "جميع العملاء", count: 47, emoji: "👥" },
  { label: "عملاء متكررين", count: 12, emoji: "🔁" },
  { label: "عملاء VIP (5+ زيارات)", count: 5, emoji: "👑" },
  { label: "عملاء غير نشطين (30+ يوم)", count: 18, emoji: "😴" },
  { label: "عملاء جدد (آخر 7 أيام)", count: 8, emoji: "🆕" },
];

const Messages = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [messageBody, setMessageBody] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: stats } = useWhatsappStats();
  const { data: recentDb } = useWhatsappMessages(10);
  const { data: contactsData } = useWhatsappContacts();
  const totalUnread = (contactsData ?? []).reduce((s, c) => s + c.unreadCount, 0);

  const projectRef = "bjfhrrtajyvvdcsrpwqb";
  const webhookUrl = `https://${projectRef}.supabase.co/functions/v1/whatsapp-webhook`;

  const copyWebhook = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("تم نسخ رابط الـ Webhook");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsapp = async () => {
    if (!phone.trim()) {
      toast.error("أدخل رقم الجوال");
      return;
    }
    if (!messageBody.trim()) {
      toast.error("اكتب نص الرسالة");
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-message", {
        body: {
          to: phone.trim(),
          message: messageBody.trim(),
          template_name: selectedTemplate ?? null,
        },
      });
      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error ?? "فشل الإرسال");
      }
      toast.success(`تم إرسال الرسالة إلى ${data.to}`);
      setPhone("");
      setMessageBody("");
      setSelectedTemplate(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطأ غير متوقع";
      toast.error(`فشل الإرسال: ${msg}`);
    } finally {
      setSending(false);
    }
  };

  const handleSelectTemplate = (t: typeof templates[0]) => {
    setSelectedTemplate(t.id);
    setMessageBody(t.body);
    setShowTemplates(false);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="الرسائل النصية" subtitle="إرسال رسائل واتساب وSMS للعملاء · Twilio" badge="جديد" />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="📨 رسائل مرسلة" value={String(stats?.totalSent ?? 0)} sub="إجمالي" />
        <MetricCard label="✅ نسبة النجاح" value={`${stats?.successRate ?? 0}%`} sub="من الرسائل المرسلة" subColor="success" />
        <MetricCard label="👥 العملاء المستهدفين" value="47" sub="عميل مسجّل بالنظام" />
        <MetricCard label="📖 مقروءة" value={String(stats?.read ?? 0)} sub="عبر واتساب" subColor="success" />
      </div>

      <Tabs defaultValue="send" className="w-full" dir="rtl">
        <TabsList className="mb-4 flex-row-reverse">
          <TabsTrigger value="send" className="text-[12px]">
            <Send size={12} className="ml-1.5" /> إرسال جديد
          </TabsTrigger>
          <TabsTrigger value="conversations" className="text-[12px]">
            <MessagesSquare size={12} className="ml-1.5" /> المحادثات
            {totalUnread > 0 && (
              <span className="mr-1.5 bg-success text-primary-foreground text-[9px] font-bold rounded-full min-w-[16px] h-[16px] inline-flex items-center justify-center px-1">
                {totalUnread}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="mt-0">
          <ConversationsTab />
        </TabsContent>

        <TabsContent value="send" className="mt-0 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {/* إرسال رسالة */}
        <div className="col-span-2 ios-card">
          <div className="text-[11px] font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <Send size={14} /> إرسال رسالة جديدة
          </div>

          {/* اختيار الشريحة */}
          <div className="mb-4">
            <div className="text-[10px] text-muted-foreground mb-2 font-medium">🎯 الشريحة المستهدفة</div>
            <div className="flex flex-wrap gap-2">
              {customerSegments.map((seg, i) => (
                <button
                  key={seg.label}
                  onClick={() => setSelectedSegment(i)}
                  className={`text-[11px] px-3 py-1.5 rounded-full transition-all ${
                    selectedSegment === i
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {seg.emoji} {seg.label} ({seg.count})
                </button>
              ))}
            </div>
          </div>

          {/* اختيار القالب */}
          <div className="mb-4 relative">
            <div className="text-[10px] text-muted-foreground mb-2 font-medium">📋 اختر قالب جاهز</div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full flex items-center justify-between bg-background rounded-xl px-4 py-3 text-[12px] text-foreground border border-border hover:border-primary/30 transition-colors"
            >
              <span>
                {selectedTemplate
                  ? `${templates.find(t => t.id === selectedTemplate)?.emoji} ${templates.find(t => t.id === selectedTemplate)?.name}`
                  : "اختر قالب..."
                }
              </span>
              <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showTemplates ? "rotate-180" : ""}`} />
            </button>
            {showTemplates && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className="w-full text-right px-4 py-3 text-[12px] hover:bg-muted transition-colors flex items-center gap-2 border-b border-border last:border-0"
                  >
                    <span className="text-[16px]">{t.emoji}</span>
                    <div>
                      <div className="font-semibold text-foreground">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{t.body}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* نص الرسالة */}
          <div className="mb-4">
            <div className="text-[10px] text-muted-foreground mb-2 font-medium">✏️ نص الرسالة</div>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="اكتب رسالتك هنا أو اختر قالب جاهز..."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-[12px] text-foreground placeholder:text-muted-foreground resize-none h-28 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
            <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
              <span>المتغيرات: {"{name}"} {"{points}"} {"{product}"} {"{link}"}</span>
              <span>{messageBody.length}/1600</span>
            </div>
          </div>

          {/* رقم الجوال للإرسال الفوري */}
          <div className="mb-4">
            <div className="text-[10px] text-muted-foreground mb-2 font-medium">📱 رقم الجوال (للاختبار)</div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 0501234567"
              dir="ltr"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-right"
            />
          </div>

          {/* أزرار الإرسال */}
          <div className="flex gap-3">
            <button
              onClick={handleSendWhatsapp}
              disabled={!messageBody || !phone || sending}
              className="flex items-center gap-2 bg-success text-primary-foreground px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
              {sending ? "جاري الإرسال..." : "إرسال واتساب"}
            </button>
            <button
              disabled
              title="قريباً"
              className="flex items-center gap-2 bg-muted text-muted-foreground px-5 py-2.5 rounded-xl text-[12px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              إرسال SMS
            </button>
          </div>
        </div>

        {/* قوالب سريعة */}
        <div className="ios-card">
          <div className="text-[11px] font-medium text-muted-foreground mb-4">📋 القوالب الجاهزة</div>
          <div className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`w-full text-right p-3 rounded-xl transition-all border ${
                  selectedTemplate === t.id
                    ? "bg-primary/10 border-primary/30"
                    : "bg-background border-border hover:border-primary/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[16px]">{t.emoji}</span>
                  <span className="text-[12px] font-semibold text-foreground">{t.name}</span>
                </div>
                <div className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{t.body}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* سجل الرسائل */}
      <div className="ios-card">
        <div className="text-[11px] font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Clock size={14} /> آخر الرسائل المرسلة
        </div>
        <div className="space-y-0">
          {(recentDb && recentDb.length > 0) ? (
            recentDb.map((msg, i) => {
              const st = statusMap[msg.status] ?? { label: msg.status, variant: "warning" as const };
              return (
                <div key={msg.id} className={`flex items-center justify-between py-3 text-[13px] ${i < recentDb.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-[18px]">💬</span>
                    <div>
                      <div className="font-semibold text-foreground" dir="ltr">
                        {formatSaudiPhoneDisplay(msg.to_phone) || msg.to_phone}
                      </div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">
                        {msg.body.slice(0, 60)}{msg.body.length > 60 ? "…" : ""} · {new Date(msg.sent_at).toLocaleString("ar-SA")}
                      </div>
                    </div>
                  </div>
                  <StatusBadge variant={st.variant}>{st.label}</StatusBadge>
                </div>
              );
            })
          ) : (
            recentMessages.map((msg, i) => (
              <div key={i} className={`flex items-center justify-between py-3 text-[13px] ${i < recentMessages.length - 1 ? "border-b border-border" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className="text-[18px]">{msg.emoji}</span>
                  <div>
                    <div className="font-semibold text-foreground">{msg.to} <span className="text-[10px] text-muted-foreground font-normal">{msg.phone}</span></div>
                    <div className="text-[10px] text-muted-foreground">{msg.template} · {msg.time}</div>
                  </div>
                </div>
                <StatusBadge variant={statusMap[msg.status].variant}>{statusMap[msg.status].label}</StatusBadge>
              </div>
            ))
          )}
        </div>
      </div>

      {/* إعدادات Webhook */}
      <div className="ios-card border-2 border-dashed border-success/30">
        <div className="flex items-start gap-3">
          <span className="text-[28px]">✅</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-foreground mb-1">WhatsApp Cloud API متصل</div>
            <div className="text-[11px] text-muted-foreground leading-relaxed mb-3">
              لتفعيل تحديثات الحالة (تم التوصيل / تمت القراءة) من Meta، الصق الرابط التالي في
              {" "}<span className="font-semibold">Meta Developer → WhatsApp → Configuration → Webhook</span>{" "}
              مع نفس قيمة <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">WHATSAPP_VERIFY_TOKEN</code>:
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2">
              <code className="text-[11px] text-foreground flex-1 overflow-x-auto whitespace-nowrap" dir="ltr">{webhookUrl}</code>
              <button
                onClick={copyWebhook}
                className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-[11px] font-semibold hover:opacity-90 transition-opacity shrink-0"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "تم" : "نسخ"}
              </button>
            </div>
          </div>
        </div>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Messages;
