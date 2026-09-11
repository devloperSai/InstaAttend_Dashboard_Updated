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

// Same shared label style as ExpenseProfileModal so both modals read
// as one consistent system.
const FIELD_LABEL =
  "text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1";

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
      <DialogContent className="w-[calc(100%-1rem)] max-w-[calc(100vw-1rem)] overflow-hidden p-0 sm:w-[calc(100%-2rem)] sm:max-w-[480px]">
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
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
              <p className={FIELD_LABEL}>Leave Balance</p>
              <div className="grid grid-cols-3 gap-3 mb-3 mt-2">
                <div className="flex flex-col items-start">
                  <p className="text-[11px] text-gray-500 mb-0.5">Total</p>
                  <p className="text-sm font-bold text-gray-900">
                    {balance.total}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-[11px] text-gray-500 mb-0.5">Used</p>
                  <p className="text-sm font-bold text-gray-900">
                    {balance.used}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-[11px] text-gray-500 mb-0.5">Remaining</p>
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

            {/* Request details — items-start keeps every label/value
                pair flush at the top of its cell, matching the Expense
                modal's "Claim details" grid so a Badge cell never
                pushes neighboring text out of line. */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg bg-gray-50 p-4">
              <div className="flex flex-col items-start">
                <p className={FIELD_LABEL}>Leave Type</p>
                <p className="text-sm font-medium text-gray-800 leading-tight">
                  {leave.type}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <p className={FIELD_LABEL}>Status</p>
                <Badge className={LEAVE_STATUS_BADGE_STYLES[leave.status]}>
                  {leave.status}
                </Badge>
              </div>
              <div className="flex flex-col items-start">
                <p className={FIELD_LABEL}>From</p>
                <p className="text-sm font-medium text-gray-800 leading-tight">
                  {safeFormatDate(leave.startDate)}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <p className={FIELD_LABEL}>To</p>
                <p className="text-sm font-medium text-gray-800 leading-tight">
                  {safeFormatDate(leave.endDate)}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <p className={FIELD_LABEL}>Days</p>
                <p className="text-sm font-medium text-gray-800 leading-tight">
                  {leave.days}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <p className={FIELD_LABEL}>Applied On</p>
                <p className="text-sm font-medium text-gray-800 leading-tight">
                  {safeFormatDate(leave.appliedOn)}
                </p>
              </div>
            </div>
          </div>

          {leave.status === "Pending" && (
            <DialogFooter className="pt-4 mt-2 border-t border-gray-100">
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
