import { fmt } from "@/lib/format";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import RiyalIcon from "@/components/ui/RiyalIcon";

interface DayPoint {
  day: string;
  avg: number;
  count?: number;
  total?: number;
}

interface Props {
  data: DayPoint[];
  highlight?: string;
}

const shortName = (d: string) => d.replace(/^ال/, "");

const WeekdayHeatmap = ({ data, highlight = "الجمعة" }: Props) => {
  const max = Math.max(...data.map((d) => d.avg), 1);
  const avgAll = data.reduce((s, d) => s + d.avg, 0) / data.length;
  const order = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  const ordered = order.map((day) => data.find((d) => d.day === day)).filter(Boolean) as DayPoint[];
  const minVal = Math.min(...data.map((d) => d.avg));

  return (
    <TooltipProvider delayDuration={120}>
      <div className="mt-3">
        {/* Bars */}
        <div className="flex items-end justify-between gap-2 h-36 px-1">
          {ordered.map((d) => {
            const intensity = d.avg / max;
            const isHighlight = d.day === highlight;
            const isWorst = d.avg === minVal;
            const tone = isHighlight
              ? "hsl(var(--accent))"
              : isWorst
              ? "hsl(var(--danger))"
              : `hsl(var(--primary) / ${0.25 + intensity * 0.6})`;
            return (
              <Tooltip key={d.day}>
                <TooltipTrigger asChild>
                  <div className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full cursor-pointer group">
                    <div className="text-[10px] font-bold text-foreground leading-none group-hover:text-primary transition-colors">
                      {fmt(d.avg)}
                    </div>
                    <div
                      className={`w-full rounded-t-md transition-all group-hover:opacity-80 ${
                        isHighlight ? "ring-1 ring-accent/60" : ""
                      }`}
                      style={{
                        background: tone,
                        height: `${Math.max(intensity * 100, 14)}%`,
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-card border border-border text-foreground p-3 rounded-xl shadow-lg">
                  <div className="text-[12px] font-bold mb-2 text-foreground">{d.day}</div>
                  <div className="space-y-1.5 min-w-[140px]">
                    <div className="flex items-center justify-between gap-3 text-[11px]">
                      <span className="text-muted-foreground">عدد الأيام</span>
                      <span className="font-bold text-foreground">{fmt(d.count ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[11px]">
                      <span className="text-muted-foreground">المتوسط/يوم</span>
                      <span className="font-bold text-foreground flex items-center gap-1">
                        {fmt(d.avg)} <RiyalIcon size={9} />
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[11px] pt-1.5 border-t border-border">
                      <span className="text-muted-foreground">الإجمالي الكلي</span>
                      <span className="font-bold text-primary flex items-center gap-1">
                        {fmt(d.total ?? d.avg * (d.count ?? 0))} <RiyalIcon size={9} />
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Day labels */}
        <div className="flex items-center justify-between gap-2 px-1 mt-2 border-t border-border pt-2">
          {ordered.map((d) => {
            const isHighlight = d.day === highlight;
            const isWorst = d.avg === minVal;
            return (
              <div
                key={d.day}
                className={`flex-1 text-center text-[10px] font-medium ${
                  isHighlight ? "text-accent" : isWorst ? "text-danger" : "text-muted-foreground"
                }`}
              >
                {shortName(d.day)}
              </div>
            );
          })}
        </div>

        {/* Inline summary stats */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="p-2 bg-background rounded-lg text-center">
            <div className="text-[9px] text-muted-foreground">المتوسط العام</div>
            <div className="text-[12px] font-bold text-foreground">{fmt(Math.round(avgAll))}</div>
          </div>
          <div className="p-2 bg-background rounded-lg text-center">
            <div className="text-[9px] text-muted-foreground">الأعلى</div>
            <div className="text-[12px] font-bold text-accent">{fmt(max)}</div>
          </div>
          <div className="p-2 bg-background rounded-lg text-center">
            <div className="text-[9px] text-muted-foreground">الأدنى</div>
            <div className="text-[12px] font-bold text-danger">{fmt(minVal)}</div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default WeekdayHeatmap;
