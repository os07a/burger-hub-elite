import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import ProductionCostCard from "@/components/dashboard/ProductionCostCard";
import StatusBadge from "@/components/ui/StatusBadge";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Plus, X, Check, RefreshCw, Settings2, Undo2, TicketPercent, Wallet, Banknote, CreditCard, Bike } from "lucide-react";
import { toast } from "sonner";
import PosSyncDialog from "@/components/dashboard/PosSyncDialog";
import SalesLogCard from "@/components/dashboard/SalesLogCard";
import { supabase as sb } from "@/integrations/supabase/client";
import { fmt, fmtPct } from "@/lib/format";
import { useEmployees } from "@/hooks/useEmployees";
import { useTodayAttendance, useActiveLeavesToday } from "@/hooks/useTodayAttendance";
import { useRealtimeInvalidate } from "@/hooks/useRealtime";

const FALLBACK_AVG_DAILY = 696;
const todayStr = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Riyadh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const todayLabel = new Intl.DateTimeFormat("ar-SA", {
  timeZone: "Asia/Riyadh",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

interface DashboardSalesRow {
  id: string;
  date: string;
  cash_sales: number;
  card_sales: number;
  delivery_sales: number;
  total_sales: number;
  orders_count: number;
  gross_sales: number;
  refunds: number;
  discounts: number;
  net_sales: number;
  cogs: number;
  gross_profit: number;
  margin: number;
  taxes: number;
}

interface DashboardProps {
  embedded?: boolean;
}

const Dashboard = ({ embedded = false }: DashboardProps) => {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [cardInput, setCardInput] = useState("");
  const [deliveryInput, setDeliveryInput] = useState("");
  const [posOpen, setPosOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const lastSync = typeof window !== "undefined" ? localStorage.getItem("pos_last_sync") : null;

  // Live staff data
  const { data: employees = [] } = useEmployees();
  const { data: todayAttendance = [] } = useTodayAttendance();
  const { data: activeLeaves = [] } = useActiveLeavesToday();

  // Realtime: any change in staff/attendance/leaves refreshes the dashboard card
  useRealtimeInvalidate("employees", [["employees"]]);
  useRealtimeInvalidate("attendance", [["attendance", "today"]]);
  useRealtimeInvalidate("employee_leaves", [["employee_leaves", "today"]]);

  // Realtime: new POS receipts / sales summary updates → refresh dashboard instantly
  useRealtimeInvalidate("pos_receipts", [
    ["pos_receipts"],
    ["daily-sales-summary"],
    ["daily_sales"],
  ]);
  useRealtimeInvalidate("daily_sales", [
    ["daily-sales-summary"],
    ["daily_sales"],
  ]);

  const totalSalaries = employees.reduce((s, e) => s + Number(e.salary || 0), 0);

  const invalidateSalesQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["daily_sales"] });
    queryClient.invalidateQueries({ queryKey: ["daily-sales-summary"] });
    queryClient.invalidateQueries({ queryKey: ["pos_receipts"] });
  };

  const quickSync = async () => {
    setSyncing(true);
    const { data, error } = await sb.functions.invoke("sync-loyverse-sales", { body: {} });
    setSyncing(false);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "فشلت المزامنة");
      return;
    }
    toast.success(`تمت المزامنة: ${fmt(Number(data.total ?? 0), { maximumFractionDigits: 2 })} ريال · ${data.receipts_saved ?? 0} إيصال`);
    localStorage.setItem("pos_last_sync", new Date().toISOString());
    invalidateSalesQueries();
  };

  const { data: todaySales } = useQuery({
    queryKey: ["daily_sales", todayStr],
    queryFn: async (): Promise<DashboardSalesRow | null> => {
      const { data, error } = await supabase.from("daily_sales").select("*").eq("date", todayStr).maybeSingle();
      if (error) throw error;
      return (data as unknown as DashboardSalesRow | null) ?? null;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ cash, card, delivery }: { cash: number; card: number; delivery: number }) => {
      const total = cash + card + delivery;
      if (todaySales) {
        const newCash = Number(todaySales.cash_sales || 0) + cash;
        const newCard = Number(todaySales.card_sales || 0) + card;
        const newDelivery = Number(todaySales.delivery_sales || 0) + delivery;
        const newTotal = newCash + newCard + newDelivery;
        const payload = {
          cash_sales: newCash,
          card_sales: newCard,
          delivery_sales: newDelivery,
          total_sales: newTotal,
          gross_sales: Number(todaySales.gross_sales ?? todaySales.total_sales ?? 0) + total,
          net_sales: Number(todaySales.net_sales ?? todaySales.total_sales ?? 0) + total,
          gross_profit: Number(todaySales.gross_profit ?? todaySales.total_sales ?? 0) + total,
          margin: 100,
          orders_count: Number(todaySales.orders_count || 0) + 1,
        };

        const { error } = await supabase.from("daily_sales").update(payload as never).eq("id", todaySales.id);
        if (error) throw error;
      } else {
        const payload = {
          date: todayStr,
          cash_sales: cash,
          card_sales: card,
          delivery_sales: delivery,
          total_sales: total,
          gross_sales: total,
          net_sales: total,
          gross_profit: total,
          margin: 100,
          orders_count: 1,
        };

        const { error } = await supabase.from("daily_sales").insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidateSalesQueries();
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
  const channelTotal = cashVal + cardVal + deliveryVal;
  const grossVal = Number(todaySales?.gross_sales ?? 0);
  const refundsVal = Number(todaySales?.refunds ?? 0);
  const discountsVal = Number(todaySales?.discounts ?? 0);
  const netVal = Number(todaySales?.net_sales ?? todaySales?.total_sales ?? 0);
  const marginVal = Number(todaySales?.margin ?? (netVal > 0 ? 100 : 0));
  const totalToday = channelTotal > 0 ? channelTotal : netVal;
  const hasChannelBreakdown = channelTotal > 0;

  return (
    <div className="animate-fade-in">
      <PosSyncDialog
        open={posOpen}
        onOpenChange={setPosOpen}
        onSynced={() => {
          invalidateSalesQueries();
        }}
      />
      {!embedded && <PageHeader title="لوحة التحكم" subtitle={todayLabel} badge="مباشر" />}

      <div className="ios-card mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[11px] font-medium text-muted-foreground">
            💰 الدخل اليومي — {todayStr}
            {lastSync && (
              <span className="mr-2 text-[10px] text-gray-light">
                · آخر مزامنة: {new Date(lastSync).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          {!adding && (
            <div className="flex items-center gap-2">
              <button
                onClick={quickSync}
                disabled={syncing}
                className="flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-[11px] font-semibold text-success transition-colors hover:bg-success/20 disabled:opacity-50"
              >
                <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                {syncing ? "جاري المزامنة..." : "مزامنة من الكاشير"}
              </button>
              <button
                onClick={() => setPosOpen(true)}
                className="flex items-center justify-center rounded-lg bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-muted/80"
                title="إعدادات الكاشير"
              >
                <Settings2 size={14} />
              </button>
              <button
                onClick={() => setAdding(true)}
                className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <Plus size={14} /> إضافة
              </button>
            </div>
          )}
        </div>

        {adding && (
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: "شبكة", icon: CreditCard, value: cardInput, set: setCardInput },
              { label: "كاش", icon: Banknote, value: cashInput, set: setCashInput },
              { label: "توصيل", icon: Bike, value: deliveryInput, set: setDeliveryInput },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-background p-3">
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                  <item.icon size={12} /> {item.label}
                </div>
                <input
                  type="number"
                  placeholder="0"
                  value={item.value}
                  onChange={(e) => item.set(e.target.value)}
                  className="w-full border-b border-border bg-transparent pb-1 text-center text-[18px] font-bold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            ))}
          </div>
        )}

        {adding && (
          <div className="mb-4 flex gap-2">
            <button onClick={handleSave} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              <Check size={14} /> حفظ
            </button>
            <button onClick={() => setAdding(false)} className="flex items-center justify-center gap-1 rounded-xl bg-muted px-4 py-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/80">
              <X size={14} /> إلغاء
            </button>
          </div>
        )}

        {hasChannelBreakdown && (
          <div className="mb-3 grid grid-cols-3 gap-3">
            {[
              { label: "شبكة", value: cardVal, icon: CreditCard, color: "text-primary" },
              { label: "كاش", value: cashVal, icon: Banknote, color: "text-success" },
              { label: "توصيل", value: deliveryVal, icon: Bike, color: "text-warning" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-background px-3 py-2.5">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                  <item.icon size={11} /> {item.label}
                </div>
                <div className={`flex items-center gap-1 text-[16px] font-bold tracking-tight ${item.color}`}>
                  {fmt(item.value, { maximumFractionDigits: 2 })}
                  <RiyalIcon size={10} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "صافي المبيعات", value: netVal, icon: Wallet, tone: "text-foreground" },
            { label: "الخصومات", value: discountsVal, icon: TicketPercent, tone: "text-muted-foreground" },
            { label: "المرتجع", value: refundsVal, icon: Undo2, tone: "text-muted-foreground" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-background px-3 py-2.5">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                <item.icon size={11} /> {item.label}
              </div>
              <div className={`flex items-center gap-1 text-[16px] font-bold tracking-tight ${item.tone}`}>
                {fmt(item.value, { maximumFractionDigits: 2 })}
                <RiyalIcon size={10} />
              </div>
            </div>
          ))}
        </div>

        {hasChannelBreakdown ? (
          <>
            {totalToday > 0 && (
              <>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-background flex">
                  <div className="h-full rounded-r-full bg-primary/60" style={{ width: `${((cardVal / totalToday) * 100).toFixed(0)}%` }} />
                  <div className="h-full bg-success/70" style={{ width: `${((cashVal / totalToday) * 100).toFixed(0)}%` }} />
                  <div className="h-full rounded-l-full bg-warning/60" style={{ width: `${((deliveryVal / totalToday) * 100).toFixed(0)}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>
                    الإجمالي: <b className="text-foreground">{fmt(totalToday, { maximumFractionDigits: 2 })}</b> <RiyalIcon size={9} />
                  </span>
                  <span>
                    الطلبات: <b className="text-foreground">{todaySales?.orders_count ?? 0}</b>
                  </span>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-border bg-background p-3 text-[11px] text-muted-foreground">
            هذا التقرير يعرض ملخص Loyverse اليومي بشكل صحيح، لكن تقسيم طرق الدفع (كاش/شبكة/توصيل) غير متوفر إلا إذا رجعت الإيصالات نفسها من المزامنة.
          </div>
        )}
      </div>

      <SalesLogCard />

      <div className="mb-5 grid grid-cols-2 gap-4">
        <div className="ios-card">
          <div className="mb-4 text-[11px] font-medium text-muted-foreground">أكثر المنتجات مبيعاً</div>
          {[
            { label: "آنجوس لحم", value: "34% من الطلبات", emoji: "🥩" },
            { label: "وجبة كاملة", value: "25% من الطلبات", emoji: "🍔" },
            { label: "كريسبي الدجاج", value: "19% من الطلبات", emoji: "🍗" },
            { label: "ناشفيل الدجاج", value: "12% من الطلبات", emoji: "🌶️" },
          ].map((item, i) => (
            <div key={item.label} className={`flex items-center justify-between py-3 text-[13px] ${i < 3 ? "border-b border-border" : ""}`}>
              <span className="text-muted-foreground">{item.emoji} {item.label}</span>
              <span className="font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="ios-card">
          <div className="mb-4 text-[11px] font-medium text-muted-foreground">تنبيهات المخزون</div>
          {[
            { label: "زيت الرائد تنك 17لتر", status: "حرج", variant: "danger" as const, supplier: "السلال المنتجة" },
            { label: "خبز البرجر", status: "منخفض", variant: "warning" as const, supplier: "مورد محلي" },
            { label: "مايونيز هاينز", status: "منخفض", variant: "warning" as const, supplier: "الحلول المساندة" },
            { label: "بيبسي قوارير", status: "منخفض", variant: "warning" as const, supplier: "السلال المنتجة" },
          ].map((item, i) => (
            <div key={item.label} className={`flex items-center justify-between py-3 text-[13px] ${i < 3 ? "border-b border-border" : ""}`}>
              <div>
                <span className="text-muted-foreground">{item.label}</span>
                <span className="mr-1.5 text-[10px] text-gray-light">({item.supplier})</span>
              </div>
              <StatusBadge variant={item.variant}>{item.status}</StatusBadge>
            </div>
          ))}
        </div>
      </div>

      <div className="ios-card">
        <div className="mb-4 text-[11px] font-medium text-muted-foreground">👥 حالة الطاقم اليوم</div>
        {employees.length === 0 ? (
          <div className="py-6 text-center text-[12px] text-muted-foreground">لا يوجد موظفون مسجلون بعد</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {employees.map((emp) => {
              const att = todayAttendance.find((a) => a.employee_id === emp.id);
              const onLeave = activeLeaves.find((l) => l.employee_id === emp.id);
              let statusLabel = "غائب";
              let variant: "success" | "warning" | "danger" | "info" = "danger";
              if (onLeave) { statusLabel = "إجازة"; variant = "info"; }
              else if (att?.check_in) {
                if ((att.late_minutes ?? 0) > 0) { statusLabel = `تأخر ${att.late_minutes}د`; variant = "warning"; }
                else { statusLabel = "حاضر"; variant = "success"; }
              }
              const shortName = (emp.name || "").split(" ").slice(-1)[0] || emp.name;
              const shortRole = emp.role_short || (emp.role || "").slice(0, 10);
              return (
                <div key={emp.id} className="rounded-xl bg-background p-4 text-center">
                  <div className="truncate text-[13px] font-semibold text-foreground" title={emp.name}>{shortName}</div>
                  <div className="mb-2 truncate text-[10px] text-muted-foreground" title={emp.role}>{shortRole}</div>
                  <StatusBadge variant={variant}>{statusLabel}</StatusBadge>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 flex justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">الرواتب الشهرية: <b className="flex items-center gap-1 text-foreground">{fmt(totalSalaries)} <RiyalIcon size={9} /></b></span>
          <span>نسبة العمالة: <b className={totalSalaries / (FALLBACK_AVG_DAILY * 30) > 0.35 ? "text-danger" : "text-success"}>{totalSalaries > 0 ? ((totalSalaries / (FALLBACK_AVG_DAILY * 30)) * 100).toFixed(1) : "0.0"}%</b></span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
