import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { useAnalyzeInsight, Platform } from "@/hooks/useSocialInsights";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface PostForm {
  post_text: string;
  post_url: string;
  post_type: string;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  posted_at: string;
}

const emptyPost = (): PostForm => ({
  post_text: "", post_url: "", post_type: "image", reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, posted_at: "",
});

const todayMonday = () => {
  const d = new Date();
  const day = d.getDay(); // 0 sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
};

const WeeklyInsightDialog = ({ open, onOpenChange }: Props) => {
  const analyze = useAnalyzeInsight();
  const [form, setForm] = useState({
    week_start: todayMonday(),
    platform: "both" as Platform,
    reach: 0,
    impressions: 0,
    profile_visits: 0,
    new_followers: 0,
    total_followers: 0,
    engagement_rate: 0,
    posts_count: 0,
    best_post_time: "",
  });
  const [posts, setPosts] = useState<PostForm[]>([emptyPost()]);

  const handleAnalyze = async () => {
    if (!form.week_start) { toast.error("حدد أسبوع البداية"); return; }
    try {
      await analyze.mutateAsync({
        ...form,
        posts: posts.filter(p => p.reach > 0 || p.likes > 0 || p.post_text),
      });
      onOpenChange(false);
    } catch {}
  };

  const updatePost = (idx: number, patch: Partial<PostForm>) => {
    setPosts(posts.map((p, i) => i === idx ? { ...p, ...patch } : p));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إدخال أرقام الأسبوع</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">بداية الأسبوع (الإثنين)</Label>
              <Input type="date" value={form.week_start} onChange={e => setForm({ ...form, week_start: e.target.value })} />
            </div>
            <div>
              <Label className="text-[11px]">المنصة</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.platform}
                onChange={e => setForm({ ...form, platform: e.target.value as Platform })}>
                <option value="both">فيسبوك + Instagram</option>
                <option value="facebook">فيسبوك</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><Label className="text-[11px]">الوصول (Reach)</Label>
              <Input type="number" value={form.reach} onChange={e => setForm({ ...form, reach: +e.target.value })} /></div>
            <div><Label className="text-[11px]">الانطباعات</Label>
              <Input type="number" value={form.impressions} onChange={e => setForm({ ...form, impressions: +e.target.value })} /></div>
            <div><Label className="text-[11px]">زيارات الملف</Label>
              <Input type="number" value={form.profile_visits} onChange={e => setForm({ ...form, profile_visits: +e.target.value })} /></div>
            <div><Label className="text-[11px]">متابعون جدد</Label>
              <Input type="number" value={form.new_followers} onChange={e => setForm({ ...form, new_followers: +e.target.value })} /></div>
            <div><Label className="text-[11px]">إجمالي المتابعين</Label>
              <Input type="number" value={form.total_followers} onChange={e => setForm({ ...form, total_followers: +e.target.value })} /></div>
            <div><Label className="text-[11px]">نسبة التفاعل %</Label>
              <Input type="number" step="0.1" value={form.engagement_rate} onChange={e => setForm({ ...form, engagement_rate: +e.target.value })} /></div>
            <div><Label className="text-[11px]">عدد المنشورات</Label>
              <Input type="number" value={form.posts_count} onChange={e => setForm({ ...form, posts_count: +e.target.value })} /></div>
            <div className="col-span-2"><Label className="text-[11px]">أفضل وقت نشر</Label>
              <Input placeholder="مثال: الجمعة 7م" value={form.best_post_time} onChange={e => setForm({ ...form, best_post_time: e.target.value })} /></div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-[12px] font-semibold">منشورات الأسبوع (اختياري)</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setPosts([...posts, emptyPost()])}>
                <Plus className="w-3.5 h-3.5 ml-1" /> إضافة منشور
              </Button>
            </div>

            <div className="space-y-3">
              {posts.map((p, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">منشور #{i + 1}</span>
                    {posts.length > 1 && (
                      <button onClick={() => setPosts(posts.filter((_, idx) => idx !== i))} className="text-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <Input placeholder="نص المنشور" value={p.post_text} onChange={e => updatePost(i, { post_text: e.target.value })} />
                  <div className="grid grid-cols-3 gap-2">
                    <select className="h-9 rounded-md border border-input bg-background px-2 text-[12px]" value={p.post_type}
                      onChange={e => updatePost(i, { post_type: e.target.value })}>
                      <option value="image">📷 صورة</option>
                      <option value="video">🎬 فيديو</option>
                      <option value="reel">🎞️ ريل</option>
                      <option value="story">📱 ستوري</option>
                      <option value="carousel">🖼️ كاروسيل</option>
                    </select>
                    <Input type="number" placeholder="Reach" value={p.reach || ""} onChange={e => updatePost(i, { reach: +e.target.value })} />
                    <Input type="number" placeholder="Likes" value={p.likes || ""} onChange={e => updatePost(i, { likes: +e.target.value })} />
                    <Input type="number" placeholder="Comments" value={p.comments || ""} onChange={e => updatePost(i, { comments: +e.target.value })} />
                    <Input type="number" placeholder="Shares" value={p.shares || ""} onChange={e => updatePost(i, { shares: +e.target.value })} />
                    <Input type="number" placeholder="Saves" value={p.saves || ""} onChange={e => updatePost(i, { saves: +e.target.value })} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleAnalyze} disabled={analyze.isPending}>
            <Sparkles className="w-3.5 h-3.5 ml-1.5" />
            {analyze.isPending ? "جاري التحليل..." : "تحليل بالـ AI"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyInsightDialog;