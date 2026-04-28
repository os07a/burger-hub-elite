import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Staff from "./Staff";
import Attendance from "./Attendance";
import Payroll from "./Payroll";

const StaffHub = () => {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab = raw === "attendance" || raw === "payroll" ? raw : "staff";

  const onChange = (v: string) => {
    if (v === "staff") params.delete("tab");
    else params.set("tab", v);
    setParams(params, { replace: true });
  };

  return (
    <div className="animate-fade-in">
      <Tabs value={tab} onValueChange={onChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="staff">👥 الموظفون</TabsTrigger>
          <TabsTrigger value="attendance">🕐 الحضور والانصراف</TabsTrigger>
          <TabsTrigger value="payroll">💰 الرواتب</TabsTrigger>
        </TabsList>
        <TabsContent value="staff" className="mt-0"><Staff /></TabsContent>
        <TabsContent value="attendance" className="mt-0"><Attendance /></TabsContent>
        <TabsContent value="payroll" className="mt-0"><Payroll /></TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffHub;
