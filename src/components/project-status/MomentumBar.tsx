import { Activity, ArrowDown, ArrowUp, Clock, Flame, Wallet } from "lucide-react";
import { fmt } from "@/lib/format";
import RiyalIcon from "@/components/ui/RiyalIcon";

interface Props {
  momentumPct: number;
  trendUp: boolean;
  last30Avg: number;
  prev30Avg: number;
  burnRatePerDay: number;
  incomeRatePerDay: number;
  runwayDays: number;
}

const MomentumBar = ({ momentumPct, trendUp, last30Avg, prev30Avg, burnRatePerDay, incomeRatePerDay, runwayDays }: Props) => {
  const max = Math.max(burnRatePerDay, incomeRatePerDay, 1);
  return (
    <div className="ios-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Activity size={16} />
        </div>
        <div className="text-[12px] font-semibold text-foreground">شريط الزخم — آخر 30 يوم</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Trend */}
        <div className="p-3 bg-background rounded-xl">
          <div className="text-[10px] text-muted-foreground mb-2">الاتجاه vs الفترة السابقة</div>
          <div className="flex items-baseline gap-2">
            <span className={`text-[22px] font-bold ${trendUp ? "text-success" : "text-danger"}`}>
              {trendUp ? "+" : ""}{momentumPct.toFixed(1)}%
            </span>
            {trendUp ? (
              <ArrowUp size={16} className="text-success" />
            ) : (
              <ArrowDown size={16} className="text-danger" />
            )}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
            <span>{fmt(last30Avg)}</span>
            <RiyalIcon size={9} />
            <span>vs {fmt(prev30Avg)}</span>
          </div>
        </div>

        {/* Burn vs Income */}
        <div className="p-3 bg-background rounded-xl">
          <div className="text-[10px] text-muted-foreground mb-2">الحرق vs الدخل (يومي)</div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="flex items-center gap-1 text-success">
                  <Wallet size={10} /> دخل
                </span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  {fmt(incomeRatePerDay)}
                  <RiyalIcon size={9} />
                </span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: `${(incomeRatePerDay / max) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="flex items-center gap-1 text-danger">
                  <Flame size={10} /> حرق
                </span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  {fmt(burnRatePerDay)}
                  <RiyalIcon size={9} />
                </span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-danger rounded-full" style={{ width: `${(burnRatePerDay / max) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Runway */}
        <div className="p-3 bg-background rounded-xl">
          <div className="text-[10px] text-muted-foreground mb-2">المدى المتبقي للسيولة</div>
          <div className="flex items-center gap-2">
            <Clock size={18} className={runwayDays < 14 ? "text-danger" : runwayDays < 30 ? "text-warning" : "text-success"} />
            <span className={`text-[22px] font-bold ${runwayDays < 14 ? "text-danger" : runwayDays < 30 ? "text-warning" : "text-success"}`}>
              {runwayDays >= 999 ? "∞" : `${runwayDays}`}
            </span>
            <span className="text-[11px] text-muted-foreground">يوم</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {runwayDays < 14 ? "تحذير: سيولة منخفضة جداً" : runwayDays < 30 ? "يحتاج متابعة" : "آمن"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MomentumBar;
