import { TrendingUp } from "lucide-react";
import { SocialInsight } from "@/hooks/useSocialInsights";
import RiyalIcon from "@/components/ui/RiyalIcon";

interface Props {
  insights: SocialInsight[];
}

const SalesCorrelationCard = ({ insights }: Props) => {
  const last4 = insights.slice(0, 4).reverse();

  const maxReach = Math.max(...last4.map(i => i.reach), 1);
  const maxSales = Math.max(...last4.map(i => i.sales_correlation?.week_sales ?? 0), 1);

  const avgRatio = last4.length
    ? Math.round(last4.reduce((s, i) => s + (i.sales_correlation?.sar_per_1000_reach ?? 0), 0) / last4.length)
    : 0;

  return (
    <div className="ios-card animate-fade-in p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-success" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-foreground">ربط السوشل بالمبيعات</div>
          <div className="text-[10.5px] text-muted-foreground">آخر 4 أسابيع — كل عمود يقارن الوصول بالمبيعات</div>
        </div>
      </div>

      {last4.length === 0 ? (
        <p className="text-[13px] text-muted-foreground text-center py-8">لا توجد بيانات كافية بعد</p>
      ) : (
        <>
          <div className="flex items-end gap-3 h-32 mb-3">
            {last4.map((i) => {
              const sales = i.sales_correlation?.week_sales ?? 0;
              return (
                <div key={i.id} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end h-24">
                    <div className="flex-1 bg-primary/70 rounded-t" style={{ height: `${(i.reach / maxReach) * 100}%` }} title={`Reach: ${i.reach}`} />
                    <div className="flex-1 bg-success/70 rounded-t" style={{ height: `${(sales / maxSales) * 100}%` }} title={`Sales: ${sales}`} />
                  </div>
                  <div className="text-[9px] text-muted-foreground">{i.week_start.slice(5)}</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-[10.5px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-primary/70" /> الوصول</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-success/70" /> المبيعات</span>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 text-[12px] text-foreground">
            💡 في المتوسط: كل <strong>1000 وصول</strong> = <strong className="inline-flex items-center gap-1">{avgRatio} <RiyalIcon size={11} /></strong> مبيعات إضافية
          </div>
        </>
      )}
    </div>
  );
};

export default SalesCorrelationCard;