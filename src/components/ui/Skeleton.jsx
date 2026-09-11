import React from "react";
import { cn } from "../../lib/utils";

/**
 * Base shimmer block. Compose these to build page/section skeletons.
 * Uses the existing `.shimmer` keyframe defined in index.css so every
 * skeleton in the app animates identically.
 */
export const Skeleton = ({ className, ...props }) => (
  <div
    className={cn("rounded-md shimmer", className)}
    aria-hidden="true"
    {...props}
  />
);

export default Skeleton;
