import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  Users,
  UserCheck,
  Calendar,
  CalendarDays,
  Receipt,
  Clock,
  Settings,
  GridIcon,
  X,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { authService } from "../../api/services/auth.service.js";

// Sidebar renders in two modes:
//  - Desktop (lg and up): part of the normal flex flow, width animates
//    between w-20 (collapsed) and w-64 (expanded) via the existing toggle.
//  - Mobile / tablet (below lg): off-canvas drawer, fixed to the viewport,
//    slides in/out with translate-x and sits above a dim backdrop. Always
//    renders "expanded" width while open since there's no reason to
//    collapse a drawer that closes completely anyway.
const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const itemRefs = useRef({});
  const [indicatorTop, setIndicatorTop] = useState(null);

  const navItems = [
    { name: "Dashboard", icon: GridIcon, path: "/" },
    { name: "Employees", icon: Users, path: "/employees" },
    // Sits directly under Employees — new-employee enrollment requests
    // are a sub-workflow of employee management (admin approves/rejects
    // self-registrations before they get system access).
    { name: "Approve Requests", icon: UserCheck, path: "/approve-requests" },
    { name: "Attendance", icon: Clock, path: "/attendance" },
    { name: "Expense", icon: Receipt, path: "/expense" },
    { name: "Leave", icon: Calendar, path: "/leave" },
    { name: "Calendar", icon: CalendarDays, path: "/calendar" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  // On mobile the drawer is always visually "expanded"; collapsing only
  // applies to the desktop rail.
  const effectiveCollapsed = collapsed;

  useEffect(() => {
    const activeItem = navItems.find((item) => item.path === location.pathname);
    const el = activeItem ? itemRefs.current[activeItem.path] : null;
    if (el) {
      setIndicatorTop(el.offsetTop + el.offsetHeight / 2 - 12);
    } else {
      setIndicatorTop(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, collapsed, mobileOpen]);

  // Close the mobile drawer on route change so navigating always returns
  // the user to the page instead of leaving the drawer open over it.
  useEffect(() => {
    onMobileClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const currentUser = authService.getCurrentUser();
  const designationName = currentUser?.designation?.designation_name;
  const roleInitial = designationName
    ? designationName
        .split(" ")
        .map((word) => word[0]?.toUpperCase())
        .join("")
    : "U";

  return (
    <>
      {/* Backdrop — mobile only, shown while the drawer is open */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-fade-in"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex shrink-0 flex-col overflow-hidden border-r border-border bg-card shadow-soft",
          // Mobile: fixed off-canvas drawer, full width up to 18rem/80vw,
          // slides in from the left.
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] h-full",
          "transition-transform duration-300 ease-smooth",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: back into normal flow, width driven by `collapsed`,
          // always visible (no translate).
          "lg:static lg:z-auto lg:h-screen lg:max-w-none lg:translate-x-0",
          "lg:transition-[width] lg:duration-500 lg:ease-smooth",
          effectiveCollapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        <div className="relative p-4 border-b border-border flex items-center justify-between">
          {(!effectiveCollapsed || mobileOpen) && (
            <div className="flex items-center animate-fade-in">
              <span className="text-2xl font-bold text-gradient-primary">
                Insta Attend
              </span>
            </div>
          )}
          {effectiveCollapsed && !mobileOpen && (
            <div className="hidden lg:flex items-center mx-auto animate-scale-in">
              <span className="text-2xl font-bold text-gradient-primary">
                IA
              </span>
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            aria-label="Close menu"
            className="lg:hidden text-muted-foreground hover:text-primary rounded-md p-1 transition-all duration-300 ease-smooth hover:bg-primary/10 active:scale-90 focus-ring"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Desktop collapse/expand button */}
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:block text-muted-foreground hover:text-primary rounded-md p-1 transition-all duration-300 ease-smooth hover:bg-primary/10 active:scale-90 focus-ring"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={cn(
                "h-6 w-6 transition-transform duration-500 ease-smooth",
                collapsed && "rotate-180",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <nav className="relative flex-1 pt-6 overflow-y-auto">
          <ul className="relative stagger-children">
            <span
              className="absolute left-4 w-1 rounded-r-full bg-gradient-primary transition-[top,opacity] duration-350 ease-spring pointer-events-none"
              style={{
                top: indicatorTop ?? 0,
                height: 24,
                opacity: indicatorTop === null ? 0 : 1,
              }}
            />
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <li
                  key={item.name}
                  className="mb-2 px-4"
                  ref={(el) => {
                    itemRefs.current[item.path] = el;
                  }}
                >
                  <Link
                    to={item.path}
                    title={
                      effectiveCollapsed && !mobileOpen ? item.name : undefined
                    }
                    className={cn(
                      "group relative flex items-center px-4 py-3 rounded-lg overflow-hidden",
                      "text-muted-foreground font-medium transition-all duration-300 ease-smooth",
                      "hover:bg-primary/10 hover:text-primary hover:translate-x-1",
                      active &&
                        "bg-primary/10 text-primary font-semibold shadow-glow",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-300 ease-spring",
                        "group-hover:scale-110",
                        active && "scale-110",
                      )}
                    />
                    {(!effectiveCollapsed || mobileOpen) && (
                      <span className="ml-4 whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative p-4 border-t border-border">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold transition-transform duration-300 ease-spring hover:scale-110 shrink-0">
              {roleInitial}
            </div>
            {(!effectiveCollapsed || mobileOpen) && currentUser && (
              <div className="ml-3 animate-fade-in min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {currentUser.username}
                </p>
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {currentUser.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
