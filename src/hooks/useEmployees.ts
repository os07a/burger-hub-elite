import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Employee = Tables<"employees">;
export type EmployeeDoc = Tables<"employee_docs">;
export type EmployeeQualification = Tables<"employee_qualifications">;
export type EmployeeLeave = Tables<"employee_leaves">;
export type EmployeePenalty = Tables<"employee_penalties">;
export type EmployeeReward = Tables<"employee_rewards">;
export type EmployeeEvaluation = Tables<"employee_evaluations">;

export type EmployeeInsert = TablesInsert<"employees">;
export type EmployeeDocInsert = TablesInsert<"employee_docs">;

export type EmployeeWithDocs = Employee & { employee_docs: EmployeeDoc[] };

export type EmployeeFull = Employee & {
  employee_docs: EmployeeDoc[];
  employee_qualifications: EmployeeQualification[];
  employee_leaves: EmployeeLeave[];
  employee_penalties: EmployeePenalty[];
  employee_rewards: EmployeeReward[];
  employee_evaluations: EmployeeEvaluation[];
};

export const useEmployees = () =>
  useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select(
          "*, employee_docs(*), employee_qualifications(*), employee_leaves(*), employee_penalties(*), employee_rewards(*), employee_evaluations(*)"
        )
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as EmployeeFull[];
    },
  });

export const useAddEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emp: EmployeeInsert) => {
      const { data, error } = await supabase.from("employees").insert(emp).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
      const { error } = await supabase.from("employees").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useAddEmployeeDoc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: EmployeeDocInsert) => {
      const { error } = await supabase.from("employee_docs").insert(doc);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useDeleteEmployeeDoc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_docs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

// Generic helpers for related tables
type RelatedTable =
  | "employee_qualifications"
  | "employee_leaves"
  | "employee_penalties"
  | "employee_rewards"
  | "employee_evaluations";

export const useAddEmployeeRecord = <T extends RelatedTable>(table: T) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: TablesInsert<T>) => {
      const { error } = await (supabase.from(table) as any).insert(record);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useDeleteEmployeeRecord = (table: RelatedTable) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};
