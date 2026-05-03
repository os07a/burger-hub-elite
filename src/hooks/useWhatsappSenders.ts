import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AllowedSender {
  id: string;
  phone: string;
  display_name: string | null;
  is_active: boolean;
  created_at: string;
}

export const useAllowedSenders = () =>
  useQuery({
    queryKey: ["whatsapp_allowed_senders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_allowed_senders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AllowedSender[];
    },
  });

export const useAddAllowedSender = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { phone: string; display_name?: string }) => {
      const cleaned = input.phone.replace(/\D/g, "");
      if (!cleaned) throw new Error("رقم غير صالح");
      const { data, error } = await supabase
        .from("whatsapp_allowed_senders")
        .insert({ phone: cleaned, display_name: input.display_name ?? null, is_active: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp_allowed_senders"] }),
  });
};

export const useToggleAllowedSender = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("whatsapp_allowed_senders")
        .update({ is_active: input.is_active })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp_allowed_senders"] }),
  });
};

export const useDeleteAllowedSender = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("whatsapp_allowed_senders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp_allowed_senders"] }),
  });
};
