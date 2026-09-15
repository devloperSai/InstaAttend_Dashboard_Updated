import React, { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import CalendarView from "../components/ui/CalendarView";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  CalendarDays,
  PartyPopper,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  format,
  isSameDay,
  isAfter,
  startOfDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { getHolidays } from "../data/holidays";
import { dashboardService } from "../api/services/dashboard.service.js";
import { statusColors, hexToRgba } from "../lib/theme.js";
import CalendarSkeleton from "../components/skeleton/CalendarSkeleton.jsx";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const [calendarData, setCalendarData] = useState(null); // raw API payload for the visible month
  const [isLoading, setIsLoading] = useState(false);
  // Only true until the very first fetch resolves — later month navigation
  // reuses the lightweight inline spinner inside CalendarView instead of
  // swapping the whole page out to a skeleton.
  const [initialLoading, setInitialLoading] = useState(true);

  const holidays = useMemo(() => getHolidays(), []);

  // Sort ascending by date once, reused for the upcoming list.
  const sortedHolidays = useMemo(
    () => [...holidays].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [holidays],
  );

  const upcomingHolidays = useMemo(() => {
    const today = startOfDay(new Date());
    return sortedHolidays
      .filter(
        (h) =>
          isAfter(new Date(h.date), today) ||
          isSameDay(new Date(h.date), today),
      )
      .slice(0, 6);
  }, [sortedHolidays]);

  const selectedHoliday = useMemo(() => {
    if (!selectedDate) return null;
    const key = format(selectedDate, "yyyy-MM-dd");
    return holidays.find((h) => h.date === key) || null;
  }, [selectedDate, holidays]);

  // Fetch live per-date attendance counts from the admin dashboard API
  // whenever the visible month changes.
  const fetchAttendanceCalendar = useCallback(async (monthAnchor) => {
    setIsLoading(true);
    try {
      const startDate = format(startOfMonth(monthAnchor), "yyyy-MM-dd");
      const endDate = format(endOfMonth(monthAnchor), "yyyy-MM-dd");
      const data = await dashboardService.getAttendanceCalendar(
        "custom",
        startDate,
        endDate,
      );
      setCalendarData(data);
    } catch (e) {
      console.error("Failed to fetch attendance calendar", e);
      setCalendarData(null);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceCalendar(currentMonth);
  }, [currentMonth, fetchAttendanceCalendar]);

  const attendanceMap = useMemo(() => {
    const map = new Map();
    (calendarData?.records || []).forEach((r) => {
      map.set(r.date, {
        presentCount: r.presentCount ?? 0,
        absentCount: r.absentCount ?? 0,
        halfDayCount: r.halfDayCount ?? 0,
      });
    });
    return map;
  }, [calendarData]);

  const selectedStats = useMemo(() => {
    if (!selectedDate) return null;
    const key = format(selectedDate, "yyyy-MM-dd");
    return attendanceMap.get(key) || null;
  }, [selectedDate, attendanceMap]);

  // The day the stat cards reflect: whatever's selected on the calendar,
  // defaulting to today when nothing is picked yet. This is what makes the
  // cards "day-wise" — they read straight from attendanceMap (already
  // fetched per-date from the attendance-calendar API) keyed by this date.
  const activeDate = selectedDate || new Date();
  const activeDateKey = format(activeDate, "yyyy-MM-dd");
  const activeIsToday = isSameDay(activeDate, new Date());
  const activeStats = attendanceMap.get(activeDateKey) || null;
  const activeDayLabel = activeIsToday ? "Today" : format(activeDate, "d MMM");

  return (
    <MainLayout>
      <div
        className="min-h-[calc(100vh-4rem)] min-w-0 overflow-x-hidden p-4 md:p-6"
        style={{ backgroundColor: "hsl(var(--dashboard-bg))" }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Calendar
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Sundays, national holidays and live attendance at a glance
            </p>
          </div>
        </div>

        {initialLoading ? (
          <CalendarSkeleton />
        ) : (
          <>
            {/* Live day-wise snapshot — reflects whichever date is selected on
            the calendar below, defaulting to today. */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="glass-panel border border-white/60">
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-full text-white flex-shrink-0"
                    style={{ backgroundColor: statusColors.holiday }}
                  >
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Employees</p>
                    <p className="text-lg font-bold text-gray-800">
                      {calendarData?.totalEmployees ?? 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="glass-panel border"
                style={{ borderColor: hexToRgba(statusColors.present, 0.35) }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-full text-white flex-shrink-0"
                    style={{ backgroundColor: statusColors.present }}
                  >
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Present {activeDayLabel}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {activeStats ? activeStats.presentCount : 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="glass-panel border"
                style={{ borderColor: hexToRgba(statusColors.absent, 0.35) }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-full text-white flex-shrink-0"
                    style={{ backgroundColor: statusColors.absent }}
                  >
                    <UserX className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Absent {activeDayLabel}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {activeStats ? activeStats.absentCount : 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main calendar */}
              <div className="min-w-0 space-y-4 lg:col-span-2">
                <CalendarView
                  currentMonth={currentMonth}
                  onMonthChange={setCurrentMonth}
                  holidays={holidays}
                  attendanceMap={attendanceMap}
                  isLoading={isLoading}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 glass-panel border border-white/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-200 border border-gray-300" />
                    <span className="text-xs text-gray-600">Sunday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-instattend-500" />
                    <span className="text-xs text-gray-600">
                      National Holiday
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs text-gray-600">
                      Optional Holiday
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-instattend-500 flex items-center justify-center text-[10px] text-white font-semibold">
                      {format(new Date(), "d")}
                    </span>
                    <span className="text-xs text-gray-600">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: statusColors.present }}
                    >
                      P
                    </span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: statusColors.absent }}
                    >
                      A
                    </span>
                    <span className="text-xs text-gray-600">
                      Present / Absent (live)
                    </span>
                  </div>
                </div>

                {/* Selected date detail */}
                {selectedDate && (
                  <div className="glass-panel border border-white/60 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">
                      {format(selectedDate, "EEEE, dd MMMM yyyy")}
                    </p>
                    {selectedHoliday ? (
                      <p className="text-sm text-instattend-600 mt-1">
                        {selectedHoliday.name}
                      </p>
                    ) : selectedDate.getDay() === 0 ? (
                      <p className="text-sm text-gray-500 mt-1">Sunday</p>
                    ) : selectedStats ? (
                      <p className="text-sm text-gray-600 mt-1">
                        <span
                          className="font-medium"
                          style={{ color: statusColors.present }}
                        >
                          {selectedStats.presentCount} Present
                        </span>
                        {"  ·  "}
                        <span
                          className="font-medium"
                          style={{ color: statusColors.absent }}
                        >
                          {selectedStats.absentCount} Absent
                        </span>
                        {selectedStats.halfDayCount > 0 && (
                          <>
                            {"  ·  "}
                            <span
                              className="font-medium"
                              style={{ color: statusColors.late }}
                            >
                              {selectedStats.halfDayCount} Half-day
                            </span>
                          </>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1">
                        No attendance data for this day
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Upcoming holidays panel */}
              <div>
                <Card className="glass-panel border border-white/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <PartyPopper className="h-4 w-4 text-instattend-500" />
                      Upcoming Holidays
                    </CardTitle>
                    <CardDescription>Next holidays from today</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingHolidays.length === 0 ? (
                      <div className="flex flex-col items-center text-center py-8 text-gray-400">
                        <CalendarDays className="h-8 w-8 mb-2" />
                        <p className="text-sm">No upcoming holidays found</p>
                      </div>
                    ) : (
                      upcomingHolidays.map((h) => (
                        <div
                          key={h.date}
                          className="flex items-center justify-between gap-3 border-b border-white/50 last:border-b-0 pb-3 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {h.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(h.date), "EEEE, dd MMM yyyy")}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                              h.type === "optional"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-instattend-100 text-instattend-700"
                            }`}
                          >
                            {h.type === "optional" ? "Optional" : "National"}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Calendar;
