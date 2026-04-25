import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WhatsappMessageRow {
  id: string;
  to_phone: string;
  body: string;
  template_name: string | null;
  customer_id: string | null;
  status: string;
  meta_message_id: string | null;
  error: string | null;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
}

export function useWhatsappMessages(limit = 30) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["whatsapp-messages", limit],
    queryFn: async (): Promise<WhatsappMessageRow[]> => {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select(
          "id, to_phone, body, template_name, customer_id, status, meta_message_id, error, sent_at, delivered_at, read_at",
        )
        .order("sent_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as WhatsappMessageRow[]) ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("whatsapp-messages-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_messages" },
        () => {
          qc.invalidateQueries({ queryKey: ["whatsapp-messages"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
}

export interface WhatsappStats {
  totalSent: number;
  todaySent: number;
  weekSent: number;
  delivered: number;
  read: number;
  failed: number;
  successRate: number;
}

export function useWhatsappStats() {
  return useQuery({
    queryKey: ["whatsapp-stats"],
    queryFn: async (): Promise<WhatsappStats> => {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("status, sent_at")
        .limit(5000);
      if (error) throw error;

      const rows = data ?? [];
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const weekStart = now - 7 * dayMs;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      let todaySent = 0;
      let weekSent = 0;
      let delivered = 0;
      let read = 0;
      let failed = 0;

      for (const r of rows) {
        const t = new Date(r.sent_at).getTime();
        if (t >= todayStart.getTime()) todaySent++;
        if (t >= weekStart) weekSent++;
        if (r.status === "delivered") delivered++;
        else if (r.status === "read") read++;
        else if (r.status === "failed" || r.status === "error") failed++;
      }

      const totalSent = rows.length;
      const successful = totalSent - failed;
      const successRate =
        totalSent > 0 ? Math.round((successful / totalSent) * 100) : 0;

      return {
        totalSent,
        todaySent,
        weekSent,
        delivered,
        read,
        failed,
        successRate,
      };
    },
    staleTime: 30_000,
  });
}