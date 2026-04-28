import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RecipeIngredient {
  id: string;
  product_id: string;
  inventory_item_id: string;
  quantity_per_unit: number;
  unit: string;
  waste_percentage: number;
  notes: string | null;
  valid_from: string;
  valid_to: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  inventory_items?: {
    id: string;
    name: string;
    unit: string;
    cost_per_unit: number;
    quantity: number;
  };
}

export const useProductRecipes = (productId?: string) =>
  useQuery({
    queryKey: ["product_recipes", "active", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_recipes")
        .select("*, inventory_items(id, name, unit, cost_per_unit, quantity)")
        .eq("product_id", productId!)
        .is("valid_to", null)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as RecipeIngredient[];
    },
  });

export const useRecipeHistory = (productId?: string) =>
  useQuery({
    queryKey: ["product_recipes", "history", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_recipes")
        .select("*, inventory_items(id, name, unit, cost_per_unit)")
        .eq("product_id", productId!)
        .not("valid_to", "is", null)
        .order("valid_to", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as RecipeIngredient[];
    },
  });

interface AddInput {
  product_id: string;
  inventory_item_id: string;
  quantity_per_unit: number;
  unit: string;
  waste_percentage?: number;
  notes?: string | null;
}

export const useAddRecipeIngredient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddInput) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("product_recipes")
        .insert({
          ...input,
          waste_percentage: input.waste_percentage ?? 0,
          notes: input.notes ?? null,
          created_by: userData.user?.id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["product_recipes", "active", v.product_id] });
      qc.invalidateQueries({ queryKey: ["product_recipes", "history", v.product_id] });
    },
  });
};

interface UpdateInput {
  old_id: string;
  product_id: string;
  inventory_item_id: string;
  quantity_per_unit: number;
  unit: string;
  waste_percentage: number;
  notes: string | null;
}

// Versioned update: close the old row, insert a new active row
export const useUpdateRecipeIngredient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateInput) => {
      const { data: userData } = await supabase.auth.getUser();
      const now = new Date().toISOString();

      const { error: closeErr } = await supabase
        .from("product_recipes")
        .update({ valid_to: now })
        .eq("id", input.old_id)
        .is("valid_to", null);
      if (closeErr) throw closeErr;

      const { data, error: insErr } = await supabase
        .from("product_recipes")
        .insert({
          product_id: input.product_id,
          inventory_item_id: input.inventory_item_id,
          quantity_per_unit: input.quantity_per_unit,
          unit: input.unit,
          waste_percentage: input.waste_percentage,
          notes: input.notes,
          created_by: userData.user?.id ?? null,
        })
        .select()
        .single();
      if (insErr) throw insErr;
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["product_recipes", "active", v.product_id] });
      qc.invalidateQueries({ queryKey: ["product_recipes", "history", v.product_id] });
    },
  });
};

// Soft-delete: close current version, no new row
export const useDeleteRecipeIngredient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, product_id }: { id: string; product_id: string }) => {
      const { error } = await supabase
        .from("product_recipes")
        .update({ valid_to: new Date().toISOString() })
        .eq("id", id)
        .is("valid_to", null);
      if (error) throw error;
      return { id, product_id };
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["product_recipes", "active", r.product_id] });
      qc.invalidateQueries({ queryKey: ["product_recipes", "history", r.product_id] });
    },
  });
};
