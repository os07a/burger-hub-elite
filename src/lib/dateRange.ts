// Centralized date range computation for the Command Center time filter.
// rangeDays values:
//   1   → today only
//  -1   → yesterday only
//   7   → last 7 days (inclusive of today)
//  30   → last 30 days
//   0   → no filter (90+ / all data)

const TZ = "Asia/Riyadh";

const isoInTZ = (d: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);

export interface DateRange {
  fromDate?: string;
  toDate?: string;
  label: string;
  isFiltered: boolean;
  rangeDays: number;
}

const arabicMonth = (iso: string): string =>
  new Intl.DateTimeFormat("ar-SA", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
  }).format(new Date(iso + "T12:00:00Z"));

export const computeRange = (rangeDays: number): DateRange => {
  const today = new Date();
  const todayIso = isoInTZ(today);

  if (rangeDays === 1) {
    return {
      fromDate: todayIso,
      toDate: todayIso,
      label: `اليوم (${arabicMonth(todayIso)})`,
      isFiltered: true,
      rangeDays,
    };
  }

  if (rangeDays === -1) {
    const y = new Date(today);
    y.setUTCDate(y.getUTCDate() - 1);
    const yIso = isoInTZ(y);
    return {
      fromDate: yIso,
      toDate: yIso,
      label: `أمس (${arabicMonth(yIso)})`,
      isFiltered: true,
      rangeDays,
    };
  }

  if (rangeDays > 1) {
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - (rangeDays - 1));
    const startIso = isoInTZ(start);
    return {
      fromDate: startIso,
      toDate: todayIso,
      label: `${arabicMonth(startIso)} – ${arabicMonth(todayIso)} (${rangeDays} يوم)`,
      isFiltered: true,
      rangeDays,
    };
  }

  // rangeDays === 0 → all
  return {
    fromDate: undefined,
    toDate: undefined,
    label: "كل البيانات (90+ يوم)",
    isFiltered: false,
    rangeDays: 0,
  };
};