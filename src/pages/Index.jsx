import { useEffect, useState, useCallback } from "react";
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
import NotificationsCard from "../components/ui/NotificationsCard.jsx";

// dashboard.service.js returns presentPercentage/leavePercentage as
// display-ready strings (e.g. "90.3%"). We need the raw number to drive
// the CircularStat conic-gradient rings, so this strips it back out.
const parsePercent = (value) => {
  if (value === undefined || value === null) return 0;
  const n = parseFloat(String(value).replace("%", "").trim());
  return isNaN(n) ? 0 : n;
};

const Index = () => {
  const [stat, setStat] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await dashboardService.getStats();

      const dailyStats = data.dailyStats || [];
      const todayStats = dailyStats[dailyStats.length - 1] || {};

      const totalEmployees = data.totalEmployees || 0;
      // "Half Day" replaces the old "Late" summary tile. The daily-stats
      // payload doesn't guarantee a halfDay/half_day field yet, so this
      // falls back to 0 instead of fabricating a number.
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
    } catch (error) {
      console.error("Error fetching stats", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const currentUser = authService.getCurrentUser();
  const username = currentUser ? currentUser.username : "User";

  return (
    <MainLayout>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div
          className="-m-6 min-h-[calc(100vh-4rem)] p-4 md:p-6"
          style={{ backgroundColor: "hsl(var(--dashboard-bg))" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* ---- Main column ---- */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:items-center md:text-left gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                    Dashboard
                  </h1>
                  <p className="text-text-muted">
                    Your attendance overview, all in one place
                  </p>
                </div>
              </div>

              {/* Today's Attendance Status */}
              <Card className="glass-panel border border-white/60">
                <CardHeader className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/50 pb-4">
                  <div>
                    <CardTitle className="text-base md:text-lg font-semibold text-text-primary/90">
                      Today's Attendance Status
                    </CardTitle>
                    
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
                    {[
                      {
                        percentage: stat.presentPercentage,
                        color: statusColors.present,
                        label: "Present",
                        value: stat.presentToday,
                      },
                      {
                        percentage: stat.halfDayPercentage,
                        color: statusColors.halfDay,
                        label: "Half Day",
                        value: stat.halfDayToday,
                      },
                      {
                        percentage: stat.absentPercentage,
                        color: statusColors.absent,
                        label: "Absent",
                        value: stat.absentToday,
                      },
                      {
                        percentage: stat.leavePercentage,
                        color: statusColors.leave,
                        label: "On Leave",
                        value: stat.onLeave,
                      },
                    ].map((s) => (
                      // Status-tinted tile — original single-div structure
                      // kept intact (border + inline bg/border color), just
                      // with brighter opacity values (0.08→0.14, 0.25→0.45)
                      // so the color-coding reads clearly against the light
                      // mint dashboard background.
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

              {/* Weekly Trends — redesigned for a cleaner, more premium look:
                  gradient-filled bars instead of flat color, no nested
                  translucent boxes, borderless axes, and a compact
                  top-right legend (standard SaaS-dashboard convention). */}
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

            {/* ---- Right rail: today pill + live calendar + notifications ---- */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex justify-center lg:justify-end">
                {/* Removed backdrop-blur-sm here — this pill sits directly
                    on the dashboard background (not inside a glass-panel),
                    so the extra blur layer was only adding to the text
                    softness. A slightly higher solid opacity keeps the
                    frosted look without sacrificing text crispness. */}
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/75 text-primary border border-white/90 shadow-sm">
                  <span className="text-sm font-medium">
                    Today:{" "}
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

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
                <MiniCalendar />
              </Card>

              <Card className="glass-panel border border-white/60 p-5">
                <NotificationsCard />
              </Card>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Index;