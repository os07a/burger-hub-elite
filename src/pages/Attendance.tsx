import { useState, useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Plus } from "lucide-react";
import AttendanceAlertsBar from "@/components/attendance/AttendanceAlertsBar";
import QuickPunchButton from "@/components/attendance/QuickPunchButton";
import PermissionRequestDialog from "@/components/attendance/PermissionRequestDialog";
import AttendanceEditDialog from "@/components/attendance/AttendanceEditDialog";
import AttendanceAuditTab from "@/components/attendance/AttendanceAuditTab";
import RestaurantLocationSettings from "@/components/attendance/RestaurantLocationSettings";
import { useTodayAttendance, useWeekAttendance, type AttendanceRow } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";
import { fmtTime, fmtMinutes, calcWorkedHours } from "@/lib/attendanceCalc";

const todayStr = new Date().toLocaleDateString("ar-SA", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

// Map JS getDay() (0=Sun..6=Sat) to our short keys
const dayKey = (d: Date) => ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][d.getDay()];

const variantOf = (status: string): "success" | "warning" | "danger" | "info" => {
  if (status === "حاضر") return "success";
  if (status === "تأخر") return "warning";
  if (status === "غائب") return "danger";
  return "info";
};

const Attendance = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const { data: employees = [] } = useEmployees();
  const { data: todayRows = [] } = useTodayAttendance();
  const { data: weekRows = [] } = useWeekAttendance();

  const [permOpen, setPermOpen] = useState(false);
  const [permEmpId, setPermEmpId] = useState<string | undefined>();
  const [editTarget, setEditTarget] = useState<AttendanceRow | null>(null);

  // Today metrics — compute against employees scheduled for today
  const todayDayKey = dayKey(new Date());
  const scheduledToday = employees.filter((e) => {
    const days = (e.work_days as any) || [];
    return Array.isArray(days) && days.includes(todayDayKey);
  });

  const presentMap = new Map(todayRows.filter(r => r.check_in).map(r => [r.employee_id, r]));
  const permissionRows = todayRows.filter(r => r.request_type && r.request_type !== "none");

  // Absent only counts after shift_start + 30min grace, or if no shift defined
  const now = new Date();
  const isPastGrace = (shiftStart: string | null | undefined) => {
    if (!shiftStart) return false;
    const [h, m] = shiftStart.split(":").map(Number);
    const start = new Date();
    start.setHours(h, m + 30, 0, 0);
    return now >= start;
  };
  const absentCount = scheduledToday.filter(e =>
    !presentMap.has(e.id) &&
    !permissionRows.some(p => p.employee_id === e.id) &&
    isPastGrace(e.shift_start_time)
  ).length;
  const lateCount = todayRows.filter(r => (r.late_minutes || 0) > 0).length;
  const overtimeMin = todayRows.reduce((a, r) => a + (r.overtime_minutes || 0), 0);

  // Build display rows: scheduled employees + extra rows from attendance
  const displayRows = useMemo(() => {
    const empMap = new Map(employees.map(e => [e.id, e]));
    const attendanceByEmp = new Map<string, AttendanceRow>();
    todayRows.forEach(r => {
      // prefer the row with check_in over a pure permission row
      const existing = attendanceByEmp.get(r.employee_id);
      if (!existing || (r.check_in && !existing.check_in)) attendanceByEmp.set(r.employee_id, r);
    });
    const rows: { emp: any; rec: AttendanceRow | null }[] = [];
    scheduledToday.forEach(emp => {
      rows.push({ emp, rec: attendanceByEmp.get(emp.id) || null });
    });
    // Include any attendance for non-scheduled (e.g. covered shift)
    todayRows.forEach(r => {
      if (!scheduledToday.find(e => e.id === r.employee_id)) {
        const emp = empMap.get(r.employee_id);
        if (emp) rows.push({ emp, rec: r });
      }
    });
    return rows;
  }, [todayRows, employees, scheduledToday]);

  // Week summary (dots per day per employee)
  const weekDays: Date[] = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d);
    }
    return arr;
  }, []);
  const weekByEmpDate = useMemo(() => {
    const m = new Map<string, AttendanceRow>();
    weekRows.forEach(r => m.set(`${r.employee_id}|${r.date}`, r));
    return m;
  }, [weekRows]);

  return (
    <div>
      <PageHeader title="الحضور والانصراف الذكي" subtitle={todayStr} badge="GPS مفعّل" />

      <AttendanceAlertsBar
        absent={absentCount}
        late={lateCount}
        overtime={overtimeMin}
        permissions={permissionRows.length}
      />

      <QuickPunchButton onOutOfRange={(empId) => { setPermEmpId(empId); setPermOpen(true); }} />

      <div className="flex gap-2 mb-4 justify-end">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setPermEmpId(undefined); setPermOpen(true); }}>
          <Plus size={14} /> تسجيل استئذان
        </Button>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="mb-3">
          <TabsTrigger value="today">سجل اليوم</TabsTrigger>
          <TabsTrigger value="week">ملخص الأسبوع</TabsTrigger>
          {isAdmin && <TabsTrigger value="audit">سجل التعديلات</TabsTrigger>}
          {isAdmin && <TabsTrigger value="settings">إعدادات</TabsTrigger>}
        </TabsList>

        {/* TODAY */}
        <TabsContent value="today">
          <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary">
            <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">سجل الحضور والانصراف — اليوم</div>
            {displayRows.length === 0 ? (
              <div className="text-center py-6 text-gray-light text-[12px]">لا يوجد موظفين مجدولين اليوم.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      {["الموظف", "الدوام", "دخول", "خروج", "ساعات", "تأخير", "إضافي", "موقع", "الحالة", ...(isAdmin ? ["إجراء"] : [])].map((h) => (
                        <th key={h} className="text-[9px] text-gray-light font-semibold uppercase tracking-wide px-2 pb-2.5 text-right border-b-2 border-border">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map(({ emp, rec }) => {
                      const initials = emp.name.slice(0, 2);
                      const shift = emp.shift_start_time && emp.shift_end_time
                        ? `${emp.shift_start_time?.slice(0, 5)} — ${emp.shift_end_time?.slice(0, 5)}`
                        : "—";
                      const status = rec?.status || "غائب";
                      const variant = variantOf(status);
                      const hours = rec?.check_in && rec?.check_out
                        ? `${calcWorkedHours(rec.check_in, rec.check_out).toFixed(1)} س`
                        : rec?.check_in ? "جارٍ" : "—";
                      const verified = rec?.check_in_verified;
                      return (
                        <tr key={emp.id + (rec?.id || "")} className="hover:bg-background/50">
                          <td className="px-2 py-2.5 border-b border-border">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground">{initials}</div>
                              <div>
                                <span className="font-semibold text-foreground text-[12px] block">{emp.name}</span>
                                <span className="text-[9px] text-gray-light">{emp.role}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2.5 border-b border-border text-gray-light text-[11px]">{shift}</td>
                          <td className="px-2 py-2.5 border-b border-border font-bold text-[12px]">{fmtTime(rec?.check_in)}</td>
                          <td className="px-2 py-2.5 border-b border-border text-[12px] text-gray-light">{fmtTime(rec?.check_out)}</td>
                          <td className="px-2 py-2.5 border-b border-border font-bold text-[12px]">{hours}</td>
                          <td className={`px-2 py-2.5 border-b border-border text-[11px] font-semibold ${rec?.late_minutes ? "text-warning" : "text-gray-light"}`}>
                            {fmtMinutes(rec?.late_minutes || 0)}
                          </td>
                          <td className={`px-2 py-2.5 border-b border-border text-[11px] font-semibold ${rec?.overtime_minutes ? "text-success" : "text-gray-light"}`}>
                            {fmtMinutes(rec?.overtime_minutes || 0)}
                          </td>
                          <td className="px-2 py-2.5 border-b border-border text-[14px]">
                            {rec?.check_in
                              ? (verified ? <span title="موقع متطابق">📍</span> : <span title="غير متحقق">⚠️</span>)
                              : "—"}
                          </td>
                          <td className="px-2 py-2.5 border-b border-border">
                            <StatusBadge variant={variant}>{status}</StatusBadge>
                          </td>
                          {isAdmin && (
                            <td className="px-2 py-2.5 border-b border-border">
                              {rec && (
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditTarget(rec)}>
                                  <Pencil size={13} />
                                </Button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* WEEK */}
        <TabsContent value="week">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">ملخص الأسبوع</div>
            <div className="overflow-x-auto">
              <div className="flex flex-col gap-px bg-border rounded-lg overflow-hidden min-w-[700px]">
                <div className="grid bg-background" style={{ gridTemplateColumns: "160px repeat(7, 1fr) 90px" }}>
                  <div className="px-2.5 py-2 text-[9px] font-semibold text-gray-light uppercase tracking-wide">الموظف</div>
                  {weekDays.map((d, i) => (
                    <div key={i} className="text-center px-1 py-2 text-[9px] font-semibold text-gray-light">
                      {d.toLocaleDateString("ar-SA", { weekday: "short", day: "numeric" })}
                    </div>
                  ))}
                  <div className="px-2 py-2 text-[10px] font-bold text-foreground text-center">إضافي</div>
                </div>
                {employees.map((emp) => {
                  let totalOvertime = 0;
                  return (
                    <div key={emp.id} className="grid bg-surface items-center" style={{ gridTemplateColumns: "160px repeat(7, 1fr) 90px" }}>
                      <div className="px-2.5 py-2.5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                          {emp.name.slice(0, 2)}
                        </div>
                        <span className="font-semibold text-foreground text-[12px] truncate">{emp.name}</span>
                      </div>
                      {weekDays.map((d, i) => {
                        const key = `${emp.id}|${d.toISOString().slice(0, 10)}`;
                        const r = weekByEmpDate.get(key);
                        if (r) totalOvertime += r.overtime_minutes || 0;
                        const scheduled = ((emp.work_days as any[]) || []).includes(dayKey(d));
                        let dot = "—", color = "text-border";
                        if (r?.request_type && r.request_type !== "none") { dot = "●"; color = "text-info"; }
                        else if (r?.check_in) {
                          if (r.late_minutes > 0) { dot = "●"; color = "text-warning"; }
                          else { dot = "●"; color = "text-success"; }
                        } else if (scheduled && d < new Date(new Date().setHours(0,0,0,0))) {
                          dot = "●"; color = "text-danger";
                        }
                        return <div key={i} className={`text-center py-2.5 text-[14px] ${color}`}>{dot}</div>;
                      })}
                      <div className="px-2 py-2.5 text-[11px] font-bold text-success text-center">{fmtMinutes(totalOvertime)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-3.5 mt-3.5 pt-3 border-t border-border flex-wrap">
              {[
                { color: "text-success", label: "حاضر" },
                { color: "text-warning", label: "تأخر" },
                { color: "text-danger", label: "غائب" },
                { color: "text-info", label: "استئذان" },
                { color: "text-border", label: "إجازة/قادم" },
              ].map((l) => (
                <span key={l.label} className="text-[11px] text-gray-light flex items-center gap-1.5">
                  <span className={`text-[14px] ${l.color}`}>●</span>{l.label}
                </span>
              ))}
            </div>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="audit">
            <AttendanceAuditTab />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="settings">
            <RestaurantLocationSettings />
          </TabsContent>
        )}
      </Tabs>

      <PermissionRequestDialog open={permOpen} onOpenChange={setPermOpen} defaultEmployeeId={permEmpId} />
      <AttendanceEditDialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)} record={editTarget} />
    </div>
  );
};

export default Attendance;
