interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

const PageHeader = ({ title, subtitle, badge }: PageHeaderProps) => (
  <div className="flex items-start justify-between mb-7">
    <div>
      <h1 className="text-[22px] font-bold text-foreground tracking-tight">{title}</h1>
      {subtitle && <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {badge && (
      <span className="bg-success/10 text-success text-[11px] font-semibold px-3.5 py-1.5 rounded-full">
        {badge}
      </span>
    )}
  </div>
);

export default PageHeader;
