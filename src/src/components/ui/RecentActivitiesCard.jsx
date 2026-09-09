import React from "react";
import {
  Activity,
  LogIn,
  LogOut,
  CalendarCheck,
  CalendarX,
  Receipt,
  UserPlus,
  Bell,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * Renders the `activityLog` array returned inline by GET /dashboard/stats
 * (data.activityLog: [{ user, action, time }]) — no separate endpoint
 * exists for this yet, so this reuses the same stats payload Index.jsx
 * already fetches rather than issuing an extra request.
 *
 * `action` strings observed from the API are free-text (e.g. "checked in"),
 * so icon/color selection below matches on keywords rather than exact
 * enum values, with a sensible generic fallback for anything unrecognized.
 *
 * Colors use solid hex values (not the low-opacity muted-foreground
 * token) so icons, dots, and timestamps stay crisp against the glass
 * panel background instead of washing out.
 */
const getActivityMeta = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("checked in") || a.includes("check-in"))
    return { icon: LogIn, color: "#16A34A", bg: "rgba(22, 163, 74, 0.14)" };
  if (a.includes("checked out") || a.includes("check-out"))
    return { icon: LogOut, color: "#0EA5E9", bg: "rgba(14, 165, 233, 0.14)" };
  if (a.includes("leave") && a.includes("approve"))
    return {
      icon: CalendarCheck,
      color: "#16A34A",
      bg: "rgba(22, 163, 74, 0.14)",
    };
  if (a.includes("leave") && (a.includes("reject") || a.includes("decline")))
    return { icon: CalendarX, color: "#EF4444", bg: "rgba(239, 68, 68, 0.14)" };
  if (a.includes("leave"))
    return {
      icon: CalendarCheck,
      color: "#8B5CF6",
      bg: "rgba(139, 92, 246, 0.14)",
    };
  if (a.includes("expense"))
    return { icon: Receipt, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.14)" };
  if (a.includes("added") || a.includes("created") || a.includes("joined"))
    return { icon: UserPlus, color: "#10B981", bg: "rgba(16, 185, 129, 0.14)" };
  return { icon: Bell, color: "#64748B", bg: "rgba(100, 116, 139, 0.14)" };
};

const safeRelativeTime = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
};

const RecentActivitiesCard = ({ activities = [], isLoading = false }) => {
  const list = Array.isArray(activities) ? activities : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/70">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-gray-900 text-sm">
            Recent Activities
          </h3>
        </div>
        {list.length > 0 && (
          <span className="bg-primary/15 text-primary-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
            {list.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-gray-200" />
                <div className="h-2.5 w-1/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center text-center py-6 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <Activity className="h-7 w-7 mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">
            No recent activity
          </p>
          <p className="text-xs mt-0.5 text-gray-500">
            Check-ins and updates will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {list.map((item, idx) => {
            const { icon: Icon, color, bg } = getActivityMeta(item.action);
            return (
              <div
                key={`${item.user}-${item.time}-${idx}`}
                className="flex items-start gap-3 border-b border-gray-200/70 last:border-b-0 pb-3 last:pb-0"
              >
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: bg, color }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 truncate leading-snug">
                    <span className="font-semibold">
                      {item.user || "Someone"}
                    </span>{" "}
                    <span className="text-gray-700 font-medium">
                      {item.action}
                    </span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-gray-500 font-medium">
                      {safeRelativeTime(item.time)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivitiesCard;
