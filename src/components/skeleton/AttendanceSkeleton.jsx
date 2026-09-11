import React from "react";
import { Skeleton } from "../ui/Skeleton.jsx";

const AttendanceSkeleton = () => {
  return (
    <div>
      {/* Filter bar */}
      <div className="hidden md:flex flex-wrap gap-3 items-center mb-6">
        <Skeleton className="h-10 w-full md:w-64" />
        <Skeleton className="h-10 w-full md:w-44" />
        <Skeleton className="h-10 w-full md:w-40" />
        <Skeleton className="h-10 w-full md:w-40" />
        <Skeleton className="h-9 w-24 ml-auto rounded-full" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <div className="hidden sm:grid grid-cols-10 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-3/4" />
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 8 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-2 sm:grid-cols-10 gap-4 px-6 py-4"
            >
              {Array.from({ length: 10 }).map((__, col) => (
                <Skeleton
                  key={col}
                  className={`h-4 ${col > 1 ? "hidden sm:block" : ""} w-full`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSkeleton;
