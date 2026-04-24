import { Eye, PlayCircle, UserPlus, Heart, MousePointerClick, Filter, Info, Lightbulb } from "lucide-react";
import { SocialInsight } from "@/hooks/useSocialInsights";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const stages = [
    { key: "views", label: "المشاهدات", value: views, icon: PlayCircle, desc: "كم مرة عُرض المحتوى" },
    { key: "reach", label: "الوصول", value: reach, icon: Eye, desc: "كم شخص فريد شافه" },
    { key: "visits", label: "زيارات الملف", value: visits, icon: UserPlus, desc: "فتحوا البروفايل" },
    { key: "interactions", label: "التفاعلات", value: interactions, icon: Heart, desc: "أعجبهم المحتوى" },
    { key: "clicks", label: "نقرات الرابط", value: clicks, icon: MousePointerClick, desc: "اتخذوا إجراء" },
  ];

  const max = Math.max(...stages.map((s) => s.value), 1);

  // Compute biggest drop for smart insight
  let biggestDrop = { from: "", to: "", pct: 0, fromValue: 0, toValue: 0 };
  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1].value;
    const curr = stages[i].value;
    if (prev > 0 && curr < prev) {
      const dropPct = ((prev - curr) / prev) * 100;
      if (dropPct > biggestDrop.pct) {
        biggestDrop = {
          from: stages[i - 1].label,
          to: stages[i].label,
          pct: dropPct,
          fromValue: prev,
          toValue: curr,
        };
      }
    }
  }

  const smartTip = (() => {
    if (biggestDrop.from === "المشاهدات" && biggestDrop.to === "الوصول") {
      return "جرّب Reels لكسر الخوارزمية وزيادة الوصول لجمهور جديد.";
    }
    if (biggestDrop.to === "زيارات الملف") {
      return "حسّن البايو والصورة الشخصية — هي أول انطباع بعد المنشور.";
    }
    if (biggestDrop.to === "التفاعلات") {
      return "اطرح أسئلة في النص أو استخدم استكرات تفاعلية في القصص.";
    }
    if (biggestDrop.to === "نقرات الرابط") {
      return "ضيف Call-to-Action واضح ورابط مباشر في البايو.";
    }
    return "ركّز على المرحلة اللي فيها أكبر تسرب لتحسين القمع.";
  })();

  const visitConversion = reach > 0 ? (visits / reach) * 100 : 0;
  const clickConversion = visits > 0 ? (clicks / visits) * 100 : 0;

  return (
    <div className="ios-card animate-fade-in p-6">
      <div className="flex items-center gap-2 mb-1">
        <Filter className="w-4 h-4 text-primary" />
        <div className="text-[13px] font-semibold text-foreground">قمع التفاعل</div>
      </div>
      <div className="text-[10.5px] text-muted-foreground mb-5">شوف وين يضيع جمهورك في كل مرحلة</div>

      <div className="space-y-4">
        {stages.map((s, i) => {
          const widthPct = Math.max((s.value / max) * 100, 6);
          const prev = i > 0 ? stages[i - 1].value : 0;
          const dropPct = i > 0 && prev > 0 && s.value < prev ? ((prev - s.value) / prev) * 100 : 0;
          const Icon = s.icon;
          // Gradient from gold (top) to crimson (bottom) for flow feel
          const opacity = 1 - i * 0.12;

          return (
            <div key={s.key}>
              {/* Header row: icon + label + value + drop badge */}
              <div className="flex items-center justify-between mb-1.5 text-[12px]">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {s.label}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-bold tabular-nums text-[13px]">
                    {s.value.toLocaleString()}
                  </span>
                  {dropPct > 0 && (
                    <span className="text-[9.5px] text-danger font-semibold bg-danger/10 px-1.5 py-0.5 rounded-md">
                      ↓ {dropPct.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Clean bar — no text inside */}
              <div className="relative h-2.5 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, hsl(var(--primary) / ${opacity}), hsl(var(--accent) / ${opacity}))`,
                  }}
                />
              </div>

              {/* Description below the bar */}
              <div className="mt-1 text-[10px] text-muted-foreground">{s.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Smart insight */}
      {biggestDrop.pct > 0 && (
        <div className="mt-5 p-3 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold text-foreground">أكبر تسرب: </span>
            <span className="text-muted-foreground">
              {biggestDrop.pct.toFixed(0)}% بين {biggestDrop.from} و{biggestDrop.to} (
              {biggestDrop.fromValue.toLocaleString()} → {biggestDrop.toValue.toLocaleString()}). {smartTip}
            </span>
          </div>
        </div>
      )}

      {/* Conversion rates */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
        <div className="p-2.5 rounded-lg bg-muted/40">
          <div className="flex items-center gap-1 text-muted-foreground text-[10px] mb-0.5">
            معدل تحويل لزيارة
            {visitConversion > 100 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-[10.5px]">
                    أكثر من 100% طبيعي في Meta — زيارات الملف تُحسب من فترات أطول من الوصول.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="text-foreground font-bold">{visitConversion.toFixed(1)}%</div>
          <div className="text-[9.5px] text-muted-foreground mt-0.5">من شاف → دخل البروفايل</div>
        </div>

        {clicks > 0 ? (
          <div className="p-2.5 rounded-lg bg-muted/40">
            <div className="text-muted-foreground text-[10px] mb-0.5">معدل النقر للرابط</div>
            <div className="text-foreground font-bold">{clickConversion.toFixed(1)}%</div>
            <div className="text-[9.5px] text-muted-foreground mt-0.5">من زار → ضغط الرابط</div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-1 text-accent text-[10px] mb-0.5 font-semibold">
              <Lightbulb className="w-3 h-3" /> اقتراح
            </div>
            <div className="text-foreground font-semibold text-[11px]">ضيف رابط في البايو</div>
            <div className="text-[9.5px] text-muted-foreground mt-0.5">عشان تقيس النقرات الفعلية</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngagementFunnel;
