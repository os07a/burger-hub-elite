import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import FloatingAdvisor from "@/components/FloatingAdvisor";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-7 max-w-[calc(100vw-220px)] overflow-x-hidden">
        <Outlet />
      </main>
      <FloatingAdvisor />
    </div>
  );
};

export default AppLayout;
