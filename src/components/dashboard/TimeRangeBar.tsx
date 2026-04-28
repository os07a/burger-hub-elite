import { useSearchParams } from "react-router-dom";

const RANGES = [
  { label: "اليوم", value: 1 },
  { label: "7 أيام", value: 7 },
  { label: "30 يوم", value: 30 },
  { label: "90+ يوم", value: 0 },
];

export const useRangeDays = (): [number, (n: number) => void] => {
  const [params, setParams] = useSearchParams();
  const raw = params.get("range");
  const days = raw === null ? 30 : Number(raw);
  const set = (n: number) => {
    if (n === 30) params.delete("range");
    else params.set("range", String(n));
    setParams(params, { replace: true });
  };
  return [Number.isFinite(days) ? days : 30, set];
};

const TimeRangeBar = () => {
  const [rangeDays, setRangeDays] = useRangeDays();
  return (
    <div className="ios-card mb-5 flex items-center justify-between gap-3 py-3">
      <div className="text-[11px] font-semibold text-muted-foreground">📅 النطاق الزمني</div>
      <div className="flex items-center gap-1.5">
        {RANGES.map((p) => (
          <button
            key={p.value}
            onClick={() => setRangeDays(p.value)}
            className={`text-[11px] rounded-full px-3.5 py-1.5 border transition-colors ${
              rangeDays === p.value
                ? "bg-primary text-primary-foreground border-primary font-semibold"
                : "bg-background text-muted-foreground hover:text-foreground border-border"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeBar;