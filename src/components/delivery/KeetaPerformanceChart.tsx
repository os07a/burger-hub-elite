import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
  Cell,
} from "recharts";

interface DataPoint {
  date: string;
  netIncome: number;
  sales: number;
  commission: number;
  promoCost: number;
  otherCosts: number;
}

interface KeetaPerformanceChartProps {
  data: DataPoint[];
  netIncomeTotal: number;
  netIncomeChange: number; // percentage
  salesTotal: number;
  costsTotal: number; // positive number (sum of all cost categories absolute)
}

const fmtK = (n: number) => {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toFixed(0);
};

const KeetaPerformanceChart = ({
  data,
  netIncomeTotal,
  netIncomeChange,
  salesTotal,
  costsTotal,
}: KeetaPerformanceChartProps) => {
  const [mode, setMode] = useState<"netIncome" | "sales">("netIncome");

  const avg = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((s, d) => s + d.netIncome, 0) / data.length;
  }, [data]);

  const isUp = netIncomeChange >= 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-[14px] font-bold text-foreground mb-1">أداء Keeta</div>
          <div className="text-[11px] text-muted-foreground">آخر 30 يوم · يومياً</div>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setMode("netIncome")}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
              mode === "netIncome" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            صافي الدخل
          </button>
          <button
            onClick={() => setMode("sales")}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
              mode === "sales" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            المبيعات
          </button>
        </div>
      </div>

      {/* Summary KPI strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-background/60 border border-border rounded-xl p-3">
          <div className="text-[10px] text-muted-foreground mb-1">إجمالي المبيعات</div>
          <div className="text-[18px] font-bold text-foreground">
            {salesTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            <span className="text-[10px] text-muted-foreground font-medium mr-1">ر.س</span>
          </div>
        </div>
        <div className="bg-background/60 border border-border rounded-xl p-3">
          <div className="text-[10px] text-muted-foreground mb-1">إجمالي التكاليف</div>
          <div className="text-[18px] font-bold text-danger">
            {costsTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            <span className="text-[10px] text-muted-foreground font-medium mr-1">ر.س</span>
          </div>
        </div>
        <div className="bg-info/5 border border-info/20 rounded-xl p-3">
          <div className="text-[10px] text-info mb-1">صافي الدخل</div>
          <div className="text-[18px] font-bold text-foreground flex items-center gap-2">
            {netIncomeTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            <span className={`text-[10px] font-semibold ${isUp ? "text-success" : "text-danger"}`}>
              {isUp ? "↑" : "↓"} {Math.abs(netIncomeChange).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        {mode === "netIncome" ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="netIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtK}
              width={40}
            />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
            <ReferenceLine
              y={avg}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: `متوسط ${avg.toFixed(0)}`,
                fill: "hsl(var(--muted-foreground))",
                fontSize: 9,
                position: "insideTopRight",
              }}
            />
            <Tooltip
              cursor={{ stroke: "hsl(var(--info))", strokeWidth: 1, strokeDasharray: "3 3" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as DataPoint;
                const totalCosts = p.commission + p.promoCost + p.otherCosts;
                return (
                  <div className="bg-card border border-border rounded-xl shadow-lg p-3 min-w-[180px]" dir="rtl">
                    <div className="text-[10px] text-muted-foreground mb-2 font-medium">{label}</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">المبيعات</span>
                        <span className="font-semibold text-foreground">{p.sales.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">العمولة</span>
                        <span className="text-danger">-{p.commission.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الترويج</span>
                        <span className="text-danger">-{p.promoCost.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تكاليف أخرى</span>
                        <span className="text-danger">-{p.otherCosts.toFixed(0)}</span>
                      </div>
                      <div className="border-t border-border pt-1.5 mt-1.5 flex justify-between">
                        <span className="text-foreground font-semibold">صافي الدخل</span>
                        <span className={`font-bold ${p.netIncome >= 0 ? "text-success" : "text-danger"}`}>
                          {p.netIncome.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="netIncome"
              stroke="hsl(var(--info))"
              strokeWidth={2.5}
              fill="url(#netIncomeGradient)"
              activeDot={{ r: 5, fill: "hsl(var(--info))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
            />
          </AreaChart>
        ) : (
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtK}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as DataPoint;
                return (
                  <div className="bg-card border border-border rounded-xl shadow-lg p-3" dir="rtl">
                    <div className="text-[10px] text-muted-foreground mb-1 font-medium">{label}</div>
                    <div className="text-[14px] font-bold text-foreground">
                      {p.sales.toFixed(0)} <span className="text-[10px] text-muted-foreground">ر.س</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.netIncome >= 0 ? "hsl(var(--info))" : "hsl(var(--danger))"} fillOpacity={0.85} />
              ))}
            </Bar>
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default KeetaPerformanceChart;
