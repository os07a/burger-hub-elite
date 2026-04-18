import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddEmployeeDoc } from "@/hooks/useEmployees";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
}

const DocFormDialog = ({ open, onOpenChange, employeeId }: Props) => {
  const addDoc = useAddEmployeeDoc();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    doc_type: "iqama",
    doc_number: "",
    issue_date: "",
    expiry_date: "",
    status: "",
    status_variant: "success",
    details: "",
  });

  const resetAll = () => {
    setForm({
      label: "", doc_type: "iqama", doc_number: "", issue_date: "",
      expiry_date: "", status: "", status_variant: "success", details: "",
    });
    setImagePath(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجا");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${employeeId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("employee-docs").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      // Local preview from blob (bucket is private)
      const blobUrl = URL.createObjectURL(file);
      setImagePath(path);
      setPreviewUrl(blobUrl);
      toast.success("تم رفع الصورة");
    } catch (err: any) {
      toast.error(err.message || "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (imagePath) {
      await supabase.storage.from("employee-docs").remove([imagePath]);
    }
    setImagePath(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc.mutateAsync({
        employee_id: employeeId,
        label: form.label,
        doc_type: form.doc_type,
        doc_number: form.doc_number || null,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
        status: form.status,
        status_variant: form.status_variant,
        details: form.details || null,
        image_url: imagePath,
      });
      toast.success("تم إضافة الوثيقة" + (imagePath ? " مع الصورة" : ""));
      resetAll();
      onOpenChange(false);
    } catch {
      toast.error("حدث خطأ");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetAll(); onOpenChange(o); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة وثيقة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>📎 صورة الوثيقة (اختياري)</Label>
            {previewUrl ? (
              <div className="relative border border-border rounded-lg overflow-hidden bg-background">
                <img src={previewUrl} alt="preview" className="w-full h-48 object-contain" />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 left-2 h-7 w-7"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-border rounded-lg p-6 hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center gap-2 text-muted-foreground disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <ImageIcon className="h-8 w-8" />
                )}
                <span className="text-[12px] font-medium">
                  {uploading ? "جاري الرفع..." : "اضغط لرفع صورة الإقامة / الوثيقة"}
                </span>
                <span className="text-[10px]">PNG, JPG حتى 5 ميجا</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>اسم الوثيقة</Label>
              <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="الإقامة" required />
            </div>
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select value={form.doc_type} onValueChange={v => setForm(f => ({ ...f, doc_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="iqama">إقامة</SelectItem>
                  <SelectItem value="health">شهادة صحية</SelectItem>
                  <SelectItem value="contract">عقد</SelectItem>
                  <SelectItem value="leave">إجازات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>رقم المستند</Label>
            <Input value={form.doc_number} onChange={e => setForm(f => ({ ...f, doc_number: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>تاريخ الإصدار</Label>
              <Input value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} placeholder="12 مارس 2025" />
            </div>
            <div className="space-y-2">
              <Label>تاريخ الانتهاء</Label>
              <Input value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} placeholder="12 مارس 2026" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Input value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} placeholder="باقي 11 شهر" required />
            </div>
            <div className="space-y-2">
              <Label>مستوى الحالة</Label>
              <Select value={form.status_variant} onValueChange={v => setForm(f => ({ ...f, status_variant: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">✅ سارية</SelectItem>
                  <SelectItem value="warning">⚠️ تنتهي قريباً</SelectItem>
                  <SelectItem value="danger">🚨 منتهية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>تفاصيل</Label>
            <Input value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} placeholder="ملاحظات إضافية" />
          </div>
          <Button type="submit" className="w-full" disabled={addDoc.isPending || uploading}>
            {addDoc.isPending ? "جاري الحفظ..." : "إضافة الوثيقة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocFormDialog;
