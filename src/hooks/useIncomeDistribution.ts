import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MonthlyIncome {
  month: string; // YYYY-MM
  totalRevenue: number;
  sharesGenerated: number;
  perShareAmount: number;
  reservedAmount: number;
}

const SHARE_UNIT = 1000;

export const useMonthlyIncomes = (paidShares: number) => {
  return useQuery({
    queryKey: ["monthly_incomes", paidShares],
    queryFn: async (): Promise<MonthlyIncome[]> => {
      const since = new Date();
      since.setMonth(since.getMonth() - 6);
      const { data, error } = await supabase
        .from("daily_sales")
        .select("date,total_sales")
        .gte("date", since.toISOString().slice(0, 10))
        .order("date", { ascending: true });
      if (error) throw error;

      const buckets = new Map<string, number>();
      for (const row of data || []) {
        const m = (row.date as string).slice(0, 7);
        buckets.set(m, (buckets.get(m) || 0) + Number(row.total_sales || 0));
      }

      return Array.from(buckets.entries()).map(([month, totalRevenue]) => {
        const sharesGenerated = Math.floor(totalRevenue / SHARE_UNIT);
        const perShareAmount = paidShares > 0 ? (sharesGenerated * SHARE_UNIT) / paidShares : 0;
        const distributed = perShareAmount * paidShares;
        const reservedAmount = totalRevenue - distributed;
        return { month, totalRevenue, sharesGenerated, perShareAmount, reservedAmount };
      });
    },
    enabled: paidShares >= 0,
  });
};

export const projectCapitalCompletion = (
  remainingCapital: number,
  avgMonthlyRevenue: number,
): { months: number; etaLabel: string } | null => {
  if (avgMonthlyRevenue <= 0) return null;
  const months = Math.ceil(remainingCapital / avgMonthlyRevenue);
  const eta = new Date();
  eta.setMonth(eta.getMonth() + months);
  return {
    months,
    etaLabel: eta.toLocaleDateString("ar-SA", { year: "numeric", month: "long" }),
  };
};
