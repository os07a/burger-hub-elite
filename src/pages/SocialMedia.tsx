import { useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSocialInsights, useLatestInsight, useInsightPosts, Platform } from "@/hooks/useSocialInsights";
import InsightHeroCard from "@/components/social/InsightHeroCard";
import SocialKpiGrid from "@/components/social/SocialKpiGrid";
import SalesCorrelationCard from "@/components/social/SalesCorrelationCard";
import TopPostsTable from "@/components/social/TopPostsTable";
import AiSuggestionsCard from "@/components/social/AiSuggestionsCard";
import SocialTrendChart from "@/components/social/SocialTrendChart";
import MetaConnectionPlaceholder from "@/components/social/MetaConnectionPlaceholder";
import WeeklyInsightDialog from "@/components/social/WeeklyInsightDialog";
import EngagementFunnel from "@/components/social/EngagementFunnel";
import AccountHealthCard from "@/components/social/AccountHealthCard";
import InteractionsBreakdown from "@/components/social/InteractionsBreakdown";

const PlatformView = ({ platform }: { platform: Platform }) => {
  const { data: insights = [] } = useSocialInsights(platform);
  const { data: latest } = useLatestInsight(platform);
  const { data: posts = [] } = useInsightPosts(latest?.id);

  return (
    <div className="space-y-5">
      <InsightHeroCard insight={latest ?? null} />
      <SocialKpiGrid insight={latest ?? null} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AccountHealthCard insight={latest ?? null} />
        <EngagementFunnel insight={latest ?? null} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SocialTrendChart insights={insights} />
        <InteractionsBreakdown insight={latest ?? null} posts={posts} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SalesCorrelationCard insights={insights} />
        <AiSuggestionsCard suggestions={latest?.ai_suggestions ?? []} />
      </div>
      <TopPostsTable posts={posts} />
      <MetaConnectionPlaceholder />
    </div>
  );
};

const SocialMedia = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <PageHeader
        title="التواصل الاجتماعي"
        subtitle="تحليلات Meta الذكية مع ربط بالمبيعات الفعلية"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 ml-1.5" />
            إدخال أسبوع جديد
          </Button>
        }
      />

      <Tabs defaultValue="both" dir="rtl">
        <TabsList>
          <TabsTrigger value="both">الكل</TabsTrigger>
          <TabsTrigger value="facebook">فيسبوك</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
        </TabsList>

        <TabsContent value="both" className="mt-5"><PlatformView platform="both" /></TabsContent>
        <TabsContent value="facebook" className="mt-5"><PlatformView platform="facebook" /></TabsContent>
        <TabsContent value="instagram" className="mt-5"><PlatformView platform="instagram" /></TabsContent>
      </Tabs>

      <WeeklyInsightDialog open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default SocialMedia;