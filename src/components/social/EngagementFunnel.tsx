import { Eye, PlayCircle, UserPlus, Heart, MousePointerClick } from "lucide-react";
import { SocialInsight } from "@/hooks/useSocialInsights";

interface Props {
  insight: SocialInsight | null;
}

const EngagementFunnel = ({ insight }: Props) => {
  if (!insight) return null;

  const views = insight.views || insight.impressions || 0;
  const reach = insight.reach || 0;
  const visits = insight.profile_visits || 0;
  const interactions = insight.content_interactions || 0;
  const clicks = insight.link_clicks || 0;

  const max = Math.max(views, 1);

  const stages = [
    { label: "المشاهدات", value: views, icon: PlayCircle, color: "bg-accent", textColor: "text-accent", desc: "كم مرة عُرض المحتوى" },
    { label: "الوصول", value: reach, icon: Eye, color: "bg-primary", textColor: "text-primary", desc: "كم شخص فريد شافه" },
    { label: "زاروا الملف", value: visits, icon: UserPlus, color: "bg-success", textColor: "text-success", desc: "اهتموا وفتحوا البروفايل" },
    { label: "تفاعلوا", value: interactions, icon: Heart, color: "bg-warning", textColor: "text-warning", desc: "أعجبهم المحتوى" },
    { label: "نقروا الرابط", value: clicks, icon: MousePointerClick, color: "bg-danger", textColor: "text-danger", desc: "اتخذوا إجراء" },
  ];

  return (
    <div className="ios-card animate-fade-in p-6">
      <div className="mb-1 text-[13px] font-semibold text-foreground">🔻 قمع التفاعل (Funnel)</div>
      <div className="text-[10.5px] text-muted-foreground mb-5">شوف وين يضيع جمهورك في كل مرحلة</div>

      <div className="space-y-2.5">
        {stages.map((s, i) => {
          const widthPct = Math.max((s.value / max) * 100, 4);
          const prev = i > 0 ? stages[i - 1].value : 0;
          const dropPct = i > 0 && prev > 0 ? ((prev - s.value) / prev) * 100 : 0;
          const Icon = s.icon;

          return (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1 text-[11.5px]">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Icon className={`w-3.5 h-3.5 ${s.textColor}`} />
                  {s.label}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-bold tabular-nums">{s.value.toLocaleString()}</span>
                  {i > 0 && dropPct > 0 && (
                    <span className="text-[10px] text-danger font-medium">↓ {dropPct.toFixed(0)}%</span>
                  )}
                </div>
              </div>
              <div className="relative h-7 bg-muted/40 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${s.color} transition-all duration-700 flex items-center px-2.5`}
                  style={{ width: `${widthPct}%` }}
                >
                  <span className="text-[9.5px] text-primary-foreground/90 font-medium truncate">{s.desc}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-border/50 grid grid-cols-2 gap-3 text-[11px]">
        <div className="p-2.5 rounded-lg bg-muted/40">
          <div className="text-muted-foreground text-[10px] mb-0.5">معدل التحويل لزيارة</div>
          <div className="text-foreground font-bold">
            {reach > 0 ? ((visits / reach) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-[9.5px] text-muted-foreground mt-0.5">من شاف → دخل البروفايل</div>
        </div>
        <div className="p-2.5 rounded-lg bg-muted/40">
          <div className="text-muted-foreground text-[10px] mb-0.5">معدل النقر للرابط</div>
          <div className="text-foreground font-bold">
            {visits > 0 ? ((clicks / visits) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-[9.5px] text-muted-foreground mt-0.5">من زار → ضغط الرابط</div>
        </div>
      </div>
    </div>
  );
};

export default EngagementFunnel;
