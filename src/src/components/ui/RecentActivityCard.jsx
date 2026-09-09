import React, { useEffect, useState, useCallback } from "react";
import { Activity, Loader2 } from "lucide-react";
import { attendanceService } from "../../api/services/attendance.service.js";
import { format } from "date-fns";

const STATUS_DOT = {
  Present: "bg-green-500",
  Late: "bg-orange-400",
  Absent: "bg-red-500",
  "Half Day": "bg-blue-400",
};

/**
 * The mockup's "Onboarding Pipeline" panel has no backing endpoint, so
 * rather than ship a static mock, this shows a real, live feed built
 * from GET /attendance — the most recent check-ins, newest first. If
 * there's genuinely no attendance data yet, it shows an honest empty
 * state instead of placeholder rows.
 */
const RecentActivityCard = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await attendanceService.getAll();
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list]
        .filter((r) => r.check_in_time || r.date)
        .sort(
          (a, b) =>
            new Date(b.check_in_time || b.date) -
            new Date(a.check_in_time || a.date),
        )
        .slice(0, 5);
      setRows(sorted);
    } catch (e) {
      console.error("Failed to load recent attendance activity", e);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-instattend-500" />
        <h3 className="font-semibold text-gray-800 text-sm">Recent Activity</h3>
        {isLoading && (
          <Loader2 className="h-3.5 w-3.5 text-instattend-400 animate-spin ml-1" />
        )}
      </div>

      {!isLoading && rows.length === 0 ? (
        <p className="text-sm text-gray-400">No recent activity found</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, idx) => (
            <div
              key={r.id || idx}
              className="flex items-center justify-between gap-3 border-b border-gray-50 last:border-b-0 pb-3 last:pb-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    STATUS_DOT[r.status] || "bg-gray-300"
                  }`}
                />
                <span className="text-sm text-gray-700 truncate">
                  {r.employee_name || "Unknown"}
                </span>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {r.check_in_time
                  ? format(new Date(r.check_in_time), "dd MMM, HH:mm")
                  : r.date
                    ? format(new Date(r.date), "dd MMM")
                    : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivityCard;
