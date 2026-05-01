import { useMemo, useState } from "react";
import { Package, Receipt, CalendarDays, ChevronDown, CreditCard, Banknote, Bike, User, Undo2, TicketPercent } from "lucide-react";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fmt, fmtPct, formatArabicDayMonth, getArabicWeekday } from "@/lib/format";
import { useDailySalesSummary } from "@/hooks/useDailySalesSummary";
import { usePosReceipts } from "@/hooks/usePosReceipts";
import { useReceiptItemsByDate } from "@/hooks/useReceiptItemsByDate";
import { useReceiptItemByReceipt } from "@/hooks/useReceiptItemByReceipt";
import { cn } from "@/lib/utils";

const money = (v: number) => fmt(v, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const todayKsa = (): string => {
  const fmtD = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" });
  return fmtD.format(new Date());
};

// Latin 12-hour time formatter — e.g. "6:27 PM"
const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Riyadh",
});
const formatTimeLatin = (iso: string | null) => (iso ? timeFmt.format(new Date(iso)) : "—");

// Strip the constant POS prefix ("1-2897" → "2897"); fall back to original.
const shortReceiptNo = (s: string) => {
  const m = /^\d+-(.+)$/.exec(s);
  return m ? m[1] : s;
};

const SalesLogCard = () => {
  const { data: days = [], isLoading: daysLoading } = useDailySalesSummary({ limit: 30 });
  const defaultDate = days[0]?.date ?? todayKsa();
  const [selected, setSelected] = useState<string | null>(null);
  const date = selected ?? defaultDate;
  const [expanded, setExpanded] = useState<string | null>(null);

  const row = days.find((d) => d.date === date);
  const { data: receipts = [], isLoading: rLoading } = usePosReceipts(date, 50);
  const { data: items = [], isLoading: iLoading } = useReceiptItemsByDate(date);

  const kpi = useMemo(() => {
    const net = Number(row?.net_sales || row?.total_sales || 0);
    const gross = Number(row?.gross_sales || 0);
    const orders = Number(row?.orders_count || 0) || receipts.filter((r) => r.receipt_type !== "REFUND").length;
    const avg = orders > 0 ? net / orders : 0;
    const card = Number(row?.card_sales || 0);
    const cash = Number(row?.cash_sales || 0);
    const delivery = Number(row?.delivery_sales || 0);
    const total = card + cash + delivery || 1;
    return {
      net, gross, orders, avg,
      card, cash, delivery,
      cardPct: (card / total) * 100,
      cashPct: (cash / total) * 100,
      delPct: (delivery / total) * 100,
    };
  }, [row, receipts]);

  const last7 = days.slice(0, 7);
  const max7 = Math.max(...last7.map((d) => Number(d.net_sales || d.total_sales || 0)), 1);

  return (
    <div className="ios-card mb-6">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[12px] font-semibold text-foreground">🧾 سجل المبيعات</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            {getArabicWeekday(date)} — {formatArabicDayMonth(date)}
          </div>
        </div>
        <select
          value={date}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {(days.length ? days : [{ date: defaultDate } as { date: string }]).map((d) => (
            <option key={d.date} value={d.date}>
              {date === d.date ? "اليوم: " : ""}
              {formatArabicDayMonth(d.date)}
            </option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi label="صافي" value={money(kpi.net)} riyal accent="primary" />
        <Kpi label="إجمالي" value={money(kpi.gross)} riyal />
        <Kpi label="إيصالات" value={fmt(kpi.orders)} />
        <Kpi label="متوسط الإيصال" value={money(kpi.avg)} riyal />
      </div>

      {/* Payment split bar */}
      <div className="mb-4 rounded-xl border border-border bg-background/40 p-2.5">
        <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>توزيع طرق الدفع</span>
          <span className="flex gap-3">
            <Dot color="bg-primary" label={`شبكة ${fmtPct(kpi.cardPct, 0)}`} />
            <Dot color="bg-success" label={`كاش ${fmtPct(kpi.cashPct, 0)}`} />
            <Dot color="bg-warning" label={`توصيل ${fmtPct(kpi.delPct, 0)}`} />
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${kpi.cardPct}%` }} />
          <div className="h-full bg-success" style={{ width: `${kpi.cashPct}%` }} />
          <div className="h-full bg-warning" style={{ width: `${kpi.delPct}%` }} />
        </div>
      </div>

      {/* Sub-tabs */}
      <Tabs defaultValue="receipts" className="w-full">
        <TabsList className="mb-3 flex h-8 w-fit justify-start bg-muted/40">
          <TabsTrigger value="receipts" className="gap-1.5 text-[11px]">
            <Receipt className="h-3 w-3" />
            الإيصالات ({receipts.length})
          </TabsTrigger>
          <TabsTrigger value="items" className="gap-1.5 text-[11px]">
            <Package className="h-3 w-3" />
            الأصناف ({items.length})
          </TabsTrigger>
          <TabsTrigger value="days" className="gap-1.5 text-[11px]">
            <CalendarDays className="h-3 w-3" />
            آخر 7 أيام
          </TabsTrigger>
        </TabsList>

        {/* Receipts tab */}
        <TabsContent value="receipts" className="m-0">
          <div className="max-h-[260px] overflow-y-auto rounded-xl border border-border bg-background/40">
            {rLoading ? (
              <Empty text="جاري التحميل..." />
            ) : receipts.length === 0 ? (
              <Empty text='لا توجد إيصالات لهذا اليوم — اضغط "مزامنة من الكاشير"' />
            ) : (
              <div className="divide-y divide-border/40">
                {receipts.map((r) => {
                  const isRefund = r.receipt_type === "REFUND";
                  const time = formatTimeLatin(r.created_at_pos);
                  const isOpen = expanded === r.receipt_number;
                  return (
                    <ReceiptRow
                      key={r.id}
                      isOpen={isOpen}
                      onToggle={() => setExpanded(isOpen ? null : r.receipt_number)}
                      receipt={r}
                      isRefund={isRefund}
                      time={time}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Items tab */}
        <TabsContent value="items" className="m-0">
          <div className="max-h-[260px] space-y-1.5 overflow-y-auto rounded-xl border border-border bg-background/40 p-3">
            {iLoading ? (
              <Empty text="جاري تحميل الأصناف..." />
            ) : items.length === 0 ? (
              <Empty text="لا توجد تفاصيل أصناف لهذا اليوم." />
            ) : (
              items.map((it) => (
                <div key={it.item_name}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-[11px]">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-medium text-foreground">{it.item_name}</span>
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        ×{fmt(it.quantity)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-muted-foreground">{fmtPct(it.share, 1)}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        {money(it.net_total)}
                        <RiyalIcon size={9} />
                      </span>
                    </div>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.min(100, it.share)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Last 7 days tab */}
        <TabsContent value="days" className="m-0">
          <div className="max-h-[260px] space-y-1.5 overflow-y-auto rounded-xl border border-border bg-background/40 p-3">
            {daysLoading ? (
              <Empty text="جاري التحميل..." />
            ) : last7.length === 0 ? (
              <Empty text="لا توجد بيانات." />
            ) : (
              last7.map((d, i) => {
                const net = Number(d.net_sales || d.total_sales || 0);
                const isSel = d.date === date;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelected(d.date)}
                    className={cn(
                      "block w-full rounded-lg px-2 py-1.5 text-right transition-colors hover:bg-muted/40",
                      isSel && "bg-primary/10",
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-2">
                        {i === 0 && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">اليوم</span>
                        )}
                        <span className="font-medium text-foreground">{formatArabicDayMonth(d.date)}</span>
                        <span className="text-[10px] text-muted-foreground">{getArabicWeekday(d.date)}</span>
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{d.orders_count || 0} إيصال</span>
                        <span className="inline-flex items-center gap-1 font-bold text-foreground">
                          {money(net)}
                          <RiyalIcon size={9} />
                        </span>
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", isSel ? "bg-primary" : "bg-primary/40")}
                        style={{ width: `${(net / max7) * 100}%` }}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Kpi = ({ label, value, riyal, accent }: { label: string; value: string; riyal?: boolean; accent?: "primary" }) => (
  <div className="rounded-xl border border-border bg-background/40 px-3 py-2">
    <div className="text-[10px] text-muted-foreground">{label}</div>
    <div className={cn("mt-0.5 inline-flex items-center gap-1 text-[14px] font-bold", accent === "primary" ? "text-primary" : "text-foreground")}>
      {value}
      {riyal && <RiyalIcon size={11} />}
    </div>
  </div>
);

const Dot = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1">
    <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
    {label}
  </span>
);

const Empty = ({ text }: { text: string }) => (
  <div className="py-6 text-center text-[11px] text-muted-foreground">{text}</div>
);

type PosReceiptLite = {
  id: string;
  receipt_number: string;
  total: number;
  cash: number;
  card: number;
  delivery: number;
  gross: number;
  discount: number;
  tax: number;
  cashier_name: string | null;
  receipt_type: string;
};

const ReceiptRow = ({
  isOpen,
  onToggle,
  receipt,
  isRefund,
  time,
}: {
  isOpen: boolean;
  onToggle: () => void;
  receipt: PosReceiptLite;
  isRefund: boolean;
  time: string;
}) => {
  const total = Number(receipt.total);
  const discount = Math.abs(Number(receipt.discount || 0));
  const cash = Math.abs(Number(receipt.cash || 0));
  const card = Math.abs(Number(receipt.card || 0));
  const delivery = Math.abs(Number(receipt.delivery || 0));

  // Pick dominant payment method
  const payMethod = (() => {
    if (delivery > card && delivery > cash) return { icon: Bike, label: "توصيل", color: "text-warning" };
    if (cash > card) return { icon: Banknote, label: "كاش", color: "text-success" };
    return { icon: CreditCard, label: "شبكة", color: "text-primary" };
  })();
  const PayIcon = payMethod.icon;

  return (
    <div
      className={cn(
        "cursor-pointer transition-colors hover:bg-muted/40",
        isOpen && "bg-muted/30",
      )}
      onClick={onToggle}
    >
      {/* Main row — three RTL zones: identity (right) | smart middle | financial (left) */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2">
        {/* ── Identity zone (right in RTL) ── */}
        <div className="flex items-center gap-2">
          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
          <span
            className="text-[11.5px] font-semibold tabular-nums text-foreground"
            title={`#${receipt.receipt_number}`}
            dir="ltr"
          >
            #{shortReceiptNo(receipt.receipt_number)}
          </span>
          <span
            className="text-[10px] tabular-nums text-muted-foreground"
            dir="ltr"
          >
            {time}
          </span>
        </div>

        {/* ── Smart middle (truncates) ── */}
        <div className="flex min-w-0 items-center gap-2 text-[10.5px] text-muted-foreground">
          {receipt.cashier_name && (
            <span className="inline-flex min-w-0 items-center gap-1 truncate">
              <User className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{receipt.cashier_name}</span>
            </span>
          )}
          {discount > 0 && !isRefund && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/30">
              <TicketPercent className="h-2.5 w-2.5" />
              <span className="tabular-nums" dir="ltr">−{money(discount)}</span>
            </span>
          )}
        </div>

        {/* ── Financial zone (left in RTL) ── */}
        <div className="flex items-center gap-2">
          {isRefund ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
              <Undo2 className="h-2.5 w-2.5" /> استرجاع
            </span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium",
                payMethod.color,
              )}
              title={payMethod.label}
            >
              <PayIcon className="h-2.5 w-2.5" />
              {payMethod.label}
            </span>
          )}

          <span
            className={cn(
              "inline-flex items-center gap-1 text-[12.5px] font-bold tabular-nums",
              isRefund ? "text-danger" : "text-foreground",
            )}
            dir="ltr"
          >
            {money(total)}
            <RiyalIcon size={10} />
          </span>
        </div>
      </div>

      {/* Expanded */}
      {isOpen && (
        <div className="border-t border-border/40 bg-muted/10 px-3 py-2.5">
          <ReceiptMetaStrip receipt={receipt} time={time} />
          <ReceiptDetails receiptNumber={receipt.receipt_number} />
        </div>
      )}
    </div>
  );
};

const ReceiptMetaStrip = ({ receipt, time }: { receipt: PosReceiptLite; time: string }) => {
  const isRefund = receipt.receipt_type === "REFUND";
  const total = Math.abs(Number(receipt.total));
  const gross = Math.abs(Number(receipt.gross || total));
  const discount = Math.abs(Number(receipt.discount || 0));
  const tax = Math.abs(Number(receipt.tax || 0));
  const cash = Math.abs(Number(receipt.cash || 0));
  const card = Math.abs(Number(receipt.card || 0));
  const delivery = Math.abs(Number(receipt.delivery || 0));

  return (
    <div className="mb-2.5 rounded-lg border border-border/60 bg-background/60 p-2.5 text-[10.5px]">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-4">
        <MetaItem label="إجمالي قبل الخصم" value={money(gross)} riyal />
        {discount > 0 && (
          <MetaItem label="الخصم" value={`−${money(discount)}`} riyal accent="rose" />
        )}
        {tax > 0 && <MetaItem label="الضريبة" value={money(tax)} riyal accent="muted" />}
        <MetaItem label={isRefund ? "صافي المرتجع" : "صافي الإيصال"} value={money(total)} riyal accent={isRefund ? "danger" : "primary"} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/40 pt-2 text-muted-foreground">
        {card > 0 && (
          <span className="inline-flex items-center gap-1">
            <CreditCard className="h-2.5 w-2.5 text-primary" /> شبكة {money(card)}
          </span>
        )}
        {cash > 0 && (
          <span className="inline-flex items-center gap-1">
            <Banknote className="h-2.5 w-2.5 text-success" /> كاش {money(cash)}
          </span>
        )}
        {delivery > 0 && (
          <span className="inline-flex items-center gap-1">
            <Bike className="h-2.5 w-2.5 text-warning" /> توصيل {money(delivery)}
          </span>
        )}
        <span className="ms-auto inline-flex items-center gap-2">
          {receipt.cashier_name && (
            <span className="inline-flex items-center gap-1">
              <User className="h-2.5 w-2.5" /> {receipt.cashier_name}
            </span>
          )}
          <span className="tabular-nums">{time}</span>
        </span>
      </div>
    </div>
  );
};

const MetaItem = ({
  label,
  value,
  riyal,
  accent,
}: {
  label: string;
  value: string;
  riyal?: boolean;
  accent?: "primary" | "danger" | "rose" | "muted";
}) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-[10px] text-muted-foreground">{label}</span>
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold tabular-nums",
        accent === "primary" && "text-primary",
        accent === "danger" && "text-danger",
        accent === "rose" && "text-rose-700 dark:text-rose-400",
        accent === "muted" && "text-muted-foreground",
        !accent && "text-foreground",
      )}
    >
      {value}
      {riyal && <RiyalIcon size={8} />}
    </span>
  </div>
);

const ReceiptDetails = ({ receiptNumber }: { receiptNumber: string }) => {
  const { data = [], isLoading } = useReceiptItemByReceipt(receiptNumber);
  if (isLoading) return <div className="py-2 text-center text-[10px] text-muted-foreground">جاري تحميل التفاصيل...</div>;
  if (data.length === 0) return <div className="py-2 text-center text-[10px] text-muted-foreground">لا توجد أصناف لهذا الإيصال.</div>;
  return (
    <div className="space-y-1.5">
      <div className="mb-1 text-[10px] font-semibold text-muted-foreground">تفاصيل الطلب</div>
      {data.map((it, idx) => (
        <div key={`${it.item_name}-${idx}`} className="flex items-center justify-between gap-2 rounded-lg bg-background/60 px-2.5 py-1.5 text-[11px]">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate font-medium text-foreground">{it.item_name}</span>
            {it.variant_name && <span className="truncate text-[10px] text-muted-foreground">({it.variant_name})</span>}
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">×{fmt(Number(it.quantity))}</span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-foreground">
            {money(Number(it.net_total))}
            <RiyalIcon size={9} />
          </span>
        </div>
      ))}
    </div>
  );
};

export default SalesLogCard;