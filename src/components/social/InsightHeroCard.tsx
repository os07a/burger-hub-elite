import { Sparkles, TrendingDown, TrendingUp, AlertTriangle, Music2, Users, Heart } from "lucide-react";
import { SocialInsight } from "@/hooks/useSocialInsights";
import RiyalIcon from "@/components/ui/RiyalIcon";

interface Props {
  insight: SocialInsight | null;
}

const InsightHeroCard = ({ insight }: Props) => {
  if (!insight) {
    return (
      <div className="ios-card animate-fade-in p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[11px] text-muted-foreground font-medium">الملخص الذكي</span>
        </div>
        <p className="text-[14px] text-muted-foreground">
          ابدأ بإدخال أرقام الفترة من Meta Business Suite لتحصل على ملخص ذكي وتوصيات مبنية على بياناتك.
        </p>
      </div>
    );
  }

  const sales = insight.sales_correlation?.week_sales ?? 0;
  const reachDown = (insight.reach_change_pct ?? 0) < -10;
  const reachUp = (insight.reach_change_pct ?? 0) > 10;
  const goodEr = (insight.engagement_rate ?? 0) >= 5;

  // حالة الحساب الذكية
  const status = reachDown && goodEr
    ? { label: "جمهور مخلص لكن وصول ضعيف", color: "warning", icon: AlertTriangle }
    : reachUp
    ? { label: "نمو صحي 🚀", color: "success", icon: TrendingUp }
    : reachDown
    ? { label: "يحتاج تدخل عاجل", color: "danger", icon: TrendingDown }
    : { label: "أداء مستقر", color: "primary", icon: Sparkles };

  const StatusIcon = status.icon;
  const isTikTok = insight.platform === "tiktok";
  const platformLabel =
    insight.platform === "instagram" ? "Instagram" :
    insight.platform === "facebook" ? "Facebook" :
    insight.platform === "tiktok" ? "TikTok" : "كل المنصات";

  return (
    <div className="ios-card animate-fade-in p-6 bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/10">
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-[13px] text-foreground font-semibold">📈 الملخص الذكي</div>
            <div className="text-[10.5px] text-muted-foreground">
              {insight.week_start} {insight.period_end ? `← ${insight.period_end}` : ""} · {platformLabel}
            </div>
          </div>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-${status.color}/10 text-${status.color}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>

      {isTikTok && (
        <div className="mb-4 p-3 rounded-xl bg-foreground/5 border border-border/50">
          <div className="flex items-center gap-2 mb-1.5">
            <Music2 className="w-3.5 h-3.5 text-foreground" />
            <span className="text-[12px] font-bold text-foreground">@hmburgerhm</span>
          </div>
          {insight.bio && (
            <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">{insight.bio}</p>
          )}
          <div className="flex flex-wrap gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 text-foreground">
              <Users className="w-3 h-3 text-primary" />
              <strong>{(insight.total_followers ?? 0).toLocaleString()}</strong>
              <span className="text-muted-foreground">متابع</span>
            </span>
            <span className="inline-flex items-center gap-1 text-foreground">
              <Heart className="w-3 h-3 text-danger" />
              <strong>{(insight.total_likes ?? 0).toLocaleString()}</strong>
              <span className="text-muted-foreground">إعجاب</span>
            </span>
            <span className="inline-flex items-center gap-1 text-foreground">
              <Sparkles className="w-3 h-3 text-accent" />
              <strong>{insight.posts_count}</strong>
              <span className="text-muted-foreground">فيديو</span>
            </span>
          </div>
        </div>
      )}

      <p className="text-[14.5px] leading-relaxed text-foreground">
        {insight.ai_summary || "لا يوجد ملخص بعد — أعد التحليل."}
      </p>

      {sales > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-4 text-[12px] text-muted-foreground flex-wrap">
          <span>💰 مبيعات الفترة: <strong className="text-foreground inline-flex items-center gap-1">{sales.toLocaleString()} <RiyalIcon size={11} /></strong></span>
          <span>🎯 كل 1000 وصول = <strong className="text-foreground inline-flex items-center gap-1">{insight.sales_correlation.sar_per_1000_reach ?? 0} <RiyalIcon size={11} /></strong></span>
        </div>
      )}
    </div>
  );
};

export default InsightHeroCard;
