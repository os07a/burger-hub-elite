import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailySalesSummaryRow {
  date: string;
  gross_sales: number;
  refunds: number;
  discounts: number;
  net_sales: number;
  cogs: number;
  gross_profit: number;
  margin: number;
  taxes: number;
  total_sales: number;
  orders_count: number;
  cash_sales: number;
  card_sales: number;
  delivery_sales: number;
}

interface UseDailySalesSummaryOptions {
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

export const useDailySalesSummary = ({ fromDate, toDate, limit = 30 }: UseDailySalesSummaryOptions = {}) =>
  useQuery({
    queryKey: ["daily-sales-summary", fromDate, toDate, limit],
    queryFn: async (): Promise<DailySalesSummaryRow[]> => {
      let query = supabase
        .from("daily_sales")
        .select(
          "date,gross_sales,refunds,discounts,net_sales,cogs,gross_profit,margin,taxes,total_sales,orders_count,cash_sales,card_sales,delivery_sales",
        )
        .order("date", { ascending: false })
        .limit(limit);

      if (fromDate) query = query.gte("date", fromDate);
      if (toDate) query = query.lte("date", toDate);

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as DailySalesSummaryRow[]) ?? [];
    },
  });
