import { useEffect, useRef, useState } from "react";
import { Bot, X, Sparkles, Send, Loader2, AlertTriangle, Info, MessageCircle, ListChecks } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/business-advisor`;

// Initial alerts shown when opening — clickable to drop into chat as a question
const ALERTS = [
  { id: 1, text: "المخزون: خبز البرجر وصل للحد الأدنى — اطلب اليوم", urgent: true, ask: "خبز البرجر وصل للحد الأدنى — كم اطلب؟ ومن أي مورد؟" },
  { id: 2, text: "مبيعات الاثنين أقل 10% من المتوسط — جرّب عرض خاص", urgent: false, ask: "ليش مبيعات الاثنين أقل من باقي الأيام؟ ووش العرض المناسب؟" },
  { id: 3, text: "أبريل أعلى 22% من المتوسط العام — استمر!", urgent: false, ask: "ليش أبريل كان أعلى 22%؟ كيف نكرر النجاح؟" },
  { id: 4, text: "زيت الرائد حرج — تواصل مع السلال المنتجة", urgent: true, ask: "زيت الرائد حرج — وش الكمية المطلوبة وكم سعرها الحالي؟" },
  { id: 5, text: "نسبة العمالة 49.8% — مرتفعة، راجع الجدول", urgent: true, ask: "نسبة العمالة 49.8% مرتفعة — كيف أنزّلها بدون ما يأثر على الخدمة؟" },
];

type Msg = { role: "user" | "assistant"; content: string };
type View = "alerts" | "chat";

const FloatingAdvisor = () => {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [view, setView] = useState<View>("alerts");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const urgentCount = ALERTS.filter((a) => a.urgent).length;

  useEffect(() => {
    if (view === "chat") {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, view]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setView("chat");
    const userMsg: Msg = { role: "user", content: trimmed };
    const all = [...messages, userMsg];
    setMessages(all);
    setInput("");
    setLoading(true);
    let so_far = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: all.map(({ role, content }) => ({ role, content })) }),
      });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "تعذّر الاتصال بالمستشار");
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") break;
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              so_far += c;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: so_far } : m));
                }
                return [...prev, { role: "assistant", content: so_far }];
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e: any) {
      toast.error(e.message || "خطأ في الاتصال");
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${e.message || "حصل خطأ، جرّب مرة ثانية."}` }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    setOpen((o) => !o);
    setSeen(true);
    if (!open) setView(messages.length > 0 ? "chat" : "alerts");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleOpen}
        aria-label="المستشار الذكي"
        className="fixed bottom-5 left-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-110"
      >
        {open ? (
          <X size={20} className="text-primary-foreground" />
        ) : (
          <>
            <Bot size={22} className="text-primary-foreground" />
            {!seen && urgentCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {urgentCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          dir="rtl"
          className="fixed bottom-20 left-5 z-50 flex h-[560px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary/5 px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[12px] font-bold text-foreground">المستشار الذكي</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-muted p-0.5">
              <button
                onClick={() => setView("alerts")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors",
                  view === "alerts" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                <ListChecks size={11} />
                التنبيهات ({ALERTS.length})
              </button>
              <button
                onClick={() => setView("chat")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors",
                  view === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                <MessageCircle size={11} />
                المحادثة
              </button>
            </div>
          </div>

          {/* Body */}
          {view === "alerts" ? (
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              <p className="mb-1 text-[10px] text-muted-foreground">
                تنبيهات اليوم — اضغط على أي تنبيه للسؤال عنه:
              </p>
              {ALERTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => sendMessage(a.ask)}
                  className={cn(
                    "block w-full rounded-xl border p-2.5 text-right text-[11px] leading-relaxed transition-colors",
                    a.urgent
                      ? "border-destructive/30 bg-destructive/10 text-foreground hover:bg-destructive/15"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/60",
                  )}
                >
                  <span className="flex items-start gap-1.5">
                    {a.urgent ? (
                      <AlertTriangle size={12} className="mt-0.5 shrink-0 text-destructive" />
                    ) : (
                      <Info size={12} className="mt-0.5 shrink-0 text-primary" />
                    )}
                    <span>{a.text}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-3">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">اسألني عن المبيعات، المخزون، الموظفين أو الأرباح.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}>
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                      m.role === "user" ? "bg-primary/20" : "bg-success/15",
                    )}
                  >
                    {m.role === "user" ? <span className="text-[10px]">أنت</span> : <Bot size={12} className="text-success" />}
                  </div>
                  <div
                    className={cn(
                      "max-w-[82%] rounded-xl border px-2.5 py-1.5 text-[11px] leading-relaxed",
                      m.role === "user"
                        ? "border-primary/20 bg-primary/10 text-foreground"
                        : "border-border bg-background text-foreground",
                    )}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-primary">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-success/15">
                    <Bot size={12} className="text-success" />
                  </div>
                  <div className="rounded-xl border border-border bg-background px-2.5 py-1.5">
                    <Loader2 size={12} className="animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-1.5 border-t border-border p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="اكتب سؤالك..."
              disabled={loading}
              className="flex-1 rounded-lg border border-border bg-background px-2.5 py-2 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAdvisor;
