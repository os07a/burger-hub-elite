import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MetaTemplate } from "@/lib/templateUtils";

interface ListTemplatesResponse {
  success?: boolean;
  total?: number;
  approved?: number;
  templates: MetaTemplate[];
  error?: string;
}

export function useWhatsappTemplates() {
  return useQuery({
    queryKey: ["whatsapp-templates"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ListTemplatesResponse> => {
      const { data, error } = await supabase.functions.invoke(
        "list-whatsapp-templates",
        { body: {} },
      );
      if (error) throw error;
      return (data ?? { templates: [] }) as ListTemplatesResponse;
    },
  });
}