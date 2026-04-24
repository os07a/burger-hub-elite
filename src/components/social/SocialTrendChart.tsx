import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { SocialInsight } from "@/hooks/useSocialInsights";

interface Props {
  insights: SocialInsight[];
}

const SocialTrendChart = ({ insights }: Props) => {
  const data = [...insights].slice(0, 8).reverse().map(i => ({
    week: i.week_start.slice(5),
    وصول: i.reach,
    تفاعل: i.engagement_rate,
    متابعون: i.new_followers,
  }));

  return (
    <div className="ios-card animate-fade-in p-6">
      <div className="text-[13px] font-semibold text-foreground mb-1">اتجاه الأداء — آخر 8 أسابيع</div>
      <div className="text-[10.5px] text-muted-foreground mb-4">شوف نموك بالعين</div>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-[12px] text-muted-foreground">
          لا توجد بيانات كافية بعد
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Line type="monotone" dataKey="وصول" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="تفاعل" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="متابعون" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SocialTrendChart;