import React, { useEffect, useState } from "react";

/**
 * Small ring/donut stat (pure CSS conic-gradient, no chart lib needed).
 * `percentage` and `value` should always be passed with real numbers —
 * callers are expected to fall back to 0 when the backend has no data,
 * rather than this component inventing anything.
 *
 * The ring sweeps from 0 to its target on mount for a lively dashboard feel.
 */
const CircularStat = ({ percentage = 0, color = "#10B981", label, value }) => {
  const safePct = Math.min(100, Math.max(0, Number(percentage) || 0));
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    // animate the sweep + the number over ~900ms
    let frame;
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedPct(safePct * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [safePct]);

  const deg = animatedPct * 3.6;

  return (
    <div className="group flex flex-col items-center animate-count-up">
      <div
        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border border-border transition-transform duration-300 ease-spring group-hover:scale-105"
        style={{
          // was hsl(var(--border)) — too close to white, so an empty
          // ring at 0% looked broken/invisible rather than "empty".
          background: `conic-gradient(${color} ${deg}deg, hsl(var(--muted-foreground) / 0.22) ${deg}deg)`,
          boxShadow: `0 0 0 0 ${color}`,
        }}
      >
        <div className="absolute w-11 h-11 sm:w-14 sm:h-14 bg-card rounded-full border border-border/70 flex items-center justify-center shadow-soft">
          <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums">
            {Math.round(animatedPct)}%
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full transition-transform duration-300 group-hover:scale-125"
          style={{ backgroundColor: color }}
        />
        <span className="text-[11px] sm:text-xs text-muted-foreground">
          {label}
        </span>
      </div>
      <span className="text-xs sm:text-sm font-semibold text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
};

export default CircularStat;
