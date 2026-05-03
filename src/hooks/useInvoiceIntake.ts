import { useMutation, useQueryClient } from "@tanstack/react-query";
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