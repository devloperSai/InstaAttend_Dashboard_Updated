import { useState } from "react";
import Sidebar from "./Sidebar";
import ProfileMenu from "./ProfileMenu";

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main
          key={collapsed ? "c" : "e"}
          className="flex-1 overflow-y-auto animate-fade-in"
        >
          {/* No header bar — just the capsule, floating, no border/bg */}
          <div className="flex justify-end px-4 md:px-6 pt-4 pb-2">
            <ProfileMenu />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
