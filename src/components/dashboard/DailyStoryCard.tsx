import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { fmt } from "@/lib/format";
import { Sparkles, TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react";

const todayStr = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Riyadh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const todayWeekday = new Intl.DateTimeFormat("ar-SA", {
  timeZone: "Asia/Riyadh",
  weekday: "long",
}).format(new Date());

const AVG_DAILY = 696;
const BANK_BALANCE = 2107;
const BURN_PER_DAY = 1600;

interface DailyRow {
  total_sales: number | null;
  net_sales: number | null;
  orders_count: number | null;
}

const DailyStoryCard = () => {
  const { data: today } = useQuery({
    queryKey: ["daily_sales", todayStr, "story"],
    queryFn: async (): Promise<DailyRow | null> => {
      const { data } = await supabase
        .from("daily_sales")
        .select("total_sales,net_sales,orders_count")
        .eq("date", todayStr)
        .maybeSingle();
      return (data as unknown as DailyRow | null) ?? null;
    },
  });

  const todaySales = Number(today?.net_sales ?? today?.total_sales ?? 0);
  const orders = Number(today?.orders_count ?? 0);
  const diffPct = AVG_DAILY > 0 ? Math.round(((todaySales - AVG_DAILY) / AVG_DAILY) * 100) : 0;
  const above = diffPct >= 0;
  const runwayDays = Math.max(1, Math.round(BANK_BALANCE / Math.max(1, BURN_PER_DAY - AVG_DAILY)));
  const inventoryAlerts = 4;

  const tone: "success" | "warning" | "danger" =
    todaySales >= AVG_DAILY ? "success" : todaySales >= AVG_DAILY * 0.7 ? "warning" : "danger";
  const toneClasses = {
    success: { bg: "bg-success/10", text: "text-success", icon: TrendingUp },
    warning: { bg: "bg-warning/15", text: "text-warning", icon: Sparkles },
    danger: { bg: "bg-danger/10", text: "text-danger", icon: TrendingDown },
  }[tone];
  const Icon = toneClasses.icon;

  let storyText: string;
  if (todaySales === 0) {
    storyText = `اليوم ${todayWeekday}. ما تسجّل دخل بعد — أضف الإيرادات أو شغّل المزامنة من تبويب نظرة عامة لعرض القصة الكاملة.`;
  } else {
    storyText = above
      ? `اليوم ${todayWeekday} — أداء قوي. الإيراد حتى الآن ${fmt(todaySales)} ر.س، أعلى من متوسطك بـ ${diffPct}%. السيولة تكفي ~${runwayDays} يوم، وعندك ${inventoryAlerts} تنبيهات مخزون.`
      : `اليوم ${todayWeekday} — يوم هادئ. الإيراد ${fmt(todaySales)} ر.س، أقل من المتوسط بـ ${Math.abs(diffPct)}%. السيولة تكفي ~${runwayDays} يوم، وعندك ${inventoryAlerts} تنبيهات مخزون.`;
  }

  return (
    <div className="ios-card mb-5">
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-full ${toneClasses.bg} ${toneClasses.text} flex items-center justify-center shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mb-1">📖 قصة اليوم</div>
          <div className="text-[13px] leading-relaxed text-foreground">{storyText}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="rounded-xl bg-background p-3">
          <div className="text-[10px] text-muted-foreground mb-1">دخل اليوم</div>
          <div className={`text-[16px] font-bold ${toneClasses.text} flex items-center gap-1`}>
            {fmt(todaySales)} <RiyalIcon size={10} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{orders} طلب</div>
        </div>
        <div className="rounded-xl bg-background p-3">
          <div className="text-[10px] text-muted-foreground mb-1">مقابل المتوسط</div>
          <div className={`text-[16px] font-bold ${above ? "text-success" : "text-danger"} flex items-center gap-1`}>
            {above ? "+" : ""}{diffPct}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">متوسط {fmt(AVG_DAILY)} ر.س</div>
        </div>
        <div className="rounded-xl bg-background p-3">
          <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
            <Wallet size={10} /> السيولة
          </div>
          <div className="text-[16px] font-bold text-foreground flex items-center gap-1">
            ~{runwayDays} يوم
          </div>
          <div className="text-[10px] text-warning mt-0.5 flex items-center gap-1">
            <AlertTriangle size={10} /> {inventoryAlerts} تنبيهات
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStoryCard;