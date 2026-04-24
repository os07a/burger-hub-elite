import { Lightbulb } from "lucide-react";

interface Props {
  suggestions: string[];
}

const AiSuggestionsCard = ({ suggestions }: Props) => {
  return (
    <div className="ios-card animate-fade-in p-6 bg-gradient-to-br from-accent/5 via-card to-warning/5 border-accent/10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-accent" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-foreground">💡 اقتراحات للأسبوع القادم</div>
          <div className="text-[10.5px] text-muted-foreground">مولّدة من AI بناءً على بياناتك ومبيعاتك</div>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">سيظهر هنا اقتراحات بعد إدخال أول أسبوع وتحليله.</p>
      ) : (
        <div className="space-y-2.5">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-card/60 border border-border/40">
              <span className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-[12.5px] text-foreground leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiSuggestionsCard;