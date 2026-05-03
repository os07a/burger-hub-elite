import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useProcessInvoiceIntake } from "@/hooks/useInvoiceIntake";

const CameraCaptureCard = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const process = useProcessInvoiceIntake();

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch (e) {
      toast.error("تعذر فتح الكاميرا. تأكد من السماح بالوصول.");
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  };

  useEffect(() => () => stop(), []);

  const capture = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    const dataUri = canvas.toDataURL("image/jpeg", 0.9);
    setPreview(dataUri);
    stop();
  };

  const submit = async () => {
    if (!preview) return;
    try {
      const result = await process.mutateAsync({ source: "camera", image_base64: preview });
      toast.success(
        `✅ تمت إضافة فاتورة من ${result.supplier_name ?? "مورد جديد"} بمبلغ ${result.amount.toFixed(2)} ر.س${result.needs_review ? " — تحتاج مراجعة" : ""}`,
        { duration: 6000 },
      );
      setPreview(null);
    } catch (e: any) {
      toast.error(e.message ?? "فشل المعالجة");
    }
  };

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📷</span>
        <h3 className="text-base font-semibold">تصوير مباشر بالكاميرا</h3>
      </div>
      <p className="text-xs text-muted-foreground">صوّر الفاتورة مباشرة وسيتم استخراج البيانات تلقائياً.</p>

      <div className="relative rounded-xl overflow-hidden bg-muted aspect-[3/4] flex items-center justify-center">
        {preview ? (
          <img src={preview} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
        ) : active ? (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-6 border-2 border-amber-400 rounded-lg pointer-events-none" />
          </>
        ) : (
          <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
            <Camera size={48} className="opacity-40" />
            <span>اضغط لبدء الكاميرا</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!active && !preview && (
          <Button onClick={start} className="flex-1">
            <Camera size={16} className="ml-1" /> فتح الكاميرا
          </Button>
        )}
        {active && (
          <>
            <Button onClick={capture} className="flex-1">التقاط</Button>
            <Button onClick={stop} variant="outline"><X size={16} /></Button>
          </>
        )}
        {preview && (
          <>
            <Button onClick={submit} disabled={process.isPending} className="flex-1">
              {process.isPending ? <Loader2 size={16} className="animate-spin ml-1" /> : <CheckCircle2 size={16} className="ml-1" />}
              {process.isPending ? "جاري المعالجة..." : "معالجة وحفظ"}
            </Button>
            <Button onClick={() => { setPreview(null); start(); }} variant="outline">إعادة</Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default CameraCaptureCard;