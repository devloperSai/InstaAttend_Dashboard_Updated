import React from "react";
import { Skeleton } from "../ui/Skeleton.jsx";

const SettingsSkeleton = () => {
  return (
    <div className="px-2 sm:px-0">
      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-md" />
        ))}
      </div>

      {/* Card */}
      <div className="rounded-xl border border-white/60 bg-white/60 p-4 sm:p-6">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-3 w-64 mb-6" />

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default SettingsSkeleton;
