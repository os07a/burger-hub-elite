import { useState } from "react";
import { Copy, Check, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { SUGGESTED_TEMPLATES, type SuggestedTemplate } from "@/lib/templateUtils";

const META_TEMPLATES_URL =
  "https://business.facebook.com/wa/manage/message-templates/";

const TemplateSuggestionsCard = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("تم النسخ");
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="ios-card border-2 border-dashed border-warning/40 bg-warning/5">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-[28px]">📋</span>
        <div className="flex-1">
          <div className="text-[13px] font-bold text-foreground mb-1">
            ما عندك قوالب معتمدة؟ ابدأ بهذي الـ 5 الجاهزة
          </div>
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            انسخ النص والاسم، روح{" "}
            <a
              href={META_TEMPLATES_URL}
              target="_blank"
              rel="noreferrer"
              className="text-primary font-semibold inline-flex items-center gap-0.5 hover:underline"
            >
              WhatsApp Manager <ExternalLink size={10} />
            </a>
            ، اضغط <span className="font-semibold">Create Template</span>،
            اختر اللغة <code className="bg-muted px-1 rounded">العربية</code>،
            والصق النص في خانة Body. الموافقة من Meta تأخذ عادة 1-24 ساعة.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SUGGESTED_TEMPLATES.map((tpl) => (
          <SuggestionItem
            key={tpl.name}
            tpl={tpl}
            copiedKey={copied}
            onCopy={copy}
          />
        ))}
      </div>
    </div>
  );
};

const SuggestionItem = ({
  tpl,
  copiedKey,
  onCopy,
}: {
  tpl: SuggestedTemplate;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}) => {
  const nameKey = `name-${tpl.name}`;
  const bodyKey = `body-${tpl.name}`;

  return (
    <div className="bg-background border border-border rounded-xl p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[18px]">{tpl.emoji}</span>
          <div className="min-w-0">
            <div className="text-[12px] font-bold text-foreground truncate">
              {tpl.description}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <code className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground" dir="ltr">
                {tpl.name}
              </code>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                  tpl.category === "MARKETING"
                    ? "bg-primary/10 text-primary"
                    : "bg-success/10 text-success"
                }`}
              >
                {tpl.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-2 text-[11px] text-foreground/80 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
        {tpl.bodyText}
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={() => onCopy(tpl.name, nameKey)}
          className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1.5 px-2 rounded-lg bg-muted hover:bg-muted/70 text-foreground transition-colors"
        >
          {copiedKey === nameKey ? <Check size={11} /> : <Copy size={11} />}
          نسخ الاسم
        </button>
        <button
          onClick={() => onCopy(tpl.bodyText, bodyKey)}
          className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1.5 px-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold"
        >
          {copiedKey === bodyKey ? <Check size={11} /> : <FileText size={11} />}
          نسخ النص
        </button>
      </div>
    </div>
  );
};

export default TemplateSuggestionsCard;