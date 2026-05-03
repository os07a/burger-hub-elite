/**
 * Decoder for Saudi ZATCA e-invoice QR codes.
 *
 * The QR encodes a Base64 string containing TLV (Tag-Length-Value) records.
 * Tags:
 *   1 = Seller name (UTF-8)
 *   2 = VAT registration number (UTF-8)
 *   3 = Invoice timestamp (ISO 8601, UTF-8)
 *   4 = Invoice total with VAT (numeric string)
 *   5 = VAT amount (numeric string)
 */

export interface ZatcaInvoice {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  total: number;
  vat: number;
}

function base64ToBytes(b64: string): Uint8Array {
  const cleaned = b64.replace(/\s+/g, "");
  const bin = atob(cleaned);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function parseZatcaQr(qrBase64: string): ZatcaInvoice {
  const bytes = base64ToBytes(qrBase64);
  const decoder = new TextDecoder("utf-8");
  const fields: Record<number, string> = {};

  let i = 0;
  while (i < bytes.length) {
    const tag = bytes[i++];
    const length = bytes[i++];
    if (length === undefined) break;
    const value = bytes.slice(i, i + length);
    i += length;
    fields[tag] = decoder.decode(value);
  }

  return {
    sellerName: fields[1] ?? "",
    vatNumber: fields[2] ?? "",
    timestamp: fields[3] ?? "",
    total: parseFloat(fields[4] ?? "0") || 0,
    vat: parseFloat(fields[5] ?? "0") || 0,
  };
}

export function isLikelyZatcaQr(text: string): boolean {
  // Base64 chars only and reasonable length
  if (!/^[A-Za-z0-9+/=]+$/.test(text.replace(/\s+/g, ""))) return false;
  if (text.length < 20) return false;
  try {
    const parsed = parseZatcaQr(text);
    return Boolean(parsed.sellerName && parsed.total > 0);
  } catch {
    return false;
  }
}