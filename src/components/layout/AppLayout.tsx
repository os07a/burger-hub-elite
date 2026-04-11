import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-7 max-w-[calc(100vw-220px)] overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
