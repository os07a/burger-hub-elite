import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Phone, Info, AlertCircle } from "lucide-react";
import { useWhatsappConversation } from "@/hooks/useWhatsappConversation";
import { WhatsappContact } from "@/hooks/useWhatsappContacts";
import { formatSaudiPhoneDisplay } from "@/lib/phoneNormalize";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  contact: WhatsappContact;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

function statusTicks(status: string): string {
  if (status === "read") return "✓✓";
  if (status === "delivered") return "✓✓";
  if (status === "sent") return "✓";
  if (status === "failed") return "!";
  return "·";
}

export default function ChatWindow({ contact }: Props) {
  const { data: messages = [], isLoading, markRead } = useWhatsappConversation(contact.phone);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark as read when opening
  useEffect(() => {
    if (contact.unreadCount > 0) markRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact.phone]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const send = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-reply", {
        body: { to: contact.phone, message: input.trim() },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "فشل الإرسال");
      setInput("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطأ غير متوقع";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-[16px]">
          💬
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-foreground truncate">
            {contact.name || formatSaudiPhoneDisplay(contact.phone)}
          </div>
          <div className="text-[10px] text-muted-foreground" dir="ltr">
            {formatSaudiPhoneDisplay(contact.phone)}
          </div>
        </div>
        <a
          href={`https://wa.me/${contact.phone}`}
          target="_blank"
          rel="noreferrer"
          title="فتح في واتساب"
          className="text-muted-foreground hover:text-success p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Phone size={16} />
        </a>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-[12px]">
            <Loader2 size={16} className="animate-spin ml-2" /> جاري التحميل…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
            <Info size={28} className="mb-2 opacity-40" />
            <div className="text-[12px]">لا توجد رسائل بعد مع هذا العميل</div>
          </div>
        ) : (
          messages.map((m) => {
            const outbound = m.direction === "outbound";
            return (
              <div
                key={m.id}
                className={`flex ${outbound ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed shadow-sm ${
                    outbound
                      ? "bg-primary text-primary-foreground rounded-bl-sm"
                      : "bg-card text-foreground border border-border rounded-br-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div
                    className={`flex items-center gap-1 justify-end mt-1 text-[9px] ${
                      outbound ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    <span>{fmtTime(m.sent_at)}</span>
                    {outbound && (
                      <span className={m.status === "read" ? "text-info" : ""}>
                        {statusTicks(m.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="p-3 border-t border-border bg-card">
        {!contact.withinWindow && (
          <div className="mb-2 flex items-center gap-2 text-[10px] text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
            <AlertCircle size={12} />
            <span>
              خارج نافذة 24 ساعة. لا يمكن إرسال رسالة نصية حرة. يحتاج العميل أن يبدأ المحادثة، أو استخدم قالباً معتمداً من تبويب الإرسال.
            </span>
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && contact.withinWindow) {
                e.preventDefault();
                send();
              }
            }}
            disabled={!contact.withinWindow || sending}
            placeholder={contact.withinWindow ? "اكتب رداً…" : "الرد متاح فقط ضمن 24 ساعة"}
            rows={1}
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-[12px] resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={!input.trim() || !contact.withinWindow || sending}
            className="bg-success text-primary-foreground p-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
