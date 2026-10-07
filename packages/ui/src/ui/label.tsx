import type { ComponentProps } from "react";
import { cn } from "../utils";

export interface LabelProps extends ComponentProps<"label"> {
  required?: boolean;
}

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={cn("block text-xs font-medium text-foreground select-none", className)}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}
