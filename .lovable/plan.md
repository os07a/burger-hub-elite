## Goal

Reorganize receipt rows in **سجل المبيعات** (Sales Log) so columns are clean, balanced, and easy to scan in RTL — with **Latin numerals everywhere** and smarter inline metadata.

## Problems with current row

Looking at the screenshot:
- Time uses Arabic-Indic digits (`٦:٢٧ م`) while receipt # uses Latin (`#1-2897`) → inconsistent.
- Right side feels crammed (`v #1-2897 ٦:٢٧ م`) while the middle is empty whitespace.
- Left side only shows a tiny icon + amount → no real "smart" info (no cashier, no item count, no discount visible at a glance).
- Cashier badge only appears on `sm:` screens and is hidden on this viewport — wasted intelligence.
- Payment icon is just a generic card glyph with no distinction between cash / network / delivery in the compact view.

## New row layout (RTL — reading right → left)

```text
[ ▾ ]  [ #2897 ]  [ 6:27 PM ]  [ 👤 محمد ]  [ ⚡ 3 أصناف ]      [ −5.00 ﷼ ]  [ 💳 شبكة ]  [ 58.00 ﷼ ]
 ──────── identity (right) ────────────  ── smart middle ──   ──────── financial (left) ────────
```

Three balanced zones:

1. **Identity zone (right, fixed)** — chevron + `#2897` (drop the redundant `1-` prefix; keep full # in tooltip) + time in **Latin 12-hour format** (`6:27 PM`).
2. **Smart middle (flex, truncates)** — cashier name (always shown, not just `sm:`) + item count badge (e.g. `3 أصناف`) so the row tells a story.
3. **Financial zone (left, fixed)** — discount chip (if any) → payment-method chip with **Arabic label + colored icon** (شبكة / كاش / توصيل) → total in bold.

Refund rows: replace payment chip with a red `استرجاع` chip and color the total red.

## Numeric formatting

- All numbers (receipt #, time, amounts, item counts) → **Latin digits** via `toLocaleString("en-US", …)` and `Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true })`.
- Add `tabular-nums` everywhere for clean column alignment.
- Currency stays as `RiyalIcon` SVG (per project rule).

## Smart additions

- **Item count per receipt**: derive from `useReceiptItemsByDate` — group by `receipt_number` once, pass count into each row. Shown as a subtle pill `3 أصناف`.
- **Cashier always visible** (truncates with ellipsis if long), no responsive hiding.
- **Payment chip** shows method label + icon together (not just icon), color-coded:
  - شبكة → primary, کاش → success, توصیل → warning.
- **Discount chip** stays inline only when discount > 0 (and not refund).
- Receipt number trimmed: `1-2897` → `#2897` (POS prefix is constant; full value still in `title=` for accessibility).

## Files to edit

- `src/components/dashboard/SalesLogCard.tsx` — only file changed.
  - New helper `formatTimeLatin(date)` using `en-US`.
  - New helper `shortReceiptNo(s)` stripping leading `\d+-`.
  - Pass `itemCount` map from `useReceiptItemsByDate` aggregation into each `ReceiptRow`.
  - Rewrite `ReceiptRow` main row markup with the three-zone layout above.
  - Update `Kpi`, `last 7 days`, and items tab to also use `tabular-nums` + Latin digits (already mostly Latin via `fmt`).

## Out of scope

- No DB / edge-function changes.
- No layout changes to the KPI cards or payment-split bar (already clean).
- Expanded `ReceiptMetaStrip` stays as-is (already good after last iteration).
