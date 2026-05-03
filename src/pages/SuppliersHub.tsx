import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import SupplierFormDialog from "@/components/suppliers/SupplierFormDialog";
import Suppliers from "./Suppliers";
import Archive from "./Archive";
import InvoiceIntake from "./InvoiceIntake";

const SuppliersHub = () => {
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const tab = tabParam === "archive" ? "archive" : tabParam === "intake" ? "intake" : "suppliers";
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const { data: suppliers = [] } = useSuppliers();
  const [supDialog, setSupDialog] = useState(false);

  const onChange = (v: string) => {
    if (v === "suppliers") params.delete("tab");
    else params.set("tab", v);
    setParams(params, { replace: true });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={tab === "archive" ? "الموردون والأرشيف" : "الموردون والفواتير"}
        subtitle={tab === "archive" ? "أرشيف المستندات والفواتير التأسيسية" : "إدارة الموردين وسجل الفواتير"}
        badge={tab === "suppliers" ? `${suppliers.length} مورد` : undefined}
        actions={
          tab === "suppliers" && isAdmin ? (
            <Button size="sm" onClick={() => setSupDialog(true)}>
              <Plus size={14} className="ml-1" /> إضافة مورد
            </Button>
          ) : undefined
        }
      />

      <Tabs value={tab} onValueChange={onChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="suppliers">🚚 الموردون والفواتير</TabsTrigger>
          <TabsTrigger value="intake">📥 استقبال فاتورة</TabsTrigger>
          <TabsTrigger value="archive">📁 أرشيف المستندات</TabsTrigger>
        </TabsList>
        <TabsContent value="suppliers" className="mt-0">
          <Suppliers externalDialogOpen={supDialog} setExternalDialogOpen={setSupDialog} />
        </TabsContent>
        <TabsContent value="intake" className="mt-0"><InvoiceIntake /></TabsContent>
        <TabsContent value="archive" className="mt-0"><Archive /></TabsContent>
      </Tabs>
    </div>
  );
};

export default SuppliersHub;
