import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Plus, Receipt, Phone } from "lucide-react";
import {
  useAllowedSenders,
  useAddAllowedSender,
  useToggleAllowedSender,
  useDeleteAllowedSender,
} from "@/hooks/useWhatsappSenders";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const WhatsappSendersDialog = ({ open, onOpenChange }: Props) => {
  const { data: senders = [], isLoading } = useAllowedSenders();
  const addMut = useAddAllowedSender();
  const toggleMut = useToggleAllowedSender();
  const deleteMut = useDeleteAllowedSender();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const handleAdd = async () => {
    if (!phone.trim()) {
      toast.error("أدخل رقم الواتساب");
      return;
    }
    try {
      await addMut.mutateAsync({ phone, display_name: name || undefined });
      toast.success("تمت الإضافة");
      setPhone("");
      setName("");
    } catch (e: any) {
      toast.error(e?.message ?? "فشلت الإضافة (قد يكون الرقم مكرر)");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={18} />
            استقبال الفواتير من واتساب
          </DialogTitle>
          <DialogDescription>
            الأرقام المضافة هنا تقدر ترسل صور فواتير الموردين وتنحفظ تلقائياً في الأرشيف بعد تحليلها بالذكاء الاصطناعي.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new */}
          <div className="bg-muted/40 rounded-xl p-3 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="رقم الواتساب (مثلاً 9665XXXXXXXX)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="text-right"
              />
              <Input
                placeholder="الاسم (اختياري)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={addMut.isPending}
              className="w-full gap-2"
              size="sm"
            >
              <Plus size={14} />
              إضافة رقم موثوق
            </Button>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {isLoading && <div className="text-center text-[12px] text-muted-foreground py-4">جاري التحميل...</div>}
            {!isLoading && senders.length === 0 && (
              <div className="text-center text-[12px] text-muted-foreground py-6">
                لا توجد أرقام مضافة بعد. أضف رقم مدير التشغيل لتفعيل الاستقبال التلقائي.
              </div>
            )}
            {senders.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2 bg-card border border-border rounded-xl p-3"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Phone size={14} className="text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold truncate">
                      {s.display_name || "بدون اسم"}
                    </div>
                    <div className="text-[11px] text-muted-foreground" dir="ltr">
                      +{s.phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={s.is_active}
                    onCheckedChange={(v) =>
                      toggleMut.mutate({ id: s.id, is_active: v })
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("حذف هذا الرقم من القائمة الموثوقة؟")) {
                        deleteMut.mutate(s.id);
                      }
                    }}
                  >
                    <Trash2 size={14} className="text-danger" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-info/10 text-info rounded-xl p-3 text-[11px] leading-6">
            <b>كيف تشتغل؟</b>
            <ol className="list-decimal mr-4 mt-1 space-y-0.5">
              <li>المدير يرسل صورة الفاتورة للواتساب الرسمي.</li>
              <li>الذكاء الاصطناعي يقرأ المورد، الرقم، المبلغ، التاريخ، التصنيف.</li>
              <li>تُحفظ في الأرشيف مع علامة "تحتاج مراجعة".</li>
              <li>تستقبل تأكيد واتساب فوري بالملخص.</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsappSendersDialog;
