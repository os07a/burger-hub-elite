interface StatusBadgeProps {
  variant: "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
  className?: string;
}

const variants = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
};

const StatusBadge = ({ variant, children, className = "" }: StatusBadgeProps) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${variants[variant]} ${className}`}>
    {children}
  </span>
);

export default StatusBadge;
