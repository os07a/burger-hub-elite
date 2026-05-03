import { useMemo, useRef, useState } from "react";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Loader2, Upload } from "lucide-react";
import { useArchiveInvoices, useUploadInvoiceImage, type ArchiveInvoice } from "@/hooks/useArchiveInvoices";
import InvoiceImageViewer from "@/components/archive/InvoiceImageViewer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeInvalidate } from "@/hooks/useRealtime";

const typeConfig: Record<string, { label: string; variant: "info" | "success" | "warning" | "danger"; icon: string }> = {
  "tax-invoice": { label: "فاتورة ضريبية", variant: "info", icon: "🧾" },
  invoice: { label: "فاتورة", variant: "info", icon: "📄" },
  receipt: { label: "إيصال حوالة", variant: "success", icon: "💳" },
  quote: { label: "عرض سعر", variant: "warning", icon: "📋" },
  approval: { label: "اعتماد عهدة", variant: "success", icon: "✅" },
  "supply-invoice": { label: "فاتورة تموينية", variant: "success", icon: "🥩" },
  other: { label: "أخرى", variant: "danger", icon: "📁" },
};

const statusVariant = (s: string): "success" | "warning" | "danger" => {
  if (s === "مدفوعة" || s === "موثق") return "success";
  if (s === "معلقة" || s === "بيانات فقط") return "warning";
  return "danger";
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "long" });
};

const Archive = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const { data: invoices = [], isLoading } = useArchiveInvoices();
  const upload = useUploadInvoiceImage();
  const qc = useQueryClient();

  useRealtimeInvalidate("invoices", [["archive-invoices"]]);

  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<string | null>(null);
  const quickInputRef = useRef<HTMLInputElement>(null);
  const [creating, setCreating] = useState(false);

  const supplyDocs = useMemo(() => invoices.filter(i => i.doc_type === "supply-invoice"), [invoices]);
  const assetDocs = useMemo(() => invoices.filter(i => i.doc_type !== "supply-invoice"), [invoices]);

  const supplyTotal = supplyDocs.reduce((a, d) => a + Number(d.amount), 0);
  const assetTotal = assetDocs.reduce((a, d) => a + Number(d.amount), 0);

  // تجميع التموين حسب اسم المورد
  const supplyGroups = useMemo(() => {
    const map = new Map<string, ArchiveInvoice[]>();
    supplyDocs.forEach(d => {
      const key = d.suppliers?.name || d.account || "بدون مورد";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [supplyDocs]);

  // تجميع الأصول حسب الحساب
  const assetGroups = useMemo(() => {
    const map = new Map<string, ArchiveInvoice[]>();
    assetDocs.forEach(d => {
      const key = d.account || "غير مصنف";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [assetDocs]);

  // الرفع السريع: ينشئ فاتورة جديدة (بدون مورد) ثم يرفع الصورة
  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAdmin) { toast.error("للرفع تحتاج صلاحية المدير"); return; }
    setCreating(true);
    try {
      const today = new Date();
      const monthLabel = today.toLocaleDateString("ar-SA-u-ca-gregory", { month: "long", year: "numeric" });
      const { data: inv, error } = await supabase
        .from("invoices")
        .insert({
          amount: 0,
          date: today.toISOString().slice(0, 10),
          status: "بيانات فقط",
          notes: file.name,
          account: "غير مصنف",
          recipient: "—",
          month_label: monthLabel,
          doc_type: "other",
        })
        .select()
        .single();
      if (error) throw error;
      await upload.mutateAsync({ invoiceId: inv.id, file });
      toast.success("تم رفع المستند — حدّث البيانات من قسم الفاتورة الجديدة");
      qc.invalidateQueries({ queryKey: ["archive-invoices"] });
    } catch (err: any) {
      toast.error(err.message ?? "فشل الرفع");
    } finally {
      setCreating(false);
      if (quickInputRef.current) quickInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard label="🛒 فواتير تموينية" value={supplyDocs.length.toString()} sub={`${Math.round(supplyTotal).toLocaleString()} ر.س إجمالي`} subColor="success" />
        <MetricCard label="🏗️ فواتير الأصول" value={assetDocs.length.toString()} sub={`${Math.round(assetTotal).toLocaleString()} ر.س إجمالي`} subColor="warning" />
        <MetricCard label="💸 إجمالي المصروفات" value={Math.round(supplyTotal + assetTotal).toLocaleString()} sub="ريال سعودي" showRiyal />
        <MetricCard label="📅 الفترة" value="12 شهر" sub="أبريل 2025 – أبريل 2026" subColor="gray" />
      </div>

      {/* رفع مستند سريع — شغّال الآن */}
      <div
        onClick={() => isAdmin && !creating && quickInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors mb-6 ${
          isAdmin
            ? "border-border cursor-pointer hover:border-primary hover:bg-primary/5 bg-surface"
            : "border-border bg-surface opacity-60 cursor-not-allowed"
        }`}
      >
        <div className="mx-auto mb-2 w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-gray">
          {creating ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
        </div>
        <div className="text-[13px] font-bold text-foreground mb-0.5">
          {creating ? "جارٍ الرفع وإنشاء السجل..." : "اضغط لرفع مستند"}
        </div>
        <div className="text-[10px] text-gray-light">
          {isAdmin ? "صورة أو PDF · فاتورة، سند قبض، عقد، تصريح" : "للرفع تحتاج صلاحية المدير"}
        </div>
        <input
          ref={quickInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleQuickUpload}
        />
      </div>

      {/* ═══════════ قالب الفواتير التموينية ═══════════ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[18px]">🥩</span>
          <div>
            <div className="text-[15px] font-bold text-foreground">الفواتير التموينية</div>
            <div className="text-[10px] text-gray-light">{supplyDocs.length} فاتورة · {supplyGroups.length} مورد · إجمالي {Math.round(supplyTotal).toLocaleString()} ر.س</div>
          </div>
        </div>

        <div className="space-y-2">
          {supplyGroups.map(([supplier, docs]) => {
            const total = docs.reduce((a, d) => a + Number(d.amount), 0);
            const isExpanded = expandedGroup === `supply-${supplier}`;
            return (
              <div key={supplier} className="bg-surface border border-border rounded-lg overflow-hidden border-r-2 border-r-green-500/50">
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : `supply-${supplier}`)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-background/50 transition-colors text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-[14px]">🥩</div>
                    <div>
                      <div className="text-[13px] font-bold text-foreground">{supplier}</div>
                      <div className="text-[10px] text-gray-light">{docs.length} فاتورة · من {fmtDate(docs[docs.length - 1].date)} إلى {fmtDate(docs[0].date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="text-[13px] font-bold text-primary">{Math.round(total).toLocaleString()} ر.س</div>
                      <div className="text-[9px] text-gray-light">{supplyTotal > 0 ? ((total / supplyTotal) * 100).toFixed(0) : 0}% من التموين</div>
                    </div>
                    <span className={`text-gray-light transition-transform text-[12px] ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    {docs.map((doc) => {
                      const tc = typeConfig[doc.doc_type || "other"] || typeConfig.other;
                      const hasImage = !!doc.image_url;
                      return (
                        <div key={doc.id}>
                          <div className="flex items-center justify-between px-4 py-2.5 hover:bg-background/30 border-b border-border/50 last:border-b-0">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center text-[12px] shrink-0">{tc.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-medium text-foreground truncate">{doc.notes || "—"}</div>
                                <div className="text-[9px] text-gray-light">{fmtDate(doc.date)} · {doc.month_label}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[12px] font-bold text-foreground">{Number(doc.amount).toLocaleString()} ر</span>
                              <StatusBadge variant={statusVariant(doc.status)} className="text-[8px]">{doc.status}</StatusBadge>
                              {(doc as any).source === "whatsapp" && (
                                <span className="text-[8px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md" title="من واتساب">📱 واتساب</span>
                              )}
                              {(doc as any).needs_review && (
                                <span className="text-[8px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md" title="يحتاج مراجعة">⚠️ مراجعة</span>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); setViewingInvoice(viewingInvoice === doc.id ? null : doc.id); }}
                                className={`text-[9px] px-2 py-1 rounded-md transition-colors ${
                                  hasImage
                                    ? "bg-green-500/15 text-green-700 hover:bg-green-500/25"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                }`}
                              >
                                {hasImage ? "📎 صورة" : "📤 رفع"}
                              </button>
                            </div>
                          </div>
                          {viewingInvoice === doc.id && (
                            <InvoiceImageViewer invoiceId={doc.id} imagePath={doc.image_url} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════ قالب فواتير الأصول ═══════════ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[18px]">🏗️</span>
          <div>
            <div className="text-[15px] font-bold text-foreground">فواتير الأصول والتأسيس</div>
            <div className="text-[10px] text-gray-light">{assetDocs.length} فاتورة · {assetGroups.length} حساب · إجمالي {Math.round(assetTotal).toLocaleString()} ر.س</div>
          </div>
        </div>

        <div className="space-y-2">
          {assetGroups.map(([account, docs]) => {
            const total = docs.reduce((a, d) => a + Number(d.amount), 0);
            const isExpanded = expandedGroup === `asset-${account}`;
            return (
              <div key={account} className="bg-surface border border-border rounded-lg overflow-hidden border-r-2 border-r-orange-500/50">
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : `asset-${account}`)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-background/50 transition-colors text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[14px]">🏗️</div>
                    <div>
                      <div className="text-[13px] font-bold text-foreground">{account}</div>
                      <div className="text-[10px] text-gray-light">{docs.length} عملية</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="text-[13px] font-bold text-primary">{Math.round(total).toLocaleString()} ر.س</div>
                    </div>
                    <span className={`text-gray-light transition-transform text-[12px] ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    {docs.map((doc) => {
                      const tc = typeConfig[doc.doc_type || "other"] || typeConfig.other;
                      const hasImage = !!doc.image_url;
                      return (
                        <div key={doc.id}>
                          <div className="flex items-center justify-between px-4 py-2.5 hover:bg-background/30 border-b border-border/50 last:border-b-0">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center text-[12px] shrink-0">{tc.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-medium text-foreground truncate">{doc.notes || "—"}</div>
                                <div className="text-[9px] text-gray-light">{fmtDate(doc.date)} · {doc.month_label}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <StatusBadge variant={tc.variant} className="text-[8px]">{tc.label}</StatusBadge>
                              <span className="text-[12px] font-bold text-foreground">{Number(doc.amount).toLocaleString()} ر</span>
                              <StatusBadge variant={statusVariant(doc.status)} className="text-[8px]">{doc.status}</StatusBadge>
                              {(doc as any).source === "whatsapp" && (
                                <span className="text-[8px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md" title="من واتساب">📱 واتساب</span>
                              )}
                              {(doc as any).needs_review && (
                                <span className="text-[8px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md" title="يحتاج مراجعة">⚠️ مراجعة</span>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); setViewingInvoice(viewingInvoice === doc.id ? null : doc.id); }}
                                className={`text-[9px] px-2 py-1 rounded-md transition-colors ${
                                  hasImage
                                    ? "bg-green-500/15 text-green-700 hover:bg-green-500/25"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                }`}
                              >
                                {hasImage ? "📎 صورة" : "📤 رفع"}
                              </button>
                            </div>
                          </div>
                          {viewingInvoice === doc.id && (
                            <InvoiceImageViewer invoiceId={doc.id} imagePath={doc.image_url} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Archive;
