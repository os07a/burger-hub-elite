import { Users } from "lucide-react";
import SyncLoyverseCustomersButton from "@/components/loyalty/SyncLoyverseCustomersButton";

interface Props {
  onSynced?: () => void;
}

const EmptyCustomersState = ({ onSynced }: Props) => {
  return (
    <div className="rounded-xl border-2 border-dashed border-border p-8 text-center space-y-3">
      <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
        <Users className="h-7 w-7 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-base">لا يوجد عملاء بعد</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          سحب عملاء بونات/الكاشير ليصبح بإمكانك إرسال رسائل واتساب لهم
        </p>
      </div>
      <div className="pt-2">
        <SyncLoyverseCustomersButton onSynced={onSynced} />
      </div>
    </div>
  );
};

export default EmptyCustomersState;