import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Calculator, Percent, Target, ChefHat, Plus, Trash2, Sparkles } from "lucide-react";

type Ingredient = { id: string; itemId: string; qty: number };

// Smart unit mapping: stock unit -> display unit + conversion factor to base
const unitMap: Record<string, { display: string; factor: number }> = {
  كجم: { display: "جرام", factor: 1 / 1000 },
  kg: { display: "جرام", factor: 1 / 1000 },
  لتر: { display: "مل", factor: 1 / 1000 },
  l: { display: "مل", factor: 1 / 1000 },
};

const getUnitInfo = (baseUnit: string) => {
  const key = baseUnit?.toLowerCase?.() || baseUnit;
  return unitMap[baseUnit] || unitMap[key] || { display: baseUnit || "وحدة", factor: 1 };
};

const ProductCalculatorTab = () => {
  const { data: products = [] } = useProducts();
  const { data: inventory = [] } = useInventory();

  // Recipe calculator
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [targetMargin, setTargetMargin] = useState(60);

  const addIngredient = () => {
    const firstId = inventory[0]?.id ?? "";
    setIngredients((prev) => [...prev, { id: crypto.randomUUID(), itemId: firstId, qty: 100 }]);
  };
  const removeIngredient = (id: string) => setIngredients((prev) => prev.filter((i) => i.id !== id));
  const updateIngredient = (id: string, patch: Partial<Ingredient>) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const rows = useMemo(
    () =>
      ingredients.map((ing) => {
        const item = inventory.find((i) => i.id === ing.itemId);
        const unitInfo = item ? getUnitInfo(item.unit) : { display: "وحدة", factor: 1 };
        const baseQty = ing.qty * unitInfo.factor;
        const cost = item ? baseQty * Number(item.cost_per_unit) : 0;
        return { ing, item, unitInfo, cost };
      }),
    [ingredients, inventory],
  );

  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const suggestedPrice = targetMargin < 100 ? totalCost / (1 - targetMargin / 100) : 0;
  const unitProfitRecipe = suggestedPrice - totalCost;

  // 1) Smart pricing
  const [cost1, setCost1] = useState(10);
  const [margin1, setMargin1] = useState(60);
  const suggestedPrice1 = margin1 < 100 ? cost1 / (1 - margin1 / 100) : 0;

  // 2) Margin from price
  const [price2, setPrice2] = useState(20);
  const [cost2, setCost2] = useState(8);
  const profit2 = price2 - cost2;
  const margin2 = price2 > 0 ? (profit2 / price2) * 100 : 0;

  // 3) Break-even per product
  const [fixedCost, setFixedCost] = useState(15000);
  const [productId, setProductId] = useState<string>(products[0]?.id ?? "");
  const selected = useMemo(() => products.find((p) => p.id === productId) ?? products[0], [products, productId]);
  const unitProfit = selected ? Number(selected.price) - Number(selected.cost) : 0;
  const unitsNeeded = unitProfit > 0 ? Math.ceil(fixedCost / unitProfit) : 0;
  const dailyNeeded = unitsNeeded > 0 ? Math.ceil(unitsNeeded / 30) : 0;

  return (
    <div className="ios-card">
      <Tabs defaultValue="recipe" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="recipe" className="text-[11px] gap-1">
            <ChefHat size={12} /> مكونات
          </TabsTrigger>
          <TabsTrigger value="pricing" className="text-[11px] gap-1">
            <Calculator size={12} /> تسعير
          </TabsTrigger>
          <TabsTrigger value="margin" className="text-[11px] gap-1">
            <Percent size={12} /> هامش
          </TabsTrigger>
          <TabsTrigger value="breakeven" className="text-[11px] gap-1">
            <Target size={12} /> تعادل
          </TabsTrigger>
        </TabsList>

        {/* Recipe tab */}
        <TabsContent value="recipe" className="mt-4 space-y-3">
          {inventory.length === 0 ? (
            <div className="text-center text-[12px] text-muted-foreground py-6">
              لا توجد مكونات في المخزون. أضف مكونات من صفحة المخزون أولاً.
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {rows.map(({ ing, item, unitInfo, cost }) => (
                  <div
                    key={ing.id}
                    className="grid grid-cols-[1fr_90px_70px_70px_32px] gap-2 items-center bg-muted/30 rounded-lg p-2"
                  >
                    <select
                      className="h-9 rounded-md border border-input bg-background px-2 text-[12px]"
                      value={ing.itemId}
                      onChange={(e) => updateIngredient(ing.id, { itemId: e.target.value })}
                    >
                      {inventory.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      className="h-9 text-[12px]"
                      value={ing.qty}
                      onChange={(e) => updateIngredient(ing.id, { qty: parseFloat(e.target.value) || 0 })}
                    />
                    <div className="text-[11px] text-muted-foreground text-center">{unitInfo.display}</div>
                    <div className="text-[12px] font-bold text-success flex items-center justify-center gap-0.5">
                      {cost.toFixed(2)} <RiyalIcon size={10} />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-danger hover:bg-danger/10"
                      onClick={() => removeIngredient(ing.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>

              <Button onClick={addIngredient} variant="outline" size="sm" className="w-full gap-1 text-[12px]">
                <Plus size={14} /> إضافة مكوّن
              </Button>

              {ingredients.length > 0 && (
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">إجمالي التكلفة</span>
                    <span className="text-[18px] font-bold text-foreground flex items-center gap-1">
                      {totalCost.toFixed(2)} <RiyalIcon size={12} />
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px]">هامش مرغوب</Label>
                      <span className="text-[12px] font-bold text-primary">{targetMargin}%</span>
                    </div>
                    <Slider
                      value={[targetMargin]}
                      onValueChange={(v) => setTargetMargin(v[0])}
                      min={20}
                      max={85}
                      step={1}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/10">
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
                        <Sparkles size={10} /> السعر المقترح
                      </div>
                      <div className="text-[20px] font-bold text-primary flex items-center justify-center gap-1">
                        {suggestedPrice.toFixed(2)} <RiyalIcon size={12} />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground mb-0.5">ربح/وحدة</div>
                      <div className="text-[20px] font-bold text-success flex items-center justify-center gap-1">
                        {unitProfitRecipe.toFixed(2)} <RiyalIcon size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">التكلفة (ر.س)</Label>
              <Input type="number" step="0.5" value={cost1} onChange={(e) => setCost1(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label className="text-[11px]">الهامش المرغوب (%)</Label>
              <Input type="number" step="1" value={margin1} onChange={(e) => setMargin1(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">السعر المقترح</div>
            <div className="text-[24px] font-bold text-primary flex items-center justify-center gap-1">
              {suggestedPrice1.toFixed(2)}
              <RiyalIcon size={16} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              ربح صافي: <span className="font-bold text-success">{(suggestedPrice1 - cost1).toFixed(2)}</span> ر.س
            </div>
          </div>
        </TabsContent>

        <TabsContent value="margin" className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">السعر (ر.س)</Label>
              <Input type="number" step="0.5" value={price2} onChange={(e) => setPrice2(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label className="text-[11px]">التكلفة (ر.س)</Label>
              <Input type="number" step="0.5" value={cost2} onChange={(e) => setCost2(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-center">
              <div className="text-[10px] text-muted-foreground mb-1">الربح</div>
              <div className="text-[20px] font-bold text-success flex items-center justify-center gap-1">
                {profit2.toFixed(2)} <RiyalIcon size={12} />
              </div>
            </div>
            <div className={`rounded-xl border p-3 text-center ${margin2 >= 50 ? "bg-success/10 border-success/20" : margin2 >= 30 ? "bg-warning/10 border-warning/20" : "bg-danger/10 border-danger/20"}`}>
              <div className="text-[10px] text-muted-foreground mb-1">الهامش</div>
              <div className={`text-[20px] font-bold ${margin2 >= 50 ? "text-success" : margin2 >= 30 ? "text-warning" : "text-danger"}`}>
                {margin2.toFixed(1)}%
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="breakeven" className="mt-4 space-y-3">
          <div>
            <Label className="text-[11px]">التكلفة الشهرية الثابتة (ر.س)</Label>
            <Input type="number" step="100" value={fixedCost} onChange={(e) => setFixedCost(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-[11px]">المنتج</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {Number(p.price).toFixed(0)} ر.س
                </option>
              ))}
            </select>
          </div>
          {selected && (
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10px] text-muted-foreground">ربح/وحدة</div>
                  <div className="text-[16px] font-bold text-success">{unitProfit.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">وحدات شهرياً</div>
                  <div className="text-[16px] font-bold text-primary">{unitsNeeded.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">يومياً</div>
                  <div className="text-[16px] font-bold text-foreground">{dailyNeeded}</div>
                </div>
              </div>
              {unitProfit <= 0 && (
                <div className="text-[11px] text-danger text-center mt-2">⚠️ هذا المنتج لا يحقق ربحاً — راجع السعر أو التكلفة.</div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductCalculatorTab;
