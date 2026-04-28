/**
 * مساعدات تنقية مدخلات المستخدم — OWASP A03 (Injection) & A04 (Insecure Design)
 */

/** يقصّ المسافات ويزيل أحرف التحكم غير المرئية (zero-width, BOM, ...) */
export function sanitizeText(input: string | null | undefined, maxLen = 1000): string {
  if (!input) return "";
  return String(input)
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, "")
    .trim()
    .slice(0, maxLen);
}

/**
 * يهرب الأحرف الخاصة في استعلامات PostgREST (.ilike() و .or()).
 * بدون هذا التهريب، يمكن لمستخدم كتابة `%` أو `,` للتلاعب بنطاق البحث.
 */
export function escapePostgrestLike(input: string): string {
  if (!input) return "";
  return String(input)
    .replace(/[\\%_,()*]/g, (m) => `\\${m}`)
    .slice(0, 200);
}

/** تحقق من رقم جوال سعودي — يرجع الرقم الموحّد أو null */
export function normalizeSaudiPhoneSafe(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  let national: string;
  if (digits.startsWith("00966")) national = digits.slice(5);
  else if (digits.startsWith("966")) national = digits.slice(3);
  else if (digits.startsWith("05")) national = digits.slice(1);
  else if (digits.startsWith("5") && digits.length === 9) national = digits;
  else return null;
  if (national.length !== 9 || !national.startsWith("5")) return null;
  return `966${national}`;
}

/** يمنع open-redirect: يسمح فقط بمسارات داخلية تبدأ بـ "/" بدون "//" */
export function safeRedirect(path: string | null | undefined, fallback = "/"): string {
  if (!path) return fallback;
  const p = String(path).trim();
  if (!p.startsWith("/") || p.startsWith("//")) return fallback;
  return p;
}
