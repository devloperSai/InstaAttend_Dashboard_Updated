import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";
import { Download, Receipt, FileText } from "lucide-react";
import ExpenseRow, { ExpenseRowHeader } from "../components/ui/ExpenseRow.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { expenseService } from "../api/services/expense.service.js";
import { employeeService } from "../api/services/employee.service.js";
import ExpenseProfileModal from "../components/ui/ExpenseProfileModal.jsx";
import ExpenseSkeleton from "../components/skeleton/ExpenseSkeleton.jsx";

// Tab keys match the API's expense_status values exactly
const STATUS_TABS = [
  { key: "Pending", label: "Review" },
  { key: "Approved", label: "Approved" },
  { key: "Rejected", label: "Rejected" },
];

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");
  const [updatingId, setUpdatingId] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Row-profile modal state
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Full employee lookup by id — gives us name, role (designation) and
  // department, since the same employee list already carries all three.
  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      map[emp.id] = emp;
    });
    return map;
  }, [employees]);

  /**
   * Resolves display info for a row/modal from whatever the expense
   * record already carries (expenseBy.*), falling back to the
   * separately-fetched employees list. No new API calls or fields
   * required — everything here already exists in current responses.
   */
  const getEmployeeInfo = useCallback(
    (expense) => {
      const fallback = employeeMap[expense.expense_by];
      return {
        name: expense.expenseBy?.username || fallback?.username || "Unknown",
        email: expense.expenseBy?.email || fallback?.email || "N/A",
        role:
          expense.expenseBy?.designation?.designation_name ||
          fallback?.designation?.designation_name ||
          "N/A",
        department:
          expense.expenseBy?.department?.department_name ||
          fallback?.department?.department_name ||
          "N/A",
      };
    },
    [employeeMap],
  );

  // Totals now include a "rejected" bucket alongside total/review/approved,
  // so the summary banner accounts for every status instead of leaving
  // rejected claims out of the picture entirely.
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
    const rejected = expenses
      .filter((e) => e.expense_status === "Rejected")
      .reduce((sum, e) => sum + Number(e.expense_amount || 0), 0);
    return { total, review, approved, rejected };
  }, [expenses]);

  const tabCounts = useMemo(() => {
    const counts = { Pending: 0, Approved: 0, Rejected: 0 };
    expenses.forEach((e) => {
      if (counts[e.expense_status] !== undefined) counts[e.expense_status] += 1;
    });
    return counts;
  }, [expenses]);

  const filteredExpenses = expenses.filter(
    (e) => e.expense_status === activeTab,
  );

  const openExpenseModal = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const closeExpenseModal = () => {
    setIsModalOpen(false);
    // Slight delay so the dialog's own close animation doesn't visibly
    // clear the content mid-transition.
    setTimeout(() => setSelectedExpense(null), 150);
  };

  /**
   * Updates status via the API, then patches the record in local
   * state directly (no refetch). Because totals, tabCounts, and
   * filteredExpenses are all derived from `expenses` via useMemo/filter,
   * this single setExpenses call is what makes the top summary card,
   * the tab counts, and the Review/Approved/Rejected tab membership
   * all update immediately — no page reload.
   */
  const handleStatusChange = async (expense, newStatus) => {
    setUpdatingId(expense.id);
    try {
      await expenseService.updateExpense(expense.id, {
        expense_status: newStatus,
      });
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === expense.id ? { ...e, expense_status: newStatus } : e,
        ),
      );
      toast.success(`Expense ${newStatus.toLowerCase()}`);
      closeExpenseModal();
    } catch (e) {
      console.error("Failed to update expense status", e);
    } finally {
      setUpdatingId(null);
    }
  };

  // ---- Export helpers (unchanged logic, still reflect current tab) ----
  const buildExportRows = useCallback(() => {
    return filteredExpenses.map((e) => {
      const info = getEmployeeInfo(e);
      return {
        Employee: info.name,
        Email: info.email,
        Role: info.role,
        Department: info.department,
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
      };
    });
  }, [filteredExpenses, getEmployeeInfo]);

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
      "Role",
      "Department",
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
      { wch: 22 },
      { wch: 26 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 45 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, buildExportFileName("xlsx"));
    toast.success("Exported as Excel");
    setShowExportOptions(false);
  }, [filteredExpenses, buildExportRows, buildExportFileName]);

  const periodLabel = `1 Jan ${new Date().getFullYear()} - 30 Dec ${new Date().getFullYear()}`;

  return (
    <MainLayout>
      {isLoading ? (
        <ExpenseSkeleton />
      ) : (
        <div className="min-w-0 overflow-x-hidden p-4 md:p-6">
          {/* Purple summary banner — unchanged */}
          <div className="relative rounded-2xl bg-gradient-to-br from-instattend-500 to-instattend-700 p-6 sm:p-8 mb-6 overflow-hidden">
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Expense Summary
                </h1>
                <p className="text-instattend-100 mt-1">
                  Claim your expenses here
                </p>
              </div>
              <div className="hidden sm:flex h-14 w-14 rounded-full bg-white/15 items-center justify-center flex-shrink-0">
                <Receipt className="h-7 w-7 text-white" />
              </div>
            </div>

            <Card className="relative z-10 mt-6 border-none shadow-lg">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-gray-800">
                  Total Expense
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Period {periodLabel}
                </p>
                {/* Now 4 columns — Total / Review / Approved / Rejected — so
                the rejected bucket is accounted for in the balance count,
                not just implied by (total - review - approved). */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 min-w-0">
                    <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium mb-1 truncate">
                      <Receipt className="h-3.5 w-3.5 text-instattend-500 shrink-0" />{" "}
                      Total
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                      ₹{totals.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 min-w-0">
                    <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium mb-1 truncate">
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500 inline-block shrink-0" />{" "}
                      Review
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                      ₹{totals.review.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 min-w-0">
                    <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium mb-1 truncate">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block shrink-0" />{" "}
                      Approved
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                      ₹{totals.approved.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 min-w-0">
                    <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium mb-1 truncate">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block shrink-0" />{" "}
                      Rejected
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                      ₹{totals.rejected.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status tabs — unchanged styling, counts now live from state */}
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
                  <span
                    className={`ml-1.5 text-xs ${
                      activeTab === tab.key
                        ? "text-instattend-100"
                        : "text-gray-400"
                    }`}
                  >
                    ({tabCounts[tab.key] ?? 0})
                  </span>
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

              {/* Export dropdown — unchanged */}
              <div className="relative inline-block text-left" ref={exportRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportOptions((prev) => !prev)}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 shadow-sm transition-all text-sm sm:text-base font-medium"
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
            <CardContent className="p-0 sm:p-0">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No Expenses Logged
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    There are no expenses listed under this status filter for
                    the selected tracking period.
                  </p>
                </div>
              ) : (
                <div className="rounded-b-lg overflow-hidden border-t border-gray-100">
                  <ExpenseRowHeader />
                  {filteredExpenses.map((expense) => (
                    <ExpenseRow
                      key={expense.id}
                      expense={expense}
                      employeeInfo={getEmployeeInfo(expense)}
                      onClick={() => openExpenseModal(expense)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Row-click detail modal — carries Approve/Reject for Pending claims */}
      <ExpenseProfileModal
        open={isModalOpen}
        onOpenChange={(open) =>
          open ? setIsModalOpen(true) : closeExpenseModal()
        }
        expense={selectedExpense}
        employeeInfo={selectedExpense ? getEmployeeInfo(selectedExpense) : {}}
        isUpdating={updatingId === selectedExpense?.id}
        onApprove={() => handleStatusChange(selectedExpense, "Approved")}
        onReject={() => handleStatusChange(selectedExpense, "Rejected")}
      />
    </MainLayout>
  );
};

export default Expense;
