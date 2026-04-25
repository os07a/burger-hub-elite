import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatSaudiPhoneDisplay } from "@/lib/phoneNormalize";
import type { MessagingCustomer } from "@/hooks/useLoyaltyCustomersForMessaging";

interface Props {
  customers: MessagingCustomer[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearAll: () => void;
}

const tierConfig = {
  gold: { label: "ذهبي", emoji: "🥇", className: "bg-amber-100 text-amber-800 border-amber-200" },
  silver: { label: "فضي", emoji: "🥈", className: "bg-slate-100 text-slate-700 border-slate-200" },
  regular: { label: "عادي", emoji: "👤", className: "bg-blue-50 text-blue-700 border-blue-200" },
} as const;

const RecipientsList = ({ customers, selectedIds, onToggle, onSelectAll, onClearAll }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "gold" | "silver" | "regular">("all");
  const [onlyValid, setOnlyValid] = useState(true);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (onlyValid && !c.hasValidPhone) return false;
      if (filter !== "all" && c.tier !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (c.name ?? "").toLowerCase().includes(q) ||
          (c.phone ?? "").includes(q)
        );
      }
      return true;
    });
  }, [customers, search, filter, onlyValid]);

  const validIds = filtered.filter((c) => c.hasValidPhone).map((c) => c.id);
  const allSelected = validIds.length > 0 && validIds.every((id) => selectedIds.has(id));

  const tierCounts = useMemo(() => {
    const counts = { gold: 0, silver: 0, regular: 0 };
    customers.forEach((c) => { counts[c.tier]++; });
    return counts;
  }, [customers]);

  return (
    <div className="space-y-3">
      {/* Search + Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الجوال..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="h-7 text-xs"
          >
            الكل ({customers.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "gold" ? "default" : "outline"}
            onClick={() => setFilter("gold")}
            className="h-7 text-xs"
          >
            🥇 ذهبي ({tierCounts.gold})
          </Button>
          <Button
            size="sm"
            variant={filter === "silver" ? "default" : "outline"}
            onClick={() => setFilter("silver")}
            className="h-7 text-xs"
          >
            🥈 فضي ({tierCounts.silver})
          </Button>
          <Button
            size="sm"
            variant={filter === "regular" ? "default" : "outline"}
            onClick={() => setFilter("regular")}
            className="h-7 text-xs"
          >
            👤 عادي ({tierCounts.regular})
          </Button>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <Checkbox
            checked={onlyValid}
            onCheckedChange={(v) => setOnlyValid(Boolean(v))}
          />
          إخفاء العملاء بأرقام جوال غير صحيحة
        </label>
      </div>

      {/* Bulk actions */}
      <div className="flex items-center justify-between border-y py-2">
        <div className="text-sm">
          <span className="font-bold text-primary">{selectedIds.size}</span>
          <span className="text-muted-foreground"> من {filtered.length} مختار</span>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => (allSelected ? onClearAll() : onSelectAll(validIds))}
            className="h-7 text-xs"
          >
            {allSelected ? "إلغاء الكل" : "اختر الكل"}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
        {filtered.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            لا يوجد عملاء مطابقون
          </div>
        ) : (
          filtered.map((c) => {
            const tier = tierConfig[c.tier];
            const checked = selectedIds.has(c.id);
            return (
              <label
                key={c.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors ${
                  checked
                    ? "bg-primary/5 border-primary/40"
                    : "bg-card hover:bg-accent border-border"
                } ${!c.hasValidPhone ? "opacity-60" : ""}`}
              >
                <Checkbox
                  checked={checked}
                  disabled={!c.hasValidPhone}
                  onCheckedChange={() => onToggle(c.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-medium truncate">
                    <span>{c.name || "بدون اسم"}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${tier.className}`}>
                      {tier.emoji}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                    {c.hasValidPhone ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-amber-600" />
                    )}
                    <span dir="ltr">{formatSaudiPhoneDisplay(c.phone) || "—"}</span>
                    <span>·</span>
                    <span>{c.total_visits} زيارة</span>
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecipientsList;