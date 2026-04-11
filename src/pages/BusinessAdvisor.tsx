import { useState, useRef, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/business-advisor`;

type Msg = { role: "user" | "assistant"; content: string };

const quickQuestions = [
  "هل أنا ماشي صح في المشروع؟",
  "وش أكبر مشكلة عندي حالياً؟",
  "كيف أرفع مبيعات يوم الاثنين؟",
  "هل السيولة خطيرة؟",
  "متى أسترد رأس المال؟",
  "وش نصيحتك لتقليل التكاليف؟",
];

const BusinessAdvisor = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "خطأ غير معروف" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${e.message || "حصل خطأ، جرب مرة ثانية."}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <PageHeader title="المستشار الذكي" subtitle="مستشار ريادة أعمال مدعوم بالذكاء الاصطناعي — يعرف كل بيانات مشروعك" badge="AI" />

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-[16px] font-bold text-foreground mb-1">مرحباً، أنا مستشارك الذكي 👋</h2>
            <p className="text-[11px] text-gray-light mb-5 max-w-md">
              أعرف كل تفاصيل مشروع برجرهم — المبيعات، المصروفات، نقاط القوة والضعف. اسألني أي سؤال وبساعدك.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-right p-3 bg-surface border border-border rounded-lg text-[11px] text-gray hover:bg-sidebar-hover hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              msg.role === "user" ? "bg-primary/20" : "bg-green-500/15"
            }`}>
              {msg.role === "user" ? <User size={14} className="text-primary" /> : <Bot size={14} className="text-green-400" />}
            </div>
            <div className={`max-w-[80%] rounded-xl p-3 ${
              msg.role === "user"
                ? "bg-primary/10 border border-primary/20"
                : "bg-surface border border-border"
            }`}>
              {msg.role === "assistant" ? (
                <div className="text-[12px] text-foreground leading-relaxed prose prose-sm prose-invert max-w-none
                  prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2
                  prose-strong:text-primary prose-h1:text-[14px] prose-h2:text-[13px] prose-h3:text-[12px]">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-[12px] text-foreground">{msg.content}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-green-400" />
            </div>
            <div className="bg-surface border border-border rounded-xl p-3">
              <Loader2 size={14} className="animate-spin text-gray-light" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="اسأل المستشار عن مشروعك..."
          disabled={isLoading}
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-[12px] text-foreground placeholder:text-gray-light/50 focus:outline-none focus:border-primary/50 disabled:opacity-50"
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          size="sm"
          className="px-3"
        >
          <Send size={14} />
        </Button>
      </div>
    </div>
  );
};

export default BusinessAdvisor;
