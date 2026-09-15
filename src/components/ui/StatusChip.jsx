// Status colors are driven by the attendance palette tokens
// (present / late / absent / on-leave / holiday / pending).
const statusStyles = {
  Present: "bg-status-present/10 text-status-present border-status-present/25",
  Absent: "bg-status-absent/10 text-status-absent border-status-absent/25",
  Late: "bg-status-late/10 text-status-late border-status-late/25",
  "On Leave": "bg-status-leave/10 text-status-leave border-status-leave/25",
  Leave: "bg-status-leave/10 text-status-leave border-status-leave/25",
  Holiday: "bg-status-holiday/10 text-status-holiday border-status-holiday/25",
  Pending: "bg-status-pending/10 text-status-pending border-status-pending/25",
};

const StatusChip = ({ status }) => {
  const style =
    statusStyles[status] ||
    "bg-status-pending/10 text-status-pending border-status-pending/25";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap transition-all duration-300 ease-smooth hover:scale-[1.04] hover:shadow-soft ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};

export default StatusChip;
