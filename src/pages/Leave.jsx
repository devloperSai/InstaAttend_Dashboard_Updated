import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  Search,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { leaveService } from "../api/services/leave.service.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { Card, CardContent } from "../components/ui/card";
import LeaveRow, { LeaveRowHeader } from "../components/ui/LeaveRow.jsx";
import LeaveProfileModal from "../components/ui/LeaveProfileModal.jsx";
import LeaveSkeleton from "../components/skeleton/LeaveSkeleton.jsx";

// Leave type is not a free-text "reason" in the API/input form — it's
// always one of these four values, surfaced as a dropdown wherever the
// design calls for a reason field.
const LEAVE_TYPES = ["Sick Leave", "Vacation", "Personal Leave", "Other"];

const mapLeave = (leave) => {
  let diffDays = 0;
  if (leave.from && leave.to) {
    const startDate = new Date(leave.from);
    const endDate = new Date(leave.to);
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const diffTime = Math.abs(endDate - startDate);
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  const user = leave.user || {};
  return {
    id: leave.id,
    employeeId: leave.user_id,
    employeeName: user.username || "Unknown",
    role: user.designation_name || user.designation?.designation_name || "N/A",
    department:
      user.department_name || user.department?.department_name || "N/A",
    type: leave.leave_type,
    startDate: leave.from,
    endDate: leave.to,
    days: diffDays,
    status: leave.status,
    appliedOn: leave.createdAt || null,
  };
};

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const rawLeaves = await leaveService.getAll();
      setLeaves((rawLeaves || []).map(mapLeave));
    } catch (e) {
      console.error("Error in fetchLeaves:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- 1. Top summary cards ----
  const statusCounts = useMemo(() => {
    const counts = { Pending: 0, Approved: 0, Rejected: 0 };
    leaves.forEach((l) => {
      if (counts[l.status] !== undefined) counts[l.status] += 1;
    });
    return { total: leaves.length, ...counts };
  }, [leaves]);

  const summaryCards = [
    {
      title: "Total Requests",
      value: statusCounts.total,
      icon: ClipboardList,
      iconBg: "bg-instattend-100 text-instattend-700",
    },
    {
      title: "Pending",
      value: statusCounts.Pending,
      icon: Clock,
      iconBg: "bg-orange-100 text-orange-700",
    },
    {
      title: "Approved",
      value: statusCounts.Approved,
      icon: CheckCircle2,
      iconBg: "bg-green-100 text-green-700",
    },
    {
      title: "Rejected",
      value: statusCounts.Rejected,
      icon: XCircle,
      iconBg: "bg-red-100 text-red-700",
    },
  ];

  // ---- Filters ----
  const filteredLeaves = leaves.filter((leave) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      [leave.employeeName, leave.role, leave.department, leave.type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    const matchesStatus =
      statusFilter === "all" ||
      String(leave.status).toLowerCase() === statusFilter.toLowerCase();
    const matchesType =
      typeFilter === "all" ||
      String(leave.type).toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  const hasActiveFilters =
    searchTerm.trim() !== "" || statusFilter !== "all" || typeFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const openLeaveModal = (leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  const closeLeaveModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedLeave(null), 150);
  };

  // ---- 5. Live updates: status, badge, and balance all update in place ----
  const handleApprove = async () => {
    if (!selectedLeave) return;
    setUpdatingId(selectedLeave.id);
    try {
      await leaveService.approveLeave(selectedLeave.id);
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === selectedLeave.id ? { ...l, status: "Approved" } : l,
        ),
      );
      setSelectedLeave((prev) =>
        prev ? { ...prev, status: "Approved" } : prev,
      );
    } catch (err) {
      console.error("Error approving leave:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedLeave) return;
    setUpdatingId(selectedLeave.id);
    try {
      await leaveService.rejectLeave(selectedLeave.id);
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === selectedLeave.id ? { ...l, status: "Rejected" } : l,
        ),
      );
      setSelectedLeave((prev) =>
        prev ? { ...prev, status: "Rejected" } : prev,
      );
    } catch (err) {
      console.error("Error rejecting leave:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <MainLayout>
      {isLoading ? (
        <LeaveSkeleton />
      ) : (
        <div className="min-w-0 overflow-x-hidden p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Leave Management
            </h1>
          </div>

          {/* ---- 1. Status summary cards ---- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {summaryCards.map((card) => (
              <Card key={card.title} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {card.title}
                      </p>
                      <h3 className="text-2xl font-bold">{card.value}</h3>
                    </div>
                    <div className={`p-3 rounded-full ${card.iconBg}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* ---- 2. Request list ---- */}
            <div>
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="flex flex-col items-stretch gap-4 border-b border-gray-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full max-w-md lg:flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      className="pl-10"
                      placeholder="Search by employee..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full min-w-[140px] sm:w-[150px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full min-w-[140px] sm:w-[160px]">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {LEAVE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <button
                      type="button"
                      className={`h-10 rounded-md border px-3 text-sm font-medium transition-all ${
                        hasActiveFilters
                          ? "border-gray-800 bg-gray-800 text-white hover:bg-gray-700"
                          : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 blur-[1px]"
                      }`}
                      title="Clear filters"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <div className="rounded-b-lg overflow-hidden">
                  {filteredLeaves.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      No leave records found
                    </div>
                  ) : (
                    <>
                      <LeaveRowHeader />
                      {filteredLeaves.map((leave) => (
                        <LeaveRow
                          key={leave.id}
                          leave={leave}
                          onClick={() => openLeaveModal(leave)}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- 3. Profile modal ---- */}
      <LeaveProfileModal
        open={isModalOpen}
        onOpenChange={(open) =>
          open ? setIsModalOpen(true) : closeLeaveModal()
        }
        leave={selectedLeave}
        isUpdating={updatingId === selectedLeave?.id}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </MainLayout>
  );
};

export default Leave;
