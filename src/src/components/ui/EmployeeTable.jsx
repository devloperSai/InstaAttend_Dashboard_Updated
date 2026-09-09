//updated code
import React from "react";
import { Edit, Trash } from "lucide-react";

const EmployeeTable = ({
  employees,
  onEdit,
  onDelete,
  currentPage,
  setCurrentPage,
  recordsPerPage,
}) => {
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = employees.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(employees.length / recordsPerPage);

  return (
    <div className="bg-white rounded shadow">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-white text-left">
            <tr>
              <th className="p-3 text-gray-500">Name</th>
              <th className="p-3 text-gray-500">Email</th>
              <th className="p-3 text-gray-500">Phone</th>
              <th className="p-3 text-gray-500">Designation</th>
              <th className="p-3 text-gray-500">Department</th>
              <th className="p-3 text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  No employees found.
                </td>
              </tr>
            ) : (
              currentRecords.map((emp, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">{emp.username}</td>
                  <td className="p-3">{emp.email}</td>
                  <td className="p-3">{emp.phone_number}</td>
                  <td className="p-3">{emp.designation?.designation_name || "N/A"}</td>
                  <td className="p-3">{emp.department?.department_name || "N/A"}</td>
                  <td className="p-3 flex gap-6">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => onEdit(emp)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800" onClick={() => onDelete(emp)}>
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end p-4 text-sm space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-2 text-gray-500"
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setCurrentPage(n)}
            className={`px-3 py-1 rounded ${currentPage === n ? "bg-instattend-100 text-instattend-700" : "hover:bg-gray-100"}`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-2 text-gray-500"
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default EmployeeTable;