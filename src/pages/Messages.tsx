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
  FileCheck2,
  Zap,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [tab, setTab] = useState<"template" | "freeform">("template");

  // Template tab state
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [manualPhone, setManualPhone] = useState("");
  const [parameters, setParameters] = useState<string[]>([]);
  const [sendingTemplate, setSendingTemplate] = useState(false);

  // Freeform tab state
  const [freePhone, setFreePhone] = useState("");
  const [freeBody, setFreeBody] = useState("");
  const [sendingFree, setSendingFree] = useState(false);

  // Webhook copy
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

  // Resolve recipient phone (customer takes priority over manual)
  const resolvedPhone = selectedCustomer?.phone || manualPhone.trim();

  // Validation: all variables filled
  const requiredVars = selectedTemplate ? extractVariables(selectedTemplate) : [];
  const allVarsFilled =
    requiredVars.length === 0 ||
    requiredVars.every((_, i) => parameters[i] && parameters[i].trim().length > 0);

  const canSendTemplate =
    !!selectedTemplate && !!resolvedPhone && allVarsFilled && !sendingTemplate;

  const handleSendTemplate = async () => {
    if (!selectedTemplate || !resolvedPhone) return;
    setSendingTemplate(true);
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
      setSendingTemplate(false);
    }
  };

  const handleSendFree = async () => {
    if (!freePhone.trim() || !freeBody.trim()) {
      toast.error("أدخل الرقم ونص الرسالة");
      return;
    }
    setSendingFree(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-whatsapp-message",
        {
          body: {
            kind: "text",
            to: freePhone.trim(),
            message: freeBody.trim(),
          },
        },
      );
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "فشل الإرسال");
      toast.success(`تم الإرسال إلى ${data.to}`);
      setFreePhone("");
      setFreeBody("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطأ غير متوقع";
      toast.error(`فشل الإرسال: ${msg}`);
    } finally {
      setSendingFree(false);
    }
  };

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

      {/* بطاقة إنشاء رسالة بالتبويبات */}
      <div className="ios-card mb-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "template" | "freeform")}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-2">
              <Send size={14} /> إنشاء رسالة جديدة
            </div>
            <TabsList className="h-9">
              <TabsTrigger value="template" className="text-[11px] gap-1.5">
                <FileCheck2 size={12} /> قالب معتمد
              </TabsTrigger>
              <TabsTrigger value="freeform" className="text-[11px] gap-1.5">
                <Zap size={12} /> رد سريع (24h)
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ============== TEMPLATE TAB ============== */}
          <TabsContent value="template" className="mt-0 space-y-4">
            {/* اختيار القالب */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] text-muted-foreground font-medium">
                  📋 اختر قالب من Meta
                </div>
                <button
                  onClick={() => refetchTemplates()}
                  disabled={templatesFetching}
                  className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <RefreshCw size={10} className={templatesFetching ? "animate-spin" : ""} />
                  تحديث
                </button>
              </div>

              {templatesLoading ? (
                <div className="text-[11px] text-muted-foreground flex items-center gap-2 py-4">
                  <Loader2 size={12} className="animate-spin" /> جاري جلب القوالب من Meta...
                </div>
              ) : templatesError ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-[11px] text-destructive">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>تعذّر جلب القوالب. تحقق من <code>WHATSAPP_BUSINESS_ACCOUNT_ID</code> و<code>WHATSAPP_ACCESS_TOKEN</code>.</span>
                </div>
              ) : approvedTemplates.length === 0 ? (
                <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg p-3">
                  ما عندك قوالب معتمدة. شوف الاقتراحات الـ 5 الجاهزة بالأسفل ⬇️
                </div>
              ) : (
                <Select value={selectedTemplateName} onValueChange={setSelectedTemplateName}>
                  <SelectTrigger className="h-11 text-[12px]">
                    <SelectValue placeholder="اختر قالب..." />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedTemplates.map((t) => {
                      const sv = templateStatusVariant(t.status);
                      return (
                        <SelectItem key={`${t.name}-${t.language}`} value={t.name}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px]" dir="ltr">{t.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${sv.color}`}>
                              {sv.label}
                            </span>
                            <span className="text-[9px] text-muted-foreground">{t.category}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedTemplate && (
              <>
                {/* اختيار المستلم */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-2 font-medium">
                      👤 العميل (من قاعدة الولاء)
                    </div>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger className="h-10 text-[12px]">
                        <SelectValue placeholder="اختر عميل..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers
                          .filter((c) => c.hasValidPhone)
                          .slice(0, 100)
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex items-center gap-2">
                                <span>{c.name || "بدون اسم"}</span>
                                <span className="text-[9px] text-muted-foreground" dir="ltr">
                                  {formatSaudiPhoneDisplay(c.phone)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-2 font-medium">
                      📱 أو رقم يدوي
                    </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
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
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-[10px] text-muted-foreground">
                    {!resolvedPhone
                      ? "⚠️ اختر عميل أو أدخل رقم"
                      : !allVarsFilled
                      ? `⚠️ اكمل تعبئة المتغيرات (${requiredVars.length})`
                      : `✓ جاهز للإرسال إلى ${formatSaudiPhoneDisplay(resolvedPhone) || resolvedPhone}`}
                  </div>
                  <button
                    onClick={handleSendTemplate}
                    disabled={!canSendTemplate}
                    className="flex items-center gap-2 bg-success text-primary-foreground px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sendingTemplate ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                    {sendingTemplate ? "جاري الإرسال..." : "إرسال القالب"}
                  </button>
                </div>
              </>
            )}
          </TabsContent>

          {/* ============== FREEFORM TAB ============== */}
          <TabsContent value="freeform" className="mt-0 space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20 text-[11px] text-foreground/80">
              <AlertTriangle size={14} className="text-warning mt-0.5 shrink-0" />
              <span>
                <strong>قاعدة الـ 24 ساعة:</strong> النص الحر يعمل فقط إذا راسلك العميل خلال آخر 24 ساعة. خارج هذه الفترة استخدم تبويب "قالب معتمد".
              </span>
            </div>

            <div>
              <div className="text-[10px] text-muted-foreground mb-2 font-medium">📱 رقم الجوال</div>
              <input
                type="tel"
                value={freePhone}
                onChange={(e) => setFreePhone(e.target.value)}
                placeholder="0501234567"
                dir="ltr"
                className="w-full h-10 bg-background border border-border rounded-lg px-3 text-[12px] text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>

            <div>
              <div className="text-[10px] text-muted-foreground mb-2 font-medium">✏️ نص الرسالة</div>
              <textarea
                value={freeBody}
                onChange={(e) => setFreeBody(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-[12px] text-foreground placeholder:text-muted-foreground resize-none h-28 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              <div className="text-[10px] text-muted-foreground text-left mt-1">
                {freeBody.length}/4096
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSendFree}
                disabled={!freePhone || !freeBody || sendingFree}
                className="flex items-center gap-2 bg-success text-primary-foreground px-5 py-2.5 rounded-xl text-[12px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sendingFree ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                {sendingFree ? "جاري الإرسال..." : "إرسال نص حر"}
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* قوالب مقترحة (تظهر فقط لو ما فيه قوالب معتمدة) */}
      {!templatesLoading && approvedTemplates.length === 0 && (
        <div className="mb-6">
          <TemplateSuggestionsCard />
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
