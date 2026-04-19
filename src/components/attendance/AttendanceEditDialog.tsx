import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateAttendance, type AttendanceRow } from "@/hooks/useAttendance";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AttendanceRow | null;
}

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AttendanceEditDialog = ({ open, onOpenChange, record }: Props) => {
  const update = useUpdateAttendance();
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [status, setStatus] = useState("حاضر");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (record && open) {
      setCheckIn(toLocalInput(record.check_in));
      setCheckOut(toLocalInput(record.check_out));
      setStatus(record.status);
      setNotes(record.notes || "");
    }
  }, [record, open]);

  if (!record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        id: record.id,
        previous: record,
        changed_by: user?.id ?? null,
        patch: {
          check_in: checkIn ? new Date(checkIn).toISOString() : null,
          check_out: checkOut ? new Date(checkOut).toISOString() : null,
          status,
          notes: notes || null,
        },
      });
      toast.success("تم حفظ التعديل وتسجيله في السجل");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "فشل الحفظ");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل سجل حضور</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>وقت الدخول</Label>
              <Input type="datetime-local" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>وقت الخروج</Label>
              <Input type="datetime-local" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="حاضر">حاضر</SelectItem>
                <SelectItem value="تأخر">تأخر</SelectItem>
                <SelectItem value="غائب">غائب</SelectItem>
                <SelectItem value="استئذان">استئذان</SelectItem>
                <SelectItem value="إجازة مرضية">إجازة مرضية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <p className="text-[10px] text-muted-foreground">
            ⚠️ كل تعديل يُسجَّل تلقائياً في "سجل التعديلات".
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button type="submit" disabled={update.isPending}>حفظ</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceEditDialog;
