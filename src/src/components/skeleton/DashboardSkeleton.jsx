import React from "react";

export const DashboardSkeleton = () => {
  return (
    <>
      <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:items-center md:text-left mb-6 gap-4">
        <div>
          <div className="h-6 w-32 rounded mb-2 shimmer"></div>
          <div className="h-4 w-48 rounded shimmer"></div>
        </div>
        <div className="h-8 w-48 rounded-full border border-border/60 shimmer"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border border-border/60 shadow-sm p-6 flex items-start justify-between bg-white rounded-lg"
          >
            <div>
              <div className="h-4 w-24 rounded mb-2 shimmer"></div>
              <div className="h-6 w-16 rounded mb-1 shimmer"></div>
              <div className="h-3 w-20 rounded shimmer"></div>
            </div>
            <div className="p-3 rounded-full border border-border/60 shimmer">
              <div className="h-5 w-5 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="border border-border/60 shadow-sm bg-white rounded-lg overflow-hidden"
          >
            <div className="p-6 border-b border-border/60">
              <div className="h-5 w-40 rounded mb-2 shimmer"></div>
              <div className="h-4 w-32 rounded shimmer"></div>
            </div>
            <div className="h-72 sm:h-80 rounded-b-lg shimmer"></div>
          </div>
        ))}
      </div>
    </>
  );
};
