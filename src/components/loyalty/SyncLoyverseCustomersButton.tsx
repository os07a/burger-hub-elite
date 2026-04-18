import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  onSynced?: () => void;
}

const SyncLoyverseCustomersButton = ({ onSynced }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "sync-loyverse-customers",
        { body: {} },
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(
        `تمت المزامنة: ${data?.customers_synced ?? 0} عميل`,
        {
          description: `🥇 ${data?.gold ?? 0} ذهبي · 🥈 ${data?.silver ?? 0} فضي · 👤 ${data?.regular ?? 0} عادي`,
        },
      );
      onSynced?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error("فشل المزامنة", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={loading}
      size="sm"
      className="gap-2"
    >
      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
      {loading ? "جاري المزامنة..." : "مزامنة بونات/الكاشير"}
    </Button>
  );
};

export default SyncLoyverseCustomersButton;
