import { useState } from "react";
import { useProductMovement } from "@/hooks/useProductMovement";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Trophy } from "lucide-react";

const ProductMovementTab = () => {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const { data: rows = [], isLoading } = useProductMovement(days);

  const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
  const totalNet = rows.reduce((s, r) => s + r.net_total, 0);
  const totalProfit = rows.reduce((s, r) => s + r.profit, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? "default" : "outline"}
              onClick={() => setDays(d as 7 | 30 | 90)}
              className="h-7 text-[11px]"
            >
              آخر {d} يوم
            </Button>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-3">
          <span>إجمالي الكمية: <span className="font-bold text-foreground">{totalQty.toFixed(0)}</span></span>
          <span className="flex items-center gap-1">
            صافي: <span className="font-bold text-foreground">{totalNet.toFixed(0)}</span>
            <RiyalIcon size={10} />
          </span>
          <span className="flex items-center gap-1">
            ربح: <span className="font-bold text-success">{totalProfit.toFixed(0)}</span>
            <RiyalIcon size={10} />
          </span>
        </div>
      </div>

      <div className="ios-card p-0 overflow-hidden">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12 text-[12px]">جارٍ التحميل...</div>
        ) : rows.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 text-[12px]">
            لا توجد بيانات مبيعات في هذه الفترة. شغّل مزامنة Loyverse من لوحة التحكم.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right text-[11px] w-12">#</TableHead>
                <TableHead className="text-right text-[11px]">المنتج</TableHead>
                <TableHead className="text-right text-[11px]">الكمية</TableHead>
                <TableHead className="text-right text-[11px]">الإيراد</TableHead>
                <TableHead className="text-right text-[11px]">الربح</TableHead>
                <TableHead className="text-right text-[11px]">الهامش</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.item_name}>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {i === 0 ? <Trophy size={13} className="text-warning" /> : i + 1}
                  </TableCell>
                  <TableCell className="text-[12px] font-semibold text-foreground">{r.item_name}</TableCell>
                  <TableCell className="text-[12px] font-bold text-foreground">{r.quantity.toFixed(0)}</TableCell>
                  <TableCell className="text-[12px] font-bold flex items-center gap-1">
                    {r.net_total.toFixed(0)}
                    <RiyalIcon size={10} />
                  </TableCell>
                  <TableCell className={`text-[12px] font-bold ${r.profit >= 0 ? "text-success" : "text-danger"}`}>
                    {r.profit.toFixed(0)}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${r.margin >= 50 ? "text-success" : r.margin >= 30 ? "text-warning" : "text-danger"}`}>
                      {r.margin >= 30 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {r.margin.toFixed(0)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ProductMovementTab;
