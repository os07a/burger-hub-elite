import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calcLateMinutes, calcEarlyLeaveMinutes, calcOvertimeMinutes } from "@/lib/attendanceCalc";

export interface AttendanceRow {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string | null;
  check_in_lat: number | null;
  check_in_lng: number | null;
  check_in_verified: boolean;
  check_out_lat: number | null;
  check_out_lng: number | null;
  check_out_verified: boolean;
  late_minutes: number;
  early_leave_minutes: number;
  overtime_minutes: number;
  request_type: "none" | "permission" | "sick" | "emergency" | string;
  edited_by: string | null;
  edited_at: string | null;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function useTodayAttendance() {
  return useQuery({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", todayISO())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as AttendanceRow[];
    },
  });
}

export function useWeekAttendance() {
  return useQuery({
    queryKey: ["attendance", "week"],
    queryFn: async () => {
      const start = new Date();
      start.setDate(start.getDate() - 6);
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .gte("date", start.toISOString().slice(0, 10))
        .order("date", { ascending: true });
      if (error) throw error;
      return (data || []) as AttendanceRow[];
    },
  });
}

export function useMonthAttendance(monthYM: string) {
  return useQuery({
    queryKey: ["attendance", "month", monthYM],
    queryFn: async () => {
      const [y, m] = monthYM.split("-").map(Number);
      const start = `${y}-${String(m).padStart(2, "0")}-01`;
      const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .gte("date", start)
        .lt("date", nextMonth)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data || []) as AttendanceRow[];
    },
  });
}

export function usePunchIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employee_id,
      lat,
      lng,
      verified,
      shift_start_time,
    }: {
      employee_id: string;
      lat: number;
      lng: number;
      verified: boolean;
      shift_start_time: string | null;
    }) => {
      const now = new Date().toISOString();
      const late = shift_start_time ? calcLateMinutes(now, shift_start_time) : 0;
      const status = late > 0 ? "تأخر" : "حاضر";
      const { data, error } = await supabase
        .from("attendance")
        .insert({
          employee_id,
          date: todayISO(),
          check_in: now,
          check_in_lat: lat,
          check_in_lng: lng,
          check_in_verified: verified,
          late_minutes: late,
          status,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function usePunchOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      attendance_id,
      lat,
      lng,
      verified,
      shift_end_time,
    }: {
      attendance_id: string;
      lat: number;
      lng: number;
      verified: boolean;
      shift_end_time: string | null;
    }) => {
      const now = new Date().toISOString();
      const early = shift_end_time ? calcEarlyLeaveMinutes(now, shift_end_time) : 0;
      const overtime = shift_end_time ? calcOvertimeMinutes(now, shift_end_time) : 0;
      const { data, error } = await supabase
        .from("attendance")
        .update({
          check_out: now,
          check_out_lat: lat,
          check_out_lng: lng,
          check_out_verified: verified,
          early_leave_minutes: early,
          overtime_minutes: overtime,
        })
        .eq("id", attendance_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useRequestPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employee_id,
      date,
      request_type,
      notes,
    }: {
      employee_id: string;
      date: string;
      request_type: "permission" | "sick" | "emergency";
      notes?: string;
    }) => {
      const statusMap: Record<string, string> = {
        permission: "استئذان",
        sick: "إجازة مرضية",
        emergency: "طارئ",
      };
      const { error } = await supabase.from("attendance").insert({
        employee_id,
        date,
        request_type,
        notes: notes || null,
        status: statusMap[request_type],
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export interface AttendanceEditPayload {
  check_in?: string | null;
  check_out?: string | null;
  status?: string;
  notes?: string | null;
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
      previous,
      changed_by,
    }: {
      id: string;
      patch: AttendanceEditPayload;
      previous: AttendanceRow;
      changed_by: string | null;
    }) => {
      const { error } = await supabase
        .from("attendance")
        .update({ ...patch, edited_by: changed_by, edited_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;

      // Write audit rows for each changed field
      const audits = (Object.keys(patch) as (keyof AttendanceEditPayload)[])
        .filter((k) => String(patch[k] ?? "") !== String((previous as any)[k] ?? ""))
        .map((k) => ({
          attendance_id: id,
          changed_by,
          field_name: String(k),
          old_value: (previous as any)[k] == null ? null : String((previous as any)[k]),
          new_value: patch[k] == null ? null : String(patch[k]),
        }));
      if (audits.length) {
        const { error: aErr } = await supabase.from("attendance_audit").insert(audits);
        if (aErr) throw aErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["attendance_audit"] });
    },
  });
}

export function useAttendanceAudit() {
  return useQuery({
    queryKey: ["attendance_audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_audit")
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });
}
