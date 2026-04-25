import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeSaudiPhone } from "@/lib/phoneNormalize";

export interface WhatsappContact {
  /** Normalized phone (E.164 without +) used as conversation key */
  phone: string;
  name: string | null;
  customerId: string | null;
  tier: "gold" | "silver" | "regular" | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastDirection: "inbound" | "outbound" | null;
  unreadCount: number;
  withinWindow: boolean; // last inbound within 24h
}

export function useWhatsappContacts() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["whatsapp-contacts"],
    queryFn: async (): Promise<WhatsappContact[]> => {
      // Pull customers + recent messages in parallel
      const [custRes, msgRes] = await Promise.all([
        supabase
          .from("loyalty_customers")
          .select("id, name, phone, tier")
          .limit(2000),
        supabase
          .from("whatsapp_messages")
          .select(
            "id, direction, from_phone, to_phone, body, sent_at, read_by_user_at, customer_id",
          )
          .order("sent_at", { ascending: false })
          .limit(2000),
      ]);

      if (custRes.error) throw custRes.error;
      if (msgRes.error) throw msgRes.error;

      const customers = custRes.data ?? [];
      const messages = msgRes.data ?? [];

      const contactMap = new Map<string, WhatsappContact>();

      // Seed with customers that have a valid phone
      for (const c of customers) {
        const norm = normalizeSaudiPhone(c.phone);
        if (!norm) continue;
        contactMap.set(norm, {
          phone: norm,
          name: c.name ?? null,
          customerId: c.id,
          tier: (c.tier as WhatsappContact["tier"]) ?? "regular",
          lastMessage: null,
          lastMessageAt: null,
          lastDirection: null,
          unreadCount: 0,
          withinWindow: false,
        });
      }

      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;

      // Walk messages newest -> oldest
      for (const m of messages) {
        const peer =
          m.direction === "inbound"
            ? normalizeSaudiPhone(m.from_phone) ?? m.from_phone
            : normalizeSaudiPhone(m.to_phone) ?? m.to_phone;
        if (!peer) continue;

        let entry = contactMap.get(peer);
        if (!entry) {
          entry = {
            phone: peer,
            name: null,
            customerId: m.customer_id ?? null,
            tier: null,
            lastMessage: null,
            lastMessageAt: null,
            lastDirection: null,
            unreadCount: 0,
            withinWindow: false,
          };
          contactMap.set(peer, entry);
        }

        // Latest message for this contact (first one we encounter wins)
        if (!entry.lastMessageAt) {
          entry.lastMessage = m.body;
          entry.lastMessageAt = m.sent_at;
          entry.lastDirection = m.direction as "inbound" | "outbound";
        }

        if (m.direction === "inbound") {
          if (!m.read_by_user_at) entry.unreadCount += 1;
          const t = new Date(m.sent_at).getTime();
          if (t >= dayAgo) entry.withinWindow = true;
        }
      }

      const list = Array.from(contactMap.values());
      list.sort((a, b) => {
        const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return tb - ta;
      });
      return list;
    },
    staleTime: 15_000,
  });

  useEffect(() => {
    const channelName = `whatsapp-contacts-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_messages" },
        () => qc.invalidateQueries({ queryKey: ["whatsapp-contacts"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
}
