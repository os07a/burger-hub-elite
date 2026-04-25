import { Eye, AlertTriangle } from "lucide-react";
import { renderTemplate, extractPlaceholders } from "@/lib/messageTemplates";
import type { MessagingCustomer } from "@/hooks/useLoyaltyCustomersForMessaging";

interface Props {
  body: string;
  selectedCustomers: MessagingCustomer[];
}

const KNOWN_VARS = ["{name}", "{points}", "{visits}"];

const MessagePreview = ({ body, selectedCustomers }: Props) => {
  const placeholders = extractPlaceholders(body);
  const unknown = placeholders.filter((p) => !KNOWN_VARS.includes(p));
  const sample = selectedCustomers.slice(0, 3);

  if (!body.trim()) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        ✏️ اكتب نص الرسالة لرؤية المعاينة
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Eye className="h-3.5 w-3.5" />
        معاينة حية ({sample.length > 0 ? `أول ${sample.length}` : "نموذج"})
      </div>

      {unknown.length > 0 && (
        <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>
            متغيرات غير معروفة: <strong>{unknown.join(", ")}</strong>
            <br />
            المتغيرات المدعومة: <code>{KNOWN_VARS.join(", ")}</code>
          </span>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sample.length === 0 ? (
          <PreviewBubble
            name="عميلنا"
            text={renderTemplate(body, { name: "أحمد", points: 120, visits: 8 })}
            note="عميل افتراضي"
          />
        ) : (
          sample.map((c) => (
            <PreviewBubble
              key={c.id}
              name={c.name || "بدون اسم"}
              text={renderTemplate(body, {
                name: c.name,
                points: c.total_points,
                visits: c.total_visits,
              })}
            />
          ))
        )}
      </div>

      {selectedCustomers.length > 3 && (
        <div className="text-[11px] text-muted-foreground text-center">
          + {selectedCustomers.length - 3} عميل آخر سيستلم نسخة مخصصة
        </div>
      )}
    </div>
  );
};

const PreviewBubble = ({ name, text, note }: { name: string; text: string; note?: string }) => (
  <div className="rounded-lg bg-[#dcf8c6] dark:bg-[#005c4b] border border-[#c5e8b3] dark:border-[#004d3e] p-3 shadow-sm">
    <div className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
      → {name} {note && <span className="opacity-60">({note})</span>}
    </div>
    <div className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">{text}</div>
  </div>
);

export default MessagePreview;