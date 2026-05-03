import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileImage, X } from "lucide-react";
import { toast } from "sonner";
import { useProcessInvoiceIntake } from "@/hooks/useInvoiceIntake";

const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const UploadInvoiceCard = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const process = useProcessInvoiceIntake();

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("الحجم الأقصى 10MB");
      return;
    }
    const dataUri = await fileToDataUri(file);
    setPreview(dataUri);
    setFileName(file.name);
    e.target.value = "";
  };

  const submit = async () => {
    if (!preview) return;
    try {
      const result = await process.mutateAsync({ source: "upload", image_base64: preview });
      toast.success(
        `✅ تمت إضافة فاتورة من ${result.supplier_name ?? "مورد جديد"} بمبلغ ${result.amount.toFixed(2)} ر.س${result.line_items_count > 0 ? ` (${result.line_items_count} صنف)` : ""}${result.needs_review ? " — تحتاج مراجعة" : ""}`,
        { duration: 6000 },
      );
      setPreview(null);
      setFileName(null);
    } catch (e: any) {
      toast.error(e.message ?? "فشل المعالجة");
    }
  };

  const isPdf = preview?.startsWith("data:application/pdf");

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📤</span>
        <h3 className="text-base font-semibold">رفع صورة / PDF</h3>
      </div>
      <p className="text-xs text-muted-foreground">ارفع فاتورة من الجوال أو الكمبيوتر — الـ AI يستخرج البيانات والأصناف.</p>

      <div className="relative rounded-xl overflow-hidden bg-muted aspect-[3/4] flex items-center justify-center">
        {preview ? (
          isPdf ? (
            <div className="text-sm flex flex-col items-center gap-2 p-4 text-center">
              <FileImage size={48} className="opacity-60" />
              <span className="font-medium truncate max-w-full">{fileName}</span>
              <span className="text-xs text-muted-foreground">ملف PDF جاهز للمعالجة</span>
            </div>
          ) : (
            <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
          )
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/70 transition"
          >
            <Upload size={48} className="opacity-40" />
            <span className="text-sm">اضغط لاختيار ملف</span>
            <span className="text-xs">JPG · PNG · PDF (حتى 10MB)</span>
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {!preview && (
          <Button onClick={() => fileRef.current?.click()} className="flex-1">
            <Upload size={16} className="ml-1" /> اختيار ملف
          </Button>
        )}
        {preview && (
          <>
            <Button onClick={submit} disabled={process.isPending} className="flex-1">
              {process.isPending ? <Loader2 size={16} className="animate-spin ml-1" /> : null}
              {process.isPending ? "جاري التحليل..." : "تحليل وحفظ"}
            </Button>
            <Button onClick={() => { setPreview(null); setFileName(null); }} variant="outline"><X size={16} /></Button>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onPick} className="hidden" />
      </div>
    </Card>
  );
};

export default UploadInvoiceCard;