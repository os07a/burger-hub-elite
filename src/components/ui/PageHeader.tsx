interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

const PageHeader = ({ title, subtitle, badge }: PageHeaderProps) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h1 className="text-[19px] font-bold text-foreground">{title}</h1>
      {subtitle && <p className="text-[12px] text-gray-light mt-0.5">{subtitle}</p>}
    </div>
    {badge && (
      <span className="bg-danger-bg text-primary text-[11px] font-semibold px-3 py-1 rounded-full border border-primary/20">
        {badge}
      </span>
    )}
  </div>
);

export default PageHeader;
