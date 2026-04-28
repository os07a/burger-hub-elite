import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Power, PowerOff, Save, ShieldAlert, AlertCircle } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useOpeningInventoryRuns, useSubmitOpeningInventory } from "@/hooks/useOpeningInventory";
import { useTriggerStatus, useToggleTrigger } from "@/hooks/useTriggerControl";
import { useUnmatchedSales, REASON_LABELS } from "@/hooks/useUnmatchedSales";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const OpeningInventory = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";

  const { data: inventory = [], isLoading } = useInventory();
  const { data: runs = [] } = useOpeningInventoryRuns();
  const triggerStatus = useTriggerStatus();
  const toggleTrigger = useToggleTrigger();
  const submit = useSubmitOpeningInventory();
  const { data: unmatched = [] } = useUnmatchedSales(20);

  const [counts, setCounts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  // Initialize counts when inventory loads
  useEffect(() => {
    if (inventory.length && Object.keys(counts).length === 0) {
      const init: Record<string, string> = {};
      inventory.forEach((it) => { init[it.id] = String(Number(it.quantity)); });
      setCounts(init);
    }
  }, [inventory, counts]);

  const lastRun = runs[0];
  const enabled = triggerStatus.data?.enabled ?? false;
  const runType: "opening" | "adjustment" = runs.length === 0 ? "opening" : "adjustment";

  const changedRows = useMemo(() => {
    return inventory.filter((it) => {
      const v = parseFloat(counts[it.id] ?? "");
      return !isNaN(v) && v !== Number(it.quantity);
    });
  }, [inventory, counts]);

  const handleToggle = async (next: boolean) => {
    try {
      await toggleTrigger.mutateAsync(next);
      toast.success(next ? "تم تفعيل الخصم التلقائي" : "تم إيقاف الخصم التلقائي");
      triggerStatus.refetch();
    } catch (e: any) {
      toast.error(e.message ?? "فشل تغيير الحالة");
    }
  };

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error("صلاحية المدير مطلوبة");
      return;
    }
    if (changedRows.length === 0) {
      toast.error("لا توجد تغييرات لحفظها");
      return;
    }
    try {
      const items = changedRows.map((it) => ({
        inventory_item_id: it.id,
        current_quantity: Number(it.quantity),
        new_quantity: parseFloat(counts[it.id]),
        cost_per_unit: Number(it.cost_per_unit),
      }));
      const res = await submit.mutateAsync({ items, notes: notes || null });
      toast.success(`تم حفظ الجرد (${res.changed_count} تعديل) كـ ${runType === "opening" ? "افتتاحي" : "تعديل"}`);
      setNotes("");
    } catch (e: any) {
      toast.error(e.message ?? "فشل الحفظ");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="📦 الجرد الابتدائي" subtitle="إدخال الكميات الفعلية في المخزون قبل تفعيل الخصم التلقائي" />

      {/* Trigger status banner */}
      <div className={`sticky top-0 z-10 rounded-2xl border p-4 ${enabled ? "bg-success/10 border-success/30" : "bg-warning/10 border-warning/30"}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-2">
            {enabled ? <Power className="text-success mt-0.5" size={20} /> : <PowerOff className="text-warning mt-0.5" size={20} />}
            <div>
              <div className={`font-semibold ${enabled ? "text-success" : "text-warning"}`}>
                {triggerStatus.isLoading ? "جارٍ التحقق من حالة التريغر..." : enabled ? "الخصم التلقائي مفعّل" : "الخصم التلقائي متوقف"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {enabled
                  ? "كل بيعة جديدة من Loyverse تخصم تلقائياً من المخزون حسب الوصفات"
                  : "البيعات لن تؤثر على المخزون. فعّل بعد إدخال الجرد الابتدائي."}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerStatus.refetch()}
              disabled={triggerStatus.isFetching}
            >
              تحديث الحالة
            </Button>
            {enabled ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleToggle(false)}
                disabled={!isAdmin || toggleTrigger.isPending}
              >
                <PowerOff size={14} className="ml-1" /> إيقاف فوري
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleToggle(true)}
                disabled={!isAdmin || toggleTrigger.isPending}
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                <Power size={14} className="ml-1" /> تفعيل
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Last run card */}
      <div className="rounded-2xl border border-border p-4 bg-card">
        <div className="text-sm text-muted-foreground mb-1">آخر جرد</div>
        {lastRun ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span><span className="text-muted-foreground">التاريخ:</span> {new Date(lastRun.run_date).toLocaleString("ar-SA")}</span>
            <span><span className="text-muted-foreground">النوع:</span> {lastRun.run_type === "opening" ? "افتتاحي" : "تعديل"}</span>
            <span className="text-xs text-muted-foreground">إجمالي الجرود: {runs.length}</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">لم يُنفّذ أي جرد بعد. الحفظ التالي سيكون <b className="text-foreground">جرد افتتاحي</b>.</div>
        )}
      </div>

      {/* Inventory count table */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="font-semibold">جدول الجرد ({inventory.length} مكوّن)</div>
          <div className="text-xs text-muted-foreground">{changedRows.length} صف تم تعديله</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-right">
                <th className="px-3 py-2 font-medium">المكوّن</th>
                <th className="px-3 py-2 font-medium">الفئة</th>
                <th className="px-3 py-2 font-medium">الكمية الحالية</th>
                <th className="px-3 py-2 font-medium">الكمية الفعلية</th>
                <th className="px-3 py-2 font-medium">الفرق</th>
                <th className="px-3 py-2 font-medium">الوحدة</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-3 py-6 text-center"><Loader2 className="inline animate-spin" size={18} /></td></tr>
              )}
              {!isLoading && inventory.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">لا توجد عناصر في المخزون. أضف من صفحة المخزون أولاً.</td></tr>
              )}
              {inventory.map((it) => {
                const val = counts[it.id] ?? "";
                const num = parseFloat(val);
                const delta = !isNaN(num) ? num - Number(it.quantity) : 0;
                const changed = !isNaN(num) && delta !== 0;
                return (
                  <tr key={it.id} className={`border-t border-border ${changed ? "bg-primary/5" : ""}`}>
                    <td className="px-3 py-2">{it.name}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{it.category ?? "—"}</td>
                    <td className="px-3 py-2">{Number(it.quantity)}</td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.001"
                        value={val}
                        onChange={(e) => setCounts({ ...counts, [it.id]: e.target.value })}
                        className="h-8 w-28"
                      />
                    </td>
                    <td className={`px-3 py-2 ${delta > 0 ? "text-success" : delta < 0 ? "text-danger" : ""}`}>
                      {!isNaN(num) ? (delta > 0 ? `+${delta}` : delta) : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{it.unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes + Save */}
      <div className="rounded-2xl border border-border p-4 bg-card space-y-3">
        <div>
          <label className="text-sm font-medium">ملاحظات الجرد</label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            placeholder="مثال: جرد بداية الشهر، تم بحضور المدير..." />
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm text-muted-foreground">
            سيُسجَّل كـ <b className="text-foreground">{runType === "opening" ? "جرد افتتاحي" : "تعديل جرد"}</b>
          </div>
          <Button onClick={handleSave} disabled={!isAdmin || submit.isPending || changedRows.length === 0}>
            {submit.isPending ? <Loader2 className="ml-1 animate-spin" size={14} /> : <Save size={14} className="ml-1" />}
            حفظ الجرد ({changedRows.length})
          </Button>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-1 text-xs text-warning">
            <ShieldAlert size={14} /> صلاحية المدير مطلوبة لحفظ الجرد وتفعيل/إيقاف التريغر
          </div>
        )}
      </div>

      {/* Unmatched sales banner */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <AlertCircle size={16} className="text-warning" />
          <div className="font-semibold">آخر بيعات لم تُخصم من المخزون</div>
          <span className="text-xs text-muted-foreground mr-auto">({unmatched.length})</span>
        </div>
        {unmatched.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">لا توجد بيعات غير متطابقة 🎉</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-right">
                  <th className="px-3 py-2 font-medium">الصنف</th>
                  <th className="px-3 py-2 font-medium">الكمية</th>
                  <th className="px-3 py-2 font-medium">السبب</th>
                  <th className="px-3 py-2 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {unmatched.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-3 py-2">{u.item_name}</td>
                    <td className="px-3 py-2">{Number(u.quantity)}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">
                        {REASON_LABELS[u.reason] ?? u.reason}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString("ar-SA")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpeningInventory;
