import RiyalIcon from "@/components/ui/RiyalIcon";

interface Props {
  partner: string;
  ownershipPct: number;
  paidShares: number;
  pendingShares: number;
  monthlyShareIncome: number;
  avg3mIncome: number;
  upcomingObligationShares: number;
  byCategory: Record<string, number>;
}

const PartnerShareCard = ({
  partner,
  ownershipPct,
  paidShares,
  pendingShares,
  monthlyShareIncome,
  avg3mIncome,
  upcomingObligationShares,
  byCategory,
}: Props) => {
  const obligationValue = upcomingObligationShares * 1000;
  const net = monthlyShareIncome - obligationValue;
  const recommendation =
    monthlyShareIncome <= 0
      ? { text: "لا يوجد دخل لتوزيعه", color: "text-gray-light", bg: "bg-gray-light/10" }
      : net >= 0
      ? { text: "💰 يستلم نقداً + يغطي الالتزامات", color: "text-success", bg: "bg-success/10" }
      : obligationValue > 0
      ? { text: "🔁 يُخصم من التزاماته القادمة", color: "text-warning", bg: "bg-warning/10" }
      : { text: "💵 يستلم نقداً", color: "text-success", bg: "bg-success/10" };

  return (
    <div className="bg-background rounded-lg p-3 border border-border">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[14px] font-bold text-foreground">{partner}</span>
        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
          {ownershipPct.toFixed(1)}% ملكية
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-surface rounded-md p-2">
          <div className="text-[10px] text-gray-light mb-1">الأسهم المدفوعة</div>
          <div className="text-[16px] font-bold text-foreground">{paidShares}</div>
        </div>
        <div className="bg-surface rounded-md p-2">
          <div className="text-[10px] text-gray-light mb-1">أسهم مؤجلة</div>
          <div className="text-[16px] font-bold text-warning">{pendingShares}</div>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-light">نصيب الشهر الحالي</span>
          <span className="text-foreground font-semibold flex items-center gap-1">
            {monthlyShareIncome.toLocaleString("ar-SA", { maximumFractionDigits: 0 })} <RiyalIcon size={10} />
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-light">متوسط آخر 3 أشهر</span>
          <span className="text-foreground font-medium flex items-center gap-1">
            {avg3mIncome.toLocaleString("ar-SA", { maximumFractionDigits: 0 })} <RiyalIcon size={10} />
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-light">التزامات قادمة</span>
          <span className="text-warning font-medium">{upcomingObligationShares} سهم</span>
        </div>
        <div className="flex justify-between text-[11px] pt-1.5 border-t border-border">
          <span className="text-gray-light">الصافي</span>
          <span className={`font-bold ${net >= 0 ? "text-success" : "text-danger"} flex items-center gap-1`}>
            {net.toLocaleString("ar-SA", { maximumFractionDigits: 0 })} <RiyalIcon size={10} />
          </span>
        </div>
      </div>

      {Object.keys(byCategory).length > 0 && (
        <div className="mb-3 pt-2 border-t border-border">
          <div className="text-[10px] text-gray-light mb-1.5">تفصيل الأسهم حسب البند</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(byCategory).map(([cat, n]) => (
              <span key={cat} className="text-[10px] bg-surface border border-border rounded px-1.5 py-0.5 text-foreground">
                {cat}: <b>{n}</b>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={`${recommendation.bg} rounded-md p-2 text-center`}>
        <span className={`text-[11px] font-semibold ${recommendation.color}`}>{recommendation.text}</span>
      </div>
    </div>
  );
};

export default PartnerShareCard;
