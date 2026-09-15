import { useEffect, useState, useCallback } from "react";
import {
  endOfMonth,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns";
import MainLayout from "../components/layout/MainLayout";
import { dashboardService } from "../api/services/dashboard.service.js";
import { authService } from "../api/services/auth.service";
import { chartTooltipStyle, statusColors, hexToRgba } from "../lib/theme.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DashboardSkeleton } from "../components/skeleton/DashboardSkeleton.jsx";
import MiniCalendar from "../components/ui/MiniCalendar.jsx";
import CircularStat from "../components/ui/CircularStat.jsx";
import RecentActivitiesCard from "../components/ui/RecentActivitiesCard.jsx";

const parsePercent = (value) => {
  if (value === undefined || value === null) return 0;
  const n = parseFloat(String(value).replace("%", "").trim());
  return isNaN(n) ? 0 : n;
};

const formatToday = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const attendanceDateKey = (date) => String(date).slice(0, 10);

const Index = () => {
  const [stat, setStat] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceMap, setAttendanceMap] = useState(new Map());
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceMonth, setAttendanceMonth] = useState(new Date());

  const fetchStats = useCallback(async () => {
    try {
      const data = await dashboardService.getStats();

      const dailyStats = data.dailyStats || [];
      const todayStats = dailyStats[dailyStats.length - 1] || {};

      const totalEmployees = data.totalEmployees || 0;
      const halfDayToday = todayStats.halfDay ?? todayStats.half_day ?? 0;
      const absentToday = todayStats.absent ?? 0;

      setStat({
        totalEmployees,
        presentToday: data.presentToday || 0,
        onLeave: data.onLeave || 0,
        avgWorkingHours: data.avgWorkingHours || 0,
        presentPercentage: parsePercent(data.presentPercentage),
        leavePercentage: parsePercent(data.leavePercentage),
        workingHoursChange: data.workingHoursChange || "",
        halfDayToday,
        absentToday,
        halfDayPercentage:
          totalEmployees > 0
            ? Math.round((halfDayToday / totalEmployees) * 100)
            : 0,
        absentPercentage:
          totalEmployees > 0
            ? Math.round((absentToday / totalEmployees) * 100)
            : 0,
      });
      setAttendanceData(dailyStats);
      setActivities(Array.isArray(data.activityLog) ? data.activityLog : []);
    } catch (error) {
      console.error("Error fetching stats", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const fetchAttendanceCalendar = useCallback(async (monthAnchor) => {
    try {
      const data = await dashboardService.getAttendanceCalendar(
        "custom",
        format(startOfMonth(monthAnchor), "yyyy-MM-dd"),
        format(endOfMonth(monthAnchor), "yyyy-MM-dd"),
      );
      const nextMap = new Map();
      (data?.records || []).forEach((record) => {
        nextMap.set(attendanceDateKey(record.date), {
          presentCount: record.presentCount ?? 0,
          absentCount: record.absentCount ?? 0,
          halfDayCount: record.halfDayCount ?? 0,
          leaveCount: record.leaveCount ?? 0,
        });
      });
      setAttendanceMap(nextMap);
    } catch (error) {
      console.error("Error fetching dashboard attendance calendar", error);
      setAttendanceMap(new Map());
    }
  }, []);

  useEffect(() => {
    fetchAttendanceCalendar(attendanceMonth);
  }, [attendanceMonth, fetchAttendanceCalendar]);

  const currentUser = authService.getCurrentUser();
  const username = currentUser ? currentUser.username : "User";
  const todayFormatted = formatToday();

  const activeDate = selectedDate || startOfDay(new Date());
  const activeDateKey = format(activeDate, "yyyy-MM-dd");
  const activeIsToday = isSameDay(activeDate, new Date());
  const activeStats = activeIsToday ? null : attendanceMap.get(activeDateKey);
  const hasSelectedDateData = Boolean(activeStats);
  const activeDateLabel = activeIsToday
    ? "Today"
    : format(activeDate, "MMMM d, yyyy");
  const selectedAttendance = [
    {
      percentage: hasSelectedDateData
        ? Math.round(
            (activeStats.presentCount / (stat.totalEmployees || 1)) * 100,
          )
        : 0,
      color: statusColors.present,
      label: "Present",
      value: hasSelectedDateData ? activeStats.presentCount : "No data",
    },
    {
      percentage: hasSelectedDateData
        ? Math.round(
            (activeStats.halfDayCount / (stat.totalEmployees || 1)) * 100,
          )
        : 0,
      color: statusColors.halfDay,
      label: "Half Day",
      value: hasSelectedDateData ? activeStats.halfDayCount : "No data",
    },
    {
      percentage: hasSelectedDateData
        ? Math.round(
            (activeStats.absentCount / (stat.totalEmployees || 1)) * 100,
          )
        : 0,
      color: statusColors.absent,
      label: "Absent",
      value: hasSelectedDateData ? activeStats.absentCount : "No data",
    },
    {
      percentage: hasSelectedDateData
        ? Math.round(
            (activeStats.leaveCount / (stat.totalEmployees || 1)) * 100,
          )
        : 0,
      color: statusColors.leave,
      label: "On Leave",
      value: hasSelectedDateData ? activeStats.leaveCount : "No data",
    },
  ];

  return (
    <MainLayout>
      {isLoading ? (
        <div className="p-4 md:p-6">
          <DashboardSkeleton />
        </div>
      ) : (
        <div
          className="min-h-[calc(100vh-4.5rem)] p-4 md:p-6"
          style={{ backgroundColor: "hsl(var(--dashboard-bg))" }}
        >
          <div className="grid min-w-0 grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
            {/* ---- Main column ---- */}
            <div className="min-w-0 space-y-4 md:space-y-5 lg:col-span-2">
              <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:items-center md:text-left gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                    Dashboard
                  </h1>
                  <p className="text-text-muted">
                    Welcome back, {username} — your attendance overview, all in
                    one place
                  </p>
                </div>
              </div>

              {/* Today's Attendance Status */}
              <Card className="glass-panel border border-white/60">
                <CardHeader className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/50 pb-4">
                  <div>
                    <CardTitle className="text-base md:text-lg font-semibold text-text-primary/90">
                      {activeDateLabel} Attendance Status
                    </CardTitle>
                    <CardDescription className="text-text-muted mt-0.5">
                      {activeIsToday
                        ? `${todayFormatted} (today's data will be reflected at end of the day)`
                        : activeDateLabel}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-text-muted px-3 py-1.5 rounded-full border border-white/60 bg-white/30">
                    <span className="font-semibold text-text-primary tabular-nums">
                      {stat.totalEmployees}
                    </span>{" "}
                    total employees
                  </div>
                </CardHeader>
                <CardContent className="relative pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 justify-items-center">
                    {selectedAttendance.map((s) => (
                      <div
                        key={s.label}
                        className="flex w-full justify-center p-3 rounded-xl border shadow-sm transition-all duration-300 ease-smooth hover:-translate-y-0.5"
                        style={{
                          backgroundColor: hexToRgba(s.color, 0.14),
                          borderColor: hexToRgba(s.color, 0.45),
                        }}
                      >
                        <CircularStat
                          percentage={s.percentage}
                          color={s.color}
                          label={s.label}
                          value={s.value}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Trends */}
              <Card className="glass-panel border border-white/60">
                <CardHeader className="relative border-b border-white/50 pb-4">
                  <CardTitle className="text-base md:text-lg font-semibold text-text-primary/90">
                    Weekly Trends
                  </CardTitle>
                  <CardDescription className="text-text-muted">
                    Last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative pt-4">
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={attendanceData}
                        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                        barGap={4}
                        barCategoryGap="30%"
                      >
                        <defs>
                          <linearGradient
                            id="presentGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={statusColors.present}
                              stopOpacity={0.95}
                            />
                            <stop
                              offset="100%"
                              stopColor={statusColors.present}
                              stopOpacity={0.55}
                            />
                          </linearGradient>
                          <linearGradient
                            id="absentGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={statusColors.absent}
                              stopOpacity={0.95}
                            />
                            <stop
                              offset="100%"
                              stopColor={statusColors.absent}
                              stopOpacity={0.55}
                            />
                          </linearGradient>
                          <linearGradient
                            id="lateGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={statusColors.late}
                              stopOpacity={0.95}
                            />
                            <stop
                              offset="100%"
                              stopColor={statusColors.late}
                              stopOpacity={0.55}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          tick={{
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                          axisLine={false}
                          tickLine={false}
                          width={36}
                        />
                        <Tooltip
                          cursor={{ fill: "hsl(160 84% 39% / 0.06)" }}
                          contentStyle={chartTooltipStyle}
                          labelStyle={{
                            color: "hsl(var(--muted-foreground))",
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                          itemStyle={{ fontSize: 12, fontWeight: 500 }}
                        />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          height={32}
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "hsl(var(--muted-foreground))",
                          }}
                        />
                        <Bar
                          dataKey="present"
                          fill="url(#presentGradient)"
                          name="Present"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={26}
                          isAnimationActive
                          animationDuration={700}
                          animationEasing="ease-out"
                        />
                        <Bar
                          dataKey="absent"
                          fill="url(#absentGradient)"
                          name="Absent"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={26}
                          isAnimationActive
                          animationDuration={700}
                          animationEasing="ease-out"
                          animationBegin={80}
                        />
                        <Bar
                          dataKey="late"
                          fill="url(#lateGradient)"
                          name="Late"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={26}
                          isAnimationActive
                          animationDuration={700}
                          animationEasing="ease-out"
                          animationBegin={160}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ---- Right rail ---- */}
            <div className="space-y-4 md:space-y-5">
              <Card className="glass-panel border border-white/60 p-5">
                <div className="relative flex items-center gap-2 mb-4 pb-3 border-b border-white/50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <span className="text-sm font-semibold text-text-primary">
                    Calendar
                  </span>
                </div>
                <MiniCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onMonthChange={setAttendanceMonth}
                />
              </Card>

              <Card className="glass-panel border border-white/60 p-5">
                <RecentActivitiesCard
                  activities={activities}
                  isLoading={isLoading}
                />
              </Card>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Index;
