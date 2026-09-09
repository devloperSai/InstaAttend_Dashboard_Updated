const TableRow = ({ emp, status }) => {
    return (
        <tr className="border-t hover:bg-gray-50">
            <td className="px-4 py-2">{emp.name}</td>
            <td className="px-4 py-2">{emp.designation}</td>
            <td className="px-4 py-2">{emp.department}</td>
            <td className="px-4 py-2">{emp.date}</td>
            <td className="px-4 py-2">{emp.inTime}</td>
            <td className="px-4 py-2">{emp.inLocation}</td>
            <td className="px-4 py-2">{emp.outTime}</td>
            <td className="px-4 py-2">{emp.outLocation}</td>
            <td className="px-4 py-2">{emp.workHours}</td>
            <td className="px-4 py-2">
                <StatusChip status={status} />
            </td>
        </tr>
    );
};

export default TableRow;
