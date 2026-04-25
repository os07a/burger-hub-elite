export interface MessageTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  body: string;
  variables: string[];
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "welcome",
    name: "ترحيب بعميل جديد",
    emoji: "👋",
    description: "رسالة ترحيب لعميل سجّل لأول مرة",
    body:
      "أهلاً {name} 👋\nمرحباً بك في عائلة برجرهم 🍔\nاستمتع بنقاط الولاء على كل زيارة، وعروض حصرية تصلك أول بأول.",
    variables: ["{name}"],
  },
  {
    id: "loyalty_reward",
    name: "مكافأة ولاء",
    emoji: "🎁",
    description: "إشعار العميل بنقاط الولاء المتراكمة",
    body:
      "هلا {name} ⭐\nرصيدك الحالي: {points} نقطة من {visits} زيارة.\nاستبدلها ببرجر مجاني في زيارتك القادمة 🍔",
    variables: ["{name}", "{points}", "{visits}"],
  },
  {
    id: "special_offer",
    name: "عرض خاص",
    emoji: "🔥",
    description: "عرض ترويجي محدود الوقت",
    body:
      "{name} 🔥\nعرض خاص لك اليوم فقط:\nاطلب وجبة برجرهم الكلاسيكية واحصل على بطاطس مجانية!\nالعرض ساري حتى نهاية اليوم 🕐",
    variables: ["{name}"],
  },
  {
    id: "visit_reminder",
    name: "تذكير زيارة",
    emoji: "💭",
    description: "تذكير لعميل ما زار من فترة",
    body:
      "وحشتنا {name} 🥺\nصار لك فترة ما شفناك في برجرهم.\nعندك {points} نقطة بانتظارك — تعال اشتقنالك! 🍔",
    variables: ["{name}", "{points}"],
  },
];

export interface CustomerVars {
  name?: string | null;
  points?: number | null;
  visits?: number | null;
}

/** Replace {name}, {points}, {visits} placeholders with customer values. */
export function renderTemplate(body: string, vars: CustomerVars): string {
  return body
    .replaceAll("{name}", vars.name?.trim() || "عزيزنا")
    .replaceAll("{points}", String(Math.round(Number(vars.points ?? 0))))
    .replaceAll("{visits}", String(Number(vars.visits ?? 0)));
}

/** Find {placeholders} in a string. */
export function extractPlaceholders(body: string): string[] {
  const matches = body.match(/\{[a-z_]+\}/gi) ?? [];
  return Array.from(new Set(matches));
}