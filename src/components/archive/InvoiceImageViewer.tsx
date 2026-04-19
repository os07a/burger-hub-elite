import { useRef, useState } from "react";
import { useInvoiceImageUrl, useUploadInvoiceImage } from "@/hooks/useArchiveInvoices";
import { Loader2, Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  invoiceId: string;
  imagePath: string | null;
}

const InvoiceImageViewer = ({ invoiceId, imagePath }: Props) => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadInvoiceImage();
  const { data: signedUrl, isLoading } = useInvoiceImageUrl(imagePath);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("الحجم الأقصى 10 ميجابايت");
      return;
    }
    setPreview(URL.createObjectURL(file));
    try {
      await upload.mutateAsync({ invoiceId, file });
      toast.success("تم رفع صورة الفاتورة");
    } catch (err: any) {
      toast.error(err.message ?? "فشل الرفع");
      setPreview(null);
    }
  };

  const displayUrl = preview || signedUrl;
  const isPdf = imagePath?.toLowerCase().endsWith(".pdf");

  return (
    <div className="px-4 py-3 bg-background/50 border-b border-border/50">
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-gray-light">
          <Loader2 className="animate-spin" size={18} />
        </div>
      ) : displayUrl ? (
        <div className="space-y-2">
          {isPdf ? (
            <div className="border border-border rounded-lg p-4 text-center bg-background">
              <div className="text-[24px] mb-2">📄</div>
              <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-primary inline-flex items-center gap-1 hover:underline">
                فتح ملف PDF <ExternalLink size={11} />
              </a>
            </div>
          ) : (
            <img src={displayUrl} alt="فاتورة" className="max-h-96 mx-auto rounded-lg border border-border" />
          )}
          {isAdmin && (
            <div className="text-center">
              <button
                onClick={() => inputRef.current?.click()}
                disabled={upload.isPending}
                className="text-[10px] text-primary hover:underline"
              >
                استبدال الصورة
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <div className="text-[24px] mb-2">📄</div>
          <div className="text-[11px] font-medium text-gray-light mb-1">لا توجد صورة مرفقة</div>
          {isAdmin ? (
            <>
              <div className="text-[10px] text-gray-light mb-2">اضغط لرفع صورة الفاتورة (JPG/PNG/PDF)</div>
              <button
                onClick={() => inputRef.current?.click()}
                disabled={upload.isPending}
                className="mt-1 text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
              >
                {upload.isPending ? <Loader2 className="animate-spin" size={11} /> : <Upload size={11} />}
                {upload.isPending ? "جارٍ الرفع..." : "رفع صورة الفاتورة"}
              </button>
            </>
          ) : (
            <div className="text-[10px] text-gray-light">للرفع تحتاج صلاحية المدير</div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

export default InvoiceImageViewer;
