import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { ChevronDown, FileText, Shield, HeartPulse, ScrollText, Calendar, Clock } from "lucide-react";

import staffYounes from "@/assets/staff-younes.jpg";
import staffShimol from "@/assets/staff-shimol.jpg";
import staffMiraj from "@/assets/staff-miraj.jpg";
import staffRayan from "@/assets/staff-rayan.jpg";

interface Doc {
  label: string;
  icon: React.ReactNode;
  type: "iqama" | "health" | "contract" | "leave";
  number?: string;
  issueDate?: string;
  expiryDate?: string;
  status: string;
  statusVariant: "success" | "warning" | "danger" | "gray";
  details?: string;
}

interface Employee {
  img: string;
  name: string;
  role: string;
  roleShort: string;
  salary: number;
  status: string;
  statusVariant: "success" | "warning" | "danger";
  performance: { tasks: string; rating: string };
  docs: Doc[];
  alerts: { text: string; variant: "success" | "warning" | "danger" }[];
}

const employees: Employee[] = [
  {
    img: staffYounes, name: "يونس", role: "كاشير + إشراف عام", roleShort: "دوام كامل · 3,200 ر/شهر",
    salary: 3200, status: "حاضر", statusVariant: "success",
    performance: { tasks: "~40% من عمليات الكاشير", rating: "حضور منتظم · أقل تأخير" },
    docs: [
      { label: "الإقامة", icon: <Shield size={14} />, type: "iqama", number: "2487XXXXXX", issueDate: "12 مارس 2025", expiryDate: "12 مارس 2026", status: "باقي 11 شهر", statusVariant: "success", details: "مهنة: كاشير · الكفيل: مؤسسة برقرهم" },
      { label: "الشهادة الصحية", icon: <HeartPulse size={14} />, type: "health", number: "HC-2025-0891", issueDate: "30 يونيو 2024", expiryDate: "30 يونيو 2025", status: "منتهية", statusVariant: "danger", details: "تحتاج تجديد فوري · مطلوبة للبلدية" },
      { label: "العقد", icon: <ScrollText size={14} />, type: "contract", issueDate: "1 نوفمبر 2024", expiryDate: "1 نوفمبر 2026", status: "ساري", statusVariant: "success", details: "عقد سنتين · مع فترة تجربة 3 شهور" },
      { label: "الإجازات", icon: <Calendar size={14} />, type: "leave", status: "18 يوم متبقي", statusVariant: "success", details: "آخر إجازة: يناير 2026 (7 أيام)" },
    ],
    alerts: [{ text: "الشهادة الصحية منتهية", variant: "danger" }],
  },
  {
    img: staffShimol, name: "شيمول", role: "طباخ رئيسي", roleShort: "دوام كامل · 3,800 ر/شهر",
    salary: 3800, status: "حاضر", statusVariant: "success",
    performance: { tasks: "تحضير البرجر (آنجوس + ناشفيل + كريسبي)", rating: "إنتاجية عالية · يغطي الذروة" },
    docs: [
      { label: "الإقامة", icon: <Shield size={14} />, type: "iqama", number: "2491XXXXXX", issueDate: "5 مايو 2023", expiryDate: "5 مايو 2025", status: "منتهية", statusVariant: "danger", details: "مهنة: طباخ · تحتاج تجديد عاجل" },
      { label: "الشهادة الصحية", icon: <HeartPulse size={14} />, type: "health", number: "HC-2025-1204", issueDate: "20 أبريل 2025", expiryDate: "20 أبريل 2026", status: "باقي 9 أيام", statusVariant: "warning", details: "تنتهي قريباً — جدّد قبل الموعد" },
      { label: "العقد", icon: <ScrollText size={14} />, type: "contract", issueDate: "15 أغسطس 2024", expiryDate: "15 أغسطس 2026", status: "ساري", statusVariant: "success", details: "عقد سنتين · راتب 3,800 ر.س شامل البدلات" },
      { label: "الإجازات", icon: <Calendar size={14} />, type: "leave", status: "21 يوم متبقي", statusVariant: "success", details: "آخر إجازة: أغسطس 2025 (14 يوم)" },
    ],
    alerts: [
      { text: "الإقامة منتهية", variant: "danger" },
      { text: "الشهادة الصحية تنتهي قريباً", variant: "warning" },
    ],
  },
  {
    img: staffMiraj, name: "ميراج", role: "تحضير + توصيل", roleShort: "دوام جزئي · 1,800 ر/شهر",
    salary: 1800, status: "تأخر", statusVariant: "warning",
    performance: { tasks: "تحضير البطاطس والجوانب + توصيل محلي", rating: "تأخيرات متكررة · يحتاج متابعة" },
    docs: [
      { label: "الإقامة", icon: <Shield size={14} />, type: "iqama", number: "2503XXXXXX", issueDate: "18 يوليو 2025", expiryDate: "18 يوليو 2026", status: "باقي 3 شهور", statusVariant: "success", details: "مهنة: عامل · الكفيل: مؤسسة برقرهم" },
      { label: "الشهادة الصحية", icon: <HeartPulse size={14} />, type: "health", number: "HC-2025-2010", issueDate: "18 يوليو 2025", expiryDate: "18 يوليو 2026", status: "باقي 3 شهور", statusVariant: "success", details: "سارية — لا حاجة لإجراء" },
      { label: "العقد", icon: <ScrollText size={14} />, type: "contract", issueDate: "1 مارس 2025", expiryDate: "1 مارس 2026", status: "ساري", statusVariant: "success", details: "عقد سنة · دوام جزئي" },
      { label: "الإجازات", icon: <Calendar size={14} />, type: "leave", status: "9 أيام متبقي", statusVariant: "success", details: "لم يأخذ إجازة بعد" },
    ],
    alerts: [{ text: "جميع الوثائق سارية", variant: "success" }],
  },
  {
    img: staffRayan, name: "ريان", role: "مساعد مطبخ", roleShort: "دوام جزئي · 1,600 ر/شهر",
    salary: 1600, status: "حاضر", statusVariant: "success",
    performance: { tasks: "مساعدة شيمول في التحضير + نظافة المطبخ", rating: "أداء مقبول" },
    docs: [
      { label: "الإقامة", icon: <Shield size={14} />, type: "iqama", number: "2498XXXXXX", issueDate: "22 أبريل 2024", expiryDate: "22 أبريل 2026", status: "باقي 11 يوم", statusVariant: "warning", details: "مهنة: مساعد طباخ · تحتاج تجديد قريباً" },
      { label: "الشهادة الصحية", icon: <HeartPulse size={14} />, type: "health", number: "HC-2024-4521", issueDate: "15 نوفمبر 2024", expiryDate: "15 نوفمبر 2025", status: "منتهية", statusVariant: "danger", details: "منتهية — تحتاج تجديد فوري" },
      { label: "العقد", icon: <ScrollText size={14} />, type: "contract", issueDate: "10 يونيو 2024", expiryDate: "10 يونيو 2026", status: "ساري", statusVariant: "success", details: "عقد سنتين · دوام جزئي مسائي" },
      { label: "الإجازات", icon: <Calendar size={14} />, type: "leave", status: "14 يوم متبقي", statusVariant: "success", details: "آخر إجازة: أكتوبر 2025 (5 أيام)" },
    ],
    alerts: [
      { text: "الإقامة تنتهي خلال 11 يوم", variant: "warning" },
      { text: "الشهادة الصحية منتهية", variant: "danger" },
    ],
  },
];

const totalSalaries = employees.reduce((a, e) => a + e.salary, 0);

const alertColors = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
};

const docStatusColors = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  gray: "text-muted-foreground",
};

const Staff = () => {
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const toggleEmployee = (name: string) => {
    setExpandedEmployee(expandedEmployee === name ? null : name);
    setExpandedDoc(null);
  };

  const toggleDoc = (key: string) => {
    setExpandedDoc(expandedDoc === key ? null : key);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="الطاقم" subtitle="المستندات والوثائق والإجازات والتنبيهات" badge={`${employees.length} موظف`} />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="👥 عدد الموظفين" value={employees.length.toString()} sub={`${employees.filter(e => e.statusVariant === "success").length} حاضر الآن`} subColor="success" />
        <MetricCard label="💰 إجمالي الرواتب" value={totalSalaries.toLocaleString()} sub="شهرياً · 49.7% من الإيرادات" subColor="warning" showRiyal />
        <MetricCard label="📈 متوسط المبيعات/موظف" value={Math.round(696 * 30 / employees.length).toLocaleString()} sub="شهرياً لكل موظف" showRiyal />
        <MetricCard label="📄 تنبيهات وثائق" value={employees.reduce((a, e) => a + e.alerts.filter(al => al.variant === "danger").length, 0).toString()} sub="وثائق منتهية تحتاج تجديد" subColor="danger" />
      </div>

      {/* Employee Cards */}
      <div className="space-y-4">
        {employees.map((emp) => {
          const isExpanded = expandedEmployee === emp.name;
          const dangerDocs = emp.docs.filter(d => d.statusVariant === "danger").length;
          const warningDocs = emp.docs.filter(d => d.statusVariant === "warning").length;

          return (
            <div key={emp.name} className="ios-card !p-0 overflow-hidden">
              {/* Header */}
              <div
                onClick={() => toggleEmployee(emp.name)}
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <img
                  src={emp.img}
                  alt={emp.name}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="w-14 h-14 rounded-full object-cover border-2 border-border flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[15px] font-bold text-foreground">{emp.name}</span>
                    <StatusBadge variant={emp.statusVariant}>{emp.status}</StatusBadge>
                  </div>
                  <div className="text-[12px] text-muted-foreground">{emp.role} — {emp.roleShort}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {dangerDocs > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-danger-bg text-danger">
                      🚨 {dangerDocs} منتهية
                    </span>
                  )}
                  {warningDocs > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-warning-bg text-warning">
                      ⚡ {warningDocs} قريبة
                    </span>
                  )}
                  <ChevronDown
                    size={18}
                    className={`text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border animate-fade-in">
                  {/* Performance */}
                  <div className="px-5 py-3 bg-muted/20 border-b border-border">
                    <div className="flex gap-6 text-[11px]">
                      <span className="text-muted-foreground">📊 المهام: <span className="text-foreground font-medium">{emp.performance.tasks}</span></span>
                      <span className="text-muted-foreground">📈 الأداء: <span className="text-foreground font-medium">{emp.performance.rating}</span></span>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="p-5">
                    <div className="text-[11px] font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                      <FileText size={13} /> المستندات والوثائق
                    </div>
                    <div className="space-y-2">
                      {emp.docs.map((doc) => {
                        const docKey = `${emp.name}-${doc.label}`;
                        const isDocExpanded = expandedDoc === docKey;
                        return (
                          <div key={doc.label} className="border border-border rounded-xl overflow-hidden">
                            <div
                              onClick={() => toggleDoc(docKey)}
                              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
                            >
                              <span className="text-muted-foreground">{doc.icon}</span>
                              <span className="text-[12px] font-semibold text-foreground flex-1">{doc.label}</span>
                              <span className={`text-[11px] font-semibold ${docStatusColors[doc.statusVariant]}`}>
                                {doc.status}
                              </span>
                              <ChevronDown
                                size={14}
                                className={`text-muted-foreground transition-transform duration-200 ${isDocExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                            {isDocExpanded && (
                              <div className="px-4 pb-3 pt-0 border-t border-border bg-muted/10 animate-fade-in">
                                <div className="grid grid-cols-3 gap-3 mt-3">
                                  {doc.number && (
                                    <div>
                                      <div className="text-[9px] text-muted-foreground font-medium mb-0.5">رقم المستند</div>
                                      <div className="text-[12px] font-semibold text-foreground">{doc.number}</div>
                                    </div>
                                  )}
                                  {doc.issueDate && (
                                    <div>
                                      <div className="text-[9px] text-muted-foreground font-medium mb-0.5">تاريخ الإصدار</div>
                                      <div className="text-[12px] font-semibold text-foreground">{doc.issueDate}</div>
                                    </div>
                                  )}
                                  {doc.expiryDate && (
                                    <div>
                                      <div className="text-[9px] text-muted-foreground font-medium mb-0.5">تاريخ الانتهاء</div>
                                      <div className={`text-[12px] font-semibold ${docStatusColors[doc.statusVariant]}`}>{doc.expiryDate}</div>
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
                  </div>

                  {/* Alerts footer */}
                  <div className="px-5 py-3 border-t border-border bg-muted/10 flex gap-2 flex-wrap">
                    {emp.alerts.map((alert, i) => (
                      <span key={i} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${alertColors[alert.variant]}`}>
                        ● {alert.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ملخص تكلفة العمالة */}
      <div className="ios-card mt-6">
        <div className="text-[11px] font-medium text-muted-foreground mb-4">📊 تحليل تكلفة العمالة مقابل الإيرادات</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background rounded-xl p-4 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">الرواتب الشهرية</div>
            <div className="text-[18px] font-bold text-foreground flex items-center justify-center gap-1">{totalSalaries.toLocaleString()} <RiyalIcon size={12} /></div>
          </div>
          <div className="bg-background rounded-xl p-4 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">متوسط الإيرادات الشهرية</div>
            <div className="text-[18px] font-bold text-primary flex items-center justify-center gap-1">{(696 * 30).toLocaleString()} <RiyalIcon size={12} /></div>
            <div className="text-[9px] text-muted-foreground mt-0.5">696 × 30 يوم</div>
          </div>
          <div className="bg-background rounded-xl p-4 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">نسبة العمالة من الإيرادات</div>
            <div className={`text-[18px] font-bold ${(totalSalaries / (696 * 30)) > 0.35 ? 'text-danger' : 'text-success'}`}>
              {((totalSalaries / (696 * 30)) * 100).toFixed(1)}%
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">{(totalSalaries / (696 * 30)) > 0.35 ? '⚠️ أعلى من المعيار (30-35%)' : '✅ ضمن المعيار'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staff;
