import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Supplier = Tables<"suppliers">;
export type SupplierInsert = TablesInsert<"suppliers">;
export type Invoice = Tables<"invoices">;
export type InvoiceInsert = TablesInsert<"invoices">;

export type SupplierWithInvoices = Supplier & { invoices: Invoice[] };

export const useSuppliers = () =>
  useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*, invoices(*)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as SupplierWithInvoices[];
    },
  });

export const useAddSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: SupplierInsert) => {
      const { data, error } = await supabase.from("suppliers").insert(s).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { error } = await supabase.from("suppliers").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

export const useAddInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inv: InvoiceInsert) => {
      const { error } = await supabase.from("invoices").insert(inv);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

export const useDeleteInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};
