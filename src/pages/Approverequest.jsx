import React, { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { UserCheck, UserX, Mail, Phone, Clock, Inbox } from "lucide-react";
import { format } from "date-fns";
import { enrollmentService } from "../api/services/enrollment.service.js";
import EnrollmentApprovalModal from "../components/modals/EnrollmentApprovalModal.jsx";
import ApproveRequestSkeleton from "../components/skeleton/Approverequestskeleton.jsx";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

const safeFormatDate = (dateVal) => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, "dd MMM yyyy, HH:mm");
  } catch {
    return "N/A";
  }
};

/**
 * Admin-facing inbox of pending employee self-enrollment requests
 * (GET /enrollment-requests). Each row can be:
 *   - Approved: opens EnrollmentApprovalModal, which loads the request's
 *     full details (including department/designation options) via
 *     GET /enrollment-requests/:id, and on submit calls
 *     PATCH /enrollment-requests/:id/approve.
 *   - Rejected: confirms, then calls the reject endpoint directly (no
 *     extra details needed for a rejection).
 */
const ApproveRequest = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState(null);

  const [rejectTarget, setRejectTarget] = useState(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await enrollmentService.getAll();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch enrollment requests", e);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openApproveModal = (request) => {
    setActiveRequestId(request.id);
    setApproveModalOpen(true);
  };

  // Called by the modal after a successful approval — removes the request
  // from the list immediately rather than waiting on a full refetch.
  const handleApproved = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const openRejectConfirm = (request) => setRejectTarget(request);

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setProcessingId(rejectTarget.id);
    try {
      await enrollmentService.reject(rejectTarget.id);
      setRequests((prev) => prev.filter((r) => r.id !== rejectTarget.id));
      setRejectTarget(null);
    } catch (e) {
      console.error("Failed to reject enrollment request", e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <MainLayout>
      <div
        className="min-w-0 overflow-x-hidden p-4 md:p-6"
        style={{ backgroundColor: "hsl(var(--dashboard-bg))" }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Approve Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review new employee enrollment requests before they get access
          </p>
        </div>

        {isLoading ? (
          <ApproveRequestSkeleton />
        ) : requests.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="flex flex-col items-center text-center py-16">
              <Inbox className="h-10 w-10 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No pending requests
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                New employee enrollment requests will show up here for your
                review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
            {requests.map((request) => {
              const employee = request.employee || {};
              const isProcessing = processingId === request.id;
              return (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4"
                >
                  <div className="h-10 w-10 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center text-sm shrink-0">
                    {getInitials(employee.username)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {employee.username || "Unknown"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5 text-xs text-gray-500">
                      {employee.email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          {employee.email}
                        </span>
                      )}
                      {employee.phone_number && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 shrink-0" />
                          {employee.phone_number}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        {safeFormatDate(request.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => openRejectConfirm(request)}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <UserX className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => openApproveModal(request)}
                      className="bg-instattend-600 hover:bg-instattend-700 text-white"
                    >
                      <UserCheck className="h-4 w-4 mr-1.5" />
                      Approve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approve form popup — loads department/designation options for
          this specific request via get-request-details, then submits
          through approve-request. */}
      <EnrollmentApprovalModal
        open={approveModalOpen}
        onOpenChange={(open) => {
          setApproveModalOpen(open);
          if (!open) setActiveRequestId(null);
        }}
        requestId={activeRequestId}
        onApproved={handleApproved}
      />

      {/* Reject confirmation — same fixed-overlay pattern used elsewhere
          in the app (Employees.jsx, Settings.jsx delete confirmations). */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-xl sm:p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Reject Enrollment Request
            </h2>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to reject{" "}
              <strong>
                {rejectTarget.employee?.username || "this request"}
              </strong>
              's enrollment request?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmReject}
                disabled={processingId === rejectTarget.id}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {processingId === rejectTarget.id
                  ? "Rejecting..."
                  : "Yes, Reject"}
              </button>
              <button
                onClick={() => setRejectTarget(null)}
                disabled={processingId === rejectTarget.id}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ApproveRequest;
