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
import { statusColors, hexToRgba, colors } from "../lib/theme.js";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const [calendarData, setCalendarData] = useState(null); // raw API payload for the visible month
  const [isLoading, setIsLoading] = useState(false);

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

  // Simple month snapshot from the live payload
  const monthSnapshot = useMemo(() => {
    if (!calendarData?.records?.length) return null;
    const totalPresent = calendarData.records.reduce(
      (sum, r) => sum + (r.presentCount || 0),
      0,
    );
    const totalAbsent = calendarData.records.reduce(
      (sum, r) => sum + (r.absentCount || 0),
      0,
    );
    const avgPresent = Math.round(totalPresent / calendarData.records.length);
    return {
      totalEmployees: calendarData.totalEmployees ?? 0,
      avgPresent,
      totalAbsent,
    };
  }, [calendarData]);

  // Snapshot tile config — colors pulled from the shared theme so this
  // matches the dashboard's status palette instead of one-off hex values.
  const snapshotTiles = monthSnapshot
    ? [
        {
          key: "total",
          label: "Total Employees",
          value: monthSnapshot.totalEmployees,
          icon: Users,
          color: colors.primary.DEFAULT,
        },
        {
          key: "present",
          label: "Avg. Present / Day",
          value: monthSnapshot.avgPresent,
          icon: UserCheck,
          color: statusColors.present,
        },
        {
          key: "absent",
          label: "Total Absences (Month)",
          value: monthSnapshot.totalAbsent,
          icon: UserX,
          color: statusColors.absent,
        },
      ]
    : [];

  return (
    <MainLayout>
      {/* Flat white page background — cards/components carry all the
          color, matching how Index.jsx keeps its background separate
          from the glass/surface cards on top of it. */}
      <div className="-m-6 min-h-[calc(100vh-4rem)] bg-white p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Calendar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sundays, national holidays and live attendance at a glance
            </p>
          </div>
        </div>

        {/* Live month snapshot from the admin attendance-calendar API */}
        {snapshotTiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {snapshotTiles.map((tile) => (
              <div
                key={tile.key}
                className="rounded-xl border border-border bg-white p-4 flex items-center gap-3 shadow-soft transition-all duration-300 ease-smooth hover:-translate-y-0.5"
              >
                <div
                  className="p-2.5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: hexToRgba(tile.color, 0.14),
                    color: tile.color,
                  }}
                >
                  <tile.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {tile.label}
                  </p>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    {tile.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main calendar */}
          <div className="lg:col-span-2 space-y-4">
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
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white rounded-lg border border-border px-4 py-3 shadow-soft">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-muted border border-border" />
                <span className="text-xs text-muted-foreground">Sunday</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: colors.primary.DEFAULT }}
                />
                <span className="text-xs text-muted-foreground">
                  National Holiday
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: statusColors.late }}
                />
                <span className="text-xs text-muted-foreground">
                  Optional Holiday
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-semibold">
                  {format(new Date(), "d")}
                </span>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: statusColors.present }}
                >
                  42P
                </span>
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: statusColors.absent }}
                >
                  6A
                </span>
                <span className="text-xs text-muted-foreground">
                  Present / Absent (live)
                </span>
              </div>
            </div>

            {/* Selected date detail */}
            {selectedDate && (
              <div className="bg-white rounded-lg border border-border px-4 py-3 shadow-soft">
                <p className="text-sm font-semibold text-foreground">
                  {format(selectedDate, "EEEE, dd MMMM yyyy")}
                </p>
                {selectedHoliday ? (
                  <p className="text-sm text-primary mt-1">
                    {selectedHoliday.name}
                  </p>
                ) : selectedDate.getDay() === 0 ? (
                  <p className="text-sm text-muted-foreground mt-1">Sunday</p>
                ) : selectedStats ? (
                  <p className="text-sm text-muted-foreground mt-1">
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
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    No attendance data for this day
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Upcoming holidays panel */}
          <div>
            <Card className="border border-border shadow-soft bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <PartyPopper className="h-4 w-4 text-primary" />
                  Upcoming Holidays
                </CardTitle>
                <CardDescription>Next holidays from today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingHolidays.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No upcoming holidays found</p>
                  </div>
                ) : (
                  upcomingHolidays.map((h) => (
                    <div
                      key={h.date}
                      className="flex items-center justify-between gap-3 border-b border-border last:border-b-0 pb-3 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {h.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(h.date), "EEEE, dd MMM yyyy")}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                        style={
                          h.type === "optional"
                            ? {
                                backgroundColor: hexToRgba(
                                  statusColors.late,
                                  0.15,
                                ),
                                color: statusColors.late,
                              }
                            : {
                                backgroundColor: hexToRgba(
                                  colors.primary.DEFAULT,
                                  0.12,
                                ),
                                color: colors.primary.dark,
                              }
                        }
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
      </div>
    </MainLayout>
  );
};

export default Calendar;