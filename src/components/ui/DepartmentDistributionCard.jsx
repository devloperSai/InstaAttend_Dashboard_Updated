import React, { useEffect, useState, useCallback } from "react";
import { Building2, Loader2 } from "lucide-react";
import { employeeService } from "../../api/services/employee.service.js";
import { departmentService } from "../../api/services/department.service.js";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

const BAR_COLORS = [
  "#10B981",
  "#16A34A",
  "#0EA5E9",
  "#F59E0B",
  "#DC2626",
  "#8B5CF6",
];

/**
 * The mockup shows a "Global Workforce" panel broken down by region
 * (North America / Europe / Asia Pacific / Remote). Our API has no
 * geography field on employees, so rather than fabricate region data
 * this pulls the real department + employee data and shows an actual
 * headcount breakdown instead.
 */
const DepartmentDistributionCard = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [employees, departments] = await Promise.all([
        employeeService.getAll(),
        departmentService.getDepartments(),
      ]);

      const empList = Array.isArray(employees) ? employees : [];
      const deptList = Array.isArray(departments) ? departments : [];
      const total = empList.length;

      const counts = {};
      empList.forEach((emp) => {
        const name =
          emp.department?.department_name ||
          deptList.find((d) => d.id === emp.department_id)?.department_name ||
          "Unassigned";
        counts[name] = (counts[name] || 0) + 1;
      });

      const computed = Object.entries(counts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setRows(computed);
    } catch (e) {
      console.error("Failed to load department distribution", e);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <Building2 className="h-4 w-4 text-instattend-500" />
        <CardTitle className="text-base">Department Breakdown</CardTitle>
        {isLoading && (
          <Loader2 className="h-3.5 w-3.5 text-instattend-400 animate-spin ml-1" />
        )}
      </CardHeader>
      <CardContent>
        {!isLoading && rows.length === 0 ? (
          <p className="text-sm text-gray-400">No department data available</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row, idx) => (
              <div key={row.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{row.name}</span>
                  <span className="font-semibold text-gray-800">
                    {row.percentage}%{" "}
                    <span className="text-gray-400 font-normal">
                      ({row.count})
                    </span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${row.percentage}%`,
                      backgroundColor: BAR_COLORS[idx % BAR_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentDistributionCard;
