// HR helper utilities

import type { EmployeeFull } from "@/hooks/useEmployees";

export const daysBetween = (from: string | Date, to: string | Date) => {
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return Math.round((t - f) / (1000 * 60 * 60 * 24));
};

export const monthsBetween = (from: string | Date, to: string | Date = new Date()) => {
  const f = new Date(from);
  const t = new Date(to);
  return (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth());
};

export const formatTenure = (hireDate?: string | null) => {
  if (!hireDate) return "—";
  const months = monthsBetween(hireDate);
  if (months < 1) return "أقل من شهر";
  if (months < 12) return `${months} شهر`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem ? `${years} سنة و${rem} شهر` : `${years} سنة`;
};

export const contractDaysLeft = (contractEnd?: string | null) => {
  if (!contractEnd) return null;
  return daysBetween(new Date(), contractEnd);
};

export const allowancesTotal = (allowances: any): number => {
  if (!Array.isArray(allowances)) return 0;
  return allowances.reduce((s: number, a: any) => s + (Number(a?.amount) || 0), 0);
};

export interface PayrollResult {
  basic: number;
  allowances: number;
  rewards: number;
  penalties: number;
  absenceDeduction: number;
  absenceDays: number;
  net: number;
}

/**
 * Compute monthly payroll for a single employee for a given month (yyyy-mm).
 * Absence deduction = (basic_salary / 30) * absent_days from `attendance`.
 */
export const computePayroll = (
  emp: EmployeeFull,
  attendance: { date: string; status: string }[],
  monthYM: string // "2026-04"
): PayrollResult => {
  const basic = Number(emp.basic_salary) || 0;
  const allowances = allowancesTotal(emp.allowances);

  const monthRewards = (emp.employee_rewards || [])
    .filter(r => (r.reward_date || "").startsWith(monthYM))
    .reduce((s, r) => s + (Number(r.amount) || 0), 0);

  const monthPenalties = (emp.employee_penalties || [])
    .filter(p => (p.penalty_date || "").startsWith(monthYM))
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const absenceDays = attendance.filter(a => a.status === "غائب" && a.date.startsWith(monthYM)).length;
  const absenceDeduction = (basic / 30) * absenceDays;

  const net = basic + allowances + monthRewards - monthPenalties - absenceDeduction;

  return {
    basic,
    allowances,
    rewards: monthRewards,
    penalties: monthPenalties,
    absenceDeduction,
    absenceDays,
    net,
  };
};

export const downloadCsv = (filename: string, rows: (string | number)[][]) => {
  const csv = rows.map(r => r.map(c => {
    const s = String(c ?? "");
    return s.includes(",") || s.includes("\"") || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

export const currentMonthYM = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
