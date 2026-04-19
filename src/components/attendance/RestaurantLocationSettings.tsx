import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getCurrentPosition } from "@/lib/geo";
import { useRestaurantSettings, useUpdateRestaurantLocation } from "@/hooks/useRestaurantSettings";

const RestaurantLocationSettings = () => {
  const { data: settings } = useRestaurantSettings();
  const update = useUpdateRestaurantLocation();
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState<string>(settings?.radius_meters?.toString() || "200");

  useEffect(() => {
    if (settings?.radius_meters != null) setRadius(String(settings.radius_meters));
  }, [settings?.radius_meters]);

  const captureLocation = async () => {
    setLoading(true);
    try {
      const pos = await getCurrentPosition();
      await update.mutateAsync({
        id: settings?.id,
        latitude: pos.latitude,
        longitude: pos.longitude,
        radius_meters: parseInt(radius) || 200,
      });
      toast.success(`تم حفظ موقع المحل (دقة ${Math.round(pos.accuracy)} م)`);
    } catch (err: any) {
      toast.error(err.message || "تعذّر التقاط الموقع");
    } finally {
      setLoading(false);
    }
  };

  const saveRadius = async () => {
    if (!settings?.latitude || !settings?.longitude) {
      toast.error("اضبط موقع المحل أولاً");
      return;
    }
    await update.mutateAsync({
      id: settings.id,
      latitude: settings.latitude,
      longitude: settings.longitude,
      radius_meters: parseInt(radius) || 200,
    });
    toast.success("تم تحديث نصف القطر");
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 border-r-[3px] border-r-info">
      <div className="text-[9px] font-semibold text-gray-light uppercase tracking-wider mb-3">
        📍 إعدادات موقع المحل
      </div>
      <div className="grid md:grid-cols-3 gap-3 items-end">
        <div className="space-y-1.5">
          <Label className="text-[11px]">خط العرض</Label>
          <Input value={settings?.latitude?.toString() || "غير مضبوط"} disabled dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px]">خط الطول</Label>
          <Input value={settings?.longitude?.toString() || "غير مضبوط"} disabled dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px]">نصف القطر (متر)</Label>
          <div className="flex gap-2">
            <Input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} />
            <Button type="button" variant="outline" onClick={saveRadius}>حفظ</Button>
          </div>
        </div>
      </div>
      <Button onClick={captureLocation} disabled={loading} className="mt-3 gap-2">
        {loading ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
        التقط موقع المحل من جهازك الآن
      </Button>
      <p className="text-[10px] text-muted-foreground mt-2">
        💡 افتح هذه الصفحة من جهاز موجود داخل المحل، ثم اضغط الزر أعلاه. اضبطها مرة واحدة فقط.
      </p>
    </div>
  );
};

export default RestaurantLocationSettings;
