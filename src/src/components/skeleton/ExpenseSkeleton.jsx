import React from "react";
import { Skeleton } from "../ui/Skeleton.jsx";

export const ExpenseRowsSkeleton = ({ rows = 5 }) => (
  <div className="divide-y divide-gray-100">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5"
      >
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <Skeleton className="h-4 w-1/2 max-w-[220px]" />
          <Skeleton className="h-3 w-1/3 max-w-[160px]" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full shrink-0" />
        <Skeleton className="h-4 w-16 shrink-0" />
      </div>
    ))}
  </div>
);

const ExpenseSkeleton = () => {
  return (
    <div className="p-4 md:p-6">
      {/* Purple summary banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-instattend-500 to-instattend-700 p-6 sm:p-8 mb-6 overflow-hidden">
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 bg-white/20" />
            <Skeleton className="h-4 w-32 bg-white/15" />
          </div>
          <Skeleton className="hidden sm:block h-14 w-14 rounded-full bg-white/15" />
        </div>

        <div className="relative z-10 mt-6 rounded-xl bg-white p-5">
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-3 w-40 mb-4" />
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <Skeleton className="h-11 w-full sm:w-72 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Row list */}
      <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden">
        <ExpenseRowsSkeleton rows={5} />
      </div>
    </div>
  );
};

export default ExpenseSkeleton;
