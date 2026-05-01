import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type AttendanceRow = Tables<"attendance">;
export type LeaveRow = Tables<"employee_leaves">;

const today = () => new Date().toISOString().slice(0, 10);

export const useTodayAttendance = () =>
  useQuery({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      const d = today();
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", d);
      if (error) throw error;
      return (data || []) as AttendanceRow[];
    },
  });

export const useActiveLeavesToday = () =>
  useQuery({
    queryKey: ["employee_leaves", "today"],
    queryFn: async () => {
      const d = today();
      const { data, error } = await supabase
        .from("employee_leaves")
        .select("*")
        .lte("start_date", d)
        .gte("end_date", d)
        .eq("status", "approved");
      if (error) throw error;
      return (data || []) as LeaveRow[];
    },
  });
