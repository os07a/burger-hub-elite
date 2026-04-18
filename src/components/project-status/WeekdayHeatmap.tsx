import { fmt } from "@/lib/format";

interface DayPoint {
  day: string;
  avg: number;
}

interface Props {
  data: DayPoint[];
  highlight?: string; // day name to highlight (gold border)
}

const WeekdayHeatmap = ({ data, highlight = "الجمعة" }: Props) => {
  const max = Math.max(...data.map((d) => d.avg), 1);
  // Order Sun → Sat (right-to-left visually since RTL)
  const order = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  const ordered = order.map((day) => data.find((d) => d.day === day)).filter(Boolean) as DayPoint[];

  return (
    <div className="flex items-end justify-between gap-1.5 h-32 mt-2">
      {ordered.map((d) => {
        const intensity = d.avg / max;
        const isHighlight = d.day === highlight;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="text-[9px] text-foreground font-semibold">{fmt(d.avg)}</div>
            <div
              className={`w-full rounded-md flex-1 flex items-end transition-all ${
                isHighlight ? "ring-2 ring-accent ring-offset-1 ring-offset-card" : ""
              }`}
              style={{
                background: `hsl(var(--primary) / ${0.12 + intensity * 0.6})`,
                minHeight: `${Math.max(intensity * 100, 12)}%`,
              }}
            />
            <div className="text-[10px] text-muted-foreground">{d.day.replace("ال", "")}</div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekdayHeatmap;
