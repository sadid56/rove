import React from "react";
import { cn } from "../utils";

export interface RoveIconProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg" | "xl" | number;
  withContainer?: boolean;
}

const SIZE_MAP = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
};

export function RoveIcon({
  size = "md",
  withContainer = false,
  className,
  ...props
}: RoveIconProps) {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 32;

  if (withContainer) {
    return (
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 select-none", className)}
        {...props}
      >
        <defs>
          <linearGradient id="rove-icon-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="rove-cyan-grad" x1="18" y1="20" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <linearGradient id="rove-bg-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
          <radialGradient id="rove-radar-glow" cx="22" cy="18" r="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle Shell */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="11"
          fill="url(#rove-bg-grad)"
          stroke="#27272a"
          strokeWidth="1.5"
        />

        {/* Ambient Radar Glow */}
        <circle cx="22" cy="18" r="12" fill="url(#rove-radar-glow)" />

        {/* Radar Telemetry Sweep Rings */}
        <path
          d="M23 11C27.4183 11 31 14.5817 31 19"
          stroke="#818cf8"
          strokeWidth="1"
          strokeOpacity="0.3"
          strokeDasharray="2 2"
        />
        <path
          d="M21 14C23.7614 14 26 16.2386 26 19"
          stroke="#38bdf8"
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* Monogram R - Vertical Stem */}
        <rect
          x="10.5"
          y="10"
          width="4.5"
          height="20"
          rx="2.25"
          fill="url(#rove-icon-grad)"
        />

        {/* Monogram R - Sweep Loop */}
        <path
          d="M13 11H21.5C24.8137 11 27.5 13.6863 27.5 17C27.5 20.3137 24.8137 23 21.5 23H14"
          stroke="url(#rove-icon-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Monogram R - Dynamic Radar Probe Leg */}
        <path
          d="M19.5 22L27 29.5"
          stroke="url(#rove-cyan-grad)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Telemetry Focus Node */}
        <circle cx="20.5" cy="17" r="1.75" fill="#38bdf8" />
      </svg>
    );
  }

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      {...props}
    >
      <defs>
        <linearGradient id="rove-flat-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="rove-flat-leg" x1="15" y1="18" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>

      {/* Radar sweep arcs */}
      <path
        d="M19 6C23.9706 6 28 10.0294 28 15"
        stroke="#818cf8"
        strokeWidth="1"
        strokeOpacity="0.3"
        strokeDasharray="2 2"
      />
      <path
        d="M17 9.5C20.0376 9.5 22.5 11.9624 22.5 15"
        stroke="#38bdf8"
        strokeWidth="1"
        strokeOpacity="0.5"
      />

      {/* Stem */}
      <rect
        x="5"
        y="5"
        width="4.5"
        height="22"
        rx="2.25"
        fill="url(#rove-flat-grad)"
      />

      {/* Upper Loop */}
      <path
        d="M7.5 6H17C20.866 6 24 9.13401 24 13C24 16.866 20.866 20 17 20H8.5"
        stroke="url(#rove-flat-grad)"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dynamic Leg */}
      <path
        d="M15 19L24 27"
        stroke="url(#rove-flat-leg)"
        strokeWidth="4.2"
        strokeLinecap="round"
      />

      {/* Pulse Center */}
      <circle cx="16" cy="13" r="1.8" fill="#38bdf8" />
    </svg>
  );
}

export interface RoveLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  withContainer?: boolean;
  showText?: boolean;
  subtitle?: string | false;
  className?: string;
}

export function RoveLogo({
  size = "md",
  withContainer = true,
  showText = true,
  subtitle = "QA Intelligence",
  className,
}: RoveLogoProps) {
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const iconSizes = {
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
    xl: "xl" as const,
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <RoveIcon size={iconSizes[size]} withContainer={withContainer} />
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-black tracking-tight text-foreground",
              textSizes[size]
            )}
          >
            ROVE
          </span>
          {subtitle && (
            <span className="text-[10px] tracking-wider text-muted-foreground uppercase mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
