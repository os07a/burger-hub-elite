import { useRipple } from "@/hooks/use-ripple";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: "success" | "warning" | "danger" | "gray";
}

const subColors = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  gray: "text-gray-light",
};

const MetricCard = ({ label, value, sub, subColor = "gray" }: MetricCardProps) => {
  const { containerRef, handleMouseEnter } = useRipple();

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className="ios-card ripple-container animate-fade-in cursor-default"
    >
      <div className="text-[11px] text-muted-foreground mb-2 font-medium">{label}</div>
      <div className="text-[24px] font-bold text-foreground tracking-tight">{value}</div>
      {sub && <div className={`text-[11px] mt-1.5 font-medium ${subColors[subColor]}`}>{sub}</div>}
    </div>
  );
};

export default MetricCard;
