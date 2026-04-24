import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from "recharts";
import { TrendingUp } from "lucide-react";
import { SocialInsight } from "@/hooks/useSocialInsights";

interface Props {
  insights: SocialInsight[];
}

const SocialTrendChart = ({ insights }: Props) => {
  // إذا فيه أكثر من فترة، اعرض trend زمني
  if (insights.length > 1) {
    const data = [...insights].slice(0, 8).reverse().map(i => ({
      week: i.week_start.slice(5),
      وصول: i.reach,
      مشاهدات: i.views || i.impressions,
      تفاعلات: i.content_interactions,
    }));

    return (
      <div className="ios-card animate-fade-in p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-foreground">اتجاه الأداء</div>
            <div className="text-[10.5px] text-muted-foreground">آخر {Math.min(insights.length, 8)} فترات</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 20, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "11px" }} />
            <Bar dataKey="وصول" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            <Bar dataKey="مشاهدات" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            <Bar dataKey="تفاعلات" fill="hsl(var(--warning))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // فترة واحدة فقط: اعرض مقارنة "قبل vs الآن" مستنتجة من نسب التغير
  const i = insights[0];
  if (!i) {
    return (
      <div className="ios-card animate-fade-in p-6">
        <div className="text-[13px] font-semibold text-foreground mb-1">اتجاه الأداء</div>
        <div className="h-48 flex items-center justify-center text-[12px] text-muted-foreground">
          لا توجد بيانات بعد
        </div>
      </div>
    );
  }

  const previous = (current: number, changePct: number) =>
    changePct === 0 ? current : Math.round(current / (1 + changePct / 100));

  const data = [
    { metric: "الوصول", "الفترة السابقة": previous(i.reach, i.reach_change_pct ?? 0), "الفترة الحالية": i.reach },
    { metric: "المشاهدات", "الفترة السابقة": previous(i.views || i.impressions, i.views_change_pct ?? 0), "الفترة الحالية": i.views || i.impressions },
    { metric: "زيارات", "الفترة السابقة": previous(i.profile_visits, i.visits_change_pct ?? 0), "الفترة الحالية": i.profile_visits },
    { metric: "تفاعلات", "الفترة السابقة": previous(i.content_interactions, i.interactions_change_pct ?? 0), "الفترة الحالية": i.content_interactions },
  ];

  return (
    <div className="ios-card animate-fade-in p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-foreground">المقارنة مع الفترة السابقة</div>
          <div className="text-[10.5px] text-muted-foreground">شوف وين تراجعت ووين تحسنت</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 24, right: 5, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={10} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "11px" }} />
          <Bar dataKey="الفترة السابقة" fill="hsl(var(--muted-foreground) / 0.4)" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="الفترة السابقة" position="top" style={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
          </Bar>
          <Bar dataKey="الفترة الحالية" radius={[6, 6, 0, 0]}>
            {data.map((d, idx) => (
              <Cell key={idx} fill={d["الفترة الحالية"] >= d["الفترة السابقة"] ? "hsl(var(--success))" : "hsl(var(--danger))"} />
            ))}
            <LabelList dataKey="الفترة الحالية" position="top" style={{ fontSize: 9, fill: "hsl(var(--foreground))", fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground justify-center">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-muted-foreground/40" /> قبل</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-success" /> تحسّن</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-danger" /> تراجع</span>
      </div>
    </div>
  );
};

export default SocialTrendChart;
