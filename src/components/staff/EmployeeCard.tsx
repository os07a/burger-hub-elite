import { useState } from "react";
import { ChevronDown, FileText, Shield, HeartPulse, ScrollText, Calendar, Pencil, Trash2, Plus } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { EmployeeWithDocs, EmployeeDoc } from "@/hooks/useEmployees";
import { useDeleteEmployee, useDeleteEmployeeDoc } from "@/hooks/useEmployees";
import { toast } from "sonner";

const docIcons: Record<string, React.ReactNode> = {
  iqama: <Shield size={14} />,
  health: <HeartPulse size={14} />,
  contract: <ScrollText size={14} />,
  leave: <Calendar size={14} />,
};

const docStatusColors: Record<string, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  gray: "text-muted-foreground",
};

const alertColors: Record<string, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
};

interface Props {
  employee: EmployeeWithDocs;
  isAdmin: boolean;
  onEdit: (emp: EmployeeWithDocs) => void;
  onAddDoc: (empId: string) => void;
}

const EmployeeCard = ({ employee: emp, isAdmin, onEdit, onAddDoc }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const deleteMutation = useDeleteEmployee();
  const deleteDocMutation = useDeleteEmployeeDoc();

  const docs = emp.employee_docs || [];
  const dangerDocs = docs.filter(d => d.status_variant === "danger").length;
  const warningDocs = docs.filter(d => d.status_variant === "warning").length;

  // Build alerts from docs
  const alerts: { text: string; variant: string }[] = [];
  if (dangerDocs === 0 && warningDocs === 0) {
    alerts.push({ text: "جميع الوثائق سارية", variant: "success" });
  }
  docs.forEach(d => {
    if (d.status_variant === "danger") alerts.push({ text: `${d.label} منتهية`, variant: "danger" });
    if (d.status_variant === "warning") alerts.push({ text: `${d.label} تنتهي قريباً`, variant: "warning" });
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(emp.id);
      toast.success("تم حذف الموظف");
    } catch {
      toast.error("فشل حذف الموظف");
    }
  };

  return (
    <div className="ios-card !p-0 overflow-hidden">
      {/* Header */}
      <div
        onClick={() => { setIsExpanded(!isExpanded); setExpandedDoc(null); }}
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-muted/30 transition-colors"
      >
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-foreground flex-shrink-0 border-2 border-border">
          {emp.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[15px] font-bold text-foreground">{emp.name}</span>
            <StatusBadge variant={emp.status_variant as "success" | "warning" | "danger"}>{emp.status}</StatusBadge>
          </div>
          <div className="text-[12px] text-muted-foreground">{emp.role} — {emp.role_short || `${emp.salary.toLocaleString()} ر/شهر`}</div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {dangerDocs > 0 && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-danger-bg text-danger">🚨 {dangerDocs} منتهية</span>
          )}
          {warningDocs > 0 && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-warning-bg text-warning">⚡ {warningDocs} قريبة</span>
          )}
          <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border animate-fade-in">
          {/* Performance */}
          <div className="px-5 py-3 bg-muted/20 border-b border-border">
            <div className="flex gap-6 text-[11px]">
              <span className="text-muted-foreground">📊 المهام: <span className="text-foreground font-medium">{emp.performance_tasks || "—"}</span></span>
              <span className="text-muted-foreground">📈 الأداء: <span className="text-foreground font-medium">{emp.performance_rating || "—"}</span></span>
            </div>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="px-5 py-2 border-b border-border flex gap-2">
              <Button size="sm" variant="outline" className="text-[11px] h-7 gap-1" onClick={(e) => { e.stopPropagation(); onEdit(emp); }}>
                <Pencil size={12} /> تعديل
              </Button>
              <Button size="sm" variant="outline" className="text-[11px] h-7 gap-1" onClick={(e) => { e.stopPropagation(); onAddDoc(emp.id); }}>
                <Plus size={12} /> إضافة وثيقة
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-[11px] h-7 gap-1 text-danger border-danger/30 hover:bg-danger-bg">
                    <Trash2 size={12} /> حذف
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>حذف الموظف {emp.name}؟</AlertDialogTitle>
                    <AlertDialogDescription>سيتم حذف الموظف وجميع وثائقه نهائياً.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Documents */}
          <div className="p-5">
            <div className="text-[11px] font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
              <FileText size={13} /> المستندات والوثائق
            </div>
            {docs.length === 0 ? (
              <p className="text-[12px] text-muted-foreground text-center py-4">لا توجد وثائق مسجلة</p>
            ) : (
              <div className="space-y-2">
                {docs.map((doc) => {
                  const docKey = `${emp.id}-${doc.id}`;
                  const isDocExpanded = expandedDoc === docKey;
                  return (
                    <div key={doc.id} className="border border-border rounded-xl overflow-hidden">
                      <div
                        onClick={() => setExpandedDoc(isDocExpanded ? null : docKey)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
                      >
                        <span className="text-muted-foreground">{docIcons[doc.doc_type] || <FileText size={14} />}</span>
                        <span className="text-[12px] font-semibold text-foreground flex-1">{doc.label}</span>
                        <span className={`text-[11px] font-semibold ${docStatusColors[doc.status_variant] || ""}`}>{doc.status}</span>
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocMutation.mutate(doc.id, {
                                onSuccess: () => toast.success("تم حذف الوثيقة"),
                                onError: () => toast.error("فشل الحذف"),
                              });
                            }}
                            className="text-muted-foreground hover:text-danger transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isDocExpanded ? "rotate-180" : ""}`} />
                      </div>
                      {isDocExpanded && (
                        <div className="px-4 pb-3 pt-0 border-t border-border bg-muted/10 animate-fade-in">
                          <div className="grid grid-cols-3 gap-3 mt-3">
                            {doc.doc_number && (
                              <div>
                                <div className="text-[9px] text-muted-foreground font-medium mb-0.5">رقم المستند</div>
                                <div className="text-[12px] font-semibold text-foreground">{doc.doc_number}</div>
                              </div>
                            )}
                            {doc.issue_date && (
                              <div>
                                <div className="text-[9px] text-muted-foreground font-medium mb-0.5">تاريخ الإصدار</div>
                                <div className="text-[12px] font-semibold text-foreground">{doc.issue_date}</div>
                              </div>
                            )}
                            {doc.expiry_date && (
                              <div>
                                <div className="text-[9px] text-muted-foreground font-medium mb-0.5">تاريخ الانتهاء</div>
                                <div className={`text-[12px] font-semibold ${docStatusColors[doc.status_variant] || ""}`}>{doc.expiry_date}</div>
                              </div>
                            )}
                          </div>
                          {doc.details && (
                            <div className="mt-2.5 text-[10px] text-muted-foreground bg-background rounded-lg px-3 py-2">
                              💡 {doc.details}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Alerts footer */}
          <div className="px-5 py-3 border-t border-border bg-muted/10 flex gap-2 flex-wrap">
            {alerts.map((alert, i) => (
              <span key={i} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${alertColors[alert.variant] || ""}`}>
                ● {alert.text}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCard;
