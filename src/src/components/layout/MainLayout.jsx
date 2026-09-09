import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import ProfileMenu from "./ProfileMenu";

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "hsl(var(--dashboard-bg))" }}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main
          key={collapsed ? "c" : "e"}
          className="flex-1 overflow-y-auto animate-fade-in"
          style={{ backgroundColor: "hsl(var(--dashboard-bg))" }}
        >
          {/* Top row: hamburger (mobile/tablet only) on the left,
              profile capsule on the right. No header bar/border — this
              row shares the same dashboard-bg token as every page's
              content, so there's no seam above the content. */}
          <div className="flex items-center justify-between px-4 md:px-6 pt-4 pb-2 gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-card border border-border shadow-soft text-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 ease-smooth active:scale-95 focus-ring shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1" />
            <ProfileMenu />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
