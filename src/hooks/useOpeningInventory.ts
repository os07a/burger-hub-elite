import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OpeningRun {
  id: string;
  run_type: "opening" | "adjustment";
  run_date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export const useOpeningInventoryRuns = () =>
  useQuery({
    queryKey: ["opening_inventory_runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opening_inventory_runs")
        .select("*")
        .order("run_date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as OpeningRun[];
    },
  });

interface SubmitItem {
  inventory_item_id: string;
  current_quantity: number;
  new_quantity: number;
  cost_per_unit: number;
}

interface SubmitInput {
  items: SubmitItem[];
  notes?: string | null;
}

export const useSubmitOpeningInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, notes }: SubmitInput) => {
      // Decide run type
      const { count, error: countErr } = await supabase
        .from("opening_inventory_runs")
        .select("*", { count: "exact", head: true });
      if (countErr) throw countErr;
      const runType: "opening" | "adjustment" = (count ?? 0) === 0 ? "opening" : "adjustment";

      const { data: userData } = await supabase.auth.getUser();

      const { data: runRow, error: runErr } = await supabase
        .from("opening_inventory_runs")
        .insert({
          run_type: runType,
          notes: notes ?? null,
          created_by: userData.user?.id ?? null,
        })
        .select()
        .single();
      if (runErr) throw runErr;

      const movementType = runType;
      const changed = items.filter((it) => Number(it.new_quantity) !== Number(it.current_quantity));

      // Update each item & log movement
      for (const it of changed) {
        const delta = Number(it.new_quantity) - Number(it.current_quantity);

        const { error: upErr } = await supabase
          .from("inventory_items")
          .update({ quantity: it.new_quantity, updated_at: new Date().toISOString() })
          .eq("id", it.inventory_item_id);
        if (upErr) throw upErr;

        const { error: mvErr } = await supabase.from("inventory_movements").insert({
          inventory_item_id: it.inventory_item_id,
          movement_type: movementType,
          quantity: delta,
          reference_id: runRow.id,
          reference_type: "opening_inventory_runs",
          cost_at_movement: it.cost_per_unit,
          notes: notes ?? null,
          created_by: userData.user?.id ?? null,
        });
        if (mvErr) throw mvErr;
      }

      return { run: runRow, changed_count: changed.length };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opening_inventory_runs"] });
      qc.invalidateQueries({ queryKey: ["inventory_items"] });
    },
  });
};
