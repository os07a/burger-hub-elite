import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isValidSaudiPhone } from "@/lib/phoneNormalize";

export interface MessagingCustomer {
  id: string;
  name: string | null;
  phone: string | null;
  total_visits: number;
  total_points: number;
  total_spent: number;
  tier: "gold" | "silver" | "regular";
  last_visit: string | null;
  hasValidPhone: boolean;
}

export function useLoyaltyCustomersForMessaging() {
  return useQuery({
    queryKey: ["loyalty-customers-messaging"],
    queryFn: async (): Promise<MessagingCustomer[]> => {
      const { data, error } = await supabase
        .from("loyalty_customers")
        .select(
          "id, name, phone, total_visits, total_points, total_spent, tier, last_visit",
        )
        .order("total_visits", { ascending: false })
        .limit(1000);

      if (error) throw error;

      return (data ?? []).map((c) => ({
        ...c,
        tier: (c.tier as "gold" | "silver" | "regular") ?? "regular",
        total_visits: Number(c.total_visits ?? 0),
        total_points: Number(c.total_points ?? 0),
        total_spent: Number(c.total_spent ?? 0),
        hasValidPhone: isValidSaudiPhone(c.phone),
      }));
    },
    staleTime: 60_000,
  });
}