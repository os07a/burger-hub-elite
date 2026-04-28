import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTriggerStatus = () =>
  useQuery({
    queryKey: ["inventory_trigger_status"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-trigger-status");
      if (error) throw error;
      return data as { enabled: boolean };
    },
    refetchOnWindowFocus: false,
  });

export const useToggleTrigger = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enable: boolean) => {
      const fn = enable ? "enable-inventory-trigger" : "disable-inventory-trigger";
      const { data, error } = await supabase.functions.invoke(fn);
      if (error) throw error;
      return data as { enabled: boolean };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory_trigger_status"] });
    },
  });
};
