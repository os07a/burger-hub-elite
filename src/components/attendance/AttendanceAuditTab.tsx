import { useAttendanceAudit } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";

const fieldLabels: Record<string, string> = {
  check_in: "وقت الدخول",
  check_out: "وقت الخروج",
  status: "الحالة",
  notes: "ملاحظات",
};

const AttendanceAuditTab = () => {
  const { data: rows = [], isLoading } = useAttendanceAudit();
  const { data: employees = [] } = useEmployees();

  if (isLoading) return <div className="text-center py-8 text-gray-light text-[12px]">جاري التحميل...</div>;
  if (!rows.length)
    return (
      <div className="text-center py-8 text-gray-light text-[12px]">
        لا توجد تعديلات مسجّلة بعد.
      </div>
    );

  return (
    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-warning">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">
        سجل تعديلات الحضور — شفافية كاملة
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              {["متى", "من", "الحقل", "القيمة القديمة", "القيمة الجديدة"].map((h) => (
                <th key={h} className="text-[9px] text-gray-light font-semibold uppercase tracking-wide px-2.5 pb-2.5 text-right border-b-2 border-border">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => {
              const editor = employees.find((e: any) => e.id === r.changed_by);
              return (
                <tr key={r.id} className="hover:bg-background/50">
                  <td className="px-2.5 py-2 border-b border-border text-[11px] text-gray-light">
                    {new Date(r.changed_at).toLocaleString("ar-SA")}
                  </td>
                  <td className="px-2.5 py-2 border-b border-border text-[12px] font-semibold">
                    {editor?.name || "—"}
                  </td>
                  <td className="px-2.5 py-2 border-b border-border text-[12px]">
                    {fieldLabels[r.field_name] || r.field_name}
                  </td>
                  <td className="px-2.5 py-2 border-b border-border text-[11px] text-danger line-through">
                    {r.old_value || "—"}
                  </td>
                  <td className="px-2.5 py-2 border-b border-border text-[11px] text-success font-semibold">
                    {r.new_value || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceAuditTab;
