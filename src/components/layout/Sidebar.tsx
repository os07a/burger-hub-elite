import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid, TrendingUp, Heart, Users, Calendar, Wallet,
  Video, ShoppingBag, Package, Truck, FolderPlus, BarChart3, Activity, LineChart, MessageCircle
} from "lucide-react";

const navGroups = [
  {
    label: "الرئيسية",
    items: [
      { id: "dashboard", label: "لوحة التحكم", icon: LayoutGrid, path: "/" },
      { id: "project-status", label: "حالة المشروع", icon: Activity, path: "/project-status" },
      { id: "sales-indicator", label: "مؤشر المبيعات", icon: LineChart, path: "/sales-indicator" },
      { id: "advisor", label: "المستشار الذكي", icon: MessageCircle, path: "/advisor" },
      { id: "behavior", label: "سلوك المستهلك", icon: TrendingUp, path: "/behavior" },
      { id: "loyalty", label: "الولاء", icon: Heart, path: "/loyalty" },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { id: "staff", label: "الطاقم", icon: Users, path: "/staff" },
      { id: "attendance", label: "الحضور والانصراف", icon: Calendar, path: "/attendance" },
      { id: "payroll", label: "الرواتب", icon: Wallet, path: "/payroll" },
      { id: "cameras", label: "كاميرات المراقبة", icon: Video, path: "/cameras" },
    ],
  },
  {
    label: "المشغّل",
    items: [
      { id: "products", label: "المنتجات", icon: ShoppingBag, path: "/products" },
      { id: "inventory", label: "المخزون", icon: Package, path: "/inventory" },
      { id: "suppliers", label: "الموردون", icon: Truck, path: "/suppliers" },
    ],
  },
  {
    label: "المالية",
    items: [
      { id: "archive", label: "الأرشيف", icon: FolderPlus, path: "/archive" },
      { id: "profits", label: "الأرباح والنسب", icon: BarChart3, path: "/profits" },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="w-[220px] bg-sidebar flex-shrink-0 sticky top-0 h-screen overflow-y-auto flex flex-col">
      <div className="p-4 pb-3 border-b border-sidebar-border mb-2">
        <div className="flex items-center gap-2">
          <div className="w-[9px] h-[9px] rounded-full bg-primary flex-shrink-0" />
          <div>
            <div className="text-[15px] font-bold text-primary-foreground">برجرهم</div>
            <div className="text-[9px] text-sidebar-foreground/40 tracking-wider uppercase">BURGERHUM OS</div>
          </div>
        </div>
      </div>

      {navGroups.map((group) => (
        <div key={group.label} className="px-2.5 pb-1">
          <div className="text-[9px] text-sidebar-foreground/40 uppercase tracking-wider px-2 pt-3 pb-1 font-semibold">
            {group.label}
          </div>
          {group.items.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2.5 px-2.5 py-2 cursor-pointer text-[13px] rounded-lg mb-px font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-active text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-primary-foreground/80"
                }`}
              >
                <Icon size={15} className={isActive ? "opacity-100" : "opacity-50"} />
                {item.label}
              </div>
            );
          })}
        </div>
      ))}

      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="text-[10px] text-sidebar-foreground/25 text-center">المدينة المنورة · 2026</div>
      </div>
    </div>
  );
};

export default Sidebar;
