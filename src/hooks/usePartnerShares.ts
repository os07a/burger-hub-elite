import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PartnerShare {
  id: string;
  partner_name: string;
  shares_count: number;
  share_value: number;
  category: string;
  committed_date: string | null;
  paid_date: string | null;
  notes: string | null;
}

export const usePartnerShares = () => {
  return useQuery({
    queryKey: ["partner_shares"],
    queryFn: async (): Promise<PartnerShare[]> => {
      const { data, error } = await supabase
        .from("partner_shares")
        .select("*")
        .order("committed_date", { ascending: true });
      if (error) throw error;
      return (data || []) as PartnerShare[];
    },
  });
};

export interface PartnerSummary {
  partner: string;
  totalShares: number;
  paidShares: number;
  pendingShares: number;
  paidValue: number;
  pendingValue: number;
  byCategory: Record<string, number>;
}

export const summarizeShares = (shares: PartnerShare[]): PartnerSummary[] => {
  const map = new Map<string, PartnerSummary>();
  for (const s of shares) {
    const key = s.partner_name;
    if (!map.has(key)) {
      map.set(key, {
        partner: key,
        totalShares: 0,
        paidShares: 0,
        pendingShares: 0,
        paidValue: 0,
        pendingValue: 0,
        byCategory: {},
      });
    }
    const sum = map.get(key)!;
    sum.totalShares += s.shares_count;
    if (s.paid_date) {
      sum.paidShares += s.shares_count;
      sum.paidValue += s.shares_count * s.share_value;
    } else {
      sum.pendingShares += s.shares_count;
      sum.pendingValue += s.shares_count * s.share_value;
    }
    sum.byCategory[s.category] = (sum.byCategory[s.category] || 0) + s.shares_count;
  }
  return Array.from(map.values());
};
