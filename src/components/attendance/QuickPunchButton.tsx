import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";
import { getCurrentPosition, distanceMeters } from "@/lib/geo";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { useTodayAttendance, usePunchIn, usePunchOut } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";

interface Props {
  onOutOfRange: (employeeId: string) => void;
}

const QuickPunchButton = ({ onOutOfRange }: Props) => {
  const { data: settings } = useRestaurantSettings();
  const { data: employees = [] } = useEmployees();
  const { data: today = [] } = useTodayAttendance();
  const punchIn = usePunchIn();
  const punchOut = usePunchOut();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const employee = employees.find((e) => e.id === employeeId);
  const existing = today.find((r) => r.employee_id === employeeId && r.check_in);
  const isCheckOut = !!existing && !existing.check_out;
  const alreadyDone = !!existing && !!existing.check_out;

  const handlePunch = async () => {
    if (!employeeId) {
      toast.error("اختر الموظف أولاً");
      return;
    }
    if (!settings?.latitude || !settings?.longitude) {
      toast.error("لم يتم ضبط موقع المحل بعد. الرجاء ضبطه من الأدمن.");
      return;
    }
    setLoading(true);
    try {
      const pos = await getCurrentPosition();
      const dist = distanceMeters(pos.latitude, pos.longitude, settings.latitude, settings.longitude);
      const verified = dist <= (settings.radius_meters || 200);

      if (!verified) {
        toast.error(`خارج نطاق المحل (${Math.round(dist)} م). تستطيع تسجيل استئذان.`);
        onOutOfRange(employeeId);
        setLoading(false);
        return;
      }

      if (isCheckOut && existing) {
        await punchOut.mutateAsync({
          attendance_id: existing.id,
          lat: pos.latitude,
          lng: pos.longitude,
          verified: true,
          shift_end_time: (employee as any)?.shift_end_time ?? null,
        });
        toast.success("تم تسجيل الانصراف ✓");
      } else if (alreadyDone) {
        toast.info("تم تسجيل الدخول والخروج لهذا اليوم بالفعل");
      } else {
        await punchIn.mutateAsync({
          employee_id: employeeId,
          lat: pos.latitude,
          lng: pos.longitude,
          verified: true,
          shift_start_time: (employee as any)?.shift_start_time ?? null,
        });
        toast.success("تم تسجيل الدخول ✓");
      }
    } catch (err: any) {
      toast.error(err.message || "تعذّر التسجيل");
    } finally {
      setLoading(false);
    }
  };

  const label = alreadyDone
    ? "✓ تم اليوم"
    : isCheckOut
    ? "بصمة الانصراف 📍"
    : "بصمة الدخول 📍";

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <label className="text-[10px] font-semibold text-gray-light uppercase tracking-wider block mb-1.5">
          اختر الموظف
        </label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name} — {e.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handlePunch}
        disabled={loading || !employeeId || alreadyDone}
        className="gap-2 h-10 min-w-[170px]"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
        {label}
      </Button>
    </div>
  );
};

export default QuickPunchButton;
