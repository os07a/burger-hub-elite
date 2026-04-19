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
import { useRequestPermission } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmployeeId?: string;
}

const PermissionRequestDialog = ({ open, onOpenChange, defaultEmployeeId }: Props) => {
  const { data: employees = [] } = useEmployees();
  const submit = useRequestPermission();
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<"permission" | "sick" | "emergency">("permission");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setEmployeeId(defaultEmployeeId || "");
      setDate(new Date().toISOString().slice(0, 10));
      setType("permission");
      setNotes("");
    }
  }, [open, defaultEmployeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return toast.error("اختر الموظف");
    try {
      await submit.mutateAsync({ employee_id: employeeId, date, request_type: type, notes });
      toast.success("تم تسجيل الاستئذان");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "فشل التسجيل");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>تسجيل استئذان</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>الموظف</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="permission">إذن</SelectItem>
                  <SelectItem value="sick">إجازة مرضية</SelectItem>
                  <SelectItem value="emergency">طارئ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button type="submit" disabled={submit.isPending}>تسجيل</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionRequestDialog;
