import React from "react";
import { Skeleton } from "../ui/Skeleton.jsx";

const CalendarSkeleton = () => {
  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/60 bg-white/60 p-4 flex items-center gap-3"
          >
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-white/60 bg-white/60 p-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Upcoming holidays panel */}
        <div className="rounded-xl border border-white/60 bg-white/60 p-4 space-y-4">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarSkeleton;
