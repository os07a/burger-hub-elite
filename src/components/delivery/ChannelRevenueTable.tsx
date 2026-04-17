import { ChevronDown } from "lucide-react";

interface Channel {
  key: string;
  name: string;
  logo: string; // emoji or short text
  logoColor: string; // tailwind bg class
  revenue: number;
}

interface ChannelRevenueTableProps {
  channels: Channel[];
  periodLabel?: string;
}

const SEGMENT_COLORS = [
  "bg-[hsl(45,90%,60%)]", // amber - HungerStation
  "bg-[hsl(0,70%,55%)]", // red - Jahez
  "bg-[hsl(50,85%,55%)]", // yellow - Keeta
  "bg-[hsl(20,75%,55%)]", // orange - Chefz
];

const ChannelRevenueTable = ({ channels, periodLabel = "هذا الشهر" }: ChannelRevenueTableProps) => {
  const total = channels.reduce((s, c) => s + c.revenue, 0) || 1;
  const withPct = channels
    .map((c) => ({ ...c, pct: (c.revenue / total) * 100 }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="bg-card border border-border rounded-2xl p-5" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[14px] font-bold text-foreground">إجمالي الإيرادات حسب القناة</div>
        <button className="flex items-center gap-1 text-[12px] text-info font-medium">
          {periodLabel}
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[60px_1fr_120px_60px] items-center text-[10px] text-muted-foreground font-semibold py-2 border-b border-border">
        <div>%</div>
        <div>القناة</div>
        <div className="text-left">يناير 2025</div>
        <div></div>
      </div>

      {/* Rows */}
      <div>
        {withPct.map((c) => (
          <div
            key={c.key}
            className="grid grid-cols-[60px_1fr_120px_60px] items-center py-3 border-b border-border last:border-0"
          >
            <div className="text-info text-[12px] font-semibold">{c.pct.toFixed(0)}%</div>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full ${c.logoColor} flex items-center justify-center text-[10px] font-bold text-white`}
              >
                {c.logo}
              </div>
              <span className="text-[12px] text-foreground font-medium">{c.name}</span>
            </div>
            <div className="text-left text-[13px] font-semibold text-foreground">
              {c.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} SAR
            </div>
            <div></div>
          </div>
        ))}
      </div>

      {/* Stacked color bar */}
      <div className="mt-4 flex h-7 rounded-full overflow-hidden">
        {withPct.map((c, i) => (
          <div
            key={c.key}
            className={`${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} flex items-center justify-center text-[10px] font-bold text-white`}
            style={{ width: `${c.pct}%` }}
          >
            {c.pct >= 8 ? `${c.pct.toFixed(0)}%` : ""}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelRevenueTable;
