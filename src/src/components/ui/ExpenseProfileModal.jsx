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

/**
 * Detail modal for a single expense claim. Opened by clicking a row in
 * ExpenseRow. Shows the full profile + claim context, and — only when
 * the claim is still Pending — Approve/Reject actions.
 *
 * Clicking the receipt no longer navigates away in a new tab. Instead
 * the dialog widens and a preview panel slides in on the right, parallel
 * to the details panel, which — since the dialog stays centered via
 * translate(-50%, -50%) — makes the details panel appear to glide left
 * as the attachment opens beside it. Toggling it again (or picking a new
 * expense / closing the modal) smoothly collapses it back down.
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
  const [showAttachment, setShowAttachment] = useState(false);

  // Collapse the preview once the close animation finishes, so it
  // doesn't flash open again the next time this modal is opened.
  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => setShowAttachment(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Reset the preview whenever a different expense claim is loaded in.
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
          "p-0 overflow-hidden max-w-[95vw] transition-[max-width] duration-500 ease-in-out",
          showAttachment ? "sm:max-w-[880px]" : "sm:max-w-[480px]",
        )}
      >
        <div className="flex w-full max-h-[85vh]">
          {/* Details panel */}
          <div className="w-full sm:w-[480px] shrink-0 overflow-y-auto p-6">
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
                  <Badge
                    className={STATUS_BADGE_STYLES[expense.expense_status]}
                  >
                    {expense.expense_status}
                  </Badge>
                </div>
              </div>

              {/* Note */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Note</p>
                <p className="text-sm text-gray-700">
                  {note || (
                    <span className="text-gray-400 italic">
                      No note provided
                    </span>
                  )}
                </p>
              </div>

              {/* Receipt — toggles the side preview instead of navigating */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Receipt</p>
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
              <DialogFooter className="pt-2">
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

          {/* Attachment preview panel — slides in parallel to the details panel */}
          <div
            className={cn(
              "shrink-0 overflow-hidden border-l border-gray-100 bg-gray-50 transition-[width,opacity] duration-500 ease-in-out",
              showAttachment ? "w-[400px] opacity-100" : "w-0 opacity-0",
            )}
          >
            {hasReceipt && (
              <div className="w-[400px] h-full flex flex-col p-4">
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
