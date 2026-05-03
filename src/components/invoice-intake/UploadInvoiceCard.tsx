import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, FileText, X, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useProcessInvoiceIntake } from "@/hooks/useInvoiceIntake";
import BatchSummaryCard from "./BatchSummaryCard";

const MAX_FILES = 10;
const MAX_SIZE_MB = 10;
const CONCURRENCY = 3;

type Status = "pending" | "processing" | "done" | "error";

interface FileItem {
  id: string;
  name: string;
  dataUri: string;
  isPdf: boolean;
  status: Status;
  invoice_id?: string;
  error?: string;
}

const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const UploadInvoiceCard = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const process = useProcessInvoiceIntake();

  const addFiles = async (incoming: File[]) => {
    const remaining = MAX_FILES - files.length;
    if (remaining <= 0) {
      toast.error(`الحد الأقصى ${MAX_FILES} ملفات`);
      return;
    }
    const slice = incoming.slice(0, remaining);
    if (incoming.length > remaining) {
      toast.warning(`تم قبول ${remaining} فقط (الحد الأقصى ${MAX_FILES})`);
    }
    const accepted: FileItem[] = [];
    for (const f of slice) {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${f.name}: تجاوز ${MAX_SIZE_MB}MB`);
        continue;
      }
      try {
        const dataUri = await fileToDataUri(f);
        accepted.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: f.name,
          dataUri,
          isPdf: f.type === "application/pdf",
          status: "pending",
        });
      } catch {
        toast.error(`فشل قراءة ${f.name}`);
      }
    }
    setFiles((prev) => [...prev, ...accepted]);
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (list.length === 0) return;
    await addFiles(list);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const list = Array.from(e.dataTransfer.files ?? []).filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf",
    );
    if (list.length === 0) return;
    await addFiles(list);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFile = (id: string, patch: Partial<FileItem>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const submitAll = async () => {
    const queue = files.filter((f) => f.status === "pending" || f.status === "error");
    if (queue.length === 0) return;
    setIsProcessing(true);
    setShowSummary(false);

    let cursor = 0;
    const worker = async () => {
      while (cursor < queue.length) {
        const idx = cursor++;
        const item = queue[idx];
        updateFile(item.id, { status: "processing", error: undefined });
        try {
          const result = await process.mutateAsync({
            source: "upload",
            image_base64: item.dataUri,
          });
          updateFile(item.id, { status: "done", invoice_id: result.invoice_id });
        } catch (e: any) {
          updateFile(item.id, { status: "error", error: e.message ?? "فشل" });
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
    setIsProcessing(false);
    setShowSummary(true);
  };

  const clearAll = () => {
    setFiles([]);
    setShowSummary(false);
  };

  const doneFiles = files.filter((f) => f.status === "done");
  const errorFiles = files.filter((f) => f.status === "error");
  const processedCount = doneFiles.length + errorFiles.length;
  const progress = files.length > 0 ? (processedCount / files.length) * 100 : 0;
  const successIds = doneFiles.map((f) => f.invoice_id!).filter(Boolean);

  const statusIcon = (s: Status) => {
    switch (s) {
      case "pending": return <Clock size={12} className="text-muted-foreground" />;
      case "processing": return <Loader2 size={12} className="animate-spin text-primary" />;
      case "done": return <CheckCircle2 size={12} className="text-emerald-600" />;
      case "error": return <XCircle size={12} className="text-destructive" />;
    }
  };

  return (
    <>
      <Card className="p-5 flex flex-col gap-4 md:col-span-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📤</span>
            <div>
              <h3 className="text-base font-semibold">رفع فواتير متعددة</h3>
              <p className="text-xs text-muted-foreground">اختر أو اسحب حتى {MAX_FILES} صور/PDF — الـ AI يحلل الكل بالتوازي.</p>
            </div>
          </div>
          {files.length > 0 && (
            <Button onClick={clearAll} variant="ghost" size="sm" disabled={isProcessing}>
              <Trash2 size={14} className="ml-1" /> مسح الكل
            </Button>
          )}
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
          }`}
        >
          <Upload size={32} className="mx-auto mb-2 opacity-40" />
          <div className="text-sm font-medium">اضغط أو اسحب الملفات هنا</div>
          <div className="text-xs text-muted-foreground mt-1">
            JPG · PNG · PDF (حتى {MAX_SIZE_MB}MB لكل ملف، {MAX_FILES} ملفات كحد أقصى)
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={onPick}
          className="hidden"
        />

        {/* Progress */}
        {files.length > 0 && isProcessing && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">جاري المعالجة...</span>
              <span className="font-medium">{processedCount} / {files.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Files grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {files.map((f) => (
              <div key={f.id} className="relative rounded-xl border overflow-hidden bg-muted aspect-square group">
                {f.isPdf ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center">
                    <FileText size={28} className="opacity-60" />
                    <span className="text-[10px] truncate max-w-full">{f.name}</span>
                  </div>
                ) : (
                  <img src={f.dataUri} alt={f.name} className="absolute inset-0 w-full h-full object-cover" />
                )}
                {/* Status overlay */}
                <div className="absolute top-1 right-1 bg-background/90 backdrop-blur rounded-full p-1 shadow">
                  {statusIcon(f.status)}
                </div>
                {!isProcessing && f.status !== "done" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                    className="absolute top-1 left-1 bg-background/90 backdrop-blur rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
                    aria-label="حذف"
                  >
                    <X size={12} />
                  </button>
                )}
                {f.status === "error" && (
                  <div className="absolute bottom-0 inset-x-0 bg-destructive/90 text-destructive-foreground text-[9px] px-1 py-0.5 truncate">
                    {f.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        {files.length > 0 && (
          <Button
            onClick={submitAll}
            disabled={isProcessing || files.every((f) => f.status === "done")}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <><Loader2 size={16} className="animate-spin ml-2" /> جاري التحليل ({processedCount}/{files.length})</>
            ) : files.every((f) => f.status === "done") ? (
              <>✅ تم تحليل الكل</>
            ) : (
              <>تحليل وحفظ ({files.filter((f) => f.status !== "done").length})</>
            )}
          </Button>
        )}
      </Card>

      {/* Batch summary appears below */}
      {showSummary && successIds.length > 0 && (
        <div className="md:col-span-3">
          <BatchSummaryCard
            invoiceIds={successIds}
            failedCount={errorFiles.length}
            onClose={() => setShowSummary(false)}
          />
        </div>
      )}
    </>
  );
};

export default UploadInvoiceCard;