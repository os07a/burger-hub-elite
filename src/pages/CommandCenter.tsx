import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TimeRangeBar from "@/components/dashboard/TimeRangeBar";
import DailyStoryCard from "@/components/dashboard/DailyStoryCard";
import Dashboard from "./Dashboard";
import SalesIndicator from "./SalesIndicator";
import ProjectStatus from "./ProjectStatus";

const todayLabel = new Intl.DateTimeFormat("ar-SA", {
  timeZone: "Asia/Riyadh",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

const VALID_TABS = ["overview", "sales", "status"] as const;
type Tab = (typeof VALID_TABS)[number];

const CommandCenter = () => {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab: Tab = (VALID_TABS as readonly string[]).includes(raw ?? "")
    ? (raw as Tab)
    : "overview";

  const onChange = (v: string) => {
    if (v === "overview") params.delete("tab");
    else params.set("tab", v);
    setParams(params, { replace: true });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="مركز القيادة" subtitle={todayLabel} badge="مباشر" />
      <TimeRangeBar />
      <DailyStoryCard />

      <Tabs value={tab} onValueChange={onChange} dir="rtl" className="w-full">
        <TabsList className="mb-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="status">حالة المشروع</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <Dashboard embedded />
        </TabsContent>
        <TabsContent value="sales" className="mt-0">
          <SalesIndicator embedded />
        </TabsContent>
        <TabsContent value="status" className="mt-0">
          <ProjectStatus embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommandCenter;