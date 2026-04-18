import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LoyaltyCustomer {
  id: string;
  loyverse_customer_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  total_visits: number;
  total_points: number;
  total_spent: number;
  tier: string;
  first_visit: string | null;
  last_visit: string | null;
  synced_at: string;
}

export function useLoyaltyCustomers() {
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("loyalty_customers")
      .select("*")
      .order("total_visits", { ascending: false })
      .limit(500);

    if (error) {
      setError(error.message);
      setCustomers([]);
    } else {
      setError(null);
      setCustomers((data ?? []) as LoyaltyCustomer[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomers();
    // auto-refresh every 5 minutes
    const interval = setInterval(fetchCustomers, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCustomers]);

  const stats = {
    total: customers.length,
    gold: customers.filter((c) => c.tier === "gold").length,
    silver: customers.filter((c) => c.tier === "silver").length,
    regular: customers.filter((c) => c.tier === "regular").length,
    eligibleFifthVisit: customers.filter((c) => c.total_visits >= 5).length,
    totalPoints: customers.reduce((s, c) => s + Number(c.total_points || 0), 0),
    totalSpent: customers.reduce((s, c) => s + Number(c.total_spent || 0), 0),
  };

  return { customers, loading, error, refetch: fetchCustomers, stats };
}
