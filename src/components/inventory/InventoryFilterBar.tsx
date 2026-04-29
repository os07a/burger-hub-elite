import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export type StockFilter = "all" | "danger" | "warning" | "success";

interface Props {
  status: StockFilter;
  onStatusChange: (s: StockFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
  category: string | null;
  onCategoryChange: (c: string | null) => void;
  categories: string[];
  counts: { all: number; danger: number; warning: number; success: number };
}

const STATUS_BUTTONS: { key: StockFilter; label: string; activeCls: string }[] = [
  { key: "all", label: "الكل", activeCls: "bg-primary text-primary-foreground border-primary" },
  { key: "danger", label: "🚨 حرج", activeCls: "bg-danger text-danger-foreground border-danger" },
  { key: "warning", label: "⚡ منخفض", activeCls: "bg-warning text-warning-foreground border-warning" },
  { key: "success", label: "✅ كافٍ", activeCls: "bg-success text-success-foreground border-success" },
];

const InventoryFilterBar = ({
  status, onStatusChange, search, onSearchChange,
  category, onCategoryChange, categories, counts,
}: Props) => {
  return (
    <div className="ios-card mb-5 py-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_BUTTONS.map((b) => {
            const active = status === b.key;
            const count = counts[b.key];
            return (
              <button
                key={b.key}
                onClick={() => onStatusChange(b.key)}
                className={`text-[11px] rounded-full px-3.5 py-1.5 border transition-colors flex items-center gap-1.5 ${
                  active ? b.activeCls + " font-semibold" : "bg-background text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                <span>{b.label}</span>
                <span className={`text-[10px] rounded-full px-1.5 py-px ${active ? "bg-background/20" : "bg-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-[280px]">
          <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث عن صنف أو مورد..."
            className="h-8 text-[12px] pr-8"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border">
          <span className="text-[10px] text-muted-foreground font-medium ml-1">التصنيف:</span>
          <button
            onClick={() => onCategoryChange(null)}
            className={`text-[10px] rounded-full px-2.5 py-1 border transition-colors ${
              category === null
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground hover:text-foreground border-border"
            }`}
          >
            الكل
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(category === c ? null : c)}
              className={`text-[10px] rounded-full px-2.5 py-1 border transition-colors ${
                category === c
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryFilterBar;