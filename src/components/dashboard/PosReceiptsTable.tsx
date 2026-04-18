import { usePosReceipts } from "@/hooks/usePosReceipts";
import RiyalIcon from "@/components/ui/RiyalIcon";
import StatusBadge from "@/components/ui/StatusBadge";

interface PosReceiptsTableProps {
  date: string;
}

const PosReceiptsTable = ({ date }: PosReceiptsTableProps) => {
  const { data: receipts, isLoading } = usePosReceipts(date, 20);

  return (
    <div className="ios-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-medium text-muted-foreground">
          🧾 إيصالات اليوم من الكاشير
        </div>
        <div className="text-[10px] text-gray-light">
          {receipts?.length ?? 0} إيصال
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-[12px] text-muted-foreground">
          جاري التحميل...
        </div>
      ) : !receipts || receipts.length === 0 ? (
        <div className="text-center py-6 text-[12px] text-muted-foreground">
          لا توجد إيصالات لهذا اليوم — اضغط "مزامنة من الكاشير"
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-muted-foreground text-[10px]">
                <th className="text-right py-2 font-medium">رقم الإيصال</th>
                <th className="text-right py-2 font-medium">الوقت</th>
                <th className="text-right py-2 font-medium">النوع</th>
                <th className="text-left py-2 font-medium">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => {
                const isRefund = r.receipt_type === "REFUND";
                const time = r.created_at_pos
                  ? new Date(r.created_at_pos).toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-";
                return (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                    <td className="py-2.5 font-semibold text-foreground">{r.receipt_number}</td>
                    <td className="py-2.5 text-muted-foreground">{time}</td>
                    <td className="py-2.5">
                      <StatusBadge variant={isRefund ? "danger" : "success"}>
                        {isRefund ? "استرجاع" : "بيع"}
                      </StatusBadge>
                    </td>
                    <td className="py-2.5 text-left">
                      <span className={`font-bold inline-flex items-center gap-1 ${isRefund ? "text-danger" : "text-foreground"}`}>
                        {Number(r.total).toLocaleString()} <RiyalIcon size={10} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PosReceiptsTable;
