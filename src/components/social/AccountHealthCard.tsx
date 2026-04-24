import { Activity } from "lucide-react";
import { SocialInsight } from "@/hooks/useSocialInsights";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

interface Props {
  insight: SocialInsight | null;
}

const AccountHealthCard = ({ insight }: Props) => {
  if (!insight) return null;

  // حساب نقاط الصحة (0-100)
  const erScore = Math.min((insight.engagement_rate / 6) * 100, 100); // 6%+ ممتاز
  const reachScore = Math.max(0, 50 + (insight.reach_change_pct ?? 0)); // مُرتكز على 50
  const visitScore = insight.reach > 0 ? Math.min(((insight.profile_visits / insight.reach) * 100) * 2, 100) : 0;
  const clickScore = insight.profile_visits > 0 ? Math.min(((insight.link_clicks / insight.profile_visits) * 100) * 5, 100) : 0;

  const overall = Math.round((erScore * 0.35 + reachScore * 0.25 + visitScore * 0.25 + clickScore * 0.15));

  const status =
    overall >= 75 ? { label: "ممتاز", color: "hsl(var(--success))" } :
    overall >= 50 ? { label: "متوسط", color: "hsl(var(--warning))" } :
    overall >= 25 ? { label: "ضعيف", color: "hsl(var(--accent))" } :
    { label: "حرج", color: "hsl(var(--danger))" };

  const data = [{ name: "score", value: overall, fill: status.color }];

  const breakdown = [
    { label: "نسبة التفاعل", score: Math.round(erScore), weight: "35%" },
    { label: "اتجاه الوصول", score: Math.round(reachScore), weight: "25%" },
    { label: "تحويل للزيارة", score: Math.round(visitScore), weight: "25%" },
    { label: "نقرات الرابط", score: Math.round(clickScore), weight: "15%" },
  ];

  return (
    <div className="ios-card animate-fade-in p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-foreground">صحة الحساب</div>
          <div className="text-[10.5px] text-muted-foreground">تقييم شامل من 100 نقطة</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-[140px] h-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "hsl(var(--muted))" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[28px] font-bold text-foreground tabular-nums leading-none">{overall}</div>
            <div className="text-[10px] font-semibold mt-1" style={{ color: status.color }}>{status.label}</div>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {breakdown.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-[10.5px] mb-0.5">
                <span className="text-foreground">{b.label}</span>
                <span className="text-muted-foreground tabular-nums">{b.score}/100</span>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${b.score}%`, background: status.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountHealthCard;
