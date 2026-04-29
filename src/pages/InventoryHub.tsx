import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/ui/PageHeader";
import InventoryStoryCard from "@/components/inventory/InventoryStoryCard";
import InventoryFilterBar, { type StockFilter } from "@/components/inventory/InventoryFilterBar";
import ReorderTab from "@/components/inventory/ReorderTab";
import Inventory from "./Inventory";
import OpeningInventory from "./OpeningInventory";
import { useInventory, getStockStatus } from "@/hooks/useInventory";

const todayLabel = new Intl.DateTimeFormat("ar-SA", {
  timeZone: "Asia/Riyadh",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

const VALID_TABS = ["items", "reorder", "opening"] as const;
type Tab = (typeof VALID_TABS)[number];

const InventoryHub = () => {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab: Tab = (VALID_TABS as readonly string[]).includes(raw ?? "")
    ? (raw as Tab)
    : "items";

  const onChange = (v: string) => {
    if (v === "items") params.delete("tab");
    else params.set("tab", v);
    setParams(params, { replace: true });
  };

  const { data: items = [] } = useInventory();

  const [statusFilter, setStatusFilter] = useState<StockFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { categories, counts, reorderCount } = useMemo(() => {
    const withStatus = items.map((i) => getStockStatus(Number(i.quantity), Number(i.min_quantity)));
    const cats = [...new Set(items.map((i) => i.category).filter(Boolean) as string[])];
    return {
      categories: cats,
      counts: {
        all: items.length,
        danger: withStatus.filter((s) => s.variant === "danger").length,
        warning: withStatus.filter((s) => s.variant === "warning").length,
        success: withStatus.filter((s) => s.variant === "success").length,
      },
      reorderCount: withStatus.filter((s) => s.variant !== "success").length,
    };
  }, [items]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="المخزون"
        subtitle={todayLabel}
        badge={items.length > 0 ? `${items.length} صنف` : undefined}
      />

      <InventoryStoryCard />

      {tab === "items" && (
        <InventoryFilterBar
          status={statusFilter}
          onStatusChange={setStatusFilter}
          search={searchQuery}
          onSearchChange={setSearchQuery}
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
          counts={counts}
        />
      )}

      <Tabs value={tab} onValueChange={onChange} dir="rtl" className="w-full">
        <TabsList className="mb-5">
          <TabsTrigger value="items">📦 الأصناف</TabsTrigger>
          <TabsTrigger value="reorder">
            🚨 يحتاج طلب
            {reorderCount > 0 && (
              <span className="mr-1.5 text-[10px] bg-warning/20 text-warning rounded-full px-1.5 py-px">
                {reorderCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="opening">📋 الجرد والتعديلات</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-0">
          <Inventory
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
          />
        </TabsContent>
        <TabsContent value="reorder" className="mt-0">
          <ReorderTab />
        </TabsContent>
        <TabsContent value="opening" className="mt-0">
          <OpeningInventory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryHub;