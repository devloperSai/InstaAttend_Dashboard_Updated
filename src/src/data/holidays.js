// src/data/holidays.js
//
// Generic static list of national holidays. Dates are in "yyyy-MM-dd" format.
// This is intentionally kept as a plain array so it's easy to:
//   1) edit by hand for now, or
//   2) later replace with a fetch to a `/holidays` API without touching
//      any component that consumes `getHolidays()`.
//
// type: "national" | "optional" — used for badge coloring in the calendar.

const HOLIDAYS = [
  // 2025
  { date: "2025-01-01", name: "New Year's Day", type: "national" },
  { date: "2025-01-26", name: "Republic Day", type: "national" },
  { date: "2025-03-14", name: "Holi", type: "national" },
  { date: "2025-03-31", name: "Eid-ul-Fitr", type: "optional" },
  { date: "2025-08-15", name: "Independence Day", type: "national" },
  { date: "2025-08-27", name: "Ganesh Chaturthi", type: "optional" },
  { date: "2025-10-02", name: "Gandhi Jayanti", type: "national" },
  { date: "2025-10-21", name: "Diwali", type: "national" },
  { date: "2025-12-25", name: "Christmas Day", type: "national" },

  // 2026
  { date: "2026-01-01", name: "New Year's Day", type: "national" },
  { date: "2026-01-26", name: "Republic Day", type: "national" },
  { date: "2026-03-04", name: "Holi", type: "national" },
  { date: "2026-08-15", name: "Independence Day", type: "national" },
  { date: "2026-10-02", name: "Gandhi Jayanti", type: "national" },
  { date: "2026-11-08", name: "Diwali", type: "national" },
  { date: "2026-12-25", name: "Christmas Day", type: "national" },
];

/**
 * Returns the full static holiday list.
 * Swap the implementation later to call an API, e.g.:
 *   export const getHolidays = () => holidayService.getAll();
 * and every consumer (CalendarView, Calendar page) keeps working unchanged.
 * @returns {Array<{date: string, name: string, type: string}>}
 */
export const getHolidays = () => HOLIDAYS;

export default HOLIDAYS;
