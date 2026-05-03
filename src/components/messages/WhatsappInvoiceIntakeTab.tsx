import { useState } from "react";
import { Loader2, RefreshCw, ExternalLink, ImageOff, RotateCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  useWhatsappInvoiceIntakeList,
  useWhatsappInvoiceIntakeStats,
  useRetryInvoiceProcessing,
  type InvoiceIntakeRow,
} from "@/hooks/useWhatsappInvoiceIntake";
import { useInvoiceImageUrl } from "@/hooks/useArchiveInvoices";
import { formatSaudiPhoneDisplay } from "@/lib/phoneNormalize";

const statusInfo: Record<string, { label: string; variant: "success" | "danger" | "warning"; icon: typeof Clock }> = {
  success: { label: "نجحت", variant: "success", icon: CheckCircle2 },
  failed: { label: "فشلت", variant: "danger", icon: XCircle },
  processing: { label: "قيد المعالجة", variant: "warning", icon: Clock },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `اليوم ${time}`;
  return `${d.toLocaleDateString("ar-SA", { day: "numeric", month: "short" })} ${time}`;
}

const ThumbCell = ({ path }: { path: string | null }) => {
  const { data: url, isLoading } = useInvoiceImageUrl(path);
  if (!path) {
    return (
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        <ImageOff className="w-4 h-4" />
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!url) return <div className="w-12 h-12 rounded-lg bg-muted" />;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block w-12 h-12 rounded-lg overflow-hidden border border-border hover:opacity-80 transition">
      <img src={url} alt="فاتورة" className="w-full h-full object-cover" />
    </a>
  );
};

const Row = ({ row }: { row: InvoiceIntakeRow }) => {
  const retry = useRetryInvoiceProcessing();
  const info = statusInfo[row.status] ?? statusInfo.processing;
  const Icon = info.icon;

  const handleRetry = async () => {
    try {
      await retry.mutateAsync(row);
      toast.success("تمت إعادة المعالجة");
    } catch (e: any) {
      toast.error(e.message ?? "فشلت إعادة المحاولة");
    }
  };

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition">
      <td className="p-3"><ThumbCell path={row.image_url} /></td>
      <td className="p-3 text-sm">
        <div className="font-medium text-foreground">{formatSaudiPhoneDisplay(row.from_phone)}</div>
        <div className="text-[11px] text-muted-foreground">{formatTime(row.created_at)}</div>
      </td>
      <td className="p-3 text-sm">
        {row.supplier_name ? (
          <span className="text-foreground">{row.supplier_name}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="p-3 text-sm font-semibold text-foreground">
        {row.amount != null && row.amount > 0 ? `${row.amount.toFixed(2)} ر.س` : "—"}
      </td>
      <td className="p-3">
        <div className="flex flex-col gap-1.5 items-start">
          <StatusBadge variant={info.variant}>
            <Icon className="w-3 h-3" />
            {info.label}
          </StatusBadge>
          {row.status === "processing" && (
            <Loader2 className="w-3 h-3 animate-spin text-warning" />
          )}
          {row.error_message && (
            <div className="text-[11px] text-danger max-w-[260px] leading-tight bg-danger/5 px-2 py-1 rounded">
              {row.error_message}
            </div>
          )}
          {row.processing_time_ms != null && row.status !== "processing" && (
            <div className="text-[10px] text-muted-foreground">
              {(row.processing_time_ms / 1000).toFixed(1)}ث
            </div>
          )}
        </div>
      </td>
      <td className="p-3">
        <div className="flex flex-col gap-1.5">
          {row.status === "failed" && (
            <button
              onClick={handleRetry}
              disabled={retry.isPending}
              className="ios-button-sm flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
            >
              {retry.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCw className="w-3 h-3" />}
              إعادة محاولة
            </button>
          )}
          {row.status === "success" && row.invoice_id && (
            <Link
              to="/archive"
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition"
            >
              <ExternalLink className="w-3 h-3" />
              فتح
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
};

const WhatsappInvoiceIntakeTab = () => {
  const { data: rows, isLoading, refetch, isFetching } = useWhatsappInvoiceIntakeList(20);
  const { data: stats } = useWhatsappInvoiceIntakeStats();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="إجمالي اليوم" value={stats?.todayTotal ?? 0} sub="فاتورة مستقبلة" subColor="gray" />
        <MetricCard label="نجحت" value={stats?.todaySuccess ?? 0} sub="معالجة كاملة" subColor="success" />
        <MetricCard label="فشلت" value={stats?.todayFailed ?? 0} sub="تحتاج مراجعة" subColor="danger" />
        <MetricCard label="قيد المعالجة" value={stats?.todayProcessing ?? 0} sub="جاري التحليل" subColor="warning" />
      </div>

      {/* Table */}
      <div className="ios-card p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-foreground">آخر الفواتير المستقبلة</h3>
            <p className="text-xs text-muted-foreground mt-0.5">يتحدّث تلقائياً عند وصول فاتورة جديدة</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing || isFetching ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-2">📭</div>
            <div className="text-sm font-medium text-foreground">لا توجد فواتير بعد</div>
            <div className="text-xs text-muted-foreground mt-1">
              فواتير الواتساب الواردة من الأرقام الموثوقة ستظهر هنا
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-right text-[11px] font-medium text-muted-foreground p-3">الصورة</th>
                  <th className="text-right text-[11px] font-medium text-muted-foreground p-3">المرسل</th>
                  <th className="text-right text-[11px] font-medium text-muted-foreground p-3">المورد</th>
                  <th className="text-right text-[11px] font-medium text-muted-foreground p-3">المبلغ</th>
                  <th className="text-right text-[11px] font-medium text-muted-foreground p-3">الحالة</th>
                  <th className="text-right text-[11px] font-medium text-muted-foreground p-3">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => <Row key={r.id} row={r} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsappInvoiceIntakeTab;