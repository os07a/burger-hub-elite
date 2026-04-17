import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { useRipple } from "@/hooks/use-ripple";

interface MetricCardProProps {
  label: string;
  value: string | number;
  showRiyal?: boolean;
  delta?: number; // percentage change vs previous period (e.g. 12 or -8)
  deltaAbs?: string; // absolute delta label e.g. "+25K SAR"
  compareLabel?: string; // e.g. "مقارنةً بـ Dec, 2024"
  badge?: string; // e.g. "25% من الإيرادات"
  highlighted?: boolean;
  children?: ReactNode;
}

const MetricCardPro = ({
  label,
  value,
  showRiyal,
  delta,
  deltaAbs,
  compareLabel,
  badge,
  highlighted,
}: MetricCardProProps) => {
  const { containerRef, handleMouseEnter } = useRipple();
  const isUp = (delta ?? 0) >= 0;
  const deltaColor = isUp ? "text-success bg-success/10" : "text-danger bg-danger/10";
  const absColor = isUp ? "text-success bg-success/10" : "text-warning bg-warning/15";

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className={`ripple-container bg-card rounded-2xl p-5 border transition-all animate-fade-in ${
        highlighted ? "border-info border-2 shadow-sm" : "border-border"
      }`}
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`text-[12px] font-semibold ${highlighted ? "text-info" : "text-foreground"}`}>
          {label}
        </div>
        <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
      </div>

      {badge && (
        <div className="inline-block text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md mb-2">
          {badge}
        </div>
      )}

      <div className="text-[22px] font-bold text-foreground tracking-tight flex items-center gap-1.5 mb-3">
        {showRiyal ? (
          <>
            <span className="text-[11px] text-muted-foreground font-medium">SAR</span>
            {value}
          </>
        ) : (
          value
        )}
      </div>

      {(deltaAbs || delta !== undefined) && (
        <div className="flex items-center gap-1.5 mb-1.5">
          {deltaAbs && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${absColor}`}>
              {deltaAbs}
            </span>
          )}
          {delta !== undefined && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${deltaColor}`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(delta).toFixed(0)}%
            </span>
          )}
        </div>
      )}

      {compareLabel && (
        <div className="text-[10px] text-muted-foreground">{compareLabel}</div>
      )}
    </div>
  );
};

export default MetricCardPro;
