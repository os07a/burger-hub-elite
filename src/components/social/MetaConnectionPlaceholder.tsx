import { Link2 } from "lucide-react";

const MetaConnectionPlaceholder = () => (
  <div className="ios-card animate-fade-in p-5 flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <Link2 className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <div className="text-[13px] font-semibold text-foreground">ربط Meta تلقائياً</div>
        <div className="text-[11px] text-muted-foreground">اربط فيسبوك و Instagram لجلب البيانات تلقائياً كل ساعة</div>
      </div>
    </div>
    <button disabled className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-[11.5px] font-medium cursor-not-allowed">
      قريباً
    </button>
  </div>
);

export default MetaConnectionPlaceholder;