/**
 * Utilities for parsing Meta WhatsApp template components & smart variable detection.
 */

export type MetaTemplateComponent = {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS" | string;
  format?: string;
  text?: string;
  example?: { body_text?: string[][]; header_text?: string[] };
  buttons?: Array<{ type: string; text: string; url?: string }>;
};

export type MetaTemplate = {
  name: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | "PAUSED" | string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION" | string;
  language: string;
  components: MetaTemplateComponent[];
};

export type VariableHint = "name" | "points" | "visits" | "offer" | "date" | "generic";

export interface TemplateVariable {
  index: number; // 1-based ({{1}}, {{2}}, ...)
  hint: VariableHint;
  example?: string;
}

/** Extract all {{N}} placeholders from BODY component, in order. */
export function getBodyText(template: MetaTemplate): string {
  const body = template.components?.find((c) => c.type === "BODY");
  return body?.text ?? "";
}

export function getHeaderText(template: MetaTemplate): string | null {
  const h = template.components?.find((c) => c.type === "HEADER");
  if (!h || h.format !== "TEXT") return null;
  return h.text ?? null;
}

export function getFooterText(template: MetaTemplate): string | null {
  const f = template.components?.find((c) => c.type === "FOOTER");
  return f?.text ?? null;
}

export function extractVariables(template: MetaTemplate): TemplateVariable[] {
  const body = template.components?.find((c) => c.type === "BODY");
  const text = body?.text ?? "";
  const matches = [...text.matchAll(/\{\{(\d+)\}\}/g)];
  const indices = Array.from(new Set(matches.map((m) => Number(m[1])))).sort(
    (a, b) => a - b,
  );
  const examples = body?.example?.body_text?.[0] ?? [];

  return indices.map((index) => {
    const example = examples[index - 1];
    const hint = detectHint(template.name, text, index);
    return { index, hint, example };
  });
}

/** Detect variable purpose from template name + position context. */
function detectHint(
  templateName: string,
  bodyText: string,
  index: number,
): VariableHint {
  const name = templateName.toLowerCase();
  // First var in welcome/greeting templates is usually customer name
  if (
    index === 1 &&
    /(welcome|hello|greet|hi|ترحيب|مرحب)/i.test(name)
  ) {
    return "name";
  }
  // Look at surrounding text near the placeholder
  const placeholder = `{{${index}}}`;
  const pos = bodyText.indexOf(placeholder);
  const window = bodyText.slice(Math.max(0, pos - 30), pos + 30).toLowerCase();

  if (/name|اسم|عميل|أخ|ضيف|hi|hello|dear|مرحب/.test(window)) return "name";
  if (/point|نقط|score|رصيد/.test(window)) return "points";
  if (/visit|زيار/.test(window)) return "visits";
  if (/offer|discount|promo|خصم|عرض|كوبون/.test(window)) return "offer";
  if (/date|day|تاريخ|يوم|موعد/.test(window)) return "date";

  // Fallback by name
  if (/loyalty|points|نقاط/.test(name) && index === 2) return "points";
  if (/visit|زيار/.test(name) && index >= 2) return "visits";
  if (/offer|promo|عرض/.test(name)) return "offer";

  return "generic";
}

/** Get suggested chip values for a variable based on its hint. */
export function getSuggestionsForHint(hint: VariableHint): string[] {
  switch (hint) {
    case "name":
      return ["العميل الكريم", "أخي العزيز", "ضيفنا الكريم"];
    case "points":
      return ["100", "250", "500"];
    case "visits":
      return ["3", "5", "10"];
    case "offer":
      return ["خصم 20%", "وجبة مجانية", "ضعف النقاط"];
    case "date":
      return ["اليوم", "نهاية الأسبوع", "خلال 3 أيام"];
    default:
      return [];
  }
}

export function getHintLabel(hint: VariableHint): string {
  switch (hint) {
    case "name":
      return "اسم العميل";
    case "points":
      return "عدد النقاط";
    case "visits":
      return "عدد الزيارات";
    case "offer":
      return "العرض / الخصم";
    case "date":
      return "التاريخ / الموعد";
    default:
      return "نص حر";
  }
}

/** Replace {{1}}, {{2}}... with provided parameter values for live preview. */
export function renderTemplateBody(
  template: MetaTemplate,
  parameters: string[],
): string {
  const body = getBodyText(template);
  return body.replace(/\{\{(\d+)\}\}/g, (_m, n) => {
    const value = parameters[Number(n) - 1];
    return value && value.trim() ? value : `{{${n}}}`;
  });
}

/** Status badge colors for UI. */
export function statusVariant(status: string): {
  label: string;
  color: string;
} {
  switch (status) {
    case "APPROVED":
      return { label: "معتمد", color: "bg-success/10 text-success border-success/30" };
    case "PENDING":
      return { label: "قيد المراجعة", color: "bg-warning/10 text-warning border-warning/30" };
    case "REJECTED":
      return { label: "مرفوض", color: "bg-destructive/10 text-destructive border-destructive/30" };
    case "PAUSED":
      return { label: "موقوف", color: "bg-muted text-muted-foreground border-border" };
    default:
      return { label: status, color: "bg-muted text-muted-foreground border-border" };
  }
}

/** 5 ready-to-paste professional template suggestions for Meta WhatsApp Manager. */
export interface SuggestedTemplate {
  name: string;
  category: "UTILITY" | "MARKETING";
  language: string;
  bodyText: string;
  description: string;
  emoji: string;
}

export const SUGGESTED_TEMPLATES: SuggestedTemplate[] = [
  {
    name: "welcome_burgerhum",
    category: "UTILITY",
    language: "ar",
    emoji: "👋",
    description: "ترحيب بعميل جديد عند أول تسجيل",
    bodyText:
      "أهلاً وسهلاً {{1}} 👋\nشرّفتنا في عائلة برجرهم 🍔\nرصيدك الابتدائي: {{2}} نقطة.\nبانتظارك دايماً 💚",
  },
  {
    name: "loyalty_points_update",
    category: "UTILITY",
    language: "ar",
    emoji: "⭐",
    description: "تحديث نقاط الولاء بعد كل زيارة",
    bodyText:
      "{{1}} العزيز،\nرصيدك تحدّث إلى {{2}} نقطة بعد زيارتك الـ{{3}} 🌟\nشكراً لثقتك ببرجرهم 💚",
  },
  {
    name: "special_offer_promo",
    category: "MARKETING",
    language: "ar",
    emoji: "🔥",
    description: "إعلان عرض ترويجي محدود",
    bodyText:
      "{{1}} 🔥\nعرض حصري لعملائنا المميزين: {{2}}\nسارٍ حتى {{3}} — لا يفوتك!\nبرجرهم 🍔",
  },
  {
    name: "visit_reminder",
    category: "MARKETING",
    language: "ar",
    emoji: "💚",
    description: "تذكير العميل بعد فترة غياب",
    bodyText:
      "اشتقنالك يا {{1}} 💚\nآخر زيارة لك كانت قبل فترة، تعال جرّب جديدنا في برجرهم 🍔\nرصيدك الحالي: {{2}} نقطة بانتظارك.",
  },
  {
    name: "thank_you_after_visit",
    category: "UTILITY",
    language: "ar",
    emoji: "🙏",
    description: "شكر العميل بعد زيارة مباشرة",
    bodyText:
      "شكراً {{1}} على زيارتك اليوم 🙏\nرصيدك الحالي: {{2}} نقطة.\nنتشرف بعودتك قريباً 💚\nبرجرهم 🍔",
  },
];