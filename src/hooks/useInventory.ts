import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type InventoryItem = Tables<"inventory_items">;
export type InventoryInsert = TablesInsert<"inventory_items">;

export const useInventory = () =>
  useQuery({
    queryKey: ["inventory_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as InventoryItem[];
    },
  });

export const useAddInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: InventoryInsert) => {
      const { data, error } = await supabase.from("inventory_items").insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory_items"] }),
  });
};

export const useUpdateInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryItem> & { id: string }) => {
      const { error } = await supabase.from("inventory_items").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory_items"] }),
  });
};

export const useDeleteInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory_items"] }),
  });
};

// Helper: status from quantity vs min
export const getStockStatus = (qty: number, min: number) => {
  if (qty <= min * 0.5) return { label: "حرج", variant: "danger" as const };
  if (qty <= min) return { label: "منخفض", variant: "warning" as const };
  return { label: "كافٍ", variant: "success" as const };
};
