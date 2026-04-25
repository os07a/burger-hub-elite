// Latin (Arabic-numeral system used in English) number formatting — e.g. 123,456
export const fmt = (n: number, opts: Intl.NumberFormatOptions = { maximumFractionDigits: 0 }) =>
  Number(n || 0).toLocaleString("en-US", opts);

export const fmtPct = (n: number, decimals = 1) => `${n.toFixed(decimals)}%`;

const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const ARABIC_WEEKDAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const parseLocalDate = (date: string | Date): Date => {
  if (date instanceof Date) return date;
  // YYYY-MM-DD → parse as local to avoid timezone shifts
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const getArabicMonth = (date: string | Date): string => {
  const d = parseLocalDate(date);
  return ARABIC_MONTHS[d.getMonth()];
};

export const getArabicWeekday = (date: string | Date): string => {
  const d = parseLocalDate(date);
  return ARABIC_WEEKDAYS[d.getDay()];
};

export const formatArabicDayMonth = (date: string | Date): string => {
  const d = parseLocalDate(date);
  return `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]}`;
};

export const ARABIC_MONTH_NAMES = ARABIC_MONTHS;
export const ARABIC_WEEKDAY_NAMES = ARABIC_WEEKDAYS;
