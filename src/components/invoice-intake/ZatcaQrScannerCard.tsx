import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, X, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { isLikelyZatcaQr, parseZatcaQr, type ZatcaInvoice } from "@/lib/zatcaQrParser";
import { useProcessInvoiceIntake } from "@/hooks/useInvoiceIntake";

const ZatcaQrScannerCard = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const [parsed, setParsed] = useState<ZatcaInvoice | null>(null);
  const [rawQr, setRawQr] = useState<string | null>(null);
  const process = useProcessInvoiceIntake();

  const handleResult = (text: string) => {
    if (!isLikelyZatcaQr(text)) {
      toast.error("هذا الـ QR ليس فاتورة ضريبية معتمدة");
      return;
    }
    try {
      const data = parseZatcaQr(text);
      setParsed(data);
      setRawQr(text);
      stop();
    } catch {
      toast.error("تعذر قراءة بيانات QR");
    }
  };

  const start = async () => {
    try {
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result) handleResult(result.getText());
      });
      controlsRef.current = controls;
      setActive(true);
    } catch (e) {
      toast.error("تعذر فتح الكاميرا");
    }
  };

  const stop = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setActive(false);
  };

  useEffect(() => () => stop(), []);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new BrowserMultiFormatReader();
      const url = URL.createObjectURL(file);
      const result = await reader.decodeFromImageUrl(url);
      URL.revokeObjectURL(url);
      handleResult(result.getText());
    } catch {
      toast.error("لم يتم العثور على QR في الصورة");
    } finally {
      e.target.value = "";
    }
  };

  const submit = async () => {
    if (!parsed) return;
    try {
      const result = await process.mutateAsync({ source: "zatca_qr", zatca_parsed: parsed, zatca_qr_data: rawQr ?? undefined });
      toast.success(`✅ تمت إضافة فاتورة ضريبية من ${result.supplier_name} بمبلغ ${result.amount.toFixed(2)} ر.س`, { duration: 6000 });
      setParsed(null);
      setRawQr(null);
    } catch (e: any) {
      toast.error(e.message ?? "فشل الحفظ");
    }
  };

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔲</span>
        <h3 className="text-base font-semibold">مسح QR ضريبي (ZATCA)</h3>
      </div>
      <p className="text-xs text-muted-foreground">دقة 100% — يستخرج اسم المورد، الرقم الضريبي، الإجمالي والضريبة فوراً.</p>

      <div className="relative rounded-xl overflow-hidden bg-muted aspect-[3/4] flex items-center justify-center">
        {parsed ? (
          <div className="p-4 w-full text-sm space-y-2 bg-card">
            <div className="flex justify-between"><span className="text-muted-foreground">المورد:</span><span className="font-medium">{parsed.sellerName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">الرقم الضريبي:</span><span className="font-mono text-xs">{parsed.vatNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">التاريخ:</span><span>{parsed.timestamp.slice(0, 10)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">الإجمالي:</span><span className="font-bold flex items-center gap-1">{parsed.total.toFixed(2)} <RiyalIcon size={12} /></span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">الضريبة:</span><span className="flex items-center gap-1">{parsed.vat.toFixed(2)} <RiyalIcon size={12} /></span></div>
          </div>
        ) : active ? (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-12 border-2 border-emerald-400 rounded-lg pointer-events-none" />
          </>
        ) : (
          <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
            <QrCode size={48} className="opacity-40" />
            <span>وجّه الكاميرا نحو QR الفاتورة</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!active && !parsed && (
          <>
            <Button onClick={start} className="flex-1"><QrCode size={16} className="ml-1" /> مسح بالكاميرا</Button>
            <Button onClick={() => fileRef.current?.click()} variant="outline"><Upload size={16} /></Button>
          </>
        )}
        {active && <Button onClick={stop} variant="outline" className="flex-1"><X size={16} className="ml-1" /> إيقاف</Button>}
        {parsed && (
          <>
            <Button onClick={submit} disabled={process.isPending} className="flex-1">
              {process.isPending ? <Loader2 size={16} className="animate-spin ml-1" /> : null}
              {process.isPending ? "جاري الحفظ..." : "حفظ الفاتورة"}
            </Button>
            <Button onClick={() => { setParsed(null); setRawQr(null); }} variant="outline">إلغاء</Button>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
      </div>
    </Card>
  );
};

export default ZatcaQrScannerCard;