import React from "react";
import { Skeleton } from "../ui/Skeleton.jsx";

const ApproveRequestSkeleton = () => {
  return (
    <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4"
        >
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-4 w-1/3 max-w-[200px]" />
            <Skeleton className="h-3 w-2/3 max-w-[320px]" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApproveRequestSkeleton;
