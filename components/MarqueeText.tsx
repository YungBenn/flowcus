"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface MarqueeTextProps {
  text: string;
  className?: string;
  /** When false, long text stays static (truncated) instead of scrolling. */
  active?: boolean;
  /** Scroll mask: fade both edges (default), trailing edge only, or none. */
  fade?: "both" | "end" | "none";
}

const SCROLL_MASK = {
  both: "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
  end: "[mask-image:linear-gradient(to_right,black,black_93%,transparent)]",
} as const;

export function MarqueeText({
  text,
  className,
  active = true,
  fade = "both",
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [segmentWidth, setSegmentWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const segment = measureRef.current;
      if (!container || !segment) return;

      const width = segment.scrollWidth;
      const overflow = width - container.clientWidth;
      setSegmentWidth(width);
      setShouldScroll(overflow > 2);
    };

    measure();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [text]);

  const duration = Math.max(12, segmentWidth / 36);
  const scroll = shouldScroll && active;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-w-0 w-full overflow-hidden",
        scroll && fade !== "none" && SCROLL_MASK[fade],
      )}
    >
      <span
        ref={measureRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute whitespace-nowrap text-[13px] font-medium opacity-0",
          className,
        )}
      >
        {text}
      </span>

      {scroll ? (
        <div
          className="flex w-max animate-[marquee-loop_var(--marquee-duration)_linear_infinite]"
          style={
            {
              "--marquee-duration": `${duration}s`,
            } as CSSProperties
          }
        >
          <span
            className={cn(
              "inline-block shrink-0 whitespace-nowrap pr-10 text-[13px] font-medium text-foreground",
              className,
            )}
          >
            {text}
          </span>
          <span
            aria-hidden
            className={cn(
              "inline-block shrink-0 whitespace-nowrap pr-10 text-[13px] font-medium text-foreground",
              className,
            )}
          >
            {text}
          </span>
        </div>
      ) : (
        <span
          className={cn(
            "block truncate text-[13px] font-medium text-foreground",
            className,
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
}
