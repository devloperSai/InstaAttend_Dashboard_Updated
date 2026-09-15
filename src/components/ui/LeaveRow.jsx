import React from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "./badge";
import { format } from "date-fns";

// Same badge palette used across the dashboard (Expense uses the same values)
export const LEAVE_STATUS_BADGE_STYLES = {
  Pending: "bg-orange-100 text-orange-800 border-orange-200",
  Approved: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
};

const TYPE_BADGE_STYLE =
  "bg-instattend-50 text-instattend-700 border-instattend-100";

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

export const safeFormatDate = (dateVal, formatStr = "dd MMM yyyy") => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, formatStr);
  } catch {
    return "N/A";
  }
};

// Mirrors ExpenseRow's column ratios exactly so Leave and Expense read
// as the same product, and so the header row lines up with the data
// rows at every breakpoint.
const COL_IDENTITY = "flex items-center gap-3 min-w-0 flex-[1.4]";
const COL_TYPE = "hidden sm:flex flex-1 justify-center min-w-0";
const COL_DATES = "hidden md:flex flex-1 justify-center";
const COL_DAYS = "flex-1 flex justify-center";
const COL_STATUS = "flex-1 flex justify-center";
const COL_CHEVRON = "w-5 shrink-0";

/**
 * Column-label header for the leave list — same purpose as
 * ExpenseRowHeader: without it the Type/Dates/Days/Status columns had
 * no visible anchor even though every row already shared one layout.
 */
export const LeaveRowHeader = () => (
  <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
    <div className={COL_IDENTITY}>Employee</div>
    <div className={COL_TYPE}>Type</div>
    <div className={COL_DATES}>Dates</div>
    <div className={COL_DAYS}>Days</div>
    <div className={COL_STATUS}>Status</div>
    <div className={COL_CHEVRON} aria-hidden="true" />
  </div>
);

/**
 * Single leave request rendered as a "profile row" — avatar, name/role/
 * department, leave type tag, date range, day count, and a status
 * badge, with a trailing chevron. Column classes are shared with
 * LeaveRowHeader above so columns line up with their labels.
 */
const LeaveRow = ({ leave, onClick }) => {
  const { employeeName, role, department, type, days, status } = leave;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left border-b last:border-b-0 border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-instattend-500 focus-visible:ring-offset-2"
    >
      {/* Avatar / Name / role / department */}
      <div className={COL_IDENTITY}>
        <div className="h-10 w-10 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center text-sm shrink-0">
          {getInitials(employeeName)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {employeeName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {role}
            {department && department !== "N/A" ? ` · ${department}` : ""}
          </p>
        </div>
      </div>

      {/* Leave type */}
      <div className={COL_TYPE}>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${TYPE_BADGE_STYLE}`}
        >
          {type}
        </span>
      </div>

      {/* Date range */}
      <div className={`${COL_DATES} text-sm text-gray-600 whitespace-nowrap`}>
        {safeFormatDate(leave.startDate)} – {safeFormatDate(leave.endDate)}
      </div>

      {/* Days */}
      <div
        className={`${COL_DAYS} text-sm font-bold text-gray-900 whitespace-nowrap`}
      >
        {days} {days === 1 ? "day" : "days"}
      </div>

      {/* Status */}
      <div className={COL_STATUS}>
        <Badge className={LEAVE_STATUS_BADGE_STYLES[status]}>{status}</Badge>
      </div>

      {/* Chevron */}
      <div className={`${COL_CHEVRON} flex justify-end`}>
        <ChevronRight className="h-5 w-5 text-instattend-500" />
      </div>
    </button>
  );
};

export default LeaveRow;
