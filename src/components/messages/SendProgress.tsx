import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export interface SendResult {
  customerId: string;
  customerName: string;
  phone: string;
  success: boolean;
  error?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  total: number;
  results: SendResult[];
  isDone: boolean;
}

const SendProgress = ({ open, onClose, total, results, isDone }: Props) => {
  const sent = results.length;
  const successful = results.filter((r) => r.success).length;
  const failed = results.length - successful;
  const pct = total > 0 ? Math.round((sent / total) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && isDone && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDone ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
            {isDone ? "اكتمل الإرسال" : "جاري الإرسال..."}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-bold">
                {sent} / {total}
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-green-50 border border-green-200 p-2.5 text-center">
              <div className="text-xl font-bold text-green-700">{successful}</div>
              <div className="text-[11px] text-green-700">نجح</div>
            </div>
            <div className="rounded-md bg-red-50 border border-red-200 p-2.5 text-center">
              <div className="text-xl font-bold text-red-700">{failed}</div>
              <div className="text-[11px] text-red-700">فشل</div>
            </div>
          </div>

          {/* Results list */}
          {results.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1 border rounded-md p-2">
              {results.slice().reverse().map((r) => (
                <div
                  key={r.customerId}
                  className="flex items-start gap-2 text-xs py-1 border-b last:border-0 border-border/50"
                >
                  {r.success ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{r.customerName}</div>
                    <div className="text-muted-foreground" dir="ltr">{r.phone}</div>
                    {r.error && (
                      <div className="text-red-600 text-[10px] mt-0.5">{r.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isDone && (
            <Button onClick={onClose} className="w-full">
              إغلاق
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendProgress;