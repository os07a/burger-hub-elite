import { useEffect, useMemo } from "react";
import { Sparkles } from "lucide-react";
import {
  type MetaTemplate,
  type TemplateVariable,
  extractVariables,
  getHintLabel,
  getSuggestionsForHint,
} from "@/lib/templateUtils";
import type { MessagingCustomer } from "@/hooks/useLoyaltyCustomersForMessaging";

interface Props {
  template: MetaTemplate;
  customer: MessagingCustomer | null;
  parameters: string[];
  onChange: (next: string[]) => void;
}

function autoFillFromCustomer(
  variable: TemplateVariable,
  customer: MessagingCustomer | null,
): string {
  if (!customer) return "";
  switch (variable.hint) {
    case "name":
      return customer.name || "العميل الكريم";
    case "points":
      return String(customer.total_points ?? 0);
    case "visits":
      return String(customer.total_visits ?? 0);
    default:
      return "";
  }
}

const TemplateSmartForm = ({ template, customer, parameters, onChange }: Props) => {
  const variables = useMemo(() => extractVariables(template), [template]);

  // Auto-fill from customer when template/customer changes (only empty slots)
  useEffect(() => {
    const next = variables.map((v, i) => {
      const current = parameters[i];
      if (current && current.trim()) return current;
      return autoFillFromCustomer(v, customer);
    });
    if (next.some((v, i) => v !== (parameters[i] ?? ""))) {
      onChange(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.name, customer?.id]);

  const setAt = (idx: number, value: string) => {
    const next = [...parameters];
    while (next.length < variables.length) next.push("");
    next[idx] = value;
    onChange(next);
  };

  if (variables.length === 0) {
    return (
      <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg p-3 text-center">
        ✨ هذا القالب لا يحتوي على متغيرات — جاهز للإرسال مباشرة
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        تعبئة ذكية ({variables.length} متغير)
      </div>

      {variables.map((v, i) => {
        const value = parameters[i] ?? "";
        const suggestions = getSuggestionsForHint(v.hint);
        const isAutoFilled =
          customer &&
          (v.hint === "name" || v.hint === "points" || v.hint === "visits") &&
          value === autoFillFromCustomer(v, customer) &&
          value !== "";

        return (
          <div key={v.index} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-foreground">
                {`{{${v.index}}} `}
                <span className="text-muted-foreground">— {getHintLabel(v.hint)}</span>
              </label>
              {isAutoFilled && (
                <span className="text-[9px] text-success font-semibold">
                  ✓ معبأ تلقائياً
                </span>
              )}
            </div>

            <input
              type="text"
              value={value}
              onChange={(e) => setAt(i, e.target.value)}
              placeholder={v.example || `أدخل قيمة {{${v.index}}}`}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />

            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setAt(i, s)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors border border-transparent hover:border-primary/30"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TemplateSmartForm;