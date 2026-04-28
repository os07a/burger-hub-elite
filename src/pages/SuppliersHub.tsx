import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Suppliers from "./Suppliers";
import Archive from "./Archive";

const SuppliersHub = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "archive" ? "archive" : "suppliers";

  const onChange = (v: string) => {
    if (v === "suppliers") params.delete("tab");
    else params.set("tab", v);
    setParams(params, { replace: true });
  };

  return (
    <div className="animate-fade-in">
      <Tabs value={tab} onValueChange={onChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="suppliers">🚚 الموردون والفواتير</TabsTrigger>
          <TabsTrigger value="archive">📁 أرشيف المستندات</TabsTrigger>
        </TabsList>
        <TabsContent value="suppliers" className="mt-0"><Suppliers /></TabsContent>
        <TabsContent value="archive" className="mt-0"><Archive /></TabsContent>
      </Tabs>
    </div>
  );
};

export default SuppliersHub;
