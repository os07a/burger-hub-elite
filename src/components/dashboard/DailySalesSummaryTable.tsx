import { useState } from "react";
import { ChevronDown, ChevronLeft, Package } from "lucide-react";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { fmt, fmtPct } from "@/lib/format";
import { useDailySalesSummary } from "@/hooks/useDailySalesSummary";
import { useReceiptItemsByDate } from "@/hooks/useReceiptItemsByDate";
import { cn } from "@/lib/utils";

interface DailySalesSummaryTableProps {
  limit?: number;
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(new Date(`${date}T12:00:00`));

const money = (value: number) => fmt(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ItemsRow = ({ date, colSpan }: { date: string; colSpan: number }) => {
  const { data: items, isLoading } = useReceiptItemsByDate(date);

  return (
    <tr className="bg-muted/20">
      <td colSpan={colSpan} className="px-4 py-3">
        {isLoading ? (
          <div className="py-3 text-center text-[11px] text-muted-foreground">جاري تحميل الأصناف...</div>
        ) : !items || items.length === 0 ? (
          <div className="py-3 text-center text-[11px] text-muted-foreground">
            لا توجد تفاصيل أصناف لهذا اليوم. شغّل المزامنة ليتم سحبها من Loyverse.
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-foreground">
              <Package className="h-3.5 w-3.5 text-primary" />
              <span>تفاصيل الأصناف ({items.length})</span>
            </div>
            <div className="space-y-1.5">
              {items.map((it) => (
                <div key={it.item_name} className="group">
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
                    <div
                      className="h-full rounded-full bg-primary/70 transition-all"
                      style={{ width: `${Math.min(100, it.share)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};

const DailySalesSummaryTable = ({ limit = 30 }: DailySalesSummaryTableProps) => {
  const { data: rows, isLoading } = useDailySalesSummary({ limit });
  const [expanded, setExpanded] = useState<string | null>(null);
  const colSpan = 10;

  return (
    <div className="ios-card mb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium text-muted-foreground">🧾 ملخص المبيعات اليومي — اضغط أي يوم لعرض الأصناف المباعة</div>
          <div className="mt-1 text-[10px] text-muted-foreground">إجمالي، مرتجع، خصم، صافي، تكلفة، ربح، هامش، ضرائب + تفاصيل الفاتورة</div>
        </div>
        <div className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">{rows?.length ?? 0} يوم</div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-[12px] text-muted-foreground">جاري تحميل الملخص...</div>
      ) : !rows || rows.length === 0 ? (
        <div className="py-8 text-center text-[12px] text-muted-foreground">لا توجد بيانات ملخص حتى الآن.</div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-border bg-background/40">
          <table className="w-full min-w-[980px] text-[12px]">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border text-[10px] text-muted-foreground">
                <th className="w-8 px-2 py-2"></th>
                <th className="px-3 py-2 text-right font-medium">التاريخ</th>
                <th className="px-3 py-2 text-left font-medium">إجمالي البيع</th>
                <th className="px-3 py-2 text-left font-medium">المرتجع</th>
                <th className="px-3 py-2 text-left font-medium">الخصومات</th>
                <th className="px-3 py-2 text-left font-medium">صافي المبيعات</th>
                <th className="px-3 py-2 text-left font-medium">التكلفة</th>
                <th className="px-3 py-2 text-left font-medium">إجمالي الربح</th>
                <th className="px-3 py-2 text-left font-medium">الهامش</th>
                <th className="px-3 py-2 text-left font-medium">الضرائب</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isToday = index === 0;
                const isOpen = expanded === row.date;
                return (
                  <>
                    <tr
                      key={row.date}
                      onClick={() => setExpanded(isOpen ? null : row.date)}
                      className={cn(
                        "cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/40",
                        isOpen && "bg-muted/30",
                      )}
                    >
                      <td className="px-2 py-2.5 text-center text-muted-foreground">
                        {isOpen ? <ChevronDown className="mx-auto h-3.5 w-3.5" /> : <ChevronLeft className="mx-auto h-3.5 w-3.5" />}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-foreground">
                        <div className="flex items-center justify-end gap-2">
                          {isToday && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">اليوم</span>}
                          <span>{formatDate(row.date)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-left font-semibold text-foreground">
                        <span className="inline-flex items-center gap-1">{money(Number(row.gross_sales))}<RiyalIcon size={10} /></span>
                      </td>
                      <td className="px-3 py-2.5 text-left text-muted-foreground">
                        <span className="inline-flex items-center gap-1">{money(Number(row.refunds))}<RiyalIcon size={10} /></span>
                      </td>
                      <td className="px-3 py-2.5 text-left text-muted-foreground">
                        <span className="inline-flex items-center gap-1">{money(Number(row.discounts))}<RiyalIcon size={10} /></span>
                      </td>
                      <td className="px-3 py-2.5 text-left font-bold text-foreground">
                        <span className="inline-flex items-center gap-1">{money(Number(row.net_sales || row.total_sales))}<RiyalIcon size={10} /></span>
                      </td>
                      <td className="px-3 py-2.5 text-left text-muted-foreground">
                        <span className="inline-flex items-center gap-1">{money(Number(row.cogs))}<RiyalIcon size={10} /></span>
                      </td>
                      <td className="px-3 py-2.5 text-left font-semibold text-foreground">
                        <span className="inline-flex items-center gap-1">{money(Number(row.gross_profit))}<RiyalIcon size={10} /></span>
                      </td>
                      <td className="px-3 py-2.5 text-left font-medium text-foreground">{fmtPct(Number(row.margin || 0), 1)}</td>
                      <td className="px-3 py-2.5 text-left text-muted-foreground">
                        <span className="inline-flex items-center gap-1">{money(Number(row.taxes))}<RiyalIcon size={10} /></span>
                      </td>
                    </tr>
                    {isOpen && <ItemsRow key={`${row.date}-items`} date={row.date} colSpan={colSpan} />}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DailySalesSummaryTable;
