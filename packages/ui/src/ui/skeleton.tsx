import type { ComponentProps } from "react";
import { cn } from "../utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-secondary/80",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent before:animate-shimmer",
        className,
      )}
      {...props}
    />
  );
}
