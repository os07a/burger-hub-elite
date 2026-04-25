import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import FloatingAdvisor from "@/components/FloatingAdvisor";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen" dir="rtl">
      <Sidebar />
      <main className="flex-1 p-8 max-w-[calc(100vw-230px)] overflow-x-hidden">
        <Outlet />
      </main>
      <FloatingAdvisor />
    </div>
  );
};

export default AppLayout;
