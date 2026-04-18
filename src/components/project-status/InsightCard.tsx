import { LucideIcon } from "lucide-react";
import RiyalIcon from "@/components/ui/RiyalIcon";

type Tone = "primary" | "accent" | "success" | "warning" | "danger" | "info" | "muted";

const toneStyles: Record<Tone, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  accent: { bg: "bg-accent/15", text: "text-accent" },
  success: { bg: "bg-success/10", text: "text-success" },
  warning: { bg: "bg-warning/15", text: "text-warning" },
  danger: { bg: "bg-danger/10", text: "text-danger" },
  info: { bg: "bg-info/10", text: "text-info" },
  muted: { bg: "bg-muted", text: "text-muted-foreground" },
};

interface InsightCardProps {
  icon: LucideIcon;
  title: string;
  value?: string | number;
  description?: string;
  tone?: Tone;
  showRiyal?: boolean;
}

const InsightCard = ({ icon: Icon, title, value, description, tone = "primary", showRiyal }: InsightCardProps) => {
  const s = toneStyles[tone];
  return (
    <div className="p-3 bg-background rounded-xl flex items-start gap-3">
      <div className={`w-9 h-9 rounded-full ${s.bg} ${s.text} flex items-center justify-center shrink-0`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[11px] font-bold text-foreground truncate">{title}</span>
          {value !== undefined && (
            <span className={`text-[12px] font-bold ${s.text} flex items-center gap-1 shrink-0`}>
              {value}
              {showRiyal && <RiyalIcon size={10} />}
            </span>
          )}
        </div>
        {description && (
          <div className="text-[10px] text-muted-foreground leading-relaxed">{description}</div>
        )}
      </div>
    </div>
  );
};

export default InsightCard;
