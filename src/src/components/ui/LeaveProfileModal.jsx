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
import { Check, X as XIcon } from "lucide-react";
import {
  LEAVE_STATUS_BADGE_STYLES,
  getInitials,
  safeFormatDate,
} from "./LeaveRow";

/**
 * Detail modal for a single leave request. Opened by clicking a row in
 * LeaveRow. Shows employee context, leave balance with a progress bar,
 * full request details, and — only when still Pending — Approve/Reject
 * actions. Mirrors ExpenseProfileModal.jsx's structure/styling.
 *
 * There is intentionally no "reason" field — the API/input form doesn't
 * carry one. The leave type (Sick/Vacation/Personal/Other) stands in for
 * it, shown as a plain detail row here (the editable dropdown lives in
 * the existing edit-leave dialog).
 */
const LeaveProfileModal = ({
  open,
  onOpenChange,
  leave,
  onApprove,
  onReject,
  isUpdating,
}) => {
  if (!leave) return null;

  const balance = leave.leaveBalance || { total: 0, used: 0, remaining: 0 };
  const usedPct =
    balance.total > 0
      ? Math.min(100, Math.round((balance.used / balance.total) * 100))
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[480px]">
        <div className="p-6 overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Leave Request</DialogTitle>
            <DialogDescription>
              Review the details of this leave request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Employee */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center text-base shrink-0">
                {getInitials(leave.employeeName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {leave.employeeName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {leave.role}
                  {leave.department && leave.department !== "N/A"
                    ? ` · ${leave.department}`
                    : ""}
                </p>
              </div>
            </div>

            {/* Leave balance */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500 mb-2">Leave Balance</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-[11px] text-gray-500">Total</p>
                  <p className="text-sm font-bold text-gray-900">
                    {balance.total}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Used</p>
                  <p className="text-sm font-bold text-gray-900">
                    {balance.used}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Remaining</p>
                  <p className="text-sm font-bold text-instattend-600">
                    {balance.remaining}
                  </p>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-instattend-500 rounded-full transition-all"
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>

            {/* Request details */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Leave Type</p>
                <p className="text-sm font-medium text-gray-800">
                  {leave.type}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                <Badge className={LEAVE_STATUS_BADGE_STYLES[leave.status]}>
                  {leave.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">From</p>
                <p className="text-sm font-medium text-gray-800">
                  {safeFormatDate(leave.startDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">To</p>
                <p className="text-sm font-medium text-gray-800">
                  {safeFormatDate(leave.endDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Days</p>
                <p className="text-sm font-medium text-gray-800">
                  {leave.days}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Applied On</p>
                <p className="text-sm font-medium text-gray-800">
                  {safeFormatDate(leave.appliedOn)}
                </p>
              </div>
            </div>
          </div>

          {leave.status === "Pending" && (
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
      </DialogContent>
    </Dialog>
  );
};

export default LeaveProfileModal;
