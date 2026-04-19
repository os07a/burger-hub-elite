import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RestaurantSettings {
  id: string;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
}

export function useRestaurantSettings() {
  return useQuery({
    queryKey: ["restaurant_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("id, latitude, longitude, radius_meters")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as RestaurantSettings | null;
    },
  });
}

export function useUpdateRestaurantLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, latitude, longitude, radius_meters }: { id?: string; latitude: number; longitude: number; radius_meters?: number }) => {
      if (id) {
        const { error } = await supabase
          .from("restaurant_settings")
          .update({ latitude, longitude, ...(radius_meters ? { radius_meters } : {}) })
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("restaurant_settings")
          .insert({ latitude, longitude, radius_meters: radius_meters ?? 200 });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["restaurant_settings"] }),
  });
}
