import React, { useMemo, useState } from "react";
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
  isBefore,
  startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// Same variant set as the main CalendarView, minus holidays (this widget
// isn't handed a holiday list) and minus "selected" (it's a glanceable
// display, not an interactive picker). Sized down for the sidebar card.
const DAY_VARIANT_CLASSES = {
  // Frosted mint glass, matching the sidebar's active-item treatment —
  // light enough to stay legible, instead of a solid dark-green fill.
  today:
    "bg-primary/10 backdrop-blur-md border border-primary/25 text-primary font-bold shadow-[0_2px_10px_-4px_hsl(var(--primary)/0.5)]",
  // Sundays get their own muted-blue tone so they read as "day off" at
  // a glance, distinct from ordinary past days.
  sunday: "bg-slate-100 text-slate-500",
  // Days already gone: faded almost to the background, so the eye
  // naturally reads "these are done" and lands on what's left.
  past: "text-muted-foreground/40",
  // Days still to come: normal foreground, no fill — this is a compact
  // widget, so "future" stays plain rather than fully bordered like the
  // full calendar's tiles.
  future: "text-foreground",
};

/**
 * Compact month calendar for the dashboard's top-right rail.
 *
 * Purely visual — no API call and no per-day attendance data. It only
 * needs today's date to compute which tile is "today," which days are
 * Sundays, and which have already passed, all client-side.
 *
 * Renders as plain content inside the parent's glass-panel Card (no
 * background of its own) so it inherits the dashboard's theme.
 */
const MiniCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfDay(new Date());

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
        <span className="text-sm font-bold tracking-wider text-primary uppercase">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1 rounded border border-transparent hover:border-border hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Previous month"
            type="button"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
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
          <span key={d} className="text-[10px] font-bold text-muted-foreground">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const inMonth = isSameMonth(d, currentMonth);
          const isToday = isSameDay(d, today);
          const isSunday = d.getDay() === 0;
          const isPast = isBefore(d, today);

          if (!inMonth) {
            return <div key={key} className="aspect-square" />;
          }

          let variant;
          if (isToday) variant = "today";
          else if (isSunday) variant = "sunday";
          else if (isPast) variant = "past";
          else variant = "future";

          return (
            <div key={key} className="flex items-center justify-center">
              <span
                className={cn(
                  "flex items-center justify-center aspect-square w-full rounded-lg text-[11px] font-medium transition-colors duration-200 ease-smooth",
                  DAY_VARIANT_CLASSES[variant],
                )}
              >
                {format(d, "d")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
