import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare, Clock, Send, AlertCircle, Inbox, Loader2,
  Sparkles, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { useLoyaltyCustomersForMessaging } from "@/hooks/useLoyaltyCustomersForMessaging";
import { useWhatsappMessages, useWhatsappStats } from "@/hooks/useWhatsappMessages";
import { MESSAGE_TEMPLATES, renderTemplate } from "@/lib/messageTemplates";
import { formatSaudiPhoneDisplay } from "@/lib/phoneNormalize";

import RecipientsList from "@/components/messages/RecipientsList";
import MessagePreview from "@/components/messages/MessagePreview";
import SendProgress, { type SendResult } from "@/components/messages/SendProgress";
import EmptyCustomersState from "@/components/messages/EmptyCustomersState";

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
  delivered: { label: "تم التوصيل", variant: "success" },
  read: { label: "مقروءة", variant: "info" },
  sent: { label: "أُرسلت", variant: "warning" },
  failed: { label: "فشلت", variant: "danger" },
  error: { label: "خطأ", variant: "danger" },
};

const Messages = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [progressOpen, setProgressOpen] = useState(false);
  const [results, setResults] = useState<SendResult[]>([]);
  const [sending, setSending] = useState(false);

  const { data: customers = [], isLoading: loadingCustomers, refetch: refetchCustomers } =
    useLoyaltyCustomersForMessaging();
  const { data: messages = [], isLoading: loadingMessages } = useWhatsappMessages(20);
  const { data: stats } = useWhatsappStats();

  const selectedCustomers = useMemo(
    () => customers.filter((c) => selectedIds.has(c.id)),
    [customers, selectedIds],
  );

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (ids: string[]) => setSelectedIds(new Set(ids));
  const handleClearAll = () => setSelectedIds(new Set());

  const handlePickTemplate = (id: string) => {
    const t = MESSAGE_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setSelectedTemplateId(id);
    setMessageBody(t.body);
  };

  const handleSend = async () => {
    if (!messageBody.trim()) {
      toast.error("اكتب نص الرسالة أولاً");
      return;
    }
    if (selectedCustomers.length === 0) {
      toast.error("اختر عميلاً واحداً على الأقل");
      return;
    }

    setSending(true);
    setResults([]);
    setProgressOpen(true);

    const tplName = selectedTemplateId
      ? MESSAGE_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name ?? null
      : null;

    for (const c of selectedCustomers) {
      const personalized = renderTemplate(messageBody, {
        name: c.name,
        points: c.total_points,
        visits: c.total_visits,
      });

      try {
        const { data, error } = await supabase.functions.invoke("send-whatsapp-message", {
          body: {
            to: c.phone,
            message: personalized,
            template_name: tplName,
            customer_id: c.id,
          },
        });

        if (error) throw error;

        if (data?.success) {
          setResults((prev) => [...prev, {
            customerId: c.id,
            customerName: c.name || "بدون اسم",
            phone: formatSaudiPhoneDisplay(c.phone),
            success: true,
          }]);
        } else {
          setResults((prev) => [...prev, {
            customerId: c.id,
            customerName: c.name || "بدون اسم",
            phone: formatSaudiPhoneDisplay(c.phone),
            success: false,
            error: data?.error ?? "فشل غير معروف",
          }]);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setResults((prev) => [...prev, {
          customerId: c.id,
          customerName: c.name || "بدون اسم",
          phone: formatSaudiPhoneDisplay(c.phone),
          success: false,
          error: msg,
        }]);
      }

      // brief pause to avoid rate-limit hits
      await new Promise((r) => setTimeout(r, 300));
    }

    setSending(false);
    toast.success("اكتمل الإرسال", {
      description: `${selectedCustomers.length} رسالة. شاهد التفاصيل في النافذة.`,
    });
  };

  const validCustomersCount = customers.filter((c) => c.hasValidPhone).length;
  const isEmpty = !loadingCustomers && customers.length === 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="الرسائل"
        subtitle="إرسال رسائل واتساب للعملاء عبر Meta Cloud API · بيانات حقيقية من بونات"
        badge="حقيقي"
      />

      {/* KPIs — بيانات فعلية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="📨 رسائل مرسلة"
          value={String(stats?.totalSent ?? 0)}
          sub={`اليوم: ${stats?.todaySent ?? 0} · الأسبوع: ${stats?.weekSent ?? 0}`}
        />
        <MetricCard
          label="✅ نسبة النجاح"
          value={`${stats?.successRate ?? 0}%`}
          sub={`فشل: ${stats?.failed ?? 0}`}
          subColor={(stats?.successRate ?? 0) >= 90 ? "success" : "warning"}
        />
        <MetricCard
          label="👥 عملاء مع جوال"
          value={String(validCustomersCount)}
          sub={`من إجمالي ${customers.length}`}
        />
        <MetricCard
          label="📖 وصلت/قُرئت"
          value={`${stats?.delivered ?? 0}/${stats?.read ?? 0}`}
          sub="تتبع فعلي عبر Webhook"
          subColor="success"
        />
      </div>

      {isEmpty ? (
        <EmptyCustomersState onSynced={() => refetchCustomers()} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Composer + Recipients */}
          <div className="lg:col-span-2 ios-card space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-2">
                <Send size={14} /> إرسال رسالة جديدة
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchCustomers()}
                className="h-7 text-xs gap-1.5"
              >
                <RefreshCw size={12} />
                تحديث العملاء
              </Button>
            </div>

            {/* Templates row */}
            <div>
              <div className="text-[10px] text-muted-foreground mb-2 font-medium">
                📋 القوالب الجاهزة
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MESSAGE_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handlePickTemplate(t.id)}
                    className={`text-[11px] px-3 py-1.5 rounded-full transition-all border ${
                      selectedTemplateId === t.id
                        ? "bg-primary text-primary-foreground border-primary font-semibold"
                        : "bg-background text-muted-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    {t.emoji} {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Body editor */}
            <div>
              <div className="text-[10px] text-muted-foreground mb-2 font-medium flex items-center justify-between">
                <span>✏️ نص الرسالة</span>
                <span className="text-[10px]">{messageBody.length}/1600</span>
              </div>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="اكتب رسالتك أو اختر قالب جاهز..."
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground resize-none h-28 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              <div className="mt-1.5 text-[10px] text-muted-foreground">
                المتغيرات المدعومة: <code>{"{name}"}</code> <code>{"{points}"}</code> <code>{"{visits}"}</code>
              </div>
            </div>

            {/* Live preview */}
            <MessagePreview body={messageBody} selectedCustomers={selectedCustomers} />

            {/* Send actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
              <Button
                onClick={handleSend}
                disabled={!messageBody.trim() || selectedIds.size === 0 || sending}
                className="gap-2 bg-[#25D366] hover:bg-[#1da851] text-white"
              >
                {sending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <MessageSquare size={14} />
                )}
                إرسال واتساب ({selectedIds.size})
              </Button>
              <Button disabled variant="outline" className="gap-2 opacity-60">
                <Send size={14} />
                SMS
                <Badge variant="secondary" className="text-[9px] ml-1">قريباً</Badge>
              </Button>
              <Button disabled variant="ghost" className="gap-2 opacity-60">
                <Clock size={14} />
                جدولة
                <Badge variant="secondary" className="text-[9px] ml-1">قريباً</Badge>
              </Button>
            </div>
          </div>

          {/* Recipients sidebar */}
          <div className="ios-card">
            <div className="text-[11px] font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Inbox size={14} /> اختر المستلمين
            </div>
            {loadingCustomers ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="animate-spin h-5 w-5" />
              </div>
            ) : (
              <RecipientsList
                customers={customers}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
              />
            )}
          </div>
        </div>
      )}

      {/* Recent messages */}
      <div className="ios-card">
        <div className="text-[11px] font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Clock size={14} /> آخر الرسائل المرسلة
          {messages.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{messages.length}</Badge>
          )}
        </div>

        {loadingMessages ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="animate-spin h-5 w-5" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            لا توجد رسائل بعد. ابدأ بإرسال أول رسالة 📨
          </div>
        ) : (
          <div className="space-y-0">
            {messages.map((m, i) => {
              const status = statusMap[m.status] ?? statusMap.sent;
              const time = new Date(m.sent_at).toLocaleString("ar-SA", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              });
              return (
                <div
                  key={m.id}
                  className={`flex items-start justify-between gap-3 py-3 text-[13px] ${
                    i < messages.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-[18px]">💬</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span dir="ltr">{formatSaudiPhoneDisplay(m.to_phone)}</span>
                        {m.template_name && (
                          <Badge variant="outline" className="text-[9px] px-1.5">
                            {m.template_name}
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {m.body}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{time}</span>
                        {m.error && (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertCircle size={10} /> {m.error}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <StatusBadge variant={status.variant}>{status.label}</StatusBadge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Setup hint */}
      <div className="ios-card mt-6 border-2 border-dashed border-primary/30 bg-primary/5">
        <div className="flex items-start gap-3">
          <Sparkles className="h-7 w-7 text-primary flex-shrink-0" />
          <div className="space-y-1">
            <div className="text-[13px] font-bold text-foreground">
              الإرسال يعمل عبر Meta WhatsApp Cloud API الرسمي
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              تأكد من إضافة الـ 5 secrets الخاصة بـ Meta + ربط Webhook بالرابط:
              <code className="bg-background px-2 py-0.5 rounded text-[10px] mx-1" dir="ltr">
                /functions/v1/whatsapp-webhook
              </code>
              ليتم تتبع التوصيل والقراءة تلقائياً. للأرقام التجريبية فقط في وضع Test number.
            </div>
          </div>
        </div>
      </div>

      {/* Send progress modal */}
      <SendProgress
        open={progressOpen}
        onClose={() => setProgressOpen(false)}
        total={selectedCustomers.length}
        results={results}
        isDone={!sending}
      />
    </div>
  );
};

export default Messages;