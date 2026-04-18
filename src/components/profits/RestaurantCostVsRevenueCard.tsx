import RiyalIcon from "@/components/ui/RiyalIcon";
import { fmt } from "@/lib/format";

interface Props {
  totalCost: number;
  totalRevenue: number;
  founding: number;
  invoicesPaid: number;
  invoicesPending: number;
  payrollAccumulated: number;
  payrollMonthly: number;
  monthsActive: number;
  averageMonthlyRevenue: number;
}

const RestaurantCostVsRevenueCard = ({
  totalCost,
  totalRevenue,
  founding,
  invoicesPaid,
  invoicesPending,
  payrollAccumulated,
  payrollMonthly,
  monthsActive,
  averageMonthlyRevenue,
}: Props) => {
  const recoveryPct = totalCost > 0 ? Math.min(100, (totalRevenue / totalCost) * 100) : 0;
  const remaining = Math.max(0, totalCost - totalRevenue);
  const monthsToRecover = averageMonthlyRevenue > 0 ? Math.ceil(remaining / averageMonthlyRevenue) : null;

  const status =
    recoveryPct >= 100
      ? { label: "مسترد بالكامل", color: "text-success", bg: "bg-success/10", border: "border-success/30" }
      : recoveryPct >= 50
      ? { label: "في المنتصف", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" }
      : { label: "بداية الاسترداد", color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" };

  return (
    <div className="bg-surface border rounded-lg p-4 border-r-[3px] border-r-primary border-gray-50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider">
            تكلفة المطعم vs المسترد من المبيعات
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            تحليل مجمّع من جميع الأقسام (مصروفات تأسيس + فواتير الموردين + الرواتب التراكمية vs دخل المبيعات)
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${status.bg} ${status.border} ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-background rounded-lg p-3 border border-border">
          <div className="text-[10px] text-gray-light mb-1">💸 إجمالي ما كلّفنا المطعم</div>
          <div className="text-[22px] font-bold text-danger flex items-center gap-1.5">
            {fmt(totalCost)} <RiyalIcon size={13} />
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-light">مصروفات التأسيس</span>
              <span className="text-foreground">{fmt(founding)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-light">فواتير موردين مدفوعة</span>
              <span className="text-foreground">{fmt(invoicesPaid)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-light">رواتب تراكمية ({monthsActive} شهر)</span>
              <span className="text-foreground">{fmt(payrollAccumulated)}</span>
            </div>
            {invoicesPending > 0 && (
              <div className="flex justify-between text-[10px]">
                <span className="text-warning">فواتير معلّقة (لم تُحتسب)</span>
                <span className="text-warning">{fmt(invoicesPending)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-background rounded-lg p-3 border border-border">
          <div className="text-[10px] text-gray-light mb-1">💰 ما استوفاه المطعم من المبيعات</div>
          <div className="text-[22px] font-bold text-success flex items-center gap-1.5">
            {fmt(totalRevenue)} <RiyalIcon size={13} />
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-light">متوسط الدخل الشهري</span>
              <span className="text-foreground">{fmt(averageMonthlyRevenue)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-light">الراتب الشهري الجاري</span>
              <span className="text-foreground">{fmt(payrollMonthly)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-light">صافي شهري بعد الرواتب</span>
              <span className={averageMonthlyRevenue - payrollMonthly >= 0 ? "text-success" : "text-danger"}>
                {fmt(averageMonthlyRevenue - payrollMonthly)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-gray-light">نسبة الاسترداد</span>
          <span className="text-foreground font-bold">{recoveryPct.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-background rounded-full overflow-hidden border border-border">
          <div
            className={`h-full rounded-full transition-all ${recoveryPct >= 100 ? "bg-success" : "bg-primary"}`}
            style={{ width: `${recoveryPct}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 text-[11px]">
        <span className="text-gray-light">
          متبقي للاسترداد: <b className="text-foreground">{fmt(remaining)}</b> ر
        </span>
        {monthsToRecover !== null && (
          <span className="text-primary font-semibold">
            ⏱️ يكتمل خلال ~{monthsToRecover} شهر بمعدل الدخل الحالي
          </span>
        )}
      </div>
    </div>
  );
};

export default RestaurantCostVsRevenueCard;
