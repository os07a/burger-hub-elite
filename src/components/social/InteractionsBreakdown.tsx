import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Heart } from "lucide-react";
import { SocialInsight, SocialPost } from "@/hooks/useSocialInsights";

interface Props {
  insight: SocialInsight | null;
  posts: SocialPost[];
}

const InteractionsBreakdown = ({ insight, posts }: Props) => {
  if (!insight) return null;

  // إذا فيه منشورات، اجمع التفاصيل من المنشورات
  let likes = 0, comments = 0, shares = 0, saves = 0;
  if (posts.length > 0) {
    posts.forEach(p => {
      likes += p.likes || 0;
      comments += p.comments || 0;
      shares += p.shares || 0;
      saves += p.saves || 0;
    });
  } else {
    // fallback: قسّم التفاعلات الكلية بنسب تقريبية معروفة لـ Instagram
    const total = insight.content_interactions || 0;
    likes = Math.round(total * 0.70);
    comments = Math.round(total * 0.15);
    saves = Math.round(total * 0.10);
    shares = total - likes - comments - saves;
  }

  const data = [
    { name: "❤️ لايك", value: likes, color: "hsl(var(--danger))" },
    { name: "💬 تعليق", value: comments, color: "hsl(var(--accent))" },
    { name: "🔖 حفظ", value: saves, color: "hsl(var(--warning))" },
    { name: "🔄 مشاركة", value: shares, color: "hsl(var(--success))" },
  ].filter(d => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);
  const isEstimated = posts.length === 0;

  return (
    <div className="ios-card animate-fade-in p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-danger-bg flex items-center justify-center">
          <Heart className="w-4 h-4 text-danger" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-foreground">تفصيل التفاعلات</div>
          <div className="text-[10.5px] text-muted-foreground">
            {isEstimated ? "تقدير ذكي بنسب Instagram المعتادة" : "من بيانات المنشورات الفعلية"}
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="h-48 flex items-center justify-center text-[12px] text-muted-foreground">
          لا توجد تفاعلات في هذه الفترة
        </div>
      ) : (
        <div className="flex items-center gap-4 mt-3">
          <div className="w-[140px] h-[140px] flex-shrink-0 relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={42} outerRadius={62} paddingAngle={3}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-[20px] font-bold text-foreground tabular-nums leading-none">{total}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">تفاعل</div>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            {data.map(d => (
              <div key={d.name} className="flex items-center justify-between text-[11.5px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded" style={{ background: d.color }} />
                  <span className="text-foreground">{d.name}</span>
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {d.value} <span className="text-[9.5px]">({total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionsBreakdown;
