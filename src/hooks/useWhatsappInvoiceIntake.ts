import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InvoiceIntakeRow {
  id: string;
  from_phone: string;
  meta_message_id: string | null;
  media_id: string;
  image_url: string | null;
  status: "processing" | "success" | "failed" | string;
  invoice_id: string | null;
  supplier_name: string | null;
  amount: number | null;
  error_message: string | null;
  processing_time_ms: number | null;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

export function useWhatsappInvoiceIntakeList(limit = 20) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["wa-invoice-intake", limit],
    queryFn: async (): Promise<InvoiceIntakeRow[]> => {
      const { data, error } = await supabase
        .from("whatsapp_invoice_intake")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as InvoiceIntakeRow[]) ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("wa-invoice-intake-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_invoice_intake" },
        () => {
          qc.invalidateQueries({ queryKey: ["wa-invoice-intake"] });
          qc.invalidateQueries({ queryKey: ["wa-invoice-intake-stats"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
}

export interface IntakeStats {
  todayTotal: number;
  todaySuccess: number;
  todayFailed: number;
  todayProcessing: number;
  failedRecentCount: number;
}

export function useWhatsappInvoiceIntakeStats() {
  return useQuery({
    queryKey: ["wa-invoice-intake-stats"],
    queryFn: async (): Promise<IntakeStats> => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("whatsapp_invoice_intake")
        .select("status, created_at")
        .gte("created_at", todayStart.toISOString())
        .limit(1000);
      if (error) throw error;

      const rows = data ?? [];
      let todaySuccess = 0;
      let todayFailed = 0;
      let todayProcessing = 0;
      for (const r of rows) {
        if (r.status === "success") todaySuccess++;
        else if (r.status === "failed") todayFailed++;
        else if (r.status === "processing") todayProcessing++;
      }

      // Failed in the last 7 days (badge counter)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("whatsapp_invoice_intake")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed")
        .gte("created_at", weekAgo);

      return {
        todayTotal: rows.length,
        todaySuccess,
        todayFailed,
        todayProcessing,
        failedRecentCount: count ?? 0,
      };
    },
    staleTime: 30_000,
  });
}

export function useRetryInvoiceProcessing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: InvoiceIntakeRow) => {
      const { data, error } = await supabase.functions.invoke("process-whatsapp-invoice", {
        body: {
          media_id: row.media_id,
          from_phone: row.from_phone,
          message_id: row.meta_message_id ?? `retry-${row.id}`,
          caption: row.caption ?? undefined,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wa-invoice-intake"] });
      qc.invalidateQueries({ queryKey: ["wa-invoice-intake-stats"] });
    },
  });
}