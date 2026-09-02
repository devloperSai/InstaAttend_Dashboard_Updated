import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { dashboardService } from "../../api/services/dashboard.service.js";
import { cn } from "../../lib/utils";

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/**
 * Compact month calendar for the dashboard's top-right rail.
 *
 * Renders as plain content inside the parent's glass-panel Card (no
 * background of its own) so it inherits the dashboard's theme instead of
 * nesting a flat box inside a glass box. Text weight/contrast bumped
 * (font-bold header, font-semibold weekday labels, solid foreground for
 * date numbers) since thin text on a translucent surface is what read as
 * "blurry" — combined with the global font-smoothing fix in theme.css,
 * this renders crisp on standard-DPI displays.
 *
 * Header ("September 2026") and the "Today" jump-button were further
 * tightened for legibility: larger, heavier type with a touch of
 * letter-spacing on the month/year label so it reads as a proper title
 * rather than a caption, and a solid pill treatment on "Today" so it
 * reads as a distinct, tappable control rather than plain text.
 *
 * Wired to GET /dashboard/attendance-calendar (via dashboardService).
 */
const MiniCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const today = startOfDay(new Date());

  const fetchMonth = useCallback(async (monthAnchor) => {
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
      console.error("Failed to fetch mini calendar data", e);
      setCalendarData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonth(currentMonth);
  }, [currentMonth, fetchMonth]);

  const attendanceMap = useMemo(() => {
    const map = new Map();
    (calendarData?.records || []).forEach((r) => {
      map.set(r.date, r);
    });
    return map;
  }, [calendarData]);

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = gridStart;
    while (day <= gridEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    const w = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    return w;
  }, [currentMonth]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          {/* Month/year title — bumped from text-xs/font-extrabold to
              text-sm/font-bold with tracking-wider so it reads as a
              heading rather than a small caption label. */}
          <span className="text-sm font-bold tracking-wider text-primary uppercase">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          {isLoading && (
            <Loader2 className="h-3 w-3 text-primary animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1 rounded border border-transparent hover:border-border hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Previous month"
            type="button"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {/* "Today" — given a solid pill treatment (soft filled
              background + border) instead of transparent text, with
              larger/bolder type so it reads as a real button rather than
              a stray word next to the arrows. */}
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-2 py-1 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold uppercase tracking-wide text-primary hover:bg-primary/20 hover:border-primary/50 transition-colors"
            type="button"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-1 rounded border border-transparent hover:border-border hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Next month"
            type="button"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 pb-1.5 mb-1.5 border-b border-border/60 text-center">
        {WEEKDAY_LABELS.map((d) => (
          <span
            key={d}
            className="text-[10px] font-bold text-muted-foreground"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {weeks.flat().map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const inMonth = isSameMonth(d, currentMonth);
          const isToday = isSameDay(d, today);
          const hasData = attendanceMap.has(key);
          return (
            <div key={key} className="flex flex-col items-center py-0.5">
              <span
                className={cn(
                  "flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-medium border border-transparent transition-all duration-300 ease-smooth",
                  !inMonth && "text-muted-foreground/50",
                  inMonth && !isToday && "text-foreground hover:border-border",
                  isToday &&
                    "bg-primary text-primary-foreground font-bold shadow-[0_0_10px_hsl(var(--primary)/0.55)]",
                )}
              >
                {format(d, "d")}
              </span>
              <span
                className={cn(
                  "h-1 w-1 rounded-full mt-0.5",
                  hasData ? "bg-primary" : "bg-transparent",
                )}
              />
            </div>
          );
        })}
      </div>

      {!isLoading && !calendarData?.records?.length && (
        <p className="text-[11px] font-medium text-muted-foreground mt-3 pt-3 border-t border-border/60 text-center">
          No attendance records for this month yet
        </p>
      )}
    </div>
  );
};

export default MiniCalendar;