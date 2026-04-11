interface StatusBadgeProps {
  variant: "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
  className?: string;
}

const variants = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
};

const StatusBadge = ({ variant, children, className = "" }: StatusBadgeProps) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${variants[variant]} ${className}`}>
    {children}
  </span>
);

export default StatusBadge;
