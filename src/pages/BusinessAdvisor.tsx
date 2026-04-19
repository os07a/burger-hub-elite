import { useState, useRef, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2, Sparkles, Paperclip, Mic, Square, X, FileText, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/business-advisor`;
const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;

type Attachment = {
  id: string;
  type: "image" | "text";
  name: string;
  dataUrl?: string; // for image
  text?: string;    // for text/pdf extracted
  preview?: string; // small preview text
};

type Msg = { role: "user" | "assistant"; content: string; attachments?: Attachment[] };

const quickQuestions = [
  "هل أنا ماشي صح في المشروع؟",
  "وش أكبر مشكلة عندي حالياً؟",
  "كيف أرفع مبيعات يوم الاثنين؟",
  "هل السيولة خطيرة؟",
  "متى أسترد رأس المال؟",
  "وش نصيحتك لتقليل التكاليف؟",
];

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const fileToBase64 = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      resolve(s.split(",")[1] || "");
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const BusinessAdvisor = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newOnes: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error(`${file.name} أكبر من 8 ميجا`);
        continue;
      }
      const id = crypto.randomUUID();
      if (file.type.startsWith("image/")) {
        const dataUrl = await fileToDataUrl(file);
        newOnes.push({ id, type: "image", name: file.name, dataUrl });
      } else if (file.type === "application/pdf") {
        // Send PDF as image-like data url to Gemini (it accepts PDFs as inline data)
        const dataUrl = await fileToDataUrl(file);
        newOnes.push({ id, type: "image", name: file.name, dataUrl, preview: "PDF" });
      } else if (file.type.startsWith("text/") || /\.(txt|csv|md|json)$/i.test(file.name)) {
        const text = await file.text();
        newOnes.push({ id, type: "text", name: file.name, text: text.slice(0, 50000), preview: text.slice(0, 80) });
      } else {
        toast.error(`نوع الملف غير مدعوم: ${file.name}`);
      }
    }
    setAttachments((p) => [...p, ...newOnes]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeAttachment = (id: string) => setAttachments((p) => p.filter((a) => a.id !== id));

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAndSend(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (e) {
      toast.error("ما قدرت أصل للمايك. تأكد من الصلاحيات.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const transcribeAndSend = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const base64 = await fileToBase64(blob);
      const resp = await fetch(TRANSCRIBE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ audioBase64: base64, mimeType: "audio/webm" }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "فشل تفريغ الصوت");
      const text = (data.text || "").trim();
      if (text) {
        await sendMessage(text);
      } else {
        toast.error("ما قدرت أفهم التسجيل، حاول مرة ثانية.");
      }
    } catch (e: any) {
      toast.error(e.message || "خطأ في التسجيل");
    } finally {
      setTranscribing(false);
    }
  };

  const sendMessage = async (text: string) => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    const userMsg: Msg = {
      role: "user",
      content: text.trim() || "(مرفقات للتحليل)",
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    const sendingAttachments = attachments;
    setAttachments([]);
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(({ role, content }) => ({ role, content })),
          attachments: sendingAttachments.map((a) => ({
            type: a.type,
            name: a.name,
            dataUrl: a.dataUrl,
            text: a.text,
          })),
        }),
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
      <PageHeader title="المستشار الذكي" subtitle="مستشار مدعوم بالذكاء الاصطناعي — قراءة شاملة لكل بيانات المشروع + يقبل صور/PDF/صوت" badge="AI" />

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-[16px] font-bold text-foreground mb-1">مرحباً، أنا مستشارك الذكي 👋</h2>
            <p className="text-[11px] text-gray-light mb-5 max-w-md">
              أعرف كل تفاصيل برجرهم — المبيعات، الموظفين، المخزون، الموردين، الأرباح. ارفق صورة فاتورة، PDF، أو سجّل صوت.
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
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {msg.attachments.map((a) => (
                    <div key={a.id} className="flex items-center gap-1 bg-background/40 rounded-md px-2 py-1 text-[10px]">
                      {a.type === "image" ? <ImageIcon size={10} /> : <FileText size={10} />}
                      <span className="max-w-[120px] truncate">{a.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {msg.role === "assistant" ? (
                <div className="text-[12px] text-foreground leading-relaxed prose prose-sm prose-invert max-w-none
                  prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2
                  prose-strong:text-primary prose-h1:text-[14px] prose-h2:text-[13px] prose-h3:text-[12px]">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-[12px] text-foreground whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>
          </div>
        ))}

        {(isLoading || transcribing) && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-green-400" />
            </div>
            <div className="bg-surface border border-border rounded-xl p-3">
              <Loader2 size={14} className="animate-spin text-gray-light" />
            </div>
          </div>
        )}
        {transcribing && (
          <div className="text-center text-[11px] text-gray-light">⏳ يفرّغ التسجيل...</div>
        )}
      </div>

      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2 border-t border-border pt-2">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center gap-1.5 bg-surface border border-border rounded-md px-2 py-1 text-[11px]">
              {a.type === "image" ? <ImageIcon size={12} className="text-primary" /> : <FileText size={12} className="text-primary" />}
              <span className="max-w-[140px] truncate">{a.name}</span>
              <button onClick={() => removeAttachment(a.id)} className="text-gray-light hover:text-destructive">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-3 flex gap-2 items-center">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,application/pdf,text/*,.csv,.md,.json"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isLoading || recording}
          title="إرفاق صورة أو ملف"
          className="w-9 h-9 rounded-lg bg-surface border border-border hover:bg-sidebar-hover flex items-center justify-center disabled:opacity-50"
        >
          <Paperclip size={15} className="text-gray" />
        </button>
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={isLoading || transcribing}
          title={recording ? "إيقاف التسجيل" : "تسجيل صوتي"}
          className={`w-9 h-9 rounded-lg border flex items-center justify-center disabled:opacity-50 ${
            recording
              ? "bg-destructive/15 border-destructive/40 animate-pulse"
              : "bg-surface border-border hover:bg-sidebar-hover"
          }`}
        >
          {recording ? <Square size={14} className="text-destructive fill-destructive" /> : <Mic size={15} className="text-gray" />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder={recording ? "🔴 جاري التسجيل..." : "اسأل المستشار، أو ارفق ملف..."}
          disabled={isLoading || recording}
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-[12px] text-foreground placeholder:text-gray-light/50 focus:outline-none focus:border-primary/50 disabled:opacity-50"
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={(!input.trim() && attachments.length === 0) || isLoading || recording}
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
