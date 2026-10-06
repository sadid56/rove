import React, { type ComponentProps } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "../utils";

export function Breadcrumb({ className, ...props }: ComponentProps<"nav">) {
  return <nav aria-label='breadcrumb' className={cn("flex", className)} {...props} />;
}

export function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground break-words", className)} {...props} />
  );
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

export interface BreadcrumbLinkProps extends ComponentProps<"a"> {
  asChild?: boolean;
}

export function BreadcrumbLink({ className, asChild = false, children, ...props }: BreadcrumbLinkProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: cn("transition-colors hover:text-foreground font-medium cursor-pointer", className, (children.props as any).className),
      ...props,
    });
  }
  return (
    <a className={cn("transition-colors hover:text-foreground font-medium cursor-pointer", className)} {...props}>
      {children}
    </a>
  );
}

export function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) {
  return (
    <span role='link' aria-disabled='true' aria-current='page' className={cn("font-semibold text-foreground", className)} {...props} />
  );
}

export function BreadcrumbSeparator({ children, className, ...props }: ComponentProps<"li">) {
  return (
    <li role='presentation' aria-hidden='true' className={cn("text-muted-foreground/60 select-none text-xs", className)} {...props}>
      {children ?? "/"}
    </li>
  );
}

export function BreadcrumbEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      role='presentation'
      aria-hidden='true'
      className={cn("flex h-6 w-6 items-center justify-center text-muted-foreground", className)}
      {...props}
    >
      <MoreHorizontal className='w-4 h-4' />
      <span className='sr-only'>More</span>
    </span>
  );
}
