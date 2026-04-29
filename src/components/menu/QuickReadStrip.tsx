import { useMemo } from "react";
import type { MenuEngineeringResult } from "@/hooks/useMenuEngineering";
import { Star, AlertTriangle, Sparkles, Link2Off, Ban } from "lucide-react";

type Insight = {
  key: string;
  tone: "success" | "warning" | "info" | "danger" | "neutral";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
  cta?: { label: string; onClick: () => void };
};

const TONE: Record<Insight["tone"], { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: "bg-success/5", border: "border-success/30", text: "text-foreground", icon: "text-success" },
  warning: { bg: "bg-warning/5", border: "border-warning/30", text: "text-foreground", icon: "text-warning" },
  info:    { bg: "bg-primary/5", border: "border-primary/30", text: "text-foreground", icon: "text-primary" },
  danger:  { bg: "bg-danger/5", border: "border-danger/30", text: "text-foreground", icon: "text-danger" },
  neutral: { bg: "bg-muted/30", border: "border-border", text: "text-foreground", icon: "text-muted-foreground" },
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
        key: "empty",
        tone: "neutral",
        icon: Ban,
        title: "لا توجد مبيعات في هذه الفترة",
        body: "اضغط زر المزامنة لجلب آخر بيانات الكاشير، أو غيّر نطاق الفترة.",
      });
      return out;
    }

    // 1) Top star
    const topStar = [...sold].sort((a, b) => b.total_margin - a.total_margin)[0];
    if (topStar) {
      out.push({
        key: "star",
        tone: "success",
        icon: Star,
        title: `النجم الأول: ${topStar.name}`,
        body: `${topStar.units_sold} وحدة · هامش ${fmtMoney(topStar.total_margin)} (${topStar.margin_pct.toFixed(0)}%) — حافظ على توفّره وادفعه للواجهة.`,
      });
    }

    // 2) Sharpest decline
    const decliner = sold
      .filter((i) => i.units_change_pct != null && i.units_change_pct < -20 && i.prev_units_sold > 1)
      .sort((a, b) => (a.units_change_pct ?? 0) - (b.units_change_pct ?? 0))[0];
    if (decliner) {
      out.push({
        key: "decline",
        tone: "warning",
        icon: AlertTriangle,
        title: `تراجع: ${decliner.name}`,
        body: `مبيعاته نزلت ${fmtPct(decliner.units_change_pct)} مقارنة بالفترة السابقة (${decliner.prev_units_sold} → ${decliner.units_sold}). راجع الجودة أو السعر أو الترويج.`,
      });
    }

    // 3) Hidden opportunity (puzzle: high margin %, low popularity)
    const opportunity = sold
      .filter((i) => i.margin_pct >= 55 && i.popularity_index < 0.7)
      .sort((a, b) => b.margin_pct - a.margin_pct)[0];
    if (opportunity) {
      out.push({
        key: "opportunity",
        tone: "info",
        icon: Sparkles,
        title: `فرصة: ${opportunity.name}`,
        body: `هامشه ${opportunity.margin_pct.toFixed(0)}% لكن مبيعاته أقل من المتوسط — يستحق الترويج والتموضع في المنيو.`,
      });
    }

    // 4) Unmatched items — most actionable issue
    if (data.unmatched.length > 0) {
      out.push({
        key: "unmatched",
        tone: "danger",
        icon: Link2Off,
        title: `${data.unmatched.length} صنف من الكاشير غير مربوط`,
        body: `بقيمة ${fmtMoney(data.unmatched_total_revenue)} و${data.unmatched.reduce((s, i) => s + i.units_sold, 0)} وحدة لا تظهر في تحليل المنيو. اربطها لتحصل على قراءة كاملة.`,
        cta: { label: "ربط الأصناف الآن", onClick: onOpenUnmatched },
      });
    }

    // 5) Active dead products
    const dead = data.items.filter((i) => i.units_sold === 0);
    if (dead.length > 0 && out.length < 5) {
      out.push({
        key: "dead",
        tone: "neutral",
        icon: Ban,
        title: `${dead.length} منتج بدون مبيعات`,
        body: `لم تُبَع أي وحدة في آخر ${data.period_days} يوم. فكّر في إعادة تصميمها أو إزالتها.`,
      });
    }

    return out.slice(0, 5);
  }, [data, onOpenUnmatched]);

  if (insights.length === 0) return null;

  return (
    <div className="ios-card mb-6" dir="rtl">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-primary" />
        <div className="text-[13px] font-bold text-foreground">قراءة سريعة</div>
        <div className="text-[10px] text-muted-foreground">— رؤى محسوبة فوراً من بياناتك</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {insights.map((ins) => {
          const t = TONE[ins.tone];
          const Icon = ins.icon;
          return (
            <div key={ins.key} className={`${t.bg} ${t.border} border rounded-xl p-3 flex items-start gap-2.5`}>
              <div className={`${t.icon} mt-0.5 shrink-0`}><Icon size={14} /></div>
              <div className="flex-1 min-w-0">
                <div className={`${t.text} text-[12px] font-bold leading-tight mb-1`}>{ins.title}</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">{ins.body}</div>
                {ins.cta && (
                  <button
                    onClick={ins.cta.onClick}
                    className={`mt-2 text-[11px] font-semibold ${t.icon} hover:underline`}
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