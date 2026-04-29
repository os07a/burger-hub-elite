import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReceiptLineItem {
  item_name: string;
  variant_name: string | null;
  quantity: number;
  net_total: number;
  gross_total: number;
}

export const useReceiptItemByReceipt = (receiptNumber: string | null) =>
  useQuery({
    queryKey: ["pos_receipt_items_by_receipt", receiptNumber],
    enabled: !!receiptNumber,
    queryFn: async (): Promise<ReceiptLineItem[]> => {
      const { data, error } = await supabase
        .from("pos_receipt_items")
        .select("item_name,variant_name,quantity,net_total,gross_total")
        .eq("receipt_number", receiptNumber as string);
      if (error) throw error;
      return (data ?? []) as ReceiptLineItem[];
    },
  });
