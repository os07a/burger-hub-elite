import { Sparkles } from "lucide-react";
import { SocialInsight } from "@/hooks/useSocialInsights";

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
          ابدأ بإدخال أرقام الأسبوع من Meta Business Suite لتحصل على ملخص ذكي وتوصيات مبنية على بياناتك.
        </p>
      </div>
    );
  }

  const sales = insight.sales_correlation?.week_sales ?? 0;

  return (
    <div className="ios-card animate-fade-in p-6 bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <span className="text-[12px] text-foreground font-semibold">📈 الملخص الذكي للأسبوع</span>
      </div>
      <p className="text-[15px] leading-relaxed text-foreground">
        {insight.ai_summary || "لا يوجد ملخص بعد — أعد التحليل."}
      </p>
      {sales > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-4 text-[12px] text-muted-foreground">
          <span>💰 مبيعات الأسبوع: <strong className="text-foreground">{sales.toLocaleString()} ر.س</strong></span>
          <span>🎯 كل 1000 وصول = <strong className="text-foreground">{insight.sales_correlation.sar_per_1000_reach ?? 0} ر.س</strong></span>
        </div>
      )}
    </div>
  );
};

export default InsightHeroCard;