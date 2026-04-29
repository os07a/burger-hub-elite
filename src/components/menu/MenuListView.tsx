import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, Search, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { QUADRANT_META, type MenuEngineeringResult, type MenuItem } from "@/hooks/useMenuEngineering";

interface Props {
  data: MenuEngineeringResult;
}

type PopLevel = "high" | "mid" | "low";

const popularityLevel = (i: MenuItem): PopLevel => {
  if (i.units_sold === 0) return "low";
  if (i.popularity_index >= 1.2) return "high";
  if (i.popularity_index >= 0.6) return "mid";
  return "low";
};

const POP_META: Record<PopLevel, { label: string; dot: string }> = {
  high: { label: "شعبية عالية",   dot: "bg-success" },
  mid:  { label: "شعبية متوسطة", dot: "bg-muted-foreground/60" },
  low:  { label: "شعبية ضعيفة",  dot: "bg-border" },
};

const fmtPct = (v: number | null | undefined) => {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  return `${v > 0 ? "+" : ""}${v.toFixed(0)}%`;
};

const TrendIndicator = ({ pct }: { pct: number | null | undefined }) => {
  if (pct === null || pct === undefined || !isFinite(pct)) {
    return <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"><Minus size={10} />—</span>;
  }
  const up = pct > 1, down = pct < -1;
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus;
  const color = up ? "text-success" : down ? "text-danger" : "text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${color}`}>
      <Icon size={10} />
      {fmtPct(pct)}
    </span>
  );
};

const MenuListView = ({ data }: Props) => {
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const sold = useMemo(() => data.items.filter((i) => i.units_sold > 0), [data.items]);
  const dead = useMemo(() => data.items.filter((i) => i.units_sold === 0), [data.items]);

  const filterFn = (i: MenuItem) =>
    !q.trim() || i.name.toLowerCase().includes(q.toLowerCase()) || (i.category ?? "").toLowerCase().includes(q.toLowerCase());

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const i of sold.filter(filterFn)) {
      const cat = i.category?.trim() || "بدون فئة";
      const arr = map.get(cat) ?? [];
      arr.push(i);
      map.set(cat, arr);
    }
    // sort categories by total margin desc
    return Array.from(map.entries())
      .map(([cat, items]) => ({
        cat,
        items: items.sort((a, b) => b.total_margin - a.total_margin),
        totalMargin: items.reduce((s, i) => s + i.total_margin, 0),
        totalUnits: items.reduce((s, i) => s + i.units_sold, 0),
      }))
      .sort((a, b) => b.totalMargin - a.totalMargin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sold, q]);

  const toggle = (cat: string) => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }));

  const renderItem = (i: MenuItem) => {
    const pop = popularityLevel(i);
    const popMeta = POP_META[pop];
    const qmeta = QUADRANT_META[i.quadrant];
    const marginColor =
      i.total_margin < 0
        ? "hsl(0, 70%, 50%)"
        : i.margin_pct >= 50
        ? "hsl(142, 71%, 35%)"
        : "hsl(var(--foreground))";
    return (
      <div
        key={i.product_id}
        className="flex items-center gap-3 py-2 px-3 hover:bg-muted/30 transition border-b border-border/40 last:border-0"
      >
        {/* Quadrant dot + name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: qmeta.color }} title={qmeta.label} />
            <span className="text-[13px] font-bold text-foreground truncate">{i.name}</span>
            {i.match_via === "name" && (
              <span title="مربوط بمطابقة الاسم" className="text-[9px] text-muted-foreground bg-muted px-1 rounded shrink-0">~</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${popMeta.dot}`} />
              {popMeta.label}
            </span>
            <span>·</span>
            <span>{qmeta.label}</span>
          </div>
        </div>

        {/* Units + trend */}
        <div className="text-end shrink-0 w-20">
          <div className="text-[13px] font-bold text-foreground">{i.units_sold}</div>
          <div className="text-[10px] text-muted-foreground">وحدة</div>
        </div>
        <div className="shrink-0 w-14 text-center">
          <TrendIndicator pct={i.units_change_pct} />
        </div>

        {/* Revenue */}
        <div className="text-end shrink-0 w-20">
          <div className="text-[12px] font-semibold text-foreground">{Math.round(i.net_revenue).toLocaleString("ar-SA")}</div>
          <div className="text-[10px] text-muted-foreground">إيراد ر.س</div>
        </div>

        {/* Margin */}
        <div className="text-end shrink-0 w-24">
          <div className="text-[12px] font-bold" style={{ color: marginColor }}>
            {Math.round(i.total_margin).toLocaleString("ar-SA")}
          </div>
          <div className="text-[10px] text-muted-foreground">هامش · {i.margin_pct.toFixed(0)}%</div>
        </div>
      </div>
    );
  };

  return (
    <div className="ios-card" dir="rtl">
      <div className="flex items-center justify-between mb-3 gap-3">
        <div>
          <div className="text-[13px] font-bold text-foreground">قائمة المنيو</div>
          <div className="text-[11px] text-muted-foreground">
            مجمّعة حسب الفئة · مرتبة حسب إجمالي الهامش · {sold.length} صنف نشط
          </div>
        </div>
        <div className="relative">
          <Search size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث منتج أو فئة..."
            className="bg-muted/30 border border-border rounded-lg text-[11px] pr-7 pl-2.5 py-1.5 w-52 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {grouped.length === 0 && dead.filter(filterFn).length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-[12px]">لا نتائج.</div>
      )}

      <div className="space-y-3">
        {grouped.map(({ cat, items, totalMargin, totalUnits }) => {
          const isCollapsed = !!collapsed[cat];
          return (
            <div key={cat} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(cat)}
                className="w-full flex items-center justify-between gap-3 bg-muted/30 hover:bg-muted/50 transition px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? <ChevronLeft size={14} /> : <ChevronDown size={14} />}
                  <span className="text-[13px] font-bold text-foreground">{cat}</span>
                  <span className="text-[10px] text-muted-foreground">{items.length} صنف</span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-muted-foreground">{totalUnits} وحدة</span>
                  <span className="font-bold" style={{ color: "hsl(142, 71%, 35%)" }}>
                    {Math.round(totalMargin).toLocaleString("ar-SA")} ر.س هامش
                  </span>
                </div>
              </button>
              {!isCollapsed && <div>{items.map(renderItem)}</div>}
            </div>
          );
        })}

        {dead.filter(filterFn).length > 0 && (
          <div className="border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => toggle("__dead")}
              className="w-full flex items-center justify-between gap-3 bg-muted/20 hover:bg-muted/40 transition px-3 py-2"
            >
              <div className="flex items-center gap-2">
                {collapsed["__dead"] ? <ChevronLeft size={14} /> : <ChevronDown size={14} />}
                <AlertCircle size={12} className="text-muted-foreground" />
                <span className="text-[12px] font-bold text-muted-foreground">
                  بدون مبيعات في هذه الفترة
                </span>
                <span className="text-[10px] text-muted-foreground">{dead.filter(filterFn).length} صنف</span>
              </div>
              <span className="text-[10px] text-muted-foreground">فكّر في إزالتها أو إعادة تصميمها</span>
            </button>
            {!collapsed["__dead"] && (
              <div className="opacity-60">{dead.filter(filterFn).map(renderItem)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuListView;