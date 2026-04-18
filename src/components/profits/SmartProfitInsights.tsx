interface Insight {
  type: "success" | "warning" | "danger" | "info";
  icon: string;
  text: string;
}

interface Props {
  insights: Insight[];
}

const styleMap = {
  success: "bg-success/10 border-success/30 text-success",
  warning: "bg-warning/10 border-warning/30 text-warning",
  danger: "bg-danger/10 border-danger/30 text-danger",
  info: "bg-primary/10 border-primary/30 text-primary",
};

const SmartProfitInsights = ({ insights }: Props) => {
  if (!insights.length) return null;
  return (
    <div className="bg-surface border rounded-lg p-4 border-r-[3px] border-r-primary border-gray-50">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">
        🧠 التحليلات الذكية
      </div>
      <div className="space-y-2">
        {insights.map((ins, i) => (
          <div key={i} className={`border rounded-md p-2.5 text-[11px] font-medium ${styleMap[ins.type]}`}>
            <span className="ml-1">{ins.icon}</span>
            {ins.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartProfitInsights;
