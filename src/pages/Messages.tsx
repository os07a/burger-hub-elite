import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Send,
  MessageSquare,
  Clock,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  RefreshCw,
  FileCheck2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWhatsappMessages, useWhatsappStats } from "@/hooks/useWhatsappMessages";
import { useWhatsappTemplates } from "@/hooks/useWhatsappTemplates";
import { useLoyaltyCustomersForMessaging, type MessagingCustomer } from "@/hooks/useLoyaltyCustomersForMessaging";
import { formatSaudiPhoneDisplay } from "@/lib/phoneNormalize";
import {
  type MetaTemplate,
  extractVariables,
  statusVariant as templateStatusVariant,
  getBodyText,
} from "@/lib/templateUtils";
import TemplateSmartForm from "@/components/messages/TemplateSmartForm";
import TemplatePreviewBubble from "@/components/messages/TemplatePreviewBubble";
import TemplateSuggestionsCard from "@/components/messages/TemplateSuggestionsCard";

const recentMessagesFallback = [
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

const Messages = () => {
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [manualPhone, setManualPhone] = useState("");
  const [parameters, setParameters] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: stats } = useWhatsappStats();
  const { data: recentDb } = useWhatsappMessages(10);
  const { data: customers = [] } = useLoyaltyCustomersForMessaging();
  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
    isFetching: templatesFetching,
  } = useWhatsappTemplates();

  const allTemplates: MetaTemplate[] = templatesData?.templates ?? [];
  const approvedTemplates = useMemo(
    () => allTemplates.filter((t) => t.status === "APPROVED"),
    [allTemplates],
  );

  const selectedTemplate = useMemo(
    () => approvedTemplates.find((t) => t.name === selectedTemplateName) ?? null,
    [approvedTemplates, selectedTemplateName],
  );

  const selectedCustomer: MessagingCustomer | null = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const projectRef = "bjfhrrtajyvvdcsrpwqb";
  const webhookUrl = `https://${projectRef}.supabase.co/functions/v1/whatsapp-webhook`;

  const copyWebhook = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("تم نسخ رابط الـ Webhook");
    setTimeout(() => setCopied(false), 2000);
  };

  const resolvedPhone = selectedCustomer?.phone || manualPhone.trim();
  const requiredVars = selectedTemplate ? extractVariables(selectedTemplate) : [];
  const allVarsFilled =
    requiredVars.length === 0 ||
    requiredVars.every((_, i) => parameters[i] && parameters[i].trim().length > 0);

  const canSend = !!selectedTemplate && !!resolvedPhone && allVarsFilled && !sending;

  const handleSelectTemplate = (name: string) => {
    setSelectedTemplateName(name);
    setParameters([]);
  };

  const handleSend = async () => {
    if (!selectedTemplate || !resolvedPhone) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-whatsapp-message",
        {
          body: {
            kind: "template",
            to: resolvedPhone,
            template_name: selectedTemplate.name,
            language: selectedTemplate.language || "ar",
            parameters: parameters.slice(0, requiredVars.length),
            customer_id: selectedCustomerId || null,
          },
        },
      );
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "فشل الإرسال");
      toast.success(`تم إرسال القالب إلى ${data.to}`);
      setParameters([]);
      setManualPhone("");
      setSelectedCustomerId("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطأ غير متوقع";
      toast.error(`فشل الإرسال: ${msg}`);
    } finally {
      setSending(false);
    }
  };

  const isTokenExpired =
    !!templatesError &&
    /access token|expired|OAuthException/i.test(String((templatesError as Error)?.message ?? ""));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="الرسائل النصية"
        subtitle="إرسال قوالب واتساب معتمدة من Meta · بيانات حقيقية"
        badge="WhatsApp Cloud API"
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="📨 رسائل مرسلة" value={String(stats?.totalSent ?? 0)} sub="إجمالي" />
        <MetricCard label="✅ نسبة النجاح" value={`${stats?.successRate ?? 0}%`} sub="من الرسائل المرسلة" subColor="success" />
        <MetricCard
          label="📋 قوالب معتمدة"
          value={String(templatesData?.approved ?? 0)}
          sub={`من ${templatesData?.total ?? 0} قالب`}
          subColor={(templatesData?.approved ?? 0) > 0 ? "success" : "warning"}
        />
        <MetricCard label="📖 مقروءة" value={String(stats?.read ?? 0)} sub="عبر واتساب" subColor="success" />
      </div>

      {/* تنبيه انتهاء التوكن */}
      {isTokenExpired && (
        <div className="ios-card mb-6 border-2 border-destructive/40 bg-destructive/5">
          <div className="flex items-start gap-3">
            <span className="text-[24px]">⚠️</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-destructive mb-1">
                Access Token الخاص بـ Meta منتهي الصلاحية
              </div>
              <div className="text-[11px] text-foreground/80 leading-relaxed">
                التوكن المؤقت من Meta يخلص كل 24 ساعة. حدّث <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">WHATSAPP_ACCESS_TOKEN</code> أو
                {" "}<strong>أنشئ توكن دائم</strong> عبر System User (الخطوات بالأسفل ⬇️).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* الصف الرئيسي: عمودين كما في الواجهة السابقة */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* العمود الأيسر (col-span-2): نموذج الإرسال */}
        <div className="col-span-2 ios-card">
          <div className="text-[11px] font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <Send size={14} /> إرسال رسالة جديدة
          </div>

          {/* القالب المختار */}
          <div className="mb-4">
            <div className="text-[10px] text-muted-foreground mb-2 font-medium flex items-center gap-1.5">
              <FileCheck2 size={11} /> القالب المعتمد من Meta
            </div>
            {!selectedTemplate ? (
              <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-xl p-3 border border-dashed border-border">
                👈 اختر قالباً من القائمة الجانبية لبدء الإرسال
              </div>
            ) : (
              <div className="bg-background rounded-xl p-3 border border-primary/30">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-[11px] font-bold text-primary" dir="ltr">
                    {selectedTemplate.name}
                  </code>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${templateStatusVariant(selectedTemplate.status).color}`}>
                    {templateStatusVariant(selectedTemplate.status).label}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground line-clamp-2">
                  {getBodyText(selectedTemplate)}
                </div>
              </div>
            )}
          </div>

          {selectedTemplate && (
            <>
              {/* المستلم */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-[10px] text-muted-foreground mb-2 font-medium">👤 العميل</div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  >
                    <option value="">اختر عميل...</option>
                    {customers
                      .filter((c) => c.hasValidPhone)
                      .slice(0, 100)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || "بدون اسم"} — {formatSaudiPhoneDisplay(c.phone)}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-2 font-medium">📱 أو رقم يدوي</div>
                  <input
                    type="tel"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    disabled={!!selectedCustomerId}
                    placeholder="0501234567"
                    dir="ltr"
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-[12px] text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* النموذج الذكي + المعاينة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4 border-t border-border">
                <TemplateSmartForm
                  template={selectedTemplate}
                  customer={selectedCustomer}
                  parameters={parameters}
                  onChange={setParameters}
                />
                <TemplatePreviewBubble
                  template={selectedTemplate}
                  parameters={parameters}
                />
              </div>

              {/* زر الإرسال */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-[10px] text-muted-foreground">
                  {!resolvedPhone
                    ? "⚠️ اختر عميل أو أدخل رقم"
                    : !allVarsFilled
                    ? `⚠️ اكمل تعبئة المتغيرات (${requiredVars.length})`
                    : `✓ جاهز للإرسال إلى ${formatSaudiPhoneDisplay(resolvedPhone) || resolvedPhone}`}
                </div>
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className="flex items-center gap-2 bg-success text-primary-foreground px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                  {sending ? "جاري الإرسال..." : "إرسال القالب"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* العمود الجانبي: قوالب Meta */}
        <div className="ios-card">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-medium text-muted-foreground">📋 قوالب Meta المعتمدة</div>
            <button
              onClick={() => refetchTemplates()}
              disabled={templatesFetching}
              className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={10} className={templatesFetching ? "animate-spin" : ""} />
            </button>
          </div>

          {templatesLoading ? (
            <div className="text-[11px] text-muted-foreground flex items-center gap-2 py-4">
              <Loader2 size={12} className="animate-spin" /> جاري التحميل...
            </div>
          ) : isTokenExpired ? (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-[11px] text-destructive">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>التوكن منتهي. حدّثه عشان نجلب القوالب.</span>
            </div>
          ) : templatesError ? (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-[11px] text-destructive">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>تعذّر جلب القوالب من Meta.</span>
            </div>
          ) : approvedTemplates.length === 0 ? (
            <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg p-3 text-center">
              ما عندك قوالب معتمدة بعد. شوف الاقتراحات الجاهزة بالأسفل ⬇️
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto">
              {approvedTemplates.map((t) => {
                const isSelected = selectedTemplateName === t.name;
                const sv = templateStatusVariant(t.status);
                const body = getBodyText(t);
                return (
                  <button
                    key={`${t.name}-${t.language}`}
                    onClick={() => handleSelectTemplate(t.name)}
                    className={`w-full text-right p-3 rounded-xl transition-all border ${
                      isSelected
                        ? "bg-primary/10 border-primary/30"
                        : "bg-background border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <code className="text-[11px] font-bold text-foreground truncate" dir="ltr">
                        {t.name}
                      </code>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border shrink-0 ${sv.color}`}>
                        {sv.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[8px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {t.category}
                      </span>
                      <span className="text-[8px] text-muted-foreground" dir="ltr">
                        {t.language}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {body}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* قوالب مقترحة جاهزة */}
      {!templatesLoading && approvedTemplates.length === 0 && !isTokenExpired && (
        <div className="mb-6">
          <TemplateSuggestionsCard />
        </div>
      )}

      {/* دليل System User Token الدائم */}
      {isTokenExpired && (
        <div className="ios-card mb-6 border-2 border-dashed border-primary/30">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-[24px]">🔐</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-foreground mb-1">
                خطوات الحصول على Access Token دائم (System User)
              </div>
              <div className="text-[11px] text-muted-foreground">
                التوكن الدائم لا ينتهي بعد 24 ساعة، ويُستخدم للإنتاج.
              </div>
            </div>
          </div>

          <ol className="space-y-2.5 text-[11px] text-foreground/80 leading-relaxed list-none pr-0">
            {[
              {
                t: "افتح Meta Business Settings",
                d: "روح على business.facebook.com → اختر حسابك التجاري → ⚙️ Settings.",
              },
              {
                t: "أنشئ System User",
                d: "Users → System Users → Add → اكتب اسم (مثل: burgerhum_api) → اختر Role: Admin → Create.",
              },
              {
                t: "أضف Assets للـ System User",
                d: "اختار الـ User اللي أنشأته → Add Assets → WhatsApp Accounts → اختر حساب WhatsApp التجاري → فعّل Full Control.",
              },
              {
                t: "أنشئ التوكن",
                d: "نفس الصفحة → Generate New Token → اختر التطبيق (App) → الصلاحيات: whatsapp_business_messaging + whatsapp_business_management → Token Expiration: Never → Generate Token.",
              },
              {
                t: "انسخ التوكن وحدّثه هنا",
                d: "انسخ الـ Token بسرعة (يظهر مرة وحدة فقط!) → ارجع هنا واضغط زر تحديث WHATSAPP_ACCESS_TOKEN.",
              },
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-bold">
                  {i + 1}
                </span>
                <div>
                  <div className="font-semibold text-foreground">{step.t}</div>
                  <div className="text-muted-foreground">{step.d}</div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-3 p-2.5 rounded-lg bg-warning/10 border border-warning/20 text-[10px] text-foreground/80">
            💡 <strong>ملاحظة:</strong> System User token صلاحياته مرتبطة بحسابك التجاري في Meta. لو حذفت الـ User أو غيّرت Role، التوكن يبطل.
          </div>
        </div>
      )}

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
            recentMessagesFallback.map((msg, i) => (
              <div key={i} className={`flex items-center justify-between py-3 text-[13px] ${i < recentMessagesFallback.length - 1 ? "border-b border-border" : ""}`}>
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
      <div className="ios-card mt-6 border-2 border-dashed border-success/30">
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
    </div>
  );
};

export default Messages;
