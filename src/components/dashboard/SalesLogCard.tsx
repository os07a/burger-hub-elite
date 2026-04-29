import { useMemo, useState } from "react";
import { Package, Receipt, CalendarDays } from "lucide-react";
import RiyalIcon from "@/components/ui/RiyalIcon";
import StatusBadge from "@/components/ui/StatusBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fmt, fmtPct, formatArabicDayMonth, getArabicWeekday } from "@/lib/format";
import { useDailySalesSummary } from "@/hooks/useDailySalesSummary";
import { usePosReceipts } from "@/hooks/usePosReceipts";
import { useReceiptItemsByDate } from "@/hooks/useReceiptItemsByDate";
import { cn } from "@/lib/utils";

const money = (v: number) => fmt(v, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const todayKsa = (): string => {
  const fmtD = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" });
  return fmtD.format(new Date());
};

const SalesLogCard = () => {
  const { data: days = [], isLoading: daysLoading } = useDailySalesSummary({ limit: 30 });
  const defaultDate = days[0]?.date ?? todayKsa();
  const [selected, setSelected] = useState<string | null>(null);
  const date = selected ?? defaultDate;

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
        <TabsList className="mb-3 h-8 bg-muted/40">
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
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border text-[10px] text-muted-foreground">
                    <th className="px-3 py-2 text-right font-medium">رقم</th>
                    <th className="px-3 py-2 text-right font-medium">الوقت</th>
                    <th className="px-3 py-2 text-right font-medium">النوع</th>
                    <th className="px-3 py-2 text-left font-medium">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r) => {
                    const isRefund = r.receipt_type === "REFUND";
                    const time = r.created_at_pos
                      ? new Date(r.created_at_pos).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
                      : "-";
                    return (
                      <tr key={r.id} className="border-b border-border/40 transition-colors hover:bg-muted/30">
                        <td className="px-3 py-2 font-semibold text-foreground">{r.receipt_number}</td>
                        <td className="px-3 py-2 text-muted-foreground">{time}</td>
                        <td className="px-3 py-2">
                          <StatusBadge variant={isRefund ? "danger" : "success"}>
                            {isRefund ? "استرجاع" : "بيع"}
                          </StatusBadge>
                        </td>
                        <td className="px-3 py-2 text-left">
                          <span className={cn("inline-flex items-center gap-1 font-bold", isRefund ? "text-danger" : "text-foreground")}>
                            {money(Number(r.total))}
                            <RiyalIcon size={9} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

export default SalesLogCard;