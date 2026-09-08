import { useState } from "react";
import Sidebar from "./Sidebar";
import ProfileMenu from "./ProfileMenu";

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    // Was `bg-background` (a grayish token, hsl(210 20% 96%)). Every page's
    // own content painted itself with the mintier `--dashboard-bg` token
    // starting BELOW the profile-menu row, so the row itself showed the
    // gray `bg-background` underneath it — a visible gray strip at the
    // top of every page. Painting the whole shell (and the <main> below)
    // with `--dashboard-bg` removes that seam everywhere at once.
    <div
      className="flex h-screen"
      style={{ backgroundColor: "hsl(var(--dashboard-bg))" }}
    >
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main
          key={collapsed ? "c" : "e"}
          className="flex-1 overflow-y-auto animate-fade-in"
          style={{ backgroundColor: "hsl(var(--dashboard-bg))" }}
        >
          {/* No header bar — just the capsule, floating, no border/bg.
              This row now shares the same dashboard-bg token as every
              page's content, so there's no seam above the content. */}
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
