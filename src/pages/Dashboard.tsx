import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Plus, X, Check } from "lucide-react";
import { toast } from "sonner";

const totalSalaries = 10400;
const avgDaily = 696;

const todayStr = new Date().toISOString().split("T")[0];

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [cardInput, setCardInput] = useState("");
  const [deliveryInput, setDeliveryInput] = useState("");

  const { data: todaySales } = useQuery({
    queryKey: ["daily_sales", todayStr],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_sales")
        .select("*")
        .eq("date", todayStr)
        .maybeSingle();
      return data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ cash, card, delivery }: { cash: number; card: number; delivery: number }) => {
      const total = cash + card + delivery;
      if (todaySales) {
        const newCash = todaySales.cash_sales + cash;
        const newCard = todaySales.card_sales + card;
        const newDelivery = todaySales.delivery_sales + delivery;
        const { error } = await supabase
          .from("daily_sales")
          .update({
            cash_sales: newCash,
            card_sales: newCard,
            delivery_sales: newDelivery,
            total_sales: newCash + newCard + newDelivery,
            orders_count: todaySales.orders_count + 1,
          })
          .eq("id", todaySales.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("daily_sales").insert({
          date: todayStr,
          cash_sales: cash,
          card_sales: card,
          delivery_sales: delivery,
          total_sales: total,
          orders_count: 1,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_sales", todayStr] });
      toast.success("تم تحديث الدخل اليومي");
      setAdding(false);
      setCashInput("");
      setCardInput("");
      setDeliveryInput("");
    },
    onError: () => toast.error("حدث خطأ في الحفظ"),
  });

  const handleSave = () => {
    const cash = Number(cashInput) || 0;
    const card = Number(cardInput) || 0;
    const delivery = Number(deliveryInput) || 0;
    if (cash + card + delivery === 0) {
      toast.error("أدخل مبلغ واحد على الأقل");
      return;
    }
    upsertMutation.mutate({ cash, card, delivery });
  };

  const cashVal = Number(todaySales?.cash_sales ?? 0);
  const cardVal = Number(todaySales?.card_sales ?? 0);
  const deliveryVal = Number(todaySales?.delivery_sales ?? 0);
  const totalToday = cashVal + cardVal + deliveryVal;

  return (
    <div className="animate-fade-in">
      <PageHeader title="لوحة التحكم" subtitle="السبت، 11 أبريل 2026" badge="مباشر" />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="📊 متوسط الإيرادات اليومية" value={avgDaily.toString()} sub="بناءً على البيانات الفعلية" subColor="success" showRiyal />
        <MetricCard label="💰 دخل اليوم" value={totalToday.toLocaleString()} sub={todayStr} showRiyal />
        <MetricCard label="💵 كاش اليوم" value={cashVal.toLocaleString()} sub="نقد مباشر" subColor="success" showRiyal />
        <MetricCard label="🚨 تنبيهات المخزون" value="4" sub="خبز + مايونيز + بيبسي + زيت" subColor="danger" />
      </div>

      {/* الدخل اليومي */}
      <div className="ios-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[11px] font-medium text-muted-foreground">💰 الدخل اليومي — {todayStr}</div>
          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 rounded-lg px-3 py-1.5 hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} /> إضافة
            </button>
          )}
        </div>

        {/* Input row */}
        {adding && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "💵 كاش", value: cashInput, set: setCashInput },
              { label: "💳 شبكة", value: cardInput, set: setCardInput },
              { label: "🛵 توصيل", value: deliveryInput, set: setDeliveryInput },
            ].map((item) => (
              <div key={item.label} className="bg-background rounded-xl p-3">
                <div className="text-[10px] text-muted-foreground font-medium mb-2">{item.label}</div>
                <input
                  type="number"
                  placeholder="0"
                  value={item.value}
                  onChange={(e) => item.set(e.target.value)}
                  className="w-full bg-transparent text-[18px] font-bold text-foreground text-center outline-none border-b border-border pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            ))}
          </div>
        )}
        {adding && (
          <div className="flex gap-2 mb-4">
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-semibold bg-primary text-primary-foreground rounded-xl py-2.5 hover:bg-primary/90 transition-colors">
              <Check size={14} /> حفظ
            </button>
            <button onClick={() => setAdding(false)} className="flex items-center justify-center gap-1 text-[12px] font-medium text-muted-foreground bg-muted rounded-xl px-4 py-2.5 hover:bg-muted/80 transition-colors">
              <X size={14} /> إلغاء
            </button>
          </div>
        )}

        {/* Display boxes */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "💵 كاش", value: cashVal, color: "text-success" },
            { label: "💳 شبكة", value: cardVal, color: "text-primary" },
            { label: "🛵 توصيل", value: deliveryVal, color: "text-warning" },
          ].map((item) => (
            <div key={item.label} className="bg-background rounded-xl p-4 text-center">
              <div className="text-[11px] text-muted-foreground font-medium mb-1.5">{item.label}</div>
              <div className={`text-[22px] font-bold tracking-tight ${item.color}`}>{item.value.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-center gap-1"><RiyalIcon size={10} /></div>
            </div>
          ))}
        </div>

        {/* Total bar */}
        {totalToday > 0 && (
          <>
            <div className="h-2 bg-background rounded-full overflow-hidden flex mt-4">
              <div className="h-full bg-success/70 rounded-r-full" style={{ width: `${(cashVal / totalToday * 100).toFixed(0)}%` }} />
              <div className="h-full bg-primary/60" style={{ width: `${(cardVal / totalToday * 100).toFixed(0)}%` }} />
              <div className="h-full bg-warning/60 rounded-l-full" style={{ width: `${(deliveryVal / totalToday * 100).toFixed(0)}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>الإجمالي: <b className="text-foreground">{totalToday.toLocaleString()}</b> <RiyalIcon size={9} /></span>
              <span>الطلبات: <b className="text-foreground">{todaySales?.orders_count ?? 0}</b></span>
            </div>
          </>
        )}
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* أعلى المنتجات */}
        <div className="ios-card">
          <div className="text-[11px] font-medium text-muted-foreground mb-4">أكثر المنتجات مبيعاً</div>
          {[
            { label: "آنجوس لحم", value: "34% من الطلبات", emoji: "🥩" },
            { label: "وجبة كاملة", value: "25% من الطلبات", emoji: "🍔" },
            { label: "كريسبي الدجاج", value: "19% من الطلبات", emoji: "🍗" },
            { label: "ناشفيل الدجاج", value: "12% من الطلبات", emoji: "🌶️" },
          ].map((item, i) => (
            <div key={item.label} className={`flex justify-between items-center py-3 text-[13px] ${i < 3 ? "border-b border-border" : ""}`}>
              <span className="text-muted-foreground">{item.emoji} {item.label}</span>
              <span className="text-foreground font-semibold">{item.value}</span>
            </div>
          ))}
        </div>

        {/* تنبيهات المخزون */}
        <div className="ios-card">
          <div className="text-[11px] font-medium text-muted-foreground mb-4">تنبيهات المخزون</div>
          {[
            { label: "زيت الرائد تنك 17لتر", status: "حرج", variant: "danger" as const, supplier: "السلال المنتجة" },
            { label: "خبز البرجر", status: "منخفض", variant: "warning" as const, supplier: "مورد محلي" },
            { label: "مايونيز هاينز", status: "منخفض", variant: "warning" as const, supplier: "الحلول المساندة" },
            { label: "بيبسي قوارير", status: "منخفض", variant: "warning" as const, supplier: "السلال المنتجة" },
          ].map((item, i) => (
            <div key={item.label} className={`flex justify-between items-center py-3 text-[13px] ${i < 3 ? "border-b border-border" : ""}`}>
              <div>
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-[10px] text-gray-light mr-1.5">({item.supplier})</span>
              </div>
              <StatusBadge variant={item.variant}>{item.status}</StatusBadge>
            </div>
          ))}
        </div>
      </div>

      {/* حالة الطاقم */}
      <div className="ios-card">
        <div className="text-[11px] font-medium text-muted-foreground mb-4">👥 حالة الطاقم اليوم</div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: "يونس", role: "كاشير", status: "حاضر", variant: "success" as const },
            { name: "شيمول", role: "طباخ", status: "حاضر", variant: "success" as const },
            { name: "ميراج", role: "تحضير", status: "تأخر 22د", variant: "warning" as const },
            { name: "ريان", role: "مساعد", status: "حاضر", variant: "success" as const },
          ].map((emp) => (
            <div key={emp.name} className="bg-background rounded-xl p-4 text-center">
              <div className="text-[13px] font-semibold text-foreground">{emp.name}</div>
              <div className="text-[10px] text-muted-foreground mb-2">{emp.role}</div>
              <StatusBadge variant={emp.variant}>{emp.status}</StatusBadge>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border flex justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">الرواتب الشهرية: <b className="text-foreground flex items-center gap-1">{totalSalaries.toLocaleString()} <RiyalIcon size={9} /></b></span>
          <span>نسبة العمالة: <b className={totalSalaries / (avgDaily * 30) > 0.35 ? "text-danger" : "text-success"}>{((totalSalaries / (avgDaily * 30)) * 100).toFixed(1)}%</b></span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
