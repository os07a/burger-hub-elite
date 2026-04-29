// Smart name-based matching between POS sale lines and product catalog.
// Handles bilingual Arabic/English names, removes diacritics, normalizes spaces.

const AR_DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g;
const NON_ALPHANUM = /[^\p{L}\p{N}\s]/gu;

export function normalizeName(input: string | null | undefined): string {
  if (!input) return "";
  let s = String(input).toLowerCase();
  s = s.replace(AR_DIACRITICS, "");
  // unify common arabic letter forms
  s = s.replace(/[إأآا]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي");
  s = s.replace(NON_ALPHANUM, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function tokens(s: string): string[] {
  return normalizeName(s).split(" ").filter((t) => t.length >= 2);
}

/** Jaccard-like similarity on token sets, 0..1 */
export function nameSimilarity(a: string, b: string): number {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  ta.forEach((t) => { if (tb.has(t)) inter++; });
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export interface ProductLite {
  id: string;
  name: string;
  loyverse_item_id: string | null;
}

export interface MatchResult {
  product_id: string | null;
  score: number;
  via: "id" | "name" | null;
}

export function matchSaleToProduct(
  saleName: string,
  saleLoyverseId: string | null,
  products: ProductLite[],
  threshold = 0.5
): MatchResult {
  if (saleLoyverseId) {
    const byId = products.find((p) => p.loyverse_item_id === saleLoyverseId);
    if (byId) return { product_id: byId.id, score: 1, via: "id" };
  }
  let best: { p: ProductLite; s: number } | null = null;
  for (const p of products) {
    const s = nameSimilarity(saleName, p.name);
    if (!best || s > best.s) best = { p, s };
  }
  if (best && best.s >= threshold) {
    return { product_id: best.p.id, score: best.s, via: "name" };
  }
  return { product_id: null, score: best?.s ?? 0, via: null };
}

/** Suggest top-N candidate products for an unmatched sale name. */
export function suggestProducts(saleName: string, products: ProductLite[], n = 3): Array<{ product: ProductLite; score: number }> {
  return products
    .map((p) => ({ product: p, score: nameSimilarity(saleName, p.name) }))
    .filter((x) => x.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}