import React from "react";
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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { statusColors } from "../../lib/theme.js";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// One class set per day "variant" — computed once per cell below and
// looked up here, instead of a long chain of conditional classNames.
// Priority (checked top to bottom when computing the variant):
//   today > selected > national holiday > optional holiday > sunday
//   > already-passed day > upcoming day
const DAY_VARIANT_CLASSES = {
  // Frosted mint glass, matching the sidebar's active-item treatment —
  // light enough that the green "Present" count stays readable on top
  // of it, instead of the old solid dark-green fill that swallowed it.
  today:
    "bg-primary/10 backdrop-blur-md border border-primary/25 text-primary shadow-[0_4px_14px_-6px_hsl(var(--primary)/0.5)] hover:bg-primary/15",
  selected: "bg-white border-2 border-primary text-primary hover:bg-primary/5",
  nationalHoliday:
    "bg-red-50 border-2 border-red-400 text-red-600 hover:bg-red-100",
  optionalHoliday:
    "bg-amber-50 border-2 border-amber-400 text-amber-600 hover:bg-amber-100",
  // Sundays get their own muted-blue tone so they read as "day off"
  // at a glance, distinct from both holidays and ordinary past days.
  sunday:
    "bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200",
  // Days already gone: faded almost to the background, so the eye
  // naturally reads "these are done" and lands on what's left.
  past: "bg-gray-50 text-gray-300 hover:bg-gray-100",
  // Days still to come: crisp white with a visible border, so they
  // stand out as "not yet happened" against the faded past days.
  future:
    "bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
};

/**
 * Full-size month-view calendar wired to live attendance data.
 *
 * The card owns an explicit height sized with `clamp(min, vh, max)` —
 * not a flat `h-full` and not a flat pixel value either. A flat
 * pixel height (e.g. `h-[640px]`) looks right on the window you
 * tested it in, then overflows on any shorter browser window,
 * pushing the last rows and anything below the card off-screen. A
 * percentage height (`h-full`) has the opposite problem: it only
 * resolves if every ancestor up the tree has a real height, which a
 * plain block/grid parent usually doesn't, so it collapses to
 * near-zero until some unrelated state change forces a reflow.
 * Sizing off the viewport height instead means the card always fits
 * the actual window, with no dependency on siblings, parent layout,
 * or interaction. Internally, rows are still `flex-1` so that height
 * is divided evenly across the weeks, which is what makes the day
 * cells read as tall, near-square tiles instead of short, wide bars.
 *
 * Pass `className` to override the height from the parent if a
 * specific page layout calls for it (e.g. `className="h-[70vh]"`).
 *
 * Each day cell is colour-coded so the month reads at a glance:
 * today (solid brand fill), national/optional holidays (red/amber),
 * Sundays (muted slate), already-passed days (faded gray, so it's
 * obvious how far into the month you are), and upcoming days (crisp
 * white). Any day with live attendance data — from `attendanceMap`,
 * for past dates and today — also shows a small Present/Absent count
 * under the date number, in the same colours as the page's legend.
 *
 * @param {Date} currentMonth - any date within the month currently displayed
 * @param {(date: Date) => void} onMonthChange - called with the new anchor date on prev/next
 * @param {Array<{date: string, name: string, type: string}>} holidays - holiday list (date as yyyy-MM-dd)
 * @param {Map<string, {presentCount:number, absentCount:number, halfDayCount:number}>} attendanceMap
 *        - per-date live attendance counts, keyed by yyyy-MM-dd
 * @param {boolean} isLoading - true while attendance data for the visible month is being fetched
 * @param {Date|null} selectedDate - currently selected day, for highlighting
 * @param {(date: Date) => void} onSelectDate - called when a day cell is clicked
 * @param {string} [className] - optional height override, e.g. "h-[70vh]"
 */
const CalendarView = ({
  currentMonth,
  onMonthChange,
  holidays = [],
  attendanceMap,
  isLoading = false,
  selectedDate,
  onSelectDate,
  className,
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const holidayMap = React.useMemo(() => {
    const map = new Map();
    holidays.forEach((h) => map.set(h.date, h));
    return map;
  }, [holidays]);

  const days = [];
  let day = gridStart;
  while (day <= gridEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const goToPrevMonth = () => onMonthChange(subMonths(currentMonth, 1));
  const goToNextMonth = () => onMonthChange(addMonths(currentMonth, 1));

  return (
    <div className={cn("relative", className || "h-[clamp(420px,62vh,660px)]")}>
      {/* Soft brand-tinted glow peeking from behind the white card's
          rounded corners */}
      <div className="absolute -inset-1.5 rounded-[24px] bg-gradient-to-br from-primary/20 via-primary/8 to-transparent blur-md -z-10" />

      <div className="relative h-full flex flex-col bg-white rounded-2xl shadow-[0_16px_36px_-22px_hsl(var(--primary)/0.45)] p-4 sm:p-6">
        {/* Header: prev/next arrows sit directly against the month/year
            label as one centered cluster, instead of being pinned to the
            far left/right edges of the card. */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 shrink-0">
          <button
            onClick={goToPrevMonth}
            aria-label="Previous month"
            className="text-gray-300 hover:text-gray-500 transition-colors p-1.5 rounded-md hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 min-w-[9rem] sm:min-w-[11rem] justify-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            {isLoading && (
              <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
            )}
          </div>
          <button
            onClick={goToNextMonth}
            aria-label="Next month"
            className="text-gray-300 hover:text-gray-500 transition-colors p-1.5 rounded-md hover:bg-gray-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 mb-2 shrink-0">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-gray-400"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Weeks grid — flex-1 so the whole stack of rows fills the
            remaining card height; each row is itself flex-1, so a
            5-week month gets taller rows than a 6-week month rather
            than leaving a gap at the bottom. */}
        <div className="flex-1 min-h-0 flex flex-col gap-1.5 sm:gap-2">
          {weeks.map((week, wIdx) => (
            <div
              key={wIdx}
              className="flex-1 min-h-0 grid grid-cols-7 gap-1.5 sm:gap-2"
            >
              {week.map((d) => {
                const dateKey = format(d, "yyyy-MM-dd");
                const holiday = holidayMap.get(dateKey);
                const inMonth = isSameMonth(d, currentMonth);
                const isToday = isSameDay(d, new Date());
                const selected = selectedDate && isSameDay(d, selectedDate);
                const isSunday = d.getDay() === 0;
                const isPast = isBefore(d, startOfDay(new Date()));
                const stats = attendanceMap?.get(dateKey);

                // Days outside the current month render as empty space,
                // but still occupy their cell so the grid stays aligned
                if (!inMonth) {
                  return <div key={dateKey} className="h-full w-full" />;
                }

                let variant;
                if (isToday) variant = "today";
                else if (selected) variant = "selected";
                else if (holiday?.type === "optional")
                  variant = "optionalHoliday";
                else if (holiday) variant = "nationalHoliday";
                else if (isSunday) variant = "sunday";
                else if (isPast) variant = "past";
                else variant = "future";

                // Attendance is only meaningful for days that have
                // already happened (including today) — future dates
                // have no records yet, so nothing renders for them.
                const showAttendance = (isPast || isToday) && stats;

                return (
                  <button
                    key={dateKey}
                    onClick={() => onSelectDate?.(d)}
                    title={holiday ? holiday.name : undefined}
                    className={cn(
                      "h-full w-full rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ease-smooth",
                      DAY_VARIANT_CLASSES[variant],
                    )}
                  >
                    <span className="text-sm sm:text-base font-semibold leading-none">
                      {format(d, "d")}
                    </span>
                    {showAttendance && (
                      <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold leading-none bg-white/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                        <span style={{ color: statusColors.present }}>
                          {stats.presentCount}P
                        </span>
                        <span style={{ color: statusColors.absent }}>
                          {stats.absentCount}A
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
