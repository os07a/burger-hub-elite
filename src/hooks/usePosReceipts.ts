import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PosReceiptRow {
  id: string;
  receipt_number: string;
  receipt_date: string;
  created_at_pos: string | null;
  receipt_type: string;
  total: number;
  cash: number;
  card: number;
  delivery: number;
  gross: number;
  discount: number;
  tax: number;
  cashier_name: string | null;
  cashier_id: string | null;
  synced_at: string;
  created_at: string;
}

export const usePosReceipts = (date: string, limit = 20) => {
  return useQuery({
    queryKey: ["pos_receipts", date, limit],
    queryFn: async (): Promise<PosReceiptRow[]> => {
      const { data, error } = await supabase
        .from("pos_receipts")
        .select("*")
        .eq("receipt_date", date)
        .order("created_at_pos", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as unknown as PosReceiptRow[]) ?? [];
    },
  });
};
