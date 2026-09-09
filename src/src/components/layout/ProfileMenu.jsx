import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, ChevronDown } from "lucide-react";
import { authService } from "../../api/services/auth.service";
import { toast } from "sonner";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const userInitial = currentUser?.username
    ? currentUser.username.charAt(0).toUpperCase()
    : "U";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="relative z-[60]" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-card border border-border shadow-soft hover:shadow-raised hover:border-primary/30 transition-all duration-300 ease-smooth active:scale-[0.97] focus-ring"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="h-8 w-8 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center text-sm shrink-0">
          {userInitial}
        </span>
        <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
          {currentUser?.username || "Admin User"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ease-smooth ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-border bg-card shadow-raised overflow-hidden animate-scale-in origin-top-right z-[70]"
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">
              {currentUser?.username || "Admin User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser?.email || ""}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {currentUser?.designation?.designation_name || "Administrator"}
            </p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <User className="h-4 w-4" />
            Profile
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
