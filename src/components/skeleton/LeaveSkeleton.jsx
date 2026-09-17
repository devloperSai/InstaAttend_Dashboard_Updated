import { Calendar } from "lucide-react";
import { Card, CardContent } from "../ui/card";

/**
 * Updated to mirror the new page structure: 4 status-count cards
 * (Total/Pending/Approved/Rejected) instead of leave-type cards, a
 * profile-row list instead of a table, and a balance panel column.
 */
const LeaveSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {["Total Requests", "Pending", "Approved", "Rejected"].map(
          (label, index) => (
            <Card key={index} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mt-1" />
                  </div>
                  <div className="p-3 rounded-full bg-gray-100 text-gray-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Request list */}
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="h-10 w-full max-w-md bg-gray-100 animate-pulse rounded" />
          </div>
          <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 border-b last:border-b-0 border-gray-100"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="h-4 w-1/2 max-w-[200px] bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-1/3 max-w-[150px] bg-gray-100 animate-pulse rounded" />
                </div>
                <div className="hidden sm:block h-6 w-20 bg-gray-100 animate-pulse rounded-full shrink-0" />
                <div className="hidden md:block h-4 w-24 bg-gray-100 animate-pulse rounded shrink-0" />
                <div className="h-6 w-16 bg-gray-100 animate-pulse rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveSkeleton;
