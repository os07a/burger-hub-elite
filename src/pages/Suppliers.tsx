import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import RiyalIcon from "@/components/ui/RiyalIcon";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ChevronDown, FileText } from "lucide-react";
import { useSuppliers, useDeleteSupplier, useDeleteInvoice, type Supplier } from "@/hooks/useSuppliers";
import { useAuth } from "@/contexts/AuthContext";
import SupplierFormDialog from "@/components/suppliers/SupplierFormDialog";
import InvoiceFormDialog from "@/components/suppliers/InvoiceFormDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const Suppliers = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const { data: suppliers = [], isLoading } = useSuppliers();
  const delSup = useDeleteSupplier();
  const delInv = useDeleteInvoice();

  const [supDialog, setSupDialog] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [invDialog, setInvDialog] = useState<{ open: boolean; supplierId: string }>({ open: false, supplierId: "" });
  const [confirmDelSup, setConfirmDelSup] = useState<Supplier | null>(null);
  const [confirmDelInv, setConfirmDelInv] = useState<{ id: string; number: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalSpend = suppliers.reduce(
    (s, sup) => s + sup.invoices.reduce((a, i) => a + Number(i.amount), 0),
    0
  );
  const totalInvoices = suppliers.reduce((s, sup) => s + sup.invoices.length, 0);
  const pending = suppliers.reduce(
    (s, sup) => s + sup.invoices.filter((i) => i.status === "معلقة").length,
    0
  );

  const handleAddSup = () => { setEditing(null); setSupDialog(true); };
  const handleEditSup = (s: Supplier) => { setEditing(s); setSupDialog(true); };
  const handleAddInv = (id: string) => setInvDialog({ open: true, supplierId: id });

  const handleDelSup = async () => {
    if (!confirmDelSup) return;
    try {
      await delSup.mutateAsync(confirmDelSup.id);
      toast.success("تم حذف المورد");
    } catch (e: any) { toast.error(e.message); }
    finally { setConfirmDelSup(null); }
  };
  const handleDelInv = async () => {
    if (!confirmDelInv) return;
    try {
      await delInv.mutateAsync(confirmDelInv.id);
      toast.success("تم حذف الفاتورة");
    } catch (e: any) { toast.error(e.message); }
    finally { setConfirmDelInv(null); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="الموردون والفواتير"
        subtitle="إدارة الموردين وسجل الفواتير"
        badge={`${suppliers.length} مورد`}
        actions={isAdmin ? <Button size="sm" onClick={handleAddSup}><Plus size={14} className="ml-1" /> إضافة مورد</Button> : undefined}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="🏢 الموردون" value={suppliers.length.toString()} sub={`${[...new Set(suppliers.map(s => s.category).filter(Boolean))].length} تصنيف`} />
        <MetricCard label="📄 الفواتير" value={totalInvoices.toString()} sub="إجمالي" />
        <MetricCard label="💰 إجمالي المصروف" value={totalSpend.toFixed(0)} sub="جميع الفواتير" showRiyal />
        <MetricCard label="⏳ معلقة" value={pending.toString()} sub="بانتظار السداد" subColor={pending > 0 ? "warning" : "success"} />
      </div>

      {isLoading && <div className="text-center text-muted-foreground py-8">جارٍ التحميل...</div>}

      {!isLoading && suppliers.length === 0 && (
        <div className="ios-card text-center py-12">
          <div className="text-[14px] text-muted-foreground mb-3">لا يوجد موردون بعد</div>
          {isAdmin && <Button onClick={handleAddSup}><Plus size={14} className="ml-1" /> أضف أول مورد</Button>}
        </div>
      )}

      <div className="space-y-3">
        {suppliers.map((sup) => {
          const isOpen = expanded === sup.id;
          const supTotal = sup.invoices.reduce((a, i) => a + Number(i.amount), 0);
          return (
            <div key={sup.id} className="ios-card !p-0 overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div
                  className="flex-1 cursor-pointer flex items-center gap-3"
                  onClick={() => setExpanded(isOpen ? null : sup.id)}
                >
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-foreground">{sup.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{sup.category ?? "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-left">
                    <div className="text-[10px] text-muted-foreground">إجمالي</div>
                    <div className="text-[13px] font-bold text-primary flex items-center gap-1 justify-end">
                      {supTotal.toFixed(0)} <RiyalIcon size={10} />
                    </div>
                  </div>
                  <StatusBadge variant="info">{sup.invoices.length} فاتورة</StatusBadge>
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditSup(sup)}>
                        <Pencil size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => setConfirmDelSup(sup)}>
                        <Trash2 size={13} />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-border px-5 py-4 bg-muted/10 animate-fade-in">
                  {(sup.contact_name || sup.phone || sup.email) && (
                    <div className="grid grid-cols-3 gap-3 mb-4 text-[11px]">
                      {sup.contact_name && <div><span className="text-muted-foreground">المسؤول: </span>{sup.contact_name}</div>}
                      {sup.phone && <div><span className="text-muted-foreground">الجوال: </span>{sup.phone}</div>}
                      {sup.payment_terms && <div><span className="text-muted-foreground">الدفع: </span>{sup.payment_terms}</div>}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[11px] font-semibold text-foreground flex items-center gap-2">
                      <FileText size={13} /> الفواتير ({sup.invoices.length})
                    </div>
                    {isAdmin && (
                      <Button size="sm" variant="outline" onClick={() => handleAddInv(sup.id)}>
                        <Plus size={12} className="ml-1" /> فاتورة
                      </Button>
                    )}
                  </div>

                  {sup.invoices.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground text-center py-4">لا توجد فواتير بعد</div>
                  ) : (
                    <div className="space-y-2">
                      {sup.invoices.sort((a, b) => b.date.localeCompare(a.date)).map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between gap-3 bg-background rounded-lg px-3 py-2 border border-border">
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-semibold">{inv.invoice_number || "—"}</div>
                            <div className="text-[10px] text-muted-foreground">{inv.date}</div>
                            {inv.notes && <div className="text-[10px] text-muted-foreground truncate mt-0.5">{inv.notes}</div>}
                          </div>
                          <StatusBadge variant={inv.status === "مدفوعة" ? "success" : inv.status === "معلقة" ? "warning" : "danger"}>
                            {inv.status}
                          </StatusBadge>
                          <div className="text-[13px] font-bold text-primary flex items-center gap-1">
                            {Number(inv.amount).toFixed(2)} <RiyalIcon size={9} />
                          </div>
                          {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-danger" onClick={() => setConfirmDelInv({ id: inv.id, number: inv.invoice_number || inv.date })}>
                              <Trash2 size={11} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SupplierFormDialog open={supDialog} onOpenChange={setSupDialog} supplier={editing} />
      <InvoiceFormDialog open={invDialog.open} onOpenChange={(o) => setInvDialog({ ...invDialog, open: o })} supplierId={invDialog.supplierId} />

      <AlertDialog open={!!confirmDelSup} onOpenChange={(o) => !o && setConfirmDelSup(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المورد؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف "{confirmDelSup?.name}" وجميع فواتيره نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelSup} className="bg-danger hover:bg-danger/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmDelInv} onOpenChange={(o) => !o && setConfirmDelInv(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الفاتورة؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف الفاتورة "{confirmDelInv?.number}" نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelInv} className="bg-danger hover:bg-danger/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Suppliers;
