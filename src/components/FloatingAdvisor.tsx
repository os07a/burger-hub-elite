import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bot, X, ArrowLeft, Sparkles } from "lucide-react";

const alerts = [
  { id: 1, text: "⚠️ المخزون: خبز البرجر وصل للحد الأدنى — اطلب اليوم", urgent: true },
  { id: 2, text: "💡 مبيعات الاثنين أقل 10% من المتوسط — جرّب عرض خاص", urgent: false },
  { id: 3, text: "📊 أبريل أعلى 22% من المتوسط العام — استمر!", urgent: false },
  { id: 4, text: "⚠️ زيت الرائد حرج — تواصل مع السلال المنتجة", urgent: true },
  { id: 5, text: "💰 نسبة العمالة 49.8% — مرتفعة، راجع الجدول", urgent: true },
];

const FloatingAdvisor = () => {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on advisor page
  if (location.pathname === "/advisor") return null;

  const urgentCount = alerts.filter((a) => a.urgent).length;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => { setOpen(!open); setSeen(true); }}
        className="fixed bottom-5 left-5 z-50 w-12 h-12 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        {open ? (
          <X size={20} className="text-primary-foreground" />
        ) : (
          <>
            <Bot size={22} className="text-primary-foreground" />
            {!seen && urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-[10px] text-destructive-foreground font-bold flex items-center justify-center">
                {urgentCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Popup */}
      {open && (
        <div className="fixed bottom-20 left-5 z-50 w-72 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center justify-between p-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[12px] font-bold text-foreground">المستشار الذكي</span>
            </div>
            <button
              onClick={() => { navigate("/advisor"); setOpen(false); }}
              className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
            >
              فتح المحادثة <ArrowLeft size={10} />
            </button>
          </div>

          <div className="p-2 max-h-64 overflow-y-auto space-y-1.5">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`text-[11px] p-2 rounded-lg leading-relaxed ${
                  a.urgent
                    ? "bg-destructive/10 border border-destructive/20 text-foreground"
                    : "bg-muted/50 border border-border text-muted-foreground"
                }`}
              >
                {a.text}
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-border">
            <button
              onClick={() => { navigate("/advisor"); setOpen(false); }}
              className="w-full text-[11px] bg-primary text-primary-foreground rounded-lg py-2 font-medium hover:opacity-90 transition-opacity"
            >
              💬 اسأل المستشار
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAdvisor;
