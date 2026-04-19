// Time helpers and attendance calculations.
// shift times are "HH:MM" or "HH:MM:SS" strings; check_in/out are ISO timestamps.

function parseShiftTime(time: string, dateRef: Date): Date {
  const [h, m] = time.split(":").map((x) => parseInt(x, 10));
  const d = new Date(dateRef);
  d.setHours(h, m || 0, 0, 0);
  return d;
}

export function calcLateMinutes(checkIn: string | Date, shiftStart: string | null | undefined): number {
  if (!shiftStart) return 0;
  const ci = new Date(checkIn);
  const ss = parseShiftTime(shiftStart, ci);
  const diffMin = Math.round((ci.getTime() - ss.getTime()) / 60000);
  return diffMin > 0 ? diffMin : 0;
}

export function calcEarlyLeaveMinutes(checkOut: string | Date, shiftEnd: string | null | undefined): number {
  if (!shiftEnd) return 0;
  const co = new Date(checkOut);
  const se = parseShiftTime(shiftEnd, co);
  const diffMin = Math.round((se.getTime() - co.getTime()) / 60000);
  return diffMin > 0 ? diffMin : 0;
}

export function calcOvertimeMinutes(checkOut: string | Date, shiftEnd: string | null | undefined): number {
  if (!shiftEnd) return 0;
  const co = new Date(checkOut);
  const se = parseShiftTime(shiftEnd, co);
  const diffMin = Math.round((co.getTime() - se.getTime()) / 60000);
  return diffMin > 0 ? diffMin : 0;
}

export function calcWorkedHours(checkIn: string | Date, checkOut: string | Date): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, ms / 3600000);
}

export function fmtMinutes(min: number): string {
  if (!min || min <= 0) return "—";
  if (min < 60) return `${min} د`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}س ${m}د` : `${h} س`;
}

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
