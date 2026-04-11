import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Employee = Tables<"employees">;
export type EmployeeDoc = Tables<"employee_docs">;
export type EmployeeInsert = TablesInsert<"employees">;
export type EmployeeDocInsert = TablesInsert<"employee_docs">;

export type EmployeeWithDocs = Employee & { employee_docs: EmployeeDoc[] };

export const useEmployees = () =>
  useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*, employee_docs(*)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as EmployeeWithDocs[];
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
