import { Heart } from "lucide-react";

interface Props {
  score: number;
  label: string;
  tone: "success" | "warning" | "danger";
}

const HealthScore = ({ score, label, tone }: Props) => {
  const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-danger";
  const ringColor = tone === "success" ? "hsl(var(--success))" : tone === "warning" ? "hsl(var(--warning))" : "hsl(var(--danger))";
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="ios-card flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} stroke="hsl(var(--border))" strokeWidth="6" fill="none" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={ringColor}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-[18px] font-bold ${toneClass}`}>{score}</span>
          <span className="text-[8px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Heart size={12} className={toneClass} />
          <span className="text-[11px] font-semibold text-muted-foreground">صحة المشروع</span>
        </div>
        <div className={`text-[18px] font-bold ${toneClass}`}>{label}</div>
        <div className="text-[10px] text-muted-foreground mt-1">
          محسوبة من السيولة والنمو والخصومات وتوزيع الأيام
        </div>
      </div>
    </div>
  );
};

export default HealthScore;
