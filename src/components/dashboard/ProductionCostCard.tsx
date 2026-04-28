import MetricCard from "@/components/ui/MetricCard";
import { useTodayProductionCost } from "@/hooks/useTodayProductionCost";

const ProductionCostCard = () => {
  const { data, isLoading } = useTodayProductionCost();
  const total = data?.total ?? 0;
  const count = data?.movementsCount ?? 0;
  return (
    <MetricCard
      label="🍳 تكلفة الإنتاج اليوم"
      value={isLoading ? "..." : total.toFixed(2)}
      sub={count > 0 ? `${count} حركة خصم من المخزون` : "لا حركات اليوم"}
      subColor={count > 0 ? "warning" : "gray"}
      showRiyal
    />
  );
};

export default ProductionCostCard;
