import React, { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";
import { Calendar, Search, Filter, Check, X, Edit, Trash } from "lucide-react";
import { Input } from "../components/ui/input";
import { leaveService } from "../api/services/leave.service.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { format } from "date-fns";
const safeFormatDate = (dateVal, formatStr = "MMM dd, yyyy") => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Invalid Date";
    return format(d, formatStr);
  } catch {
    return "Invalid Date";
  }
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import LeaveSkeleton from "../components/skeleton/LeaveSkeleton.jsx";

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  // Rejection reason
  const [rejectionReason, setRejectionReason] = useState("");
  // Edit and Delete state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    leave_type: "Sick Leave",
    from: "",
    to: "",
    status: "Pending",
  });
  // Filter leave data based on search, status and type
  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? leave.status === statusFilter : true;
    const matchesType = typeFilter ? leave.type === typeFilter : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  const leaveTypeStats = {
    sick: leaves.filter((leave) => leave.type === "Sick Leave").length,
    vacation: leaves.filter((leave) => leave.type === "Vacation").length,
    personal: leaves.filter((leave) => leave.type === "Personal Leave").length,
    other: leaves.filter((leave) => leave.type === "Other").length,
  };

  useEffect(() => {
    fetchLeaves().then(() => {});
  }, []);

  const handleApproveLeave = () => {
    try {
      leaveService.approveLeave(selectedLeave.id).then(() => {
        toast.success("Leave request approved");
        const updatedLeaves = leaves.map((leave) =>
          leave.id === selectedLeave.id
            ? { ...leave, status: "Approved" }
            : leave,
        );
        setLeaves(updatedLeaves);
        setIsApproveDialogOpen(false);
        setSelectedLeave(null);
      });
    } catch (err) {
      toast.error("Error approving leave request");
      throw err;
    }
  };

  const handleRejectLeave = () => {
    try {
      leaveService.rejectLeave(selectedLeave.id).then(() => {
        toast.success("Leave request rejected");
        const updatedLeaves = leaves.map((leave) =>
          leave.id === selectedLeave.id
            ? { ...leave, status: "Rejected", rejectedReason: rejectionReason }
            : leave,
        );

        setLeaves(updatedLeaves);
        setIsRejectDialogOpen(false);
        setSelectedLeave(null);
        setRejectionReason("");
      });
    } catch (err) {
      toast.error("Error rejecting leave request");
      throw err;
    }
  };

  const handleUpdateLeave = async () => {
    if (!editForm.from || !editForm.to) {
      toast.error("Please fill in all fields");
      return;
    }

    const updatePayload = {
      status: editForm.status,
      from: editForm.from,
      to: editForm.to,
      leave_type: editForm.leave_type,
    };

    try {
      await leaveService.updateLeave(editForm.id, updatePayload);
      await fetchLeaves();
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating leave:", err);
    }
  };

  const handleDeleteLeave = async () => {
    if (!selectedLeave) return;
    try {
      await leaveService.deleteLeave(selectedLeave.id);
      await fetchLeaves();
      setIsDeleteDialogOpen(false);
      setSelectedLeave(null);
    } catch (err) {
      console.error("Error deleting leave:", err);
    }
  };

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const rawLeaves = await leaveService.getAll(); // already an array
      console.log("Fetched Leaves:", rawLeaves);

      const mappedLeaves = rawLeaves.map((leave) => {
        let diffDays = 0;
        if (leave.from && leave.to) {
          const startDate = new Date(leave.from);
          const endDate = new Date(leave.to);
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const diffTime = Math.abs(endDate - startDate);
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          }
        }

        return {
          id: leave.id,
          employeeId: leave.user_id,
          employeeName: leave.user?.username || "Unknown", // Safe access
          type: leave.leave_type,
          startDate: leave.from,
          endDate: leave.to,
          days: diffDays,
          status: leave.status,
          reason: leave.reason || "N/A",
          appliedOn: leave.createdAt || "N/A",
        };
      });

      setLeaves(mappedLeaves);
    } catch (e) {
      console.error("Error in fetchLeaves:", e);
      toast.error("Error fetching leave records");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      {isLoading ? (
        <LeaveSkeleton />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Leave Management
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Sick Leave
                    </p>
                    <h3 className="text-2xl font-bold">
                      {leaveTypeStats.sick}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-red-100 text-red-700">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Vacation
                    </p>
                    <h3 className="text-2xl font-bold">
                      {leaveTypeStats.vacation}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 text-blue-700">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Personal Leave
                    </p>
                    <h3 className="text-2xl font-bold">
                      {leaveTypeStats.personal}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 text-green-700">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Other</p>
                    <h3 className="text-2xl font-bold">
                      {leaveTypeStats.other}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-instattend-100 text-instattend-700">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search leaves..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Vacation">Vacation</SelectItem>
                    <SelectItem value="Personal Leave">
                      Personal Leave
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell className="font-medium">
                          {leave.employeeName}
                        </TableCell>
                        <TableCell>{leave.type}</TableCell>
                        <TableCell>{safeFormatDate(leave.startDate)}</TableCell>
                        <TableCell>{safeFormatDate(leave.endDate)}</TableCell>
                        <TableCell>{leave.days}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              leave.status === "Approved"
                                ? "outline"
                                : leave.status === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              leave.status === "Approved"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : leave.status === "Rejected"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }
                          >
                            {leave.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {leave.status === "Pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-200 text-green-700 hover:bg-green-50"
                                  onClick={() => {
                                    setSelectedLeave(leave);
                                    setIsApproveDialogOpen(true);
                                  }}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedLeave(leave);
                                    setIsRejectDialogOpen(true);
                                  }}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <button
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-gray-100 transition-colors"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setEditForm({
                                  id: leave.id,
                                  leave_type: leave.type,
                                  from: safeFormatDate(
                                    leave.startDate,
                                    "yyyy-MM-dd",
                                  ),
                                  to: safeFormatDate(
                                    leave.endDate,
                                    "yyyy-MM-dd",
                                  ),
                                  status: leave.status,
                                });
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-gray-100 transition-colors"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-6 text-gray-500"
                      >
                        No leave records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Approve Leave Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Approve Leave Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this leave request?
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="py-4">
              <p>
                <strong>Employee:</strong> {selectedLeave.employeeName}
              </p>
              <p>
                <strong>Leave Type:</strong> {selectedLeave.type}
              </p>
              <p>
                <strong>Duration:</strong>{" "}
                {safeFormatDate(selectedLeave.startDate)} to{" "}
                {safeFormatDate(selectedLeave.endDate)} ({selectedLeave.days}{" "}
                days)
              </p>
              <p>
                <strong>Reason:</strong> {selectedLeave.reason}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveLeave}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Leave Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request.
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="py-4 space-y-4">
              <div>
                <p>
                  <strong>Employee:</strong> {selectedLeave.employeeName}
                </p>
                <p>
                  <strong>Leave Type:</strong> {selectedLeave.type}
                </p>
                <p>
                  <strong>Duration:</strong>{" "}
                  {safeFormatDate(selectedLeave.startDate)} to{" "}
                  {safeFormatDate(selectedLeave.endDate)} ({selectedLeave.days}{" "}
                  days)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please provide a reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRejectLeave} variant="destructive">
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Leave Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Leave Request</DialogTitle>
            <DialogDescription>
              Modify the details of the leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-leave-type">Leave Type</Label>
              <Select
                value={editForm.leave_type}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, leave_type: value })
                }
              >
                <SelectTrigger id="edit-leave-type">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Vacation">Vacation</SelectItem>
                  <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Start Date</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={editForm.from}
                  onChange={(e) =>
                    setEditForm({ ...editForm, from: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">End Date</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={editForm.to}
                  onChange={(e) =>
                    setEditForm({ ...editForm, to: e.target.value })
                  }
                  min={editForm.from}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, status: value })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateLeave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Leave Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Leave Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this leave request? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="py-4 font-sans text-sm space-y-2">
              <p>
                <strong>Employee:</strong> {selectedLeave.employeeName}
              </p>
              <p>
                <strong>Leave Type:</strong> {selectedLeave.type}
              </p>
              <p>
                <strong>Duration:</strong>{" "}
                {safeFormatDate(selectedLeave.startDate)} to{" "}
                {safeFormatDate(selectedLeave.endDate)} ({selectedLeave.days}{" "}
                days)
              </p>
              <p>
                <strong>Status:</strong> {selectedLeave.status}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteLeave} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Leave;
