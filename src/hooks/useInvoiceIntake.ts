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
  // Smart insights
  avg_invoice: number;
  suppliers_count: number;
  uncategorized_pct: number;
  largest_invoice: { amount: number; supplier: string | null; date: string | null } | null;
  top_items: { name: string; total: number }[];
  duplicate_suspects: { supplier: string; date: string; amount: number; count: number }[];
  price_spikes: { item_name: string; current_price: number; avg_price: number; pct: number }[];
  vs_last_period: { current: number; previous: number; pct_change: number | null } | null;
}

export const useBatchInvoiceSummary = (invoiceIds: string[]) => {
  return useQuery({
    queryKey: ["batch-invoice-summary", invoiceIds.sort().join(",")],
    enabled: invoiceIds.length > 0,
    queryFn: async (): Promise<BatchSummary> => {
      const { data: invoices, error: invErr } = await supabase
        .from("invoices")
        .select("id, date, amount, supplier_name, supplier_id")
        .in("id", invoiceIds);
      if (invErr) throw invErr;

      const { data: lines, error: lineErr } = await supabase
        .from("invoice_line_items")
        .select("invoice_id, item_name, total, unit_price, inventory_item_id")
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
      const top_items = [...(lines ?? [])]
        .map((l) => ({ name: l.item_name, total: Number(l.total || 0) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 3);
      const top_item = top_items[0] ?? null;

      // Smart insights
      const invoices_count = invoices?.length ?? 0;
      const avg_invoice = invoices_count > 0 ? total_amount / invoices_count : 0;
      const suppliers_count = new Set(
        (invoices ?? []).map((i) => i.supplier_name ?? "غير معروف")
      ).size;
      const uncategorizedTotal = catTotals.get("غير مصنّف") ?? 0;
      const uncategorized_pct =
        categorizedSum > 0 ? (uncategorizedTotal / categorizedSum) * 100 : 0;

      // Largest invoice
      const largestInv = [...(invoices ?? [])].sort(
        (a, b) => Number(b.amount || 0) - Number(a.amount || 0)
      )[0];
      const largest_invoice = largestInv
        ? {
            amount: Number(largestInv.amount || 0),
            supplier: largestInv.supplier_name ?? null,
            date: largestInv.date ?? null,
          }
        : null;

      // Duplicate suspects: same supplier + same date + same amount
      const dupKey = new Map<string, { supplier: string; date: string; amount: number; count: number }>();
      for (const i of invoices ?? []) {
        const k = `${i.supplier_name ?? "?"}|${i.date}|${Number(i.amount || 0).toFixed(2)}`;
        const cur = dupKey.get(k);
        if (cur) cur.count += 1;
        else
          dupKey.set(k, {
            supplier: i.supplier_name ?? "غير معروف",
            date: i.date,
            amount: Number(i.amount || 0),
            count: 1,
          });
      }
      const duplicate_suspects = [...dupKey.values()].filter((d) => d.count > 1);

      // Price spikes: compare unit_price vs avg of last 90 days for same inventory_item_id
      const linkedItemIds = (lines ?? [])
        .map((l) => l.inventory_item_id)
        .filter((x): x is string => !!x);
      const price_spikes: BatchSummary["price_spikes"] = [];
      if (linkedItemIds.length > 0) {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const { data: histLines } = await supabase
          .from("invoice_line_items")
          .select("inventory_item_id, unit_price, invoice_id, created_at")
          .in("inventory_item_id", linkedItemIds)
          .gte("created_at", ninetyDaysAgo.toISOString());
        const currentSet = new Set(invoiceIds);
        const histMap = new Map<string, number[]>();
        for (const h of histLines ?? []) {
          if (currentSet.has(h.invoice_id)) continue; // exclude current batch
          if (!h.inventory_item_id) continue;
          const arr = histMap.get(h.inventory_item_id) ?? [];
          arr.push(Number(h.unit_price || 0));
          histMap.set(h.inventory_item_id, arr);
        }
        // Group current batch lines by inventory_item_id -> avg current unit_price
        const curMap = new Map<string, { name: string; prices: number[] }>();
        for (const l of lines ?? []) {
          if (!l.inventory_item_id) continue;
          const cur = curMap.get(l.inventory_item_id) ?? { name: l.item_name, prices: [] };
          cur.prices.push(Number(l.unit_price || 0));
          curMap.set(l.inventory_item_id, cur);
        }
        for (const [iid, { name, prices }] of curMap.entries()) {
          const hist = histMap.get(iid);
          if (!hist || hist.length === 0) continue;
          const avgHist = hist.reduce((s, x) => s + x, 0) / hist.length;
          const avgCur = prices.reduce((s, x) => s + x, 0) / prices.length;
          if (avgHist <= 0 || avgCur <= 0) continue;
          const pct = ((avgCur - avgHist) / avgHist) * 100;
          if (pct >= 15) {
            price_spikes.push({
              item_name: name,
              current_price: avgCur,
              avg_price: avgHist,
              pct,
            });
          }
        }
        price_spikes.sort((a, b) => b.pct - a.pct);
      }

      // vs last period: same number of days before date_from
      let vs_last_period: BatchSummary["vs_last_period"] = null;
      if (date_from && date_to) {
        const from = new Date(date_from);
        const to = new Date(date_to);
        const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
        const prevTo = new Date(from);
        prevTo.setDate(prevTo.getDate() - 1);
        const prevFrom = new Date(prevTo);
        prevFrom.setDate(prevFrom.getDate() - (days - 1));
        const isoDate = (d: Date) => d.toISOString().slice(0, 10);
        const { data: prevInv } = await supabase
          .from("invoices")
          .select("amount")
          .gte("date", isoDate(prevFrom))
          .lte("date", isoDate(prevTo))
          .not("id", "in", `(${invoiceIds.join(",")})`);
        const previous = (prevInv ?? []).reduce((s, x) => s + Number(x.amount || 0), 0);
        const pct_change = previous > 0 ? ((total_amount - previous) / previous) * 100 : null;
        vs_last_period = { current: total_amount, previous, pct_change };
      }

      return {
        invoices_count,
        total_amount,
        line_items_count: lines?.length ?? 0,
        date_from,
        date_to,
        categories,
        top_supplier,
        top_item,
        avg_invoice,
        suppliers_count,
        uncategorized_pct,
        largest_invoice,
        top_items,
        duplicate_suspects,
        price_spikes,
        vs_last_period,
      };
    },
  });
};