import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Wifi, RefreshCw, CheckCircle2, XCircle, Zap } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSynced?: () => void;
}

export default function PosSyncDialog({ open, onOpenChange, onSynced }: Props) {
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null);

  const handleTest = async () => {
    setTesting(true);
    setStatus(null);
    const { data, error } = await supabase.functions.invoke("sync-loyverse-sales", {
      body: { mode: "test" },
    });
    setTesting(false);
    if (error || !data?.connected) {
      setStatus({ ok: false, msg: data?.error || error?.message || "فشل الاتصال" });
      return;
    }
    setStatus({ ok: true, msg: `متصل ✓ (${data?.merchant?.business_name ?? "Loyverse"})` });
  };

  const handleSync = async () => {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke("sync-loyverse-sales", {
      body: {},
    });
    setSyncing(false);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "فشلت المزامنة");
      return;
    }
    toast.success(`تمت المزامنة: ${data.orders} طلب — ${Math.round(data.total)} ريال`);
    localStorage.setItem("pos_last_sync", new Date().toISOString());
    onSynced?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi size={18} /> إعدادات الكاشير (Loyverse)
          </DialogTitle>
          <DialogDescription>
            اربط النظام مع Loyverse POS لسحب المبيعات تلقائياً.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-success/10 text-success rounded-xl p-2.5 text-[12px] font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <Zap size={13} />
            المزامنة التلقائية مفعّلة — يتم سحب المبيعات كل دقيقة بدون تدخل
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-[12px] leading-6 text-muted-foreground">
            <b className="text-foreground">كيف تحصل على التوكن؟</b>
            <ol className="list-decimal mr-5 mt-1 space-y-0.5">
              <li>افتح Loyverse Back Office</li>
              <li>Settings ← Access tokens ← Add access token</li>
              <li>انسخ التوكن وأضفه في إعدادات النظام (تم ✓)</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold bg-muted text-foreground rounded-xl py-2.5 hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
              اختبار الاتصال
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold bg-primary text-primary-foreground rounded-xl py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              مزامنة الآن
            </button>
          </div>

          {status && (
            <div
              className={`flex items-center gap-2 text-[12px] rounded-lg p-2.5 ${
                status.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              }`}
            >
              {status.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {status.msg}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
