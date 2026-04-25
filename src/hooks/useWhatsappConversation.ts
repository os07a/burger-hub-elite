import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeSaudiPhone } from "@/lib/phoneNormalize";

export interface ConvMessage {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  status: string;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  media_type: string | null;
  from_phone: string | null;
  to_phone: string;
}

export function useWhatsappConversation(phone: string | null) {
  const qc = useQueryClient();
  const norm = phone ? normalizeSaudiPhone(phone) ?? phone : null;

  const query = useQuery({
    queryKey: ["whatsapp-conversation", norm],
    enabled: !!norm,
    queryFn: async (): Promise<ConvMessage[]> => {
      if (!norm) return [];
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select(
          "id, direction, body, status, sent_at, delivered_at, read_at, media_type, from_phone, to_phone",
        )
        .or(`from_phone.eq.${norm},to_phone.eq.${norm}`)
        .order("sent_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as ConvMessage[];
    },
  });

  useEffect(() => {
    if (!norm) return;
    const channelName = `whatsapp-conv-${norm}-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_messages" },
        () => qc.invalidateQueries({ queryKey: ["whatsapp-conversation", norm] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, norm]);

  /** Mark all unread inbound messages from this phone as read */
  const markRead = async () => {
    if (!norm) return;
    await supabase
      .from("whatsapp_messages")
      .update({ read_by_user_at: new Date().toISOString() })
      .eq("direction", "inbound")
      .eq("from_phone", norm)
      .is("read_by_user_at", null);
    qc.invalidateQueries({ queryKey: ["whatsapp-contacts"] });
  };

  return { ...query, markRead };
}
