import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";

const todayRecords = [
  { initials: "يو", name: "يونس", role: "كاشير", shift: "10:00 ص — 6:00 م", checkIn: "9:58 ص", checkInClass: "text-success", checkOut: "—", hours: "7.5 س", diff: "مبكر 2 دقيقة", diffClass: "text-success", status: "حاضر", statusVariant: "success" as const },
  { initials: "شي", name: "شيمول", role: "طباخ", shift: "9:00 ص — 5:00 م", checkIn: "9:02 ص", checkInClass: "text-success", checkOut: "—", hours: "8.5 س", diff: "في الوقت", diffClass: "text-success", status: "حاضر", statusVariant: "success" as const },
  { initials: "مي", name: "ميراج", role: "تحضير", shift: "2:00 م — 10:00 م", checkIn: "2:22 م", checkInClass: "text-warning", checkOut: "—", hours: "5.5 س", diff: "تأخر 22 دقيقة", diffClass: "text-warning", status: "تأخر", statusVariant: "warning" as const },
  { initials: "ري", name: "ريان", role: "مساعد", shift: "12:00 م — 8:00 م", checkIn: "12:05 م", checkInClass: "text-success", checkOut: "—", hours: "6 س", diff: "في الوقت", diffClass: "text-success", status: "حاضر", statusVariant: "success" as const },
];

type DotType = "ok" | "late" | "abs" | "today" | "off";
const dotColors: Record<DotType, string> = { ok: "text-success", late: "text-warning", abs: "text-danger", today: "text-primary", off: "text-border" };

const weekData: { initials: string; name: string; days: DotType[]; total: string }[] = [
  { initials: "يو", name: "يونس", days: ["today", "ok", "ok", "ok", "ok", "ok", "off"], total: "6 / 6" },
  { initials: "شي", name: "شيمول", days: ["today", "ok", "ok", "late", "ok", "ok", "off"], total: "6 / 6" },
  { initials: "مي", name: "ميراج", days: ["late", "ok", "abs", "ok", "ok", "ok", "off"], total: "5 / 6" },
  { initials: "ري", name: "ريان", days: ["today", "ok", "ok", "ok", "ok", "late", "off"], total: "6 / 6" },
];

const dayLabels = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

const presentCount = todayRecords.filter(r => r.statusVariant === "success").length;
const lateCount = todayRecords.filter(r => r.statusVariant === "warning").length;
const totalHours = todayRecords.reduce((a, r) => a + parseFloat(r.hours), 0);

const Attendance = () => (
  <div>
    <PageHeader title="الحضور والانصراف" subtitle="السبت، 11 أبريل 2026" badge="اليوم" />

    <div className="grid grid-cols-4 gap-3 mb-5">
      <MetricCard label="حاضرون" value={presentCount.toString()} sub={`من أصل ${todayRecords.length}`} subColor="success" />
      <MetricCard label="تأخر" value={lateCount.toString()} sub="ميراج — 22 دقيقة" subColor="warning" />
      <MetricCard label="غائب" value="0" sub="لا يوجد غياب اليوم" subColor="success" />
      <MetricCard label="ساعات العمل اليوم" value={totalHours.toString()} sub="ساعة إجمالي" />
    </div>

    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-primary mb-4">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">سجل الحضور والانصراف — اليوم</div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              {["الموظف", "الدوام", "بصمة الدخول", "بصمة الخروج", "ساعات العمل", "الفرق", "الحالة"].map((h) => (
                <th key={h} className="text-[9px] text-gray-light font-semibold uppercase tracking-wide px-2.5 pb-2.5 text-right border-b-2 border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {todayRecords.map((r) => (
              <tr key={r.name} className="hover:bg-background/50">
                <td className="px-2.5 py-2.5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground">{r.initials}</div>
                    <div>
                      <span className="font-semibold text-foreground text-[12px]">{r.name}</span>
                      <span className="text-[9px] text-gray-light mr-1">({r.role})</span>
                    </div>
                  </div>
                </td>
                <td className="px-2.5 py-2.5 border-b border-border text-gray-light text-[11px]">{r.shift}</td>
                <td className={`px-2.5 py-2.5 border-b border-border font-bold text-[13px] ${r.checkInClass}`}>{r.checkIn}</td>
                <td className="px-2.5 py-2.5 border-b border-border text-gray-light">{r.checkOut}</td>
                <td className="px-2.5 py-2.5 border-b border-border font-bold text-foreground">{r.hours}</td>
                <td className={`px-2.5 py-2.5 border-b border-border text-[11px] font-semibold ${r.diffClass}`}>{r.diff}</td>
                <td className="px-2.5 py-2.5 border-b border-border"><StatusBadge variant={r.statusVariant}>{r.status}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">ملخص الأسبوع — الحضور والغياب</div>
      <div className="flex flex-col gap-px bg-border rounded-lg overflow-hidden">
        <div className="grid bg-background" style={{ gridTemplateColumns: "160px repeat(7, 1fr) 70px" }}>
          <div className="px-2.5 py-2 text-[9px] font-semibold text-gray-light uppercase tracking-wide">الموظف</div>
          {dayLabels.map((d) => (
            <div key={d} className="text-center px-1 py-2 text-[9px] font-semibold text-gray-light uppercase tracking-wide">{d}</div>
          ))}
          <div className="px-2.5 py-2 text-[12px] font-bold text-foreground text-center">الإجمالي</div>
        </div>
        {weekData.map((emp) => (
          <div key={emp.name} className="grid bg-surface items-center" style={{ gridTemplateColumns: "160px repeat(7, 1fr) 70px" }}>
            <div className="px-2.5 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">{emp.initials}</div>
                <span className="font-semibold text-foreground text-[12px]">{emp.name}</span>
              </div>
            </div>
            {emp.days.map((d, i) => (
              <div key={i} className={`text-center py-2.5 text-[14px] ${dotColors[d]}`}>
                {d === "off" ? "—" : "●"}
              </div>
            ))}
            <div className="px-2.5 py-2.5 text-[12px] font-bold text-foreground text-center">{emp.total}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-3.5 mt-3.5 pt-3 border-t border-border flex-wrap">
        {[
          { dot: "●", color: "text-success", label: "حاضر" },
          { dot: "●", color: "text-warning", label: "تأخر" },
          { dot: "●", color: "text-danger", label: "غائب" },
          { dot: "●", color: "text-primary", label: "اليوم" },
          { dot: "—", color: "text-border", label: "إجازة/عطلة" },
        ].map((l) => (
          <span key={l.label} className="text-[11px] text-gray flex items-center gap-1.5">
            <span className={`text-[14px] ${l.color}`}>{l.dot}</span>{l.label}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default Attendance;
