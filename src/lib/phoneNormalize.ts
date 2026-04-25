/**
 * Normalize Saudi phone numbers to E.164 format (without +).
 * Meta WhatsApp Cloud API expects: 9665XXXXXXXX (12 digits, no +)
 *
 * Accepts:
 *  - 05xxxxxxxx        (local, 10 digits)
 *  - 5xxxxxxxx         (without leading 0, 9 digits)
 *  - +9665xxxxxxxx     (international with +)
 *  - 9665xxxxxxxx      (international without +)
 *  - 009665xxxxxxxx    (international with 00)
 *  - with spaces, dashes, parentheses
 *
 * Returns null if invalid.
 */
export function normalizeSaudiPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Strip everything except digits
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;

  let national: string;

  if (digits.startsWith("00966")) {
    national = digits.slice(5);
  } else if (digits.startsWith("966")) {
    national = digits.slice(3);
  } else if (digits.startsWith("05")) {
    national = digits.slice(1); // remove leading 0 -> 5xxxxxxxx
  } else if (digits.startsWith("5") && digits.length === 9) {
    national = digits;
  } else {
    return null;
  }

  // National part must be exactly 9 digits and start with 5
  if (national.length !== 9 || !national.startsWith("5")) {
    return null;
  }

  return `966${national}`;
}

/** Returns true if the phone can be normalized to a valid Saudi mobile number. */
export function isValidSaudiPhone(raw: string | null | undefined): boolean {
  return normalizeSaudiPhone(raw) !== null;
}

/** Display format: +966 5X XXX XXXX */
export function formatSaudiPhoneDisplay(raw: string | null | undefined): string {
  const n = normalizeSaudiPhone(raw);
  if (!n) return raw ?? "";
  // n = 9665XXXXXXXX
  return `+966 ${n.slice(3, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
}