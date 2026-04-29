import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutGrid, TrendingUp, Heart, Users, Calendar, Wallet,
  Video, ShoppingBag, Package, Truck, FolderPlus, BarChart3, Activity, LineChart, MessageCircle, Bike, MessageSquare, Share2, ChefHat
} from "lucide-react";

const navGroups = [
  {
    label: "الرئيسية",
    items: [
      { id: "command-center", label: "مركز القيادة", icon: LayoutGrid, path: "/" },
      { id: "behavior", label: "سلوك المستهلك", icon: TrendingUp, path: "/behavior" },
      { id: "loyalty", label: "الولاء", icon: Heart, path: "/loyalty" },
      { id: "messages", label: "الرسائل النصية", icon: MessageSquare, path: "/messages" },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { id: "staff", label: "الطاقم", icon: Users, path: "/staff" },
      { id: "cameras", label: "كاميرات المراقبة", icon: Video, path: "/cameras" },
    ],
  },
  {
    label: "المشغّل",
    items: [
      { id: "products", label: "المنتجات", icon: ShoppingBag, path: "/products" },
      { id: "menu-analysis", label: "تحليل المنيو", icon: ChefHat, path: "/menu-analysis" },
      { id: "inventory", label: "المخزون", icon: Package, path: "/inventory" },
      { id: "suppliers", label: "الموردون", icon: Truck, path: "/suppliers" },
      { id: "delivery-apps", label: "تطبيقات التوصيل", icon: Bike, path: "/delivery-apps" },
      { id: "social-media", label: "التواصل الاجتماعي", icon: Share2, path: "/social-media" },
    ],
  },
  {
    label: "المالية",
    items: [
      { id: "profits", label: "الأرباح والنسب", icon: BarChart3, path: "/profits" },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, userRole } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <div className="w-[230px] bg-sidebar flex-shrink-0 sticky top-0 h-screen overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-[10px] h-[10px] rounded-full bg-primary flex-shrink-0" />
          <div>
            <div className="text-[16px] font-semibold text-primary-foreground tracking-tight">برجرهم</div>
            <div className="text-[9px] text-sidebar-foreground/35 tracking-[0.15em] uppercase mt-0.5">BURGERHUM OS</div>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 py-3 px-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="text-[9px] text-sidebar-foreground/35 uppercase tracking-[0.12em] px-3 pb-2 font-medium">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-3 px-3 py-[9px] cursor-pointer text-[13px] rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-sidebar-active text-primary-foreground font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-primary-foreground/80 font-normal"
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "opacity-100" : "opacity-45"} />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer with Dark Mode Toggle */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-sidebar-hover text-sidebar-foreground hover:text-primary-foreground/80 transition-all duration-200 text-[12px]"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          {isDark ? "الوضع الفاتح" : "الوضع الداكن"}
        </button>
        <button
          onClick={async () => { await signOut(); navigate("/login"); }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-danger-bg text-danger hover:opacity-80 transition-all duration-200 text-[12px]"
        >
          <LogOut size={14} />
          تسجيل الخروج
        </button>
        {userRole && (
          <div className="text-[10px] text-sidebar-foreground/40 text-center">
            {userRole === "admin" ? "👑 مدير" : "👤 موظف"}
          </div>
        )}
        <div className="text-[10px] text-sidebar-foreground/20 text-center tracking-wide">المدينة المنورة · 2026</div>
      </div>
    </div>
  );
};

export default Sidebar;
