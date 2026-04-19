import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/useProducts";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Calculator, Percent, Target } from "lucide-react";

const ProductCalculatorTab = () => {
  const { data: products = [] } = useProducts();

  // 1) Smart pricing
  const [cost1, setCost1] = useState(10);
  const [margin1, setMargin1] = useState(60);
  const suggestedPrice = margin1 < 100 ? cost1 / (1 - margin1 / 100) : 0;

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
      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="pricing" className="text-[11px] gap-1">
            <Calculator size={12} /> تسعير ذكي
          </TabsTrigger>
          <TabsTrigger value="margin" className="text-[11px] gap-1">
            <Percent size={12} /> هامش من سعر
          </TabsTrigger>
          <TabsTrigger value="breakeven" className="text-[11px] gap-1">
            <Target size={12} /> نقطة التعادل
          </TabsTrigger>
        </TabsList>

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
              {suggestedPrice.toFixed(2)}
              <RiyalIcon size={16} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              ربح صافي: <span className="font-bold text-success">{(suggestedPrice - cost1).toFixed(2)}</span> ر.س
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
