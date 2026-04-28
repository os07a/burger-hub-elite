import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type ProductInsert = TablesInsert<"products">;

export const useProducts = (opts: { includeArchived?: boolean } = {}) =>
  useQuery({
    queryKey: ["products", opts.includeArchived ? "with_archived" : "active_only"],
    queryFn: async () => {
      let q = supabase.from("products").select("*").order("created_at", { ascending: true });
      if (!opts.includeArchived) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return data as Product[];
    },
  });

export const useAddProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: ProductInsert) => {
      const { data, error } = await supabase.from("products").insert(p).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
};

// Soft-archive / restore
export const useArchiveProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("products").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
};
