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
import Papa from "papaparse";
import * as XLSX from "xlsx";
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

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");
  const [updatingId, setUpdatingId] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const exportRef = useRef();

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.getAll();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch expenses", e);
      setExpenses([]);
    } finally {
      setIsLoading(false);
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
  }, [fetchExpenses, fetchEmployees]);

  // Close the export dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Map expense_by (UUID) -> employee display name.
  // Fallback lookup only — the API now embeds `expenseBy.username` directly
  // on each expense record, which is used first below.
  const employeeNameMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      map[emp.id] = emp.username;
    });
    return map;
  }, [employees]);

  const getEmployeeName = useCallback(
    (expense) =>
      expense.expenseBy?.username ||
      employeeNameMap[expense.expense_by] ||
      "Unknown",
    [employeeNameMap],
  );

  const getEmployeeEmail = useCallback(
    (expense) => expense.expenseBy?.email || "N/A",
    [],
  );

  const totals = useMemo(() => {
    const total = expenses.reduce(
      (sum, e) => sum + Number(e.expense_amount || 0),
      0,
    );
    const review = expenses
      .filter((e) => e.expense_status === "Pending")
      .reduce((sum, e) => sum + Number(e.expense_amount || 0), 0);
    const approved = expenses
      .filter((e) => e.expense_status === "Approved")
      .reduce((sum, e) => sum + Number(e.expense_amount || 0), 0);
    return { total, review, approved };
  }, [expenses]);

  const filteredExpenses = expenses.filter(
    (e) => e.expense_status === activeTab,
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

  // ---- Export helpers (shared row-building for both formats) ----
  const buildExportRows = useCallback(() => {
    return filteredExpenses.map((e) => ({
      Employee: getEmployeeName(e),
      Email: getEmployeeEmail(e),
      Category: e.expense_type,
      Date: e.expense_date
        ? format(new Date(e.expense_date), "yyyy-MM-dd")
        : "N/A",
      "Amount (₹)": Number(e.expense_amount || 0),
      Status: e.expense_status,
      "Receipt URL": e.receipt_url || "N/A",
      "Submitted On": e.createdAt
        ? format(new Date(e.createdAt), "yyyy-MM-dd HH:mm")
        : "N/A",
    }));
  }, [filteredExpenses, getEmployeeName, getEmployeeEmail]);

  const buildExportFileName = useCallback(
    (ext) =>
      `expenses-${activeTab.toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.${ext}`,
    [activeTab],
  );

  const handleExportCSV = useCallback(() => {
    if (filteredExpenses.length === 0) {
      toast.error("No expenses to export in this view");
      return;
    }
    const rows = buildExportRows();
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = buildExportFileName("csv");
    link.click();
    toast.success("Exported as CSV");
    setShowExportOptions(false);
  }, [filteredExpenses, buildExportRows, buildExportFileName]);

  const handleExportExcel = useCallback(() => {
    if (filteredExpenses.length === 0) {
      toast.error("No expenses to export in this view");
      return;
    }

    const headers = [
      "Employee",
      "Email",
      "Category",
      "Date",
      "Amount (₹)",
      "Status",
      "Receipt URL",
      "Submitted On",
    ];

    const rows = buildExportRows().map((r) => headers.map((h) => r[h]));
    const worksheetData = [headers, ...rows];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Bold + highlighted header row, matching the Attendance export style
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { rgb: "FFFF00" },
        },
      };
    }

    worksheet["!cols"] = [
      { wch: 22 }, // Employee
      { wch: 26 }, // Email
      { wch: 16 }, // Category
      { wch: 14 }, // Date
      { wch: 14 }, // Amount
      { wch: 12 }, // Status
      { wch: 45 }, // Receipt URL
      { wch: 20 }, // Submitted On
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, buildExportFileName("xlsx"));
    toast.success("Exported as Excel");
    setShowExportOptions(false);
  }, [filteredExpenses, buildExportRows, buildExportFileName]);

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

          {/* Export dropdown — Excel + CSV, same pattern as Attendance/Employees */}
          <div className="relative inline-block text-left" ref={exportRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportOptions((prev) => !prev)}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            {showExportOptions && (
              <div className="absolute right-0 z-20 mt-2 w-48 bg-white border rounded-lg shadow-xl py-1">
                <button
                  onClick={handleExportExcel}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Export as Excel
                </button>
                <button
                  onClick={handleExportCSV}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Export as CSV
                </button>
              </div>
            )}
          </div>
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
                        {getEmployeeName(expense)}
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
                            STATUS_BADGE_STYLES[expense.expense_status]
                          }
                        >
                          {expense.expense_status}
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
