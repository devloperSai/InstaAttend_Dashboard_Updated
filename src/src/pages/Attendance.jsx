import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Search,
  Filter,
  Download,
  Menu,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import StatusChip from "../components/ui/StatusChip.jsx";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { attendanceService } from "../api/services/attendance.service.js";
import * as XLSX from "xlsx";
import AttendanceSkeleton from "../components/skeleton/AttendanceSkeleton.jsx";

const RECORDS_PER_PAGE = 10;

// key = property used for filtering/sorting, label = shown in table + sort dropdown
const TABLE_COLUMNS = [
  { label: "Employee Name", key: "name" },
  { label: "Designation", key: "designation" },
  { label: "Department", key: "department" },
  { label: "Date", key: "date" },
  { label: "In Time", key: "inTime" },
  { label: "In Location", key: "inLocation" },
  { label: "Out Time", key: "outTime" },
  { label: "Out Location", key: "outLocation" },
  { label: "Work Hours", key: "workHours" },
  { label: "Status", key: "status" },
];

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: null,
      endDate: null,
      key: "selection",
    },
    name: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [allAttendance, setAllAttendance] = useState([]); // raw, unfiltered dataset
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const exportRef = useRef();
  const datePickerRef = useRef();

  // IMPORTANT: derived from the full dataset, not the filtered one,
  // so the dropdown options never shrink/disappear once you pick a filter.
  const uniqueNames = useMemo(
    () => [...new Set(allAttendance.map((e) => e.name))].sort(),
    [allAttendance],
  );

  // Count of active filters, shown as a badge on the Date Range button
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange.startDate || filters.dateRange.endDate) count += 1;
    if (filters.name) count += 1;
    if (filters.status) count += 1;
    return count;
  }, [filters]);

  const transformAttendanceData = useCallback((data) => {
    return data.map((emp) => ({
      name: emp.employee_name,
      designation: emp.designation || "N/A",
      department: emp.department || "N/A",
      date: emp.date,
      inTime: emp.check_in_time
        ? format(new Date(emp.check_in_time), "HH:mm")
        : "-",
      inLocation: emp.check_in_location || "-",
      outTime: emp.check_out_time
        ? format(new Date(emp.check_out_time), "HH:mm")
        : "-",
      outLocation: emp.check_out_location || "-",
      workHours: emp.duration || "-",
      status: emp.status || "N/A",
    }));
  }, []);

  // Fetch happens ONCE (and on manual refresh). Filtering/sorting after
  // this is all done client-side, so changing a filter no longer
  // re-hits the API or narrows the dropdown options.
  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await attendanceService.getAll();
      const transformed = transformAttendanceData(result);
      setAllAttendance(transformed);
    } catch (error) {
      console.error("Failed to fetch attendance data", error);
    } finally {
      setIsLoading(false);
    }
  }, [transformAttendanceData]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const filteredBeforeSort = useMemo(() => {
    return allAttendance.filter((emp) => {
      const empDate = new Date(emp.date);
      const from = filters.dateRange.startDate
        ? new Date(filters.dateRange.startDate)
        : null;
      const to = filters.dateRange.endDate
        ? new Date(filters.dateRange.endDate)
        : null;
      if (from) from.setHours(0, 0, 0, 0);
      if (to) to.setHours(23, 59, 59, 999);
      empDate.setHours(12, 0, 0, 0);

      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        [emp.name, emp.department, emp.designation].some((field) =>
          (field || "").toLowerCase().includes(term),
        );
      const matchesDate = (!from || empDate >= from) && (!to || empDate <= to);
      const matchesName = !filters.name || emp.name === filters.name;
      const matchesStatus = !filters.status || emp.status === filters.status;
      return matchesSearch && matchesDate && matchesName && matchesStatus;
    });
  }, [allAttendance, searchTerm, filters]);

  const filteredData = useMemo(() => {
    const { key, direction } = sortConfig;
    if (!key) return filteredBeforeSort;

    return [...filteredBeforeSort].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (key === "date") {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else {
        valA = (valA ?? "").toString().toLowerCase();
        valB = (valB ?? "").toString().toLowerCase();
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredBeforeSort, sortConfig]);

  // Reset to page 1 whenever the visible result set changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown size={12} className="inline ml-1 opacity-30" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={12} className="inline ml-1" />
    ) : (
      <ArrowDown size={12} className="inline ml-1" />
    );
  };

  const { currentRecords, totalPages } = useMemo(() => {
    const indexOfLastRecord = currentPage * RECORDS_PER_PAGE;
    const indexOfFirstRecord = indexOfLastRecord - RECORDS_PER_PAGE;
    const currentRecords = filteredData.slice(
      indexOfFirstRecord,
      indexOfLastRecord,
    );
    const totalPages = Math.ceil(filteredData.length / RECORDS_PER_PAGE);
    return { currentRecords, totalPages };
  }, [currentPage, filteredData]);

  const getPaginationGroup = useCallback(() => {
    const siblingCount = 1;
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "DOTS", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1,
      );
      return [1, "DOTS", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      );
      return [1, "DOTS", ...middleRange, "DOTS", totalPages];
    }
  }, [currentPage, totalPages]);

  // ---- Export logic (unchanged) ----
  const handleExportExcel = useCallback(() => {
    const formattedHeaders = [
      "Date",
      "Employee Name",
      "Department",
      "Designation",
      "Check In",
      "Check Out",
      "Duration (HH:mm)",
      "Status",
      "Location",
    ];

    const rows = filteredData.map((emp) => [
      emp.date ? format(new Date(emp.date), "yyyy-MM-dd") : "N/A",
      emp.name,
      emp.department,
      emp.designation,
      emp.inTime !== "-" ? emp.inTime : "N/A",
      emp.outTime !== "-" ? emp.outTime : "N/A",
      emp.workHours !== "-" ? emp.workHours : "00:00",
      emp.status,
      emp.inLocation !== "-" ? emp.inLocation : "N/A",
    ]);

    const worksheetData = [formattedHeaders, ...rows];
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
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Records");

    let fileName = "attendance";
    const parts = [];

    if (filters.name) {
      parts.push(filters.name.replace(/\s+/g, "-"));
    }

    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      const startStr = format(
        new Date(filters.dateRange.startDate),
        "dd-MM-yyyy",
      );
      const endStr = format(new Date(filters.dateRange.endDate), "dd-MM-yyyy");
      parts.push(`${startStr}_${endStr}`);
    }

    if (parts.length > 0) {
      fileName = `Attendance_${parts.join("_")}`;
    }

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    setShowExportOptions(false);
  }, [filteredData, filters]);

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF("l", "mm", "a4");
    let title = "Attendance Report";
    if (filters.dateRange.startDate || filters.dateRange.endDate) {
      const start = filters.dateRange.startDate
        ? format(new Date(filters.dateRange.startDate), "dd MMM yyyy")
        : "Start";
      const end = filters.dateRange.endDate
        ? format(new Date(filters.dateRange.endDate), "dd MMM yyyy")
        : "End";
      title += ` (${start} to ${end})`;
    }
    doc.text(title, 14, 15);
    const tableRows = filteredData.map((emp) => [
      emp.name,
      emp.designation,
      emp.department,
      emp.date,
      emp.inTime,
      emp.inLocation,
      emp.outTime,
      emp.outLocation,
      emp.workHours,
      emp.status,
    ]);
    autoTable(doc, {
      head: [TABLE_COLUMNS.map((c) => c.label)],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    });
    doc.save("attendance.pdf");
    setShowExportOptions(false);
  }, [filteredData, filters.dateRange]);

  const handleDateRangeChange = (item) =>
    setFilters((prev) => ({ ...prev, dateRange: item.selection }));

  const formatDateRangeDisplay = () => {
    if (!filters.dateRange.startDate && !filters.dateRange.endDate)
      return "Select Date Range";
    const start = filters.dateRange.startDate
      ? format(new Date(filters.dateRange.startDate), "dd MMM yyyy")
      : "";
    const end = filters.dateRange.endDate
      ? format(new Date(filters.dateRange.endDate), "dd MMM yyyy")
      : "";
    return `${start} - ${end}`;
  };

  const clearDateRange = () =>
    setFilters((prev) => ({
      ...prev,
      dateRange: { startDate: null, endDate: null, key: "selection" },
    }));

  const clearAllFilters = () => {
    setFilters({
      dateRange: { startDate: null, endDate: null, key: "selection" },
      name: "",
      status: "",
    });
    setSearchTerm("");
    setSortConfig({ key: "date", direction: "desc" });
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target))
        setShowExportOptions(false);
      if (datePickerRef.current && !datePickerRef.current.contains(e.target))
        setShowDatePicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <MainLayout>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Attendance Management
            </h2>
            <p className="text-sm text-gray-500">
              Track and manage employee daily attendance
            </p>
          </div>
          <button
            className="md:hidden p-2 bg-white rounded-lg border shadow-sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Inline filter bar — matches the reference design:
            Search | Date Range | Employee | Status | Clear All ..... Export */}
        <div
          className={`md:flex flex-wrap gap-3 items-center mb-6 ${showMobileMenu ? "flex flex-col" : "hidden md:flex"}`}
        >
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-instattend-500 outline-none transition-all"
            />
          </div>

          {/* Date Range */}
          <div className="relative w-full md:w-auto" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePicker((prev) => !prev)}
              className="flex items-center justify-between gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg w-full md:w-auto hover:bg-gray-50 transition-colors text-sm text-gray-600 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Filter size={14} />
                {formatDateRangeDisplay()}
              </span>
              {filters.dateRange.startDate && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDateRange();
                  }}
                  className="hover:text-red-500 text-lg leading-none"
                >
                  &times;
                </span>
              )}
            </button>
            {showDatePicker && (
              <div className="absolute z-50 mt-2 bg-white border rounded-xl shadow-2xl overflow-hidden">
                <DateRange
                  editableDateInputs={true}
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  ranges={[filters.dateRange]}
                  maxDate={new Date()}
                />
              </div>
            )}
          </div>

          {/* Employee */}
          <select
            className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-instattend-500 w-full md:w-auto shadow-sm text-gray-600"
            value={filters.name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
          >
            <option value="">All Employees</option>
            {uniqueNames.map((name, i) => (
              <option key={i} value={name}>
                {name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-instattend-500 w-full md:w-auto shadow-sm text-gray-600"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
          </select>

          {/* Clear All */}
          {activeFilterCount > 0 || searchTerm ? (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-instattend-600 font-medium px-1"
            >
              Clear All
            </button>
          ) : (
            <span className="text-sm text-gray-300 font-medium px-1 select-none">
              Clear All
            </span>
          )}

          {/* Export - pill button pinned to the right */}
          <div className="relative ml-auto w-full md:w-auto" ref={exportRef}>
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center justify-center gap-2 bg-instattend-600 text-white px-5 py-2 rounded-full w-full md:w-auto font-medium hover:bg-instattend-700 shadow-sm transition-all"
            >
              <Download size={16} />
              Export
            </button>
            {showExportOptions && (
              <div className="absolute right-0 z-20 mt-2 w-48 bg-white border rounded-lg shadow-xl py-1">
                <button
                  onClick={handleExportExcel}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Export as Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <AttendanceSkeleton />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  {TABLE_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key)}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer select-none hover:text-instattend-600 transition-colors"
                    >
                      {column.label}
                      {renderSortIcon(column.key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.length}
                      className="px-6 py-12 text-center text-gray-400 italic"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((attendance, idx) => (
                    <tr
                      key={`${attendance.name}-${attendance.date}-${idx}`}
                      className="hover:bg-instattend-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-instattend-600">
                          {attendance.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {attendance.designation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                        {attendance.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {format(new Date(attendance.date), "dd MMM, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-50/50">
                        {attendance.inTime}
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-gray-500 max-w-[150px] truncate"
                        title={attendance.inLocation}
                      >
                        {attendance.inLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-50/50">
                        {attendance.outTime}
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-gray-500 max-w-[150px] truncate"
                        title={attendance.outLocation}
                      >
                        {attendance.outLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                        {attendance.workHours}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusChip status={attendance.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white rounded-b-xl">
                <div className="hidden sm:block text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * RECORDS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * RECORDS_PER_PAGE,
                      filteredData.length,
                    )}
                  </span>{" "}
                  of <span className="font-medium">{filteredData.length}</span>{" "}
                  results
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-all"
                  >
                    &lt;
                  </button>
                  {getPaginationGroup().map((item, index) =>
                    item === "DOTS" ? (
                      <span
                        key={`dots-${index}`}
                        className="px-2 text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${currentPage === item ? "bg-instattend-600 text-white border-instattend-600 shadow-md" : "text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-all"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Attendance;
