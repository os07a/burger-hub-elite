import RiyalIcon from "@/components/ui/RiyalIcon";
import { MonthlyIncome, projectCapitalCompletion } from "@/hooks/useIncomeDistribution";
import { fmt } from "@/lib/format";

interface Props {
  incomes: MonthlyIncome[];
  paidShares: number;
  remainingCapital: number;
}

const IncomeDistributionEngine = ({ incomes, paidShares, remainingCapital }: Props) => {
  const current = incomes[incomes.length - 1];
  const avg = incomes.length > 0 ? incomes.reduce((s, i) => s + i.totalRevenue, 0) / incomes.length : 0;
  const projection = projectCapitalCompletion(remainingCapital, avg);

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider">
          محرّك توزيع الدخل
        </div>
        <span className="text-[10px] text-gray-light">كل 1,000 ر = سهم</span>
      </div>

      {!current ? (
        <div className="text-center py-6 text-[11px] text-gray-light">
          لا توجد بيانات مبيعات بعد. سجّل المبيعات اليومية لتشغيل المحرّك.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-background rounded-md p-2.5 text-center">
              <div className="text-[10px] text-gray-light mb-1">دخل الشهر</div>
              <div className="text-[14px] font-bold text-foreground flex items-center justify-center gap-1">
                {fmt(current.totalRevenue)} <RiyalIcon size={10} />
              </div>
            </div>
            <div className="bg-background rounded-md p-2.5 text-center">
              <div className="text-[10px] text-gray-light mb-1">أسهم متولّدة</div>
              <div className="text-[14px] font-bold text-primary">{current.sharesGenerated}</div>
            </div>
            <div className="bg-background rounded-md p-2.5 text-center">
              <div className="text-[10px] text-gray-light mb-1">نصيب السهم</div>
              <div className="text-[14px] font-bold text-success flex items-center justify-center gap-1">
                {fmt(current.perShareAmount)} <RiyalIcon size={10} />
              </div>
            </div>
            <div className="bg-background rounded-md p-2.5 text-center">
              <div className="text-[10px] text-gray-light mb-1">محجوز للشركة</div>
              <div className="text-[14px] font-bold text-warning flex items-center justify-center gap-1">
                {fmt(current.reservedAmount)} <RiyalIcon size={10} />
              </div>
            </div>
          </div>

          <div className="bg-background rounded-md p-3">
            <div className="text-[10px] text-gray-light mb-2">آخر 6 أشهر</div>
            <div className="flex items-end gap-1 h-16">
              {incomes.map((m) => {
                const max = Math.max(...incomes.map((i) => i.totalRevenue), 1);
                const h = (m.totalRevenue / max) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/70 rounded-t transition-all hover:bg-primary"
                      style={{ height: `${h}%` }}
                      title={`${m.month}: ${fmt(m.totalRevenue)} ر`}
                    />
                    <span className="text-[8px] text-gray-light">{m.month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {projection && (
            <div className="mt-3 bg-primary/5 border border-primary/20 rounded-md p-2.5 text-center">
              <span className="text-[11px] text-foreground">
                📈 بمعدل الدخل الحالي يكتمل رأس المال خلال{" "}
                <b className="text-primary">{projection.months} شهر</b> (تقريباً {projection.etaLabel})
              </span>
            </div>
          )}

          <div className="mt-2 text-[10px] text-gray-light text-center">
            الأسهم المدفوعة المعتمدة في الحساب: <b className="text-foreground">{paidShares}</b>
          </div>
        </>
      )}
    </div>
  );
};

export default IncomeDistributionEngine;
