import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Founding expenses from the agreement (locked baseline)
export const FOUNDING_EXPENSES_TOTAL = 292_405;
export const FOUNDING_BUCKETS = {
  shop: 108_000, // محل
  operating6m: 70_000, // تشغيل 6 أشهر
  ideaAndSetup: 30_000, // فكرة وتأسيس
  uncategorized: 84_405, // فروقات بنود الإكسل (غير مصنفة في الاتفاق المختصر)
};

export interface RestaurantTotalCost {
  founding: number;
  invoicesPaid: number;
  invoicesPending: number;
  payrollMonthly: number;
  payrollAccumulated: number; // since first sale
  total: number;
  monthsActive: number;
}

const monthsBetween = (from: Date, to: Date) => {
  const y = to.getFullYear() - from.getFullYear();
  const m = to.getMonth() - from.getMonth();
  return Math.max(1, y * 12 + m + 1);
};

export const useTotalCostBreakdown = () => {
  return useQuery({
    queryKey: ["restaurant_total_cost"],
    queryFn: async (): Promise<RestaurantTotalCost> => {
      const [invRes, empRes, salesRes] = await Promise.all([
        supabase.from("invoices").select("amount,status,date"),
        supabase.from("employees").select("salary,status"),
        supabase.from("daily_sales").select("date").order("date", { ascending: true }).limit(1),
      ]);

      const invoices = invRes.data || [];
      const employees = empRes.data || [];
      const firstSale = salesRes.data?.[0]?.date ? new Date(salesRes.data[0].date) : new Date();

      const invoicesPaid = invoices
        .filter((i: any) => i.status === "مدفوعة" || i.status === "paid")
        .reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
      const invoicesPending = invoices
        .filter((i: any) => i.status !== "مدفوعة" && i.status !== "paid")
        .reduce((s: number, i: any) => s + Number(i.amount || 0), 0);

      const payrollMonthly = employees.reduce((s: number, e: any) => s + Number(e.salary || 0), 0);
      const monthsActive = monthsBetween(firstSale, new Date());
      const payrollAccumulated = payrollMonthly * monthsActive;

      const total = FOUNDING_EXPENSES_TOTAL + invoicesPaid + payrollAccumulated;

      return {
        founding: FOUNDING_EXPENSES_TOTAL,
        invoicesPaid,
        invoicesPending,
        payrollMonthly,
        payrollAccumulated,
        total,
        monthsActive,
      };
    },
  });
};

export interface RestaurantTotalRevenue {
  dailySalesTotal: number;
  posReceiptsTotal: number;
  combinedTotal: number; // uses max to avoid double-count when both sources cover same period
  monthsCovered: number;
  averageMonthly: number;
}

export const useTotalRevenue = () => {
  return useQuery({
    queryKey: ["restaurant_total_revenue"],
    queryFn: async (): Promise<RestaurantTotalRevenue> => {
      const [dsRes, posRes] = await Promise.all([
        supabase.from("daily_sales").select("date,total_sales"),
        supabase.from("pos_receipts").select("receipt_date,total"),
      ]);

      const ds = dsRes.data || [];
      const pos = posRes.data || [];

      const dailySalesTotal = ds.reduce((s: any, r: any) => s + Number(r.total_sales || 0), 0);
      const posReceiptsTotal = pos.reduce((s: any, r: any) => s + Number(r.total || 0), 0);

      // Use the larger source to avoid double counting (POS auto-syncs daily_sales in some setups)
      const combinedTotal = Math.max(dailySalesTotal, posReceiptsTotal);

      const allDates = [
        ...ds.map((r: any) => r.date),
        ...pos.map((r: any) => r.receipt_date),
      ].filter(Boolean);
      const monthSet = new Set(allDates.map((d: string) => d.slice(0, 7)));
      const monthsCovered = Math.max(1, monthSet.size);
      const averageMonthly = combinedTotal / monthsCovered;

      return {
        dailySalesTotal,
        posReceiptsTotal,
        combinedTotal,
        monthsCovered,
        averageMonthly,
      };
    },
  });
};
