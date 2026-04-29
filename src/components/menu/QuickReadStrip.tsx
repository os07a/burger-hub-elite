import { useMemo } from "react";
import type { MenuEngineeringResult } from "@/hooks/useMenuEngineering";
import { Star, AlertTriangle, Sparkles, Link2Off, Ban, type LucideIcon } from "lucide-react";

type Tone = "positive" | "negative" | "neutral";
type Insight = {
  key: string;
  tone: Tone;
  icon: LucideIcon;
  title: string;
  body: string;
  cta?: { label: string; onClick: () => void };
};

const TONE: Record<Tone, { bar: string; icon: string }> = {
  positive: { bar: "bg-success", icon: "text-success" },
  negative: { bar: "bg-danger", icon: "text-danger" },
  neutral:  { bar: "bg-border", icon: "text-muted-foreground" },
};

interface Props {
  data: MenuEngineeringResult;
  onOpenUnmatched: () => void;
}

const fmtMoney = (n: number) => `${Math.round(n).toLocaleString("ar-SA")} ر.س`;
const fmtPct = (n: number | null | undefined) => {
  if (n == null || !isFinite(n)) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(0)}%`;
};

const QuickReadStrip = ({ data, onOpenUnmatched }: Props) => {
  const insights = useMemo<Insight[]>(() => {
    const out: Insight[] = [];
    const sold = data.items.filter((i) => i.units_sold > 0);

    if (sold.length === 0 && data.unmatched.length === 0) {
      out.push({
        key: "empty", tone: "neutral", icon: Ban,
        title: "لا توجد مبيعات في هذه الفترة",
        body: "اضغط زر المزامنة لجلب آخر بيانات الكاشير، أو غيّر نطاق الفترة.",
      });
      return out;
    }

    // Priority 1: unmatched (most actionable)
    if (data.unmatched.length > 0) {
      out.push({
        key: "unmatched", tone: "negative", icon: Link2Off,
        title: `${data.unmatched.length} صنف من الكاشير غير مربوط`,
        body: `بقيمة ${fmtMoney(data.unmatched_total_revenue)} لا تظهر في التحليل. اربطها لقراءة كاملة.`,
        cta: { label: "ربط الأصناف الآن", onClick: onOpenUnmatched },
      });
    }

    // Priority 2: top star
    const topStar = [...sold].sort((a, b) => b.total_margin - a.total_margin)[0];
    if (topStar && out.length < 3) {
      out.push({
        key: "star", tone: "positive", icon: Star,
        title: `النجم الأول: ${topStar.name}`,
        body: `${topStar.units_sold} وحدة · هامش ${fmtMoney(topStar.total_margin)} (${topStar.margin_pct.toFixed(0)}%).`,
      });
    }

    // Priority 3: sharpest decline OR opportunity
    const decliner = sold
      .filter((i) => i.units_change_pct != null && i.units_change_pct < -20 && i.prev_units_sold > 1)
      .sort((a, b) => (a.units_change_pct ?? 0) - (b.units_change_pct ?? 0))[0];
    if (decliner && out.length < 3) {
      out.push({
        key: "decline", tone: "negative", icon: AlertTriangle,
        title: `تراجع: ${decliner.name}`,
        body: `${fmtPct(decliner.units_change_pct)} مقارنة بالفترة السابقة (${decliner.prev_units_sold} → ${decliner.units_sold}).`,
      });
    } else if (out.length < 3) {
      const opportunity = sold
        .filter((i) => i.margin_pct >= 55 && i.popularity_index < 0.7)
        .sort((a, b) => b.margin_pct - a.margin_pct)[0];
      if (opportunity) {
        out.push({
          key: "opportunity", tone: "neutral", icon: Sparkles,
          title: `فرصة: ${opportunity.name}`,
          body: `هامشه ${opportunity.margin_pct.toFixed(0)}% لكن مبيعاته أقل من المتوسط — يستحق الترويج.`,
        });
      }
    }

    return out.slice(0, 3);
  }, [data, onOpenUnmatched]);

  if (insights.length === 0) return null;

  return (
    <div className="ios-card mb-6" dir="rtl">
      <div className="text-[12px] font-bold text-foreground mb-3">ما يستحق انتباهك الآن</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {insights.map((ins) => {
          const t = TONE[ins.tone];
          const Icon = ins.icon;
          return (
            <div key={ins.key} className="bg-muted/20 rounded-xl p-3 flex items-start gap-2.5 relative overflow-hidden">
              <div className={`absolute right-0 top-0 bottom-0 w-[2px] ${t.bar}`} />
              <div className={`${t.icon} mt-0.5 shrink-0`}><Icon size={14} /></div>
              <div className="flex-1 min-w-0">
                <div className="text-foreground text-[12px] font-bold leading-tight mb-1">{ins.title}</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">{ins.body}</div>
                {ins.cta && (
                  <button
                    onClick={ins.cta.onClick}
                    className="mt-2 text-[11px] font-semibold text-foreground hover:text-primary"
                  >
                    {ins.cta.label} ←
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickReadStrip;
