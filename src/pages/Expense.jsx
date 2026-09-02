// src/pages/Expense.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";
import {
  Download,
  Receipt,
  FileText,
  Check,
  X as XIcon,
  Paperclip,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { expenseService } from "../api/services/expense.service.js";
import { employeeService } from "../api/services/employee.service.js";

// Tab keys match the API's expense_status values exactly
const STATUS_TABS = [
  { key: "Pending", label: "Review" },
  { key: "Approved", label: "Approved" },
  { key: "Rejected", label: "Rejected" },
];

const STATUS_BADGE_STYLES = {
  Pending: "bg-orange-100 text-orange-800 border-orange-200",
  Approved: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
};

// The mobile app and the admin panel don't always agree on casing/
// whitespace for expense_status ("pending" vs "Pending" vs " Pending ").
// Previously the tab filter did a strict `===` match against the raw
// backend value, so anything that didn't match EXACTLY (e.g. lowercase
// from mobile) was fetched successfully but silently excluded from every
// tab — it looked like the expense "never arrived" even though it was
// sitting in `expenses` state the whole time. This normalizer makes
// status comparisons resilient to that, and anything unrecognized falls
// back to "Pending" so it's never invisible.
const normalizeStatus = (status) => {
  const s = String(status ?? "").trim().toLowerCase();
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  return "Pending";
};

const safeFormatDate = (dateVal) => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Invalid Date";
    return format(d, "dd MMM yyyy");
  } catch {
    return "Invalid Date";
  }
};

// Auto-refresh interval (ms) so expenses submitted from the mobile app
// show up on the dashboard without the admin needing to reload the page.
const AUTO_REFRESH_MS = 20000;

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("Pending");
  const [updatingId, setUpdatingId] = useState(null);
  const pollRef = useRef(null);

  const fetchExpenses = useCallback(async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const data = await expenseService.getAll();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch expenses", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch employees", e);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchEmployees();

    // Light polling so expenses submitted from the mobile app while this
    // page is open get picked up automatically.
    pollRef.current = setInterval(() => fetchExpenses(true), AUTO_REFRESH_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchExpenses, fetchEmployees]);

  // Map expense_by (UUID) -> employee display name
  const employeeNameMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      map[emp.id] = emp.username;
    });
    return map;
  }, [employees]);

  // Pre-compute the normalized status once per expense so every consumer
  // (tabs, totals, badges) agrees on the same bucket.
  const normalizedExpenses = useMemo(
    () =>
      expenses.map((e) => ({
        ...e,
        _normalizedStatus: normalizeStatus(e.expense_status),
      })),
    [expenses],
  );

  const totals = useMemo(() => {
    const total = normalizedExpenses.reduce(
      (sum, e) => sum + Number(e.expense_amount || 0),
      0,
    );
    const review = normalizedExpenses
      .filter((e) => e._normalizedStatus === "Pending")
      .reduce((sum, e) => sum + Number(e.expense_amount || 0), 0);
    const approved = normalizedExpenses
      .filter((e) => e._normalizedStatus === "Approved")
      .reduce((sum, e) => sum + Number(e.expense_amount || 0), 0);
    return { total, review, approved };
  }, [normalizedExpenses]);

  const filteredExpenses = normalizedExpenses.filter(
    (e) => e._normalizedStatus === activeTab,
  );

  const handleStatusChange = async (expense, newStatus) => {
    setUpdatingId(expense.id);
    try {
      await expenseService.updateExpense(expense.id, {
        expense_status: newStatus,
      });
      toast.success(`Expense ${newStatus.toLowerCase()}`);
      await fetchExpenses();
    } catch (e) {
      console.error("Failed to update expense status", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const exportExpenseReport = () => {
    if (filteredExpenses.length === 0) {
      toast.error("No expenses to export in this view");
      return;
    }

    const headers = ["Employee", "Category", "Date", "Amount", "Status"];
    const rows = filteredExpenses.map((e) => [
      employeeNameMap[e.expense_by] || "Unknown",
      e.expense_type,
      e.expense_date,
      e.expense_amount,
      e._normalizedStatus,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expenses-${activeTab.toLowerCase()}.csv`;
    link.click();
    toast.success("Exporting expense report");
  };

  const periodLabel = `1 Jan ${new Date().getFullYear()} - 30 Dec ${new Date().getFullYear()}`;

  return (
    <MainLayout>
      {/* Purple summary banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-instattend-500 to-instattend-700 p-6 sm:p-8 mb-6 overflow-hidden">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Expense Summary
            </h1>
            <p className="text-instattend-100 mt-1">Claim your expenses here</p>
          </div>
          <div className="hidden sm:flex h-14 w-14 rounded-full bg-white/15 items-center justify-center flex-shrink-0">
            <Receipt className="h-7 w-7 text-white" />
          </div>
        </div>

        <Card className="relative z-10 mt-6 border-none shadow-lg">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-800">Total Expense</p>
            <p className="text-xs text-gray-500 mb-4">Period {periodLabel}</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium mb-1">
                  <Receipt className="h-3.5 w-3.5 text-instattend-500" /> Total
                </div>
                <p className="text-lg font-bold text-gray-900">
                  ₹{totals.total.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium mb-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500 inline-block" />{" "}
                  Review
                </div>
                <p className="text-lg font-bold text-gray-900">
                  ₹{totals.review.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium mb-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" />{" "}
                  Approved
                </div>
                <p className="text-lg font-bold text-gray-900">
                  ₹{totals.approved.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-full p-1.5 shadow-sm max-w-md w-full sm:w-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-instattend-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchExpenses(true)}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {STATUS_TABS.find((t) => t.key === activeTab)?.label} Expenses
            </CardTitle>
            <CardDescription>
              {filteredExpenses.length} record
              {filteredExpenses.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportExpenseReport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No Expenses Logged
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                There are no expenses listed under this status filter for the
                selected tracking period.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                    {activeTab === "Pending" && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {employeeNameMap[expense.expense_by] || "Unknown"}
                      </TableCell>
                      <TableCell>{expense.expense_type}</TableCell>
                      <TableCell>
                        {safeFormatDate(expense.expense_date)}
                      </TableCell>
                      <TableCell>
                        ₹{Number(expense.expense_amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {expense.receipt_url ? (
                          <a
                            href={expense.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-instattend-600 hover:text-instattend-700 text-sm"
                          >
                            <Paperclip className="h-3.5 w-3.5" /> View
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            STATUS_BADGE_STYLES[expense._normalizedStatus]
                          }
                        >
                          {expense._normalizedStatus}
                        </Badge>
                      </TableCell>
                      {activeTab === "Pending" && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === expense.id}
                              className="border-green-200 text-green-700 hover:bg-green-50"
                              onClick={() =>
                                handleStatusChange(expense, "Approved")
                              }
                            >
                              <Check className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === expense.id}
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleStatusChange(expense, "Rejected")
                              }
                            >
                              <XIcon className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Expense;