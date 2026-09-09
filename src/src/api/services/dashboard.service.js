import { dashboardRepository } from "../repositories/dashboard.repository.js";
import { toast } from "../../components/ui/sonner.jsx";
import { authService } from "./auth.service.js";

export const dashboardService = {
  /**
   * Retrieve dashboard summary statistics.
   * @returns {Promise<Object>} Object containing summary metrics, daily stats, and hours stats.
   * @throws {Error} If retrieval fails.
   */
  getStats: async () => {
    try {
      const response = await dashboardRepository.getStats();
      return response.data.data;
    } catch (error) {
      toast.error("Error, Failed to fetch dashboard stats.");
      throw error;
    }
  },

  /**
   * Retrieve the per-date attendance calendar for a date range.
   *
   * The new /attendance/calendar endpoint requires the requesting user's
   * id as a query param, so this pulls it automatically from the current
   * logged-in session (authService.getCurrentUser().id) unless an
   * explicit userId is passed in. Existing callers that only pass
   * (filter, startDate, endDate) keep working unchanged — admins get the
   * company-wide overview back automatically since the backend resolves
   * that from the id.
   * @param {string} [filter="this_month"] - "this_month" | "last_15_days" | "last_30_days" | "custom"
   * @param {string} [startDate] - yyyy-MM-dd, required when filter === "custom"
   * @param {string} [endDate] - yyyy-MM-dd, required when filter === "custom"
   * @param {string} [userId] - Optional override; defaults to the current logged-in user's id.
   * @returns {Promise<Object>} { filter, startDate, endDate, totalEmployees, records: [{ date, presentCount, absentCount, halfDayCount }] }
   * @throws {Error} If retrieval fails.
   */
  getAttendanceCalendar: async (
    filter = "this_month",
    startDate,
    endDate,
    userId,
  ) => {
    try {
      const currentUser = authService.getCurrentUser();
      const resolvedUserId = userId || currentUser?.id;

      if (!resolvedUserId) {
        throw new Error(
          "No user id available to request the attendance calendar.",
        );
      }

      const response = await dashboardRepository.getAttendanceCalendar(
        resolvedUserId,
        filter,
        startDate,
        endDate,
      );
      return response.data.data;
    } catch (error) {
      toast.error("Error, Failed to fetch attendance calendar.");
      throw error;
    }
  },
};
