import { Eye, Heart, UserPlus, MousePointerClick, PlayCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SocialInsight } from "@/hooks/useSocialInsights";
import { useRipple } from "@/hooks/use-ripple";

interface Props {
  insight: SocialInsight | null;
}

const ChangeBadge = ({ pct }: { pct: number }) => {
  if (!pct) return <span className="text-[10px] text-muted-foreground font-medium">— 0%</span>;
  const positive = pct > 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md ${
        positive ? "bg-success/10 text-success" : "bg-danger-bg text-danger"
      }`}
    >
      <Icon className="w-3 h-3" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
};

const Card = ({
  icon: Icon,
  label,
  value,
  hint,
  color,
  changePct,
}: {
  icon: any;
  label: string;
  value: string;
  hint: string;
  color: string;
  changePct?: number;
}) => {
  const { containerRef, handleMouseEnter } = useRipple();
  return (
    <div ref={containerRef} onMouseEnter={handleMouseEnter} className="ios-card ripple-container animate-fade-in p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        {changePct !== undefined && <ChangeBadge pct={changePct} />}
      </div>
      <div className="text-[11px] text-muted-foreground mb-1.5 font-medium">{label}</div>
      <div className="text-[24px] font-bold text-foreground tracking-tight">{value}</div>
      <div className="text-[10.5px] text-muted-foreground mt-2 leading-relaxed">{hint}</div>
    </div>
  );
};

const SocialKpiGrid = ({ insight }: Props) => {
  const reach = insight?.reach ?? 0;
  const views = insight?.views ?? insight?.impressions ?? 0;
  const visits = insight?.profile_visits ?? 0;
  const interactions = insight?.content_interactions ?? 0;
  const linkClicks = insight?.link_clicks ?? 0;
  const er = insight?.engagement_rate ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        icon={Eye}
        label="👁️ الوصول (Reach)"
        value={reach.toLocaleString()}
        hint="كم شخص فريد شاف منشوراتك"
        color="bg-primary/10 text-primary"
        changePct={insight?.reach_change_pct ?? 0}
      />
      <Card
        icon={PlayCircle}
        label="📺 المشاهدات (Views)"
        value={views.toLocaleString()}
        hint="إجمالي مرات عرض المحتوى (تشمل الإعادة)"
        color="bg-accent/10 text-accent"
        changePct={insight?.views_change_pct ?? 0}
      />
      <Card
        icon={UserPlus}
        label="👤 زيارات الملف"
        value={visits.toLocaleString()}
        hint="كم شخص دخل بروفايلك"
        color="bg-success/10 text-success"
        changePct={insight?.visits_change_pct ?? 0}
      />
      <Card
        icon={Heart}
        label="❤️ التفاعلات"
        value={interactions.toLocaleString()}
        hint="لايك + تعليق + حفظ + مشاركة"
        color="bg-warning/10 text-warning"
        changePct={insight?.interactions_change_pct ?? 0}
      />
      <Card
        icon={MousePointerClick}
        label="🔗 نقرات الرابط"
        value={linkClicks.toLocaleString()}
        hint="كم واحد ضغط على رابط البايو"
        color="bg-primary/10 text-primary"
        changePct={insight?.link_clicks_change_pct ?? 0}
      />
      <Card
        icon={Heart}
        label="💎 نسبة التفاعل"
        value={`${er}%`}
        hint="جودة جمهورك (تفاعلات ÷ وصول)"
        color="bg-success/10 text-success"
      />
    </div>
  );
};

export default SocialKpiGrid;
