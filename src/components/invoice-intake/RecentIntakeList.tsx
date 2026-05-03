import { useWhatsappInvoiceIntakeList } from "@/hooks/useWhatsappInvoiceIntake";
import StatusBadge from "@/components/ui/StatusBadge";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Card } from "@/components/ui/card";
import { Loader2, Camera, QrCode, Upload, MessageCircle } from "lucide-react";

const sourceIcon = (s: string | null | undefined) => {
  switch (s) {
    case "camera": return <Camera size={14} className="text-blue-500" />;
    case "zatca_qr": return <QrCode size={14} className="text-emerald-500" />;
    case "upload": return <Upload size={14} className="text-amber-500" />;
    case "whatsapp": return <MessageCircle size={14} className="text-green-600" />;
    default: return null;
  }
};

const sourceLabel = (s: string | null | undefined) => {
  switch (s) {
    case "camera": return "كاميرا";
    case "zatca_qr": return "QR ضريبي";
    case "upload": return "رفع";
    case "whatsapp": return "واتساب";
    default: return s ?? "—";
  }
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  return `قبل ${Math.floor(h / 24)} يوم`;
};

const RecentIntakeList = () => {
  const { data: rows = [], isLoading } = useWhatsappInvoiceIntakeList(10);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <span className="text-xl">📥</span> آخر الفواتير المستقبلة
        </h3>
        <span className="text-xs text-muted-foreground">تحديث مباشر</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">لا توجد فواتير بعد. ابدأ بإحدى الطرق أعلاه.</div>
      ) : (
        <div className="divide-y">
          {rows.map((r) => {
            const source = (r as unknown as { source?: string }).source;
            const variant: "success" | "warning" | "danger" =
              r.status === "success" ? "success" : r.status === "failed" ? "danger" : "warning";
            const statusText = r.status === "success" ? "نجح" : r.status === "failed" ? "فشل" : "قيد المعالجة";

            return (
              <div key={r.id} className="py-3 flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground w-20">
                  {sourceIcon(source)} {sourceLabel(source)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.supplier_name ?? "بدون اسم مورد"}</div>
                  {r.error_message && r.status === "failed" && (
                    <div className="text-xs text-rose-700 truncate">{r.error_message}</div>
                  )}
                </div>
                {r.amount != null && r.amount > 0 && (
                  <div className="font-semibold flex items-center gap-1">
                    {Number(r.amount).toFixed(2)} <RiyalIcon size={12} />
                  </div>
                )}
                <StatusBadge label={statusText} variant={variant} />
                <div className="text-xs text-muted-foreground w-16 text-left">{timeAgo(r.created_at)}</div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default RecentIntakeList;