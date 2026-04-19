import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ArchiveInvoice = Tables<"invoices"> & {
  suppliers?: { name: string; category: string | null } | null;
};

export const useArchiveInvoices = () =>
  useQuery({
    queryKey: ["archive-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, suppliers(name, category)")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as ArchiveInvoice[];
    },
  });

export const useUploadInvoiceImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ invoiceId, file }: { invoiceId: string; file: File }) => {
      const ext = file.name.split(".").pop();
      const path = `${invoiceId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("invoice-images")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from("invoice-images")
        .getPublicUrl(path);

      const { error: updErr } = await supabase
        .from("invoices")
        .update({ image_url: path })
        .eq("id", invoiceId);
      if (updErr) throw updErr;

      return urlData.publicUrl;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["archive-invoices"] }),
  });
};

export const useInvoiceImageUrl = (path: string | null) => {
  return useQuery({
    queryKey: ["invoice-image-signed", path],
    enabled: !!path,
    queryFn: async () => {
      if (!path) return null;
      const { data, error } = await supabase.storage
        .from("invoice-images")
        .createSignedUrl(path, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  });
};
