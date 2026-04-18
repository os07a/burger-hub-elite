import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePosReceipts = (date: string, limit = 20) => {
  return useQuery({
    queryKey: ["pos_receipts", date, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_receipts")
        .select("*")
        .eq("receipt_date", date)
        .order("created_at_pos", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
};
