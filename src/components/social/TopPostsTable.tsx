import { SocialPost } from "@/hooks/useSocialInsights";
import { Trophy, AlertCircle } from "lucide-react";

interface Props {
  posts: SocialPost[];
}

const TYPE_LABEL: Record<string, string> = {
  image: "📷 صورة",
  video: "🎬 فيديو",
  reel: "🎞️ ريل",
  story: "📱 ستوري",
  carousel: "🖼️ كاروسيل",
};

const TopPostsTable = ({ posts }: Props) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="ios-card animate-fade-in p-6">
        <div className="text-[13px] font-semibold text-foreground mb-2">أفضل وأضعف منشورات</div>
        <p className="text-[12px] text-muted-foreground">لا توجد منشورات بعد — أضف منشورات في نموذج الإدخال الأسبوعي.</p>
      </div>
    );
  }

  const top = posts.slice(0, 3);
  const worst = posts.length > 3 ? posts[posts.length - 1] : null;

  return (
    <div className="ios-card animate-fade-in p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-warning" />
        <div className="text-[13px] font-semibold text-foreground">أفضل المنشورات</div>
      </div>
      <div className="space-y-3">
        {top.map((p, idx) => (
          <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
            <div className="w-7 h-7 rounded-full bg-success/10 text-success flex items-center justify-center text-[12px] font-bold flex-shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-muted-foreground">{TYPE_LABEL[p.post_type] || p.post_type}</span>
                <span className="text-[10px] font-semibold text-success">{p.engagement_score}% تفاعل</span>
              </div>
              {p.post_text && <div className="text-[12px] text-foreground line-clamp-1 mb-1">{p.post_text}</div>}
              {p.ai_analysis && <div className="text-[11px] text-muted-foreground leading-relaxed">{p.ai_analysis}</div>}
              <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                <span>👁️ {p.reach.toLocaleString()}</span>
                <span>❤️ {p.likes}</span>
                <span>💬 {p.comments}</span>
                <span>🔄 {p.shares}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {worst && (
        <>
          <div className="flex items-center gap-2 mt-6 mb-3">
            <AlertCircle className="w-4 h-4 text-danger" />
            <div className="text-[12px] font-semibold text-foreground">منشور يحتاج تحسين</div>
          </div>
          <div className="p-3 rounded-xl bg-danger-bg/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-muted-foreground">{TYPE_LABEL[worst.post_type] || worst.post_type}</span>
              <span className="text-[10px] font-semibold text-danger">{worst.engagement_score}% تفاعل فقط</span>
            </div>
            {worst.post_text && <div className="text-[12px] text-foreground line-clamp-1 mb-1">{worst.post_text}</div>}
            {worst.ai_analysis && <div className="text-[11px] text-muted-foreground">{worst.ai_analysis}</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default TopPostsTable;