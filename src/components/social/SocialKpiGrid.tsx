import { Eye, Heart, UserPlus, Clock } from "lucide-react";
import { SocialInsight } from "@/hooks/useSocialInsights";
import { useRipple } from "@/hooks/use-ripple";

interface Props {
  insight: SocialInsight | null;
}

const Card = ({ icon: Icon, label, value, hint, color }: any) => {
  const { containerRef, handleMouseEnter } = useRipple();
  return (
    <div ref={containerRef} onMouseEnter={handleMouseEnter} className="ios-card ripple-container animate-fade-in p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground mb-1.5 font-medium">{label}</div>
      <div className="text-[24px] font-bold text-foreground tracking-tight">{value}</div>
      <div className="text-[10.5px] text-muted-foreground mt-2 leading-relaxed">{hint}</div>
    </div>
  );
};

const SocialKpiGrid = ({ insight }: Props) => {
  const reach = insight?.reach ?? 0;
  const er = insight?.engagement_rate ?? 0;
  const newF = insight?.new_followers ?? 0;
  const best = insight?.best_post_time || "—";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card icon={Eye} label="👁️ الوصول (Reach)" value={reach.toLocaleString()} hint="كم شخص شاف منشوراتك هذا الأسبوع" color="bg-primary/10 text-primary" />
      <Card icon={Heart} label="❤️ نسبة التفاعل" value={`${er}%`} hint="نسبة الناس اللي ضغطت لايك أو علقت" color="bg-success/10 text-success" />
      <Card icon={UserPlus} label="👥 متابعون جدد" value={`+${newF}`} hint="كم واحد جديد تابعك هذا الأسبوع" color="bg-accent/10 text-accent" />
      <Card icon={Clock} label="🔥 أفضل وقت نشر" value={best} hint="متى ينشط جمهورك أكثر" color="bg-warning/10 text-warning" />
    </div>
  );
};

export default SocialKpiGrid;