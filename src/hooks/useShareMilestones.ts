import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShareMilestone {
  id: string;
  due_date: string;
  shares_required: number;
  description: string | null;
  status: string;
}

export type MilestoneState = "met" | "upcoming" | "overdue";

export const computeMilestoneState = (m: ShareMilestone): MilestoneState => {
  if (m.status === "met") return "met";
  const due = new Date(m.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today ? "overdue" : "upcoming";
};

export const useShareMilestones = () => {
  return useQuery({
    queryKey: ["share_milestones"],
    queryFn: async (): Promise<ShareMilestone[]> => {
      const { data, error } = await supabase
        .from("share_milestones")
        .select("*")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return (data || []) as ShareMilestone[];
    },
  });
};
