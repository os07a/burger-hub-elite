import { useState } from "react";
import { useMenuEngineering, QUADRANT_META, type MenuQuadrant } from "@/hooks/useMenuEngineering";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, TrendingUp, AlertTriangle, ChefHat } from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { toast } from "sonner";

const PERIODS = [
  { d: 7, label: "آخر 7 أيام" },
  { d: 30, label: "آخر 30 يوم" },
  { d: 90, label: "آخر 90 يوم" },
];

const PRIORITY_META: Record<string, { label: string; cls: string }> = {
  high: { label: "عالية", cls: "bg-danger/10 text-danger border-danger/30" },
  medium: { label: "متوسطة", cls: "bg-warning/10 text-warning border-warning/30" },
  low: { label: "منخفضة", cls: "bg-muted text-muted-foreground border-border" },
};

const MenuAnalysis = () => {
  const [days, setDays] = useState(30);
  const [aiLoading, setAiLoading] = useState(false);
  const [advice, setAdvice] = useState<{ summary: string; recommendations: any[] } | null>(null);
  const { data, isLoading, error } = useMenuEngineering(days);

  const requestAdvice = async () => {
    if (!data) return;
    setAiLoading(true);
    setAdvice(null);
    try {
      const { data: res, error } = await supabase.functions.invoke("menu-engineering-advice", {
        body: {
          items: data.items,
          period_days: data.period_days,
          counts: data.counts,
          total_revenue: data.total_revenue,
          total_margin: data.total_margin,
          avg_units: data.avg_units,
          avg_margin: data.avg_margin,
        },
      });
      if (error) throw error;
      if ((res as any)?.error) throw new Error((res as any).error);
      setAdvice(res as any);
    } catch (e: any) {
      toast.error("فشل توليد التوصيات: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" dir="rtl">
      <PageHeader
        title="تحليل المنيو"
        subtitle="مصفوفة هندسة المنيو — صنّف منتجاتك واتخذ قرارات أذكى"
        badge={data ? `${data.items.filter((i) => i.units_sold > 0).length} صنف نشط` : undefined}
        actions={
          <div className="flex gap-1.5">
            {PERIODS.map((p) => (
              <Button
                key={p.d}
                size="sm"
                variant={days === p.d ? "default" : "outline"}
                onClick={() => setDays(p.d)}
                className="h-7 text-[11px]"
              >
                {p.label}
              </Button>
            ))}
          </div>
        }
      />

      {isLoading && <div className="ios-card text-center py-12 text-muted-foreground">جارٍ تحليل بيانات المنيو...</div>}
      {error && <div className="ios-card text-center py-12 text-danger">حدث خطأ: {(error as any).message}</div>}

      {data && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MetricCard label="إجمالي الإيراد" value={data.total_revenue.toFixed(0)} sub={`${data.period_days} يوم`} showRiyal />
            <MetricCard label="إجمالي الهامش" value={data.total_margin.toFixed(0)} sub={`${data.total_revenue > 0 ? ((data.total_margin / data.total_revenue) * 100).toFixed(0) : 0}% من الإيراد`} subColor="success" showRiyal />
            <MetricCard label="متوسط مبيعات الصنف" value={data.avg_units.toFixed(1)} sub="وحدة" />
            <MetricCard label="متوسط هامش الصنف" value={data.avg_margin.toFixed(0)} sub="ريال لكل صنف" subColor={data.avg_margin >= 0 ? "success" : "danger"} showRiyal />
          </div>

          {/* Quadrant counts */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {(Object.keys(QUADRANT_META) as MenuQuadrant[]).map((q) => {
              const meta = QUADRANT_META[q];
              return (
                <div key={q} className="ios-card flex items-start gap-3" style={{ borderInlineStartWidth: 4, borderInlineStartColor: meta.color, borderInlineStartStyle: "solid" }}>
                  <div className="text-[28px] leading-none">{meta.emoji}</div>
                  <div className="flex-1">
                    <div className="text-[11px] text-muted-foreground">{meta.description}</div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-[20px] font-bold text-foreground">{data.counts[q]}</span>
                      <span className="text-[11px] font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1.5">{meta.action}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <Tabs defaultValue="matrix" dir="rtl" className="w-full">
            <TabsList className="grid grid-cols-3 max-w-md mb-4">
              <TabsTrigger value="matrix" className="text-[12px]">المصفوفة</TabsTrigger>
              <TabsTrigger value="table" className="text-[12px]">الجدول</TabsTrigger>
              <TabsTrigger value="advice" className="text-[12px]">توصيات AI</TabsTrigger>
            </TabsList>

            <TabsContent value="matrix">
              <div className="ios-card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[13px] font-bold text-foreground">مصفوفة الشعبية × الربحية</div>
                    <div className="text-[11px] text-muted-foreground">المحور الأفقي = الوحدات المباعة، الرأسي = الهامش الإجمالي</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">حجم النقطة = نسبة الهامش %</div>
                </div>

                {data.items.filter((i) => i.units_sold > 0).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-[13px]">
                    لا توجد مبيعات في هذه الفترة. شغّل مزامنة Loyverse من الداشبورد أولاً.
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 480 }}>
                    <ResponsiveContainer>
                      <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          type="number"
                          dataKey="units_sold"
                          name="الوحدات المباعة"
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fontSize: 11 }}
                          label={{ value: "الشعبية (الوحدات المباعة)", position: "insideBottom", offset: -10, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          type="number"
                          dataKey="total_margin"
                          name="الهامش الإجمالي"
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fontSize: 11 }}
                          label={{ value: "الربحية (هامش بالريال)", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <ZAxis type="number" dataKey="margin_pct" range={[60, 400]} name="نسبة الهامش %" />
                        <ReferenceLine x={data.avg_units} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: `متوسط ${data.avg_units.toFixed(1)}`, position: "top", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <ReferenceLine y={data.avg_margin} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: `متوسط ${data.avg_margin.toFixed(0)}`, position: "right", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const i = payload[0].payload;
                            const meta = QUADRANT_META[i.quadrant as MenuQuadrant];
                            return (
                              <div className="bg-background border border-border rounded-xl p-3 shadow-lg text-[11px]" dir="rtl">
                                <div className="font-bold text-[13px] mb-1.5 flex items-center gap-1.5">
                                  <span>{meta.emoji}</span>
                                  <span>{i.name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                                  <span>الوحدات:</span><span className="text-foreground font-semibold text-end">{i.units_sold}</span>
                                  <span>الإيراد:</span><span className="text-foreground font-semibold text-end">{i.net_revenue.toFixed(0)} ر.س</span>
                                  <span>الهامش:</span><span className="text-success font-bold text-end">{i.total_margin.toFixed(0)} ر.س</span>
                                  <span>الهامش %:</span><span className="text-foreground font-semibold text-end">{i.margin_pct.toFixed(0)}%</span>
                                </div>
                                <div className="mt-1.5 pt-1.5 border-t border-border text-[10px]" style={{ color: meta.color }}>
                                  {meta.label} — {meta.action}
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Scatter data={data.items.filter((i) => i.units_sold > 0)}>
                          {data.items.filter((i) => i.units_sold > 0).map((i, idx) => (
                            <Cell key={idx} fill={QUADRANT_META[i.quadrant].color} fillOpacity={0.75} stroke={QUADRANT_META[i.quadrant].color} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="table">
              <div className="ios-card overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-[11px] text-muted-foreground border-b border-border">
                      <th className="text-start py-2 px-2 font-semibold">المنتج</th>
                      <th className="text-center font-semibold">التصنيف</th>
                      <th className="text-end font-semibold">الوحدات</th>
                      <th className="text-end font-semibold">الإيراد</th>
                      <th className="text-end font-semibold">الهامش</th>
                      <th className="text-end font-semibold">الهامش %</th>
                      <th className="text-center font-semibold">الفئة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((i) => {
                      const meta = QUADRANT_META[i.quadrant];
                      return (
                        <tr key={i.product_id} className="border-b border-border/50 hover:bg-muted/30 transition">
                          <td className="py-2 px-2 font-semibold text-foreground">{i.name}</td>
                          <td className="text-center text-muted-foreground text-[11px]">{i.category || "—"}</td>
                          <td className="text-end font-bold text-foreground">{i.units_sold}</td>
                          <td className="text-end text-foreground">{i.net_revenue.toFixed(0)}</td>
                          <td className="text-end font-bold" style={{ color: i.total_margin >= 0 ? "hsl(142, 71%, 35%)" : "hsl(0, 70%, 50%)" }}>{i.total_margin.toFixed(0)}</td>
                          <td className="text-end text-foreground">{i.margin_pct.toFixed(0)}%</td>
                          <td className="text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: `${meta.color}1A`, color: meta.color, border: `1px solid ${meta.color}40` }}>
                              <span>{meta.emoji}</span>{meta.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {data.items.length === 0 && <div className="text-center py-8 text-muted-foreground">لا توجد منتجات نشطة.</div>}
              </div>
            </TabsContent>

            <TabsContent value="advice">
              <div className="ios-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ChefHat size={18} className="text-primary" />
                    <div>
                      <div className="text-[13px] font-bold text-foreground">توصيات هندسة المنيو الذكية</div>
                      <div className="text-[11px] text-muted-foreground">تحليل بالذكاء الاصطناعي بناءً على بيانات آخر {days} يوم</div>
                    </div>
                  </div>
                  <Button size="sm" onClick={requestAdvice} disabled={aiLoading} className="gap-1.5">
                    {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {aiLoading ? "جارٍ التحليل..." : advice ? "إعادة التحليل" : "احصل على التوصيات"}
                  </Button>
                </div>

                {!advice && !aiLoading && (
                  <div className="text-center py-10 text-muted-foreground text-[12px]">
                    اضغط "احصل على التوصيات" ليحلل المستشار الذكي بياناتك ويعطيك خطوات عملية.
                  </div>
                )}

                {advice && (
                  <div className="space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <TrendingUp size={16} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[11px] font-semibold text-primary mb-1">الخلاصة</div>
                          <div className="text-[13px] text-foreground leading-relaxed">{advice.summary}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {advice.recommendations?.map((r: any, i: number) => {
                        const pm = PRIORITY_META[r.priority] ?? PRIORITY_META.medium;
                        return (
                          <div key={i} className="border border-border rounded-xl p-3 hover:bg-muted/20 transition">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                                <span className="text-muted-foreground text-[11px]">#{i + 1}</span>
                                {r.title}
                              </div>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${pm.cls}`}>
                                {pm.label}
                              </span>
                            </div>
                            {r.reason && (
                              <div className="flex items-start gap-1.5 mb-1.5">
                                <AlertTriangle size={11} className="text-muted-foreground mt-1 shrink-0" />
                                <div className="text-[11px] text-muted-foreground leading-relaxed">{r.reason}</div>
                              </div>
                            )}
                            {r.action && (
                              <div className="bg-success/5 border border-success/20 rounded-lg px-2.5 py-1.5 mt-1.5">
                                <div className="text-[11px] text-foreground leading-relaxed">
                                  <span className="font-bold text-success">الخطوة:</span> {r.action}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default MenuAnalysis;
