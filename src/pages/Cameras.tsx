import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import MetricCard from "@/components/ui/MetricCard";
import { Video } from "lucide-react";
import { useEffect, useState } from "react";

const cameras = [
  { name: "المدخل الرئيسي", online: true, feedBg: "bg-[#0d0d0d]" },
  { name: "المطبخ", online: true, feedBg: "bg-[#090d0a]" },
  { name: "منطقة الجلوس", online: true, feedBg: "bg-[#0d090b]" },
  { name: "الخارج / التوصيل", online: false, feedBg: "bg-[#111]" },
];

const Cameras = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString("en-GB"));

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString("en-GB")), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <PageHeader title="كاميرات المراقبة" subtitle="بث مباشر — 4 كاميرات" badge="مباشر" />

      <div className="grid grid-cols-2 gap-3 mb-4">
        {cameras.map((cam) => (
          <div key={cam.name} className="rounded-lg overflow-hidden border border-border bg-surface">
            <div className={`${cam.feedBg} aspect-video relative flex items-center justify-center`}>
              <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-2.5 py-2 z-10">
                {cam.online ? (
                  <span className="text-[10px] font-bold text-red-500 tracking-wide animate-blink">● LIVE</span>
                ) : (
                  <span className="text-[10px] font-bold text-gray tracking-wide">● غير متصل</span>
                )}
                {cam.online && <span className="text-[10px] font-semibold text-primary-foreground/40" dir="ltr">{time}</span>}
              </div>
              <div className="absolute top-0 left-0 right-0 h-px bg-primary-foreground/[0.03] animate-scan z-[1]" />
              <Video size={44} className={`${cam.online ? "text-primary-foreground/10" : "text-primary-foreground/20 opacity-30"}`} />
            </div>
            <div className="flex justify-between items-center px-3 py-2">
              <span className="text-[12px] font-semibold text-foreground">{cam.name}</span>
              {cam.online ? (
                <span className="text-[10px] font-semibold text-success">● متصل</span>
              ) : (
                <span className="text-[10px] font-semibold text-danger">● انقطاع</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">معلومات النظام</div>
        {[
          { label: "نوع النظام", value: "Hikvision — IP Cameras" },
          { label: "دقة التسجيل", value: "1080p — 30fps" },
          { label: "مدة الحفظ", value: "30 يوم — تسجيل مستمر" },
          { label: "آخر فحص", value: "اليوم — 8:00 ص" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center py-2 border-b border-border last:border-b-0 text-[13px]">
            <span className="text-gray">{row.label}</span>
            <span className="font-semibold text-foreground">{row.value}</span>
          </div>
        ))}
        <div className="flex justify-between items-center py-2 text-[13px]">
          <span className="text-gray">كاميرا 4 — السبب</span>
          <span className="text-[12px] font-semibold text-danger">انقطاع في الكابل — تحتاج صيانة</span>
        </div>
      </div>
    </div>
  );
};

export default Cameras;
