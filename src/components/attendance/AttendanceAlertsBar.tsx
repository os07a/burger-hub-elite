interface Props {
  absent: number;
  late: number;
  overtime: number; // minutes
  permissions: number;
}

const fmt = (m: number) => {
  if (!m) return "0 د";
  if (m < 60) return `${m} د`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}س ${r}د` : `${h} س`;
};

const AttendanceAlertsBar = ({ absent, late, overtime, permissions }: Props) => {
  const items = [
    { icon: "🔴", label: "غائبون اليوم", value: absent.toString(), color: "text-danger" },
    { icon: "🟡", label: "متأخرون", value: late.toString(), color: "text-warning" },
    { icon: "🟢", label: "ساعات إضافية", value: fmt(overtime), color: "text-success" },
    { icon: "🔵", label: "استئذانات", value: permissions.toString(), color: "text-info" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {items.map((it) => (
        <div key={it.label} className="bg-surface border border-border rounded-lg p-3 flex items-center gap-3">
          <span className="text-[20px]">{it.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-light font-semibold uppercase tracking-wider">{it.label}</div>
            <div className={`text-[16px] font-bold ${it.color}`}>{it.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceAlertsBar;
