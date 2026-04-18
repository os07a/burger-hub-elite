import RiyalIcon from "@/components/ui/RiyalIcon";
import { fmt } from "@/lib/format";

interface Props {
  totalCapital: number; // 200,000
  raisedCapital: number;
  nextMilestoneDate?: string;
  nextMilestoneShares?: number;
  status: "on_track" | "behind" | "ahead";
}

const statusMap = {
  on_track: { label: "في الموعد", color: "text-success", bg: "bg-success/10", border: "border-success/30" },
  behind: { label: "متأخر", color: "text-danger", bg: "bg-danger/10", border: "border-danger/30" },
  ahead: { label: "متقدّم", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
};

const CapitalProgressCard = ({ totalCapital, raisedCapital, nextMilestoneDate, nextMilestoneShares, status }: Props) => {
  const pct = Math.min(100, (raisedCapital / totalCapital) * 100);
  const remaining = totalCapital - raisedCapital;
  const s = statusMap[status];

  return (
    <div className="bg-surface border rounded-lg p-4 border-r-[3px] border-r-primary border-gray-50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider">رأس مال الشركة</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">200 سهم × 1,000 ر.س</div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${s.bg} ${s.border} ${s.color}`}>
          {s.label}
        </span>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[28px] font-bold text-foreground tracking-tight">
            {fmt(raisedCapital)}
          </span>
          <RiyalIcon size={16} />
        </div>
        <span className="text-[12px] text-gray-light mb-1.5">من {fmt(totalCapital)}</span>
      </div>

      <div className="h-2 bg-background rounded-full overflow-hidden mb-2">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[11px]">
        <span className="text-gray-light">نسبة الإنجاز: {pct.toFixed(1)}%</span>
        <span className="text-foreground font-medium">
          متبقي: {fmt(remaining)} ر
        </span>
      </div>

      {nextMilestoneDate && (
        <div className="mt-3 pt-3 border-t border-border flex justify-between text-[11px]">
          <span className="text-gray-light">الدفعة القادمة</span>
          <span className="text-foreground font-semibold">
            {nextMilestoneShares} سهم — {new Date(nextMilestoneDate).toLocaleDateString("ar-SA", { day: "numeric", month: "long" })}
          </span>
        </div>
      )}
    </div>
  );
};

export default CapitalProgressCard;
