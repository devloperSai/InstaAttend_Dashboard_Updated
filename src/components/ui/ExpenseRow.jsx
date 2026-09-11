import React from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "./badge";

// Same status badge styles used everywhere else in Expense.jsx
export const STATUS_BADGE_STYLES = {
  Pending: "bg-orange-100 text-orange-800 border-orange-200",
  Approved: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
};

const CATEGORY_BADGE_STYLE =
  "bg-instattend-50 text-instattend-700 border-instattend-100";

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

export const formatExpenseDate = (dateVal) => {
  if (!dateVal) return "N/A";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Shared column layout so the header row and every data row line up
// pixel-for-pixel. Keep these ratios identical between ExpenseRowHeader
// and ExpenseRow — that's what actually guarantees alignment, not the
// visual content inside each cell.
const COL_IDENTITY = "flex items-center gap-3 min-w-0 flex-[1.4]";
const COL_CATEGORY = "hidden sm:flex flex-1 justify-center min-w-0";
const COL_DATE = "hidden md:flex flex-1 justify-center";
const COL_AMOUNT = "flex-1 flex justify-center";
const COL_STATUS = "flex-1 flex justify-center";
const COL_CHEVRON = "w-5 shrink-0";

/**
 * Column-label header for the expense list. Renders once above the rows
 * so users can see what each column means — without this, the row's
 * category/date/amount/status columns had no anchor and read as
 * misaligned even though every row used the same layout.
 */
export const ExpenseRowHeader = () => (
  <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
    <div className={COL_IDENTITY}>Employee</div>
    <div className={COL_CATEGORY}>Category</div>
    <div className={COL_DATE}>Date</div>
    <div className={COL_AMOUNT}>Amount</div>
    <div className={COL_STATUS}>Status</div>
    <div className={COL_CHEVRON} aria-hidden="true" />
  </div>
);

/**
 * Single expense row rendered in a "profile row" style instead of a
 * table row — avatar, name/role/department, category tag, date,
 * amount, status badge, and a trailing chevron indicating the row
 * opens a detail modal on click.
 *
 * Column classes are shared with ExpenseRowHeader above so every
 * column lines up with its label at every breakpoint.
 */
const ExpenseRow = ({ expense, employeeInfo, onClick }) => {
  const { name, role, department } = employeeInfo;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left border-b last:border-b-0 border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-instattend-500 focus-visible:ring-offset-2"
    >
      {/* Avatar / Name / role / department */}
      <div className={COL_IDENTITY}>
        <div className="h-10 w-10 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center text-sm shrink-0">
          {getInitials(name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate">
            {role}
            {department && department !== "N/A" ? ` · ${department}` : ""}
          </p>
        </div>
      </div>

      {/* Category */}
      <div className={COL_CATEGORY}>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${CATEGORY_BADGE_STYLE}`}
        >
          {expense.expense_type}
        </span>
      </div>

      {/* Date */}
      <div className={`${COL_DATE} text-sm text-gray-600 whitespace-nowrap`}>
        {formatExpenseDate(expense.expense_date)}
      </div>

      {/* Amount */}
      <div
        className={`${COL_AMOUNT} text-sm font-bold text-gray-900 whitespace-nowrap`}
      >
        ₹{Number(expense.expense_amount || 0).toLocaleString()}
      </div>

      {/* Status */}
      <div className={COL_STATUS}>
        <Badge className={STATUS_BADGE_STYLES[expense.expense_status]}>
          {expense.expense_status}
        </Badge>
      </div>

      {/* Chevron */}
      <div className={`${COL_CHEVRON} flex justify-end`}>
        <ChevronRight className="h-5 w-5 text-instattend-500" />
      </div>
    </button>
  );
};

export default ExpenseRow;
