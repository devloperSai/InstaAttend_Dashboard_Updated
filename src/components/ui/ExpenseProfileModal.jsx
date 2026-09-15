import React, { useEffect, useState } from "react";
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
import {
  Paperclip,
  ExternalLink,
  Check,
  X as XIcon,
  FileWarning,
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
  STATUS_BADGE_STYLES,
  getInitials,
  formatExpenseDate,
} from "./ExpenseRow";

const isImageUrl = (url = "") =>
  /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
const isPdfUrl = (url = "") => /\.pdf(\?.*)?$/i.test(url);

// Shared label style so every field in the modal reads with the same
// rhythm (uppercase, tracked, muted) instead of mismatched text-xs
// colors between sections.
const FIELD_LABEL =
  "text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1";

const ExpenseProfileModal = ({
  open,
  onOpenChange,
  expense,
  employeeInfo,
  onApprove,
  onReject,
  isUpdating,
}) => {
  const [showAttachment, setShowAttachment] = useState(false);

  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => setShowAttachment(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    setShowAttachment(false);
  }, [expense?.id]);

  if (!expense) return null;

  const { name, role, department, email } = employeeInfo;
  const note = expense.note || expense.description || expense.reason || null;
  const hasReceipt = !!expense.receipt_url;
  const receiptIsImage = hasReceipt && isImageUrl(expense.receipt_url);
  const receiptIsPdf = hasReceipt && isPdfUrl(expense.receipt_url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[calc(100%-1rem)] max-w-[calc(100vw-1rem)] overflow-hidden p-0 transition-[max-width] duration-500 ease-in-out sm:w-[calc(100%-2rem)] sm:max-w-[calc(100vw-2rem)]",
          showAttachment ? "sm:max-w-[880px]" : "sm:max-w-[480px]",
        )}
      >
        <div className="flex max-h-[85vh] min-h-0 w-full flex-col sm:flex-row">
          {/* Details panel */}
          <div className="box-border min-h-0 w-full min-w-0 shrink-0 overflow-y-auto p-4 sm:w-[480px] sm:p-6">
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
                    {department && department !== "N/A"
                      ? ` · ${department}`
                      : ""}
                  </p>
                  {email && email !== "N/A" && (
                    <p className="text-xs text-gray-400 truncate">{email}</p>
                  )}
                </div>
              </div>

              {/* Claim details — items-start keeps every cell's label
                  flush with the top row, so a tall Status badge cell
                  never pushes its neighbor's baseline out of line. */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg bg-gray-50 p-4">
                <div className="flex flex-col items-start">
                  <p className={FIELD_LABEL}>Amount</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">
                    ₹{Number(expense.expense_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <p className={FIELD_LABEL}>Category</p>
                  <p className="text-sm font-medium text-gray-800 leading-tight">
                    {expense.expense_type}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <p className={FIELD_LABEL}>Date</p>
                  <p className="text-sm font-medium text-gray-800 leading-tight">
                    {formatExpenseDate(expense.expense_date)}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <p className={FIELD_LABEL}>Status</p>
                  <Badge
                    className={STATUS_BADGE_STYLES[expense.expense_status]}
                  >
                    {expense.expense_status}
                  </Badge>
                </div>
              </div>

              {/* Note */}
              <div>
                <p className={FIELD_LABEL}>Note</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {note || (
                    <span className="text-gray-400 italic">
                      No note provided
                    </span>
                  )}
                </p>
              </div>

              {/* Receipt */}
              <div>
                <p className={FIELD_LABEL}>Receipt</p>
                {hasReceipt ? (
                  <button
                    type="button"
                    onClick={() => setShowAttachment((prev) => !prev)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
                      showAttachment
                        ? "text-instattend-700"
                        : "text-instattend-600 hover:text-instattend-700",
                    )}
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    {showAttachment ? "Hide receipt" : "View receipt"}
                  </button>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No receipt attached
                  </p>
                )}
              </div>
            </div>

            {expense.expense_status === "Pending" && (
              <DialogFooter className="mt-2 w-full min-w-0 justify-center border-t border-gray-100 pt-4 sm:justify-center sm:gap-2 sm:space-x-0">
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
          </div>

          {/* Attachment preview panel */}
          <div
            className={cn(
              "shrink-0 overflow-hidden border-gray-100 bg-gray-50 transition-[width,height,max-height,opacity] duration-500 ease-in-out sm:border-l",
              showAttachment
                ? "h-[min(55vh,400px)] max-h-[400px] w-full opacity-100 sm:h-auto sm:w-[400px]"
                : "h-0 max-h-0 w-full opacity-0 sm:w-0",
            )}
          >
            {hasReceipt && (
              <div className="flex h-full min-h-0 w-full flex-col p-4 sm:w-[400px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Receipt Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAttachment(false)}
                    className="text-gray-400 hover:text-gray-600 rounded-md p-1 hover:bg-gray-200/60 transition-colors"
                    aria-label="Close preview"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                  {receiptIsImage ? (
                    <img
                      src={expense.receipt_url}
                      alt="Expense receipt"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : receiptIsPdf ? (
                    <iframe
                      src={expense.receipt_url}
                      title="Receipt PDF"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center p-6 text-gray-400">
                      <FileWarning className="h-8 w-8 mb-2" />
                      <p className="text-sm">
                        Preview not available for this file type
                      </p>
                    </div>
                  )}
                </div>

                <a
                  href={expense.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-instattend-600 hover:text-instattend-700"
                >
                  Open original <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseProfileModal;
