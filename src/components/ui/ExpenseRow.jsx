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

/**
 * Single expense row rendered in a "profile row" style instead of a
 * table row — avatar, name/role/department, category tag, date,
 * amount, status badge, and a trailing chevron indicating the row
 * opens a detail modal on click. No inline actions live here anymore;
 * Approve/Reject moved into ExpenseProfileModal.
 */
const ExpenseRow = ({ expense, employeeInfo, onClick }) => {
  const { name, role, department } = employeeInfo;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 sm:gap-4 px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors text-left border-b last:border-b-0 border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-instattend-500 focus-visible:ring-offset-2"
    >
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center text-sm shrink-0">
        {getInitials(name)}
      </div>

      {/* Name / role / department */}
      <div className="min-w-0 flex-1 sm:flex-none sm:w-44 md:w-52">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">
          {role}
          {department && department !== "N/A" ? ` · ${department}` : ""}
        </p>
      </div>

      {/* Category */}
      <div className="hidden sm:flex sm:w-32 md:w-36 shrink-0">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${CATEGORY_BADGE_STYLE}`}
        >
          {expense.expense_type}
        </span>
      </div>

      {/* Date */}
      <div className="hidden md:block w-28 shrink-0 text-sm text-gray-600">
        {formatExpenseDate(expense.expense_date)}
      </div>

      {/* Amount */}
      <div className="w-20 sm:w-24 shrink-0 text-sm font-bold text-gray-900 text-right">
        ₹{Number(expense.expense_amount || 0).toLocaleString()}
      </div>

      {/* Status */}
      <div className="w-[84px] sm:w-24 shrink-0 flex justify-end sm:justify-start">
        <Badge className={STATUS_BADGE_STYLES[expense.expense_status]}>
          {expense.expense_status}
        </Badge>
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
    </button>
  );
};

export default ExpenseRow;
