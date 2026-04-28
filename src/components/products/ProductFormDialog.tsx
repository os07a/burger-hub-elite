import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddProduct, useUpdateProduct, type Product } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product?: Product | null;
}

const ProductFormDialog = ({ open, onOpenChange, product }: Props) => {
  const add = useAddProduct();
  const update = useUpdateProduct();
  const [form, setForm] = useState({ name: "", category: "", price: 0, cost: 0, description: "", image_url: "", product_type: "primary" as "primary" | "ready_made", loyverse_item_id: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category ?? "",
        price: Number(product.price),
        cost: Number(product.cost),
        description: product.description ?? "",
        image_url: product.image_url ?? "",
        product_type: ((product as any).product_type ?? "primary") as "primary" | "ready_made",
        loyverse_item_id: (product as any).loyverse_item_id ?? "",
      });
    } else {
      setForm({ name: "", category: "", price: 0, cost: 0, description: "", image_url: "", product_type: "primary", loyverse_item_id: "" });
    }
  }, [product, open]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("اختر صورة فقط"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("الحجم الأقصى 5 ميجا"); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("تم رفع الصورة");
    } catch (err: any) {
      toast.error(err.message ?? "فشل الرفع");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("الاسم مطلوب"); return; }
    const payload = { ...form, loyverse_item_id: form.loyverse_item_id.trim() || null };
    try {
      if (product) {
        await update.mutateAsync({ id: product.id, ...payload });
        toast.success("تم تحديث المنتج");
      } else {
        await add.mutateAsync(payload);
        toast.success("تمت إضافة المنتج");
      }
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message ?? "حدث خطأ");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{product ? "تعديل منتج" : "إضافة منتج"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>صورة المنتج</Label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            {form.image_url ? (
              <div className="relative inline-block mt-1">
                <img src={form.image_url} alt="معاينة" className="w-24 h-24 rounded-xl object-cover border border-border" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image_url: "" })}
                  className="absolute -top-2 -left-2 bg-danger text-white rounded-full p-1 shadow-md hover:scale-110 transition"
                  aria-label="إزالة الصورة"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-1"
              >
                {uploading ? <Loader2 size={14} className="ml-1 animate-spin" /> : <Upload size={14} className="ml-1" />}
                {uploading ? "جارٍ الرفع..." : "رفع صورة"}
              </Button>
            )}
          </div>
          <div>
            <Label>الاسم</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>نوع المنتج</Label>
            <Select value={form.product_type} onValueChange={(v) => setForm({ ...form, product_type: v as "primary" | "ready_made" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">🍔 أساسي (مُصنّع)</SelectItem>
                <SelectItem value="ready_made">🥤 جاهز (يُباع كما هو)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>التصنيف</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="برجر / مشروبات / جوانب..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>السعر (ر.س)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>التكلفة (ر.س)</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <Label>الوصف</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>معرّف Loyverse <span className="text-[10px] text-muted-foreground">(اختياري)</span></Label>
            <Input
              value={form.loyverse_item_id}
              onChange={(e) => setForm({ ...form, loyverse_item_id: e.target.value })}
              placeholder="مثال: 8b2c1e44-..."
              dir="ltr"
              className="font-mono text-xs"
            />
            <div className="text-[10px] text-warning mt-1">⚠️ ضروري لتفعيل الخصم التلقائي من المخزون عند البيع.</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={add.isPending || update.isPending}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
