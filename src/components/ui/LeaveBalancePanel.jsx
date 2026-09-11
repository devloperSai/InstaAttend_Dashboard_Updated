import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";
import { Users } from "lucide-react";
import { getInitials } from "./LeaveRow";

/**
 * Side panel listing each employee's Total/Used/Remaining leave balance,
 * visible directly on the dashboard (not just inside the request modal).
 * `employees` is deduped from the leave list in Leave.jsx — one entry
 * per employee, each carrying { total, used, remaining }.
 */
const LeaveBalancePanel = ({ employees = [] }) => {
  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-instattend-500" />
          <CardTitle className="text-base">Leave Balances</CardTitle>
        </div>
        <CardDescription>Total / Used / Remaining per employee</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {employees.length === 0 ? (
          <p className="text-sm text-gray-400">No employee data available</p>
        ) : (
          employees.map((emp) => {
            const { total, used, remaining } = emp.leaveBalance;
            const pct =
              total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
            return (
              <div key={emp.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-7 w-7 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center text-[11px] shrink-0">
                    {getInitials(emp.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {emp.name}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {remaining}/{total} left
                  </p>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-instattend-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveBalancePanel;
