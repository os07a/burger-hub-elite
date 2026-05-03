import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { useBatchInvoiceSummary } from "@/hooks/useInvoiceIntake";
import { Loader2, X, FileText, Calendar, Store, Trophy } from "lucide-react";

interface Props {
  invoiceIds: string[];
  failedCount: number;
  onClose: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 2 }).format(n);

const fmtDate = (d: string | null) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
};

const BatchSummaryCard = ({ invoiceIds, failedCount, onClose }: Props) => {
  const { data, isLoading } = useBatchInvoiceSummary(invoiceIds);

  return (
    <Card className="p-5 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-base font-bold">ملخص الدفعة</h3>
            <p className="text-xs text-muted-foreground">
              تم حفظ {invoiceIds.length} فاتورة{failedCount > 0 ? ` · فشل ${failedCount}` : ""}
            </p>
          </div>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm"><X size={16} /></Button>
      </div>

      {isLoading || !data ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">جاري حساب الملخص...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-card border p-3 text-center">
              <Calendar size={16} className="mx-auto mb-1 text-muted-foreground" />
              <div className="text-[10px] text-muted-foreground mb-1">الفترة</div>
              <div className="text-xs font-semibold leading-tight">
                {fmtDate(data.date_from)}
                {data.date_from !== data.date_to && (
                  <>
                    <div className="text-[10px] text-muted-foreground my-0.5">إلى</div>
                    {fmtDate(data.date_to)}
                  </>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-card border p-3 text-center">
              <RiyalIcon size={16} className="mx-auto mb-1 text-primary" />
              <div className="text-[10px] text-muted-foreground mb-1">الإجمالي</div>
              <div className="text-base font-bold">{fmt(data.total_amount)}</div>
            </div>
            <div className="rounded-xl bg-card border p-3 text-center">
              <FileText size={16} className="mx-auto mb-1 text-muted-foreground" />
              <div className="text-[10px] text-muted-foreground mb-1">عدد الأصناف</div>
              <div className="text-base font-bold">{data.line_items_count}</div>
            </div>
          </div>

          {/* Categories */}
          {data.categories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <span>🔥</span>
                <span>أكثر الفئات استهلاكاً</span>
              </div>
              <div className="space-y-2">
                {data.categories.map((c, idx) => (
                  <div key={c.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">
                        <span className="text-muted-foreground ml-1">{idx + 1}.</span>
                        {c.category}
                      </span>
                      <span className="font-semibold flex items-center gap-1">
                        {fmt(c.total)} <RiyalIcon size={10} />
                        <span className="text-muted-foreground text-[10px] mr-1">
                          ({c.pct.toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <Progress value={c.pct} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top supplier + item */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
            {data.top_supplier && (
              <div className="flex items-center gap-2 rounded-xl bg-card border p-3">
                <Store size={18} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">أعلى مورد</div>
                  <div className="text-sm font-semibold truncate">{data.top_supplier.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {data.top_supplier.count} فاتورة · {fmt(data.top_supplier.total)} ر.س
                  </div>
                </div>
              </div>
            )}
            {data.top_item && (
              <div className="flex items-center gap-2 rounded-xl bg-card border p-3">
                <Trophy size={18} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">أعلى صنف</div>
                  <div className="text-sm font-semibold truncate">{data.top_item.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {fmt(data.top_item.total)} ر.س
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default BatchSummaryCard;