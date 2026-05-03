import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ZatcaInvoice } from "@/lib/zatcaQrParser";

export type IntakeSource = "camera" | "upload" | "zatca_qr";

export interface IntakeResult {
  ok: true;
  invoice_id: string;
  supplier_id: string | null;
  supplier_name?: string;
  amount: number;
  confidence: number;
  needs_review: boolean;
  line_items_count: number;
}

interface CameraOrUploadInput {
  source: "camera" | "upload";
  image_base64: string; // data URI
  caption?: string;
}

interface ZatcaInput {
  source: "zatca_qr";
  zatca_parsed: ZatcaInvoice;
  zatca_qr_data?: string;
}

type Input = CameraOrUploadInput | ZatcaInput;

export const useProcessInvoiceIntake = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Input): Promise<IntakeResult> => {
      const { data, error } = await supabase.functions.invoke("process-supplier-invoice", {
        body: input,
      });
      if (error) throw new Error(error.message ?? "تعذر معالجة الفاتورة");
      if (!data?.ok) throw new Error(data?.error ?? "فشل غير معروف");
      return data as IntakeResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["archive-invoices"] });
      qc.invalidateQueries({ queryKey: ["whatsapp-invoice-intake"] });
    },
  });
};

export interface BatchSummary {
  invoices_count: number;
  total_amount: number;
  line_items_count: number;
  date_from: string | null;
  date_to: string | null;
  categories: { category: string; total: number; pct: number }[];
  top_supplier: { name: string; total: number; count: number } | null;
  top_item: { name: string; total: number } | null;
}

export const useBatchInvoiceSummary = (invoiceIds: string[]) => {
  return useQuery({
    queryKey: ["batch-invoice-summary", invoiceIds.sort().join(",")],
    enabled: invoiceIds.length > 0,
    queryFn: async (): Promise<BatchSummary> => {
      const { data: invoices, error: invErr } = await supabase
        .from("invoices")
        .select("id, date, amount, supplier_name")
        .in("id", invoiceIds);
      if (invErr) throw invErr;

      const { data: lines, error: lineErr } = await supabase
        .from("invoice_line_items")
        .select("invoice_id, item_name, total, inventory_item_id")
        .in("invoice_id", invoiceIds);
      if (lineErr) throw lineErr;

      const invIds = (lines ?? [])
        .map((l) => l.inventory_item_id)
        .filter((x): x is string => !!x);
      let invMap = new Map<string, string>();
      if (invIds.length > 0) {
        const { data: inv } = await supabase
          .from("inventory_items")
          .select("id, category")
          .in("id", invIds);
        invMap = new Map((inv ?? []).map((i) => [i.id, i.category ?? "غير مصنّف"]));
      }

      const total_amount = (invoices ?? []).reduce((s, i) => s + Number(i.amount || 0), 0);
      const dates = (invoices ?? []).map((i) => i.date).filter(Boolean).sort();
      const date_from = dates[0] ?? null;
      const date_to = dates[dates.length - 1] ?? null;

      // Categories
      const catTotals = new Map<string, number>();
      let categorizedSum = 0;
      for (const l of lines ?? []) {
        const cat = l.inventory_item_id
          ? (invMap.get(l.inventory_item_id) ?? "غير مصنّف")
          : "غير مصنّف";
        const v = Number(l.total || 0);
        catTotals.set(cat, (catTotals.get(cat) ?? 0) + v);
        categorizedSum += v;
      }
      const denom = categorizedSum > 0 ? categorizedSum : total_amount || 1;
      const categories = [...catTotals.entries()]
        .map(([category, total]) => ({ category, total, pct: (total / denom) * 100 }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Top supplier
      const supTotals = new Map<string, { total: number; count: number }>();
      for (const i of invoices ?? []) {
        const k = i.supplier_name ?? "غير معروف";
        const cur = supTotals.get(k) ?? { total: 0, count: 0 };
        cur.total += Number(i.amount || 0);
        cur.count += 1;
        supTotals.set(k, cur);
      }
      const top_supplier_entry = [...supTotals.entries()].sort((a, b) => b[1].total - a[1].total)[0];
      const top_supplier = top_supplier_entry
        ? { name: top_supplier_entry[0], total: top_supplier_entry[1].total, count: top_supplier_entry[1].count }
        : null;

      // Top item
      const top_item_row = [...(lines ?? [])].sort((a, b) => Number(b.total || 0) - Number(a.total || 0))[0];
      const top_item = top_item_row
        ? { name: top_item_row.item_name, total: Number(top_item_row.total || 0) }
        : null;

      return {
        invoices_count: invoices?.length ?? 0,
        total_amount,
        line_items_count: lines?.length ?? 0,
        date_from,
        date_to,
        categories,
        top_supplier,
        top_item,
      };
    },
  });
};