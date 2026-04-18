// Lightweight insights hook — pure computations from the static dataset that already lives in ProjectStatus.
// Centralizes trend, burn rate, runway, weekday rank, anomalies and a 0-100 health score.

export interface SalesMonth {
  month: string;
  key: string;
  gross: number;
  net: number;
  days: number;
  avg: number;
  max: number;
  min: number;
  discounts: number;
  refunds: number;
}

export interface BankMonth {
  month: string;
  income: number;
  expenses: number;
}

export interface WeekdayPoint {
  day: string;
  avg: number;
}

export interface ProjectStatusInsights {
  // momentum
  last30Avg: number;
  prev30Avg: number;
  momentumPct: number;
  trendUp: boolean;
  // burn / runway
  burnRatePerDay: number;
  incomeRatePerDay: number;
  runwayDays: number;
  // weekday
  bestDay: WeekdayPoint;
  worstDay: WeekdayPoint;
  weekdaySpreadPct: number;
  // health
  healthScore: number; // 0-100
  healthLabel: string;
  healthTone: "success" | "warning" | "danger";
}

interface ComputeArgs {
  salesMonths: SalesMonth[];
  bankMonths: BankMonth[];
  weekdayData: WeekdayPoint[];
  bankBalance: number;
  totalGross: number;
  totalNet: number;
  totalDiscounts: number;
}

export const useProjectStatusInsights = (args: ComputeArgs): ProjectStatusInsights => {
  const { salesMonths, bankMonths, weekdayData, bankBalance, totalGross, totalNet, totalDiscounts } = args;

  // Approx last 30 vs previous 30 by using the latest 2 months avg vs the 2 before
  const sortedSales = [...salesMonths];
  const last30Avg = sortedSales.slice(-1)[0]?.avg ?? 0;
  const prev30Avg = sortedSales.slice(-2, -1)[0]?.avg ?? 0;
  const momentumPct = prev30Avg > 0 ? ((last30Avg - prev30Avg) / prev30Avg) * 100 : 0;

  // Burn rate from latest bank month
  const lastBank = bankMonths[bankMonths.length - 1];
  const burnRatePerDay = lastBank ? Math.round(lastBank.expenses / 30) : 0;
  const incomeRatePerDay = lastBank ? Math.round(lastBank.income / 30) : 0;
  const netDaily = Math.max(1, burnRatePerDay - incomeRatePerDay);
  const runwayDays = burnRatePerDay > incomeRatePerDay ? Math.round(bankBalance / netDaily) : 999;

  // Weekday
  const sortedDays = [...weekdayData].sort((a, b) => b.avg - a.avg);
  const bestDay = sortedDays[0];
  const worstDay = sortedDays[sortedDays.length - 1];
  const weekdaySpreadPct = bestDay && worstDay ? ((bestDay.avg - worstDay.avg) / bestDay.avg) * 100 : 0;

  // Health Score components (each 0-100)
  const liquidityScore = Math.min(100, (runwayDays / 30) * 100); // 30 days runway = 100
  const growthScore = Math.min(100, Math.max(0, 50 + momentumPct)); // flat = 50
  const discountScore = Math.max(0, 100 - (totalDiscounts / Math.max(totalGross, 1)) * 1000); // 5% disc = 50
  const distributionScore = Math.max(0, 100 - weekdaySpreadPct * 1.5);

  const healthScore = Math.round(
    liquidityScore * 0.35 + growthScore * 0.25 + discountScore * 0.2 + distributionScore * 0.2,
  );

  let healthTone: "success" | "warning" | "danger" = "danger";
  let healthLabel = "حرج";
  if (healthScore >= 70) {
    healthTone = "success";
    healthLabel = "ممتاز";
  } else if (healthScore >= 45) {
    healthTone = "warning";
    healthLabel = "متوسط";
  }

  return {
    last30Avg,
    prev30Avg,
    momentumPct,
    trendUp: momentumPct >= 0,
    burnRatePerDay,
    incomeRatePerDay,
    runwayDays,
    bestDay,
    worstDay,
    weekdaySpreadPct,
    healthScore,
    healthLabel,
    healthTone,
  };
};
