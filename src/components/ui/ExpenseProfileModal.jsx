import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Badge } from "./badge";
import { Paperclip, ExternalLink, Check, X as XIcon } from "lucide-react";
import {
  STATUS_BADGE_STYLES,
  getInitials,
  formatExpenseDate,
} from "./ExpenseRow";

/**
 * Detail modal for a single expense claim. Opened by clicking a row in
 * ExpenseRow. Shows the full profile + claim context, and — only when
 * the claim is still Pending — Approve/Reject actions. The parent
 * (Expense.jsx) owns the actual status-update call and local state
 * patch, so approving/rejecting here updates the dashboard instantly
 * without a page reload or refetch.
 */
const ExpenseProfileModal = ({
  open,
  onOpenChange,
  expense,
  employeeInfo,
  onApprove,
  onReject,
  isUpdating,
}) => {
  if (!expense) return null;

  const { name, role, department, email } = employeeInfo;
  const note = expense.note || expense.description || expense.reason || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Expense Claim</DialogTitle>
          <DialogDescription>
            Review the details of this expense claim.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Employee */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center text-base shrink-0">
              {getInitials(name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {role}
                {department && department !== "N/A" ? ` · ${department}` : ""}
              </p>
              {email && email !== "N/A" && (
                <p className="text-xs text-gray-400 truncate">{email}</p>
              )}
            </div>
          </div>

          {/* Claim details */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Amount</p>
              <p className="text-lg font-bold text-gray-900">
                ₹{Number(expense.expense_amount || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Category</p>
              <p className="text-sm font-medium text-gray-800">
                {expense.expense_type}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Date</p>
              <p className="text-sm font-medium text-gray-800">
                {formatExpenseDate(expense.expense_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Status</p>
              <Badge className={STATUS_BADGE_STYLES[expense.expense_status]}>
                {expense.expense_status}
              </Badge>
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Note</p>
            <p className="text-sm text-gray-700">
              {note || (
                <span className="text-gray-400 italic">No note provided</span>
              )}
            </p>
          </div>

          {/* Receipt */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Receipt</p>
            {expense.receipt_url ? (
              <a
                href={expense.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-instattend-600 hover:text-instattend-700 font-medium"
              >
                <Paperclip className="h-3.5 w-3.5" />
                View receipt
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No receipt attached
              </p>
            )}
          </div>
        </div>

        {expense.expense_status === "Pending" && (
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isUpdating}
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={onReject}
            >
              <XIcon className="h-4 w-4 mr-1.5" />
              Reject
            </Button>
            <Button
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
              onClick={onApprove}
            >
              <Check className="h-4 w-4 mr-1.5" />
              Approve
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseProfileModal;
