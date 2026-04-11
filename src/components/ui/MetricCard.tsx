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

const MetricCard = ({ label, value, sub, subColor = "gray" }: MetricCardProps) => (
  <div className="bg-surface rounded-lg p-4 border border-border relative overflow-hidden">
    <div className="absolute top-0 right-0 w-[3px] h-full bg-primary" />
    <div className="text-[10px] text-gray-light mb-1.5 font-medium tracking-wide">{label}</div>
    <div className="text-[21px] font-bold text-foreground">{value}</div>
    {sub && <div className={`text-[11px] mt-1 font-medium ${subColors[subColor]}`}>{sub}</div>}
  </div>
);

export default MetricCard;
