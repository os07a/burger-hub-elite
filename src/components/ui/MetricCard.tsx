import { useRipple } from "@/hooks/use-ripple";
import RiyalIcon from "@/components/ui/RiyalIcon";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: "success" | "warning" | "danger" | "gray";
  showRiyal?: boolean;
}

const subColors = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  gray: "text-gray-light",
};

const MetricCard = ({ label, value, sub, subColor = "gray", showRiyal }: MetricCardProps) => {
  const { containerRef, handleMouseEnter } = useRipple();

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className="ios-card ripple-container animate-fade-in cursor-default flex flex-col h-full"
    >
      <div className="text-[11px] text-muted-foreground mb-2 font-medium">{label}</div>
      <div
        className="min-h-[58px] text-[24px] font-bold text-foreground tracking-tight flex items-center gap-1.5 leading-tight break-words"
        title={typeof value === "string" ? value : undefined}
      >
        <span className="line-clamp-2">{value}</span>
        {showRiyal && <RiyalIcon size={14} />}
      </div>
      {sub && (
        <div className={`text-[11px] mt-auto pt-1.5 font-medium ${subColors[subColor]}`}>{sub}</div>
      )}
    </div>
  );
};

export default MetricCard;
