import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
}

const PageHeader = ({ title, subtitle, badge, actions }: PageHeaderProps) => (
  <div className="flex items-start justify-between mb-7 gap-3">
    <div className="flex-1 min-w-0">
      <h1 className="text-[22px] font-bold text-foreground tracking-tight">{title}</h1>
      {subtitle && <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-3 flex-shrink-0">
      {badge && (
        <span className="bg-success/10 text-success text-[11px] font-semibold px-3.5 py-1.5 rounded-full">
          {badge}
        </span>
      )}
      {actions}
    </div>
  </div>
);

export default PageHeader;
