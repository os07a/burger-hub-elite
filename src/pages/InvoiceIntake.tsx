import CameraCaptureCard from "@/components/invoice-intake/CameraCaptureCard";
import ZatcaQrScannerCard from "@/components/invoice-intake/ZatcaQrScannerCard";
import UploadInvoiceCard from "@/components/invoice-intake/UploadInvoiceCard";
import RecentIntakeList from "@/components/invoice-intake/RecentIntakeList";

const InvoiceIntake = () => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ZatcaQrScannerCard />
        <CameraCaptureCard />
        <UploadInvoiceCard />
      </div>
      <RecentIntakeList />
    </div>
  );
};

export default InvoiceIntake;