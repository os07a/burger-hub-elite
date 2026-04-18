import { ShareMilestone, computeMilestoneState } from "@/hooks/useShareMilestones";
import { fmt } from "@/lib/format";

interface Props {
  initialAchieved: number; // 70 done previously
  reservedShares: number; // 16 committed
  milestones: ShareMilestone[];
}

const stateBadge = {
  met: { label: "✅ مكتمل", cls: "text-success bg-success/10 border-success/30" },
  upcoming: { label: "⏳ قادم", cls: "text-primary bg-primary/10 border-primary/30" },
  overdue: { label: "⚠️ متأخر", cls: "text-danger bg-danger/10 border-danger/30" },
};

const ShareTimelineTable = ({ initialAchieved, reservedShares, milestones }: Props) => {
  return (
    <div className="bg-surface border rounded-lg p-4 border-r-[3px] border-r-primary border-gray-50">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">
        الجدول الزمني للأسهم
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right py-2 font-semibold text-gray-light">التاريخ</th>
              <th className="text-right py-2 font-semibold text-gray-light">الأسهم</th>
              <th className="text-right py-2 font-semibold text-gray-light">القيمة</th>
              <th className="text-right py-2 font-semibold text-gray-light">الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 text-foreground font-medium">تم سابقاً</td>
              <td className="py-2 text-foreground">{initialAchieved}</td>
              <td className="py-2 text-foreground">{fmt(initialAchieved * 1000)} ر</td>
              <td className="py-2">
                <span className="text-[10px] px-2 py-0.5 rounded-md border text-success bg-success/10 border-success/30">✅ محقق</span>
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 text-foreground font-medium">ملتزم به (إشراف+تغذية)</td>
              <td className="py-2 text-foreground">{reservedShares}</td>
              <td className="py-2 text-foreground">{fmt(reservedShares * 1000)} ر</td>
              <td className="py-2">
                <span className="text-[10px] px-2 py-0.5 rounded-md border text-primary bg-primary/10 border-primary/30">📌 محجوز</span>
              </td>
            </tr>
            {milestones.map((m) => {
              const st = computeMilestoneState(m);
              const b = stateBadge[st];
              return (
                <tr key={m.id} className="border-b border-border/50 last:border-b-0">
                  <td className="py-2 text-foreground font-medium">
                    {new Date(m.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </td>
                  <td className="py-2 text-foreground">{m.shares_required}</td>
                  <td className="py-2 text-foreground">{fmt(m.shares_required * 1000)} ر</td>
                  <td className="py-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border ${b.cls}`}>{b.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShareTimelineTable;
