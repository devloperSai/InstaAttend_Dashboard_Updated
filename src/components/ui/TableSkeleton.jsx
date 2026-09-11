// src/components/ui/EmployeeTableSkeleton.jsx
import React from "react";

const EmployeeTableSkeleton = () => {
    const rows = Array.from({ length: 10 });

    return (
        <div className="overflow-x-auto bg-white rounded shadow animate-pulse">
            <table className="min-w-full table-auto">
                <thead>
                <tr>
                    {["Name", "Email", "Phone", "Designation", "Department", "Actions"].map((header) => (
                        <th key={header} className="p-3 text-gray-500">{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {rows.map((_, idx) => (
                    <tr key={idx} className="border-t">
                        {Array.from({ length: 6 }).map((__, i) => (
                            <td key={i} className="p-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeTableSkeleton;
