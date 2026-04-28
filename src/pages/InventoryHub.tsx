import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Inventory from "./Inventory";
import OpeningInventory from "./OpeningInventory";

const InventoryHub = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "opening" ? "opening" : "items";

  const onChange = (v: string) => {
    if (v === "items") params.delete("tab");
    else params.set("tab", v);
    setParams(params, { replace: true });
  };

  return (
    <div className="animate-fade-in">
      <Tabs value={tab} onValueChange={onChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="items">📦 الأصناف والمخزون</TabsTrigger>
          <TabsTrigger value="opening">📋 الجرد الابتدائي والتعديلات</TabsTrigger>
        </TabsList>
        <TabsContent value="items" className="mt-0"><Inventory /></TabsContent>
        <TabsContent value="opening" className="mt-0"><OpeningInventory /></TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryHub;
