import { apiClient } from "../apiClient.js";
import { apiUrl } from "../apiUrl.js";

export const dashboardRepository = {
  /**
   * Fetch dashboard summary statistics from the server.
   * @returns {Promise<Object>} Axios Response containing the summary statistics.
   */
  getStats: async () => {
    return apiClient.get(apiUrl.dashboard.getStats);
  },

  /**
   * Fetch the per-date attendance calendar. Now lives under
   * /attendance/calendar (moved from /dashboard/attendance-calendar) and
   * REQUIRES the requesting user's id in the query string — the backend
   * uses it to decide whether to return the single-employee calendar or,
   * for admins, the company-wide overview.
   * @param {string} userId - Requesting (logged-in) user's id. Required.
   * @param {string} [filter="this_month"] - "this_month" | "last_15_days" | "last_30_days" | "custom"
   * @param {string} [startDate] - yyyy-MM-dd, required when filter === "custom"
   * @param {string} [endDate] - yyyy-MM-dd, required when filter === "custom"
   * @returns {Promise<Object>} Axios Response containing { filter, startDate, endDate, totalEmployees, records[] }.
   */
  getAttendanceCalendar: async (
    userId,
    filter = "this_month",
    startDate,
    endDate,
  ) => {
    return apiClient.get(
      apiUrl.attendance.getCalendar(filter, userId, startDate, endDate),
    );
  },
};
