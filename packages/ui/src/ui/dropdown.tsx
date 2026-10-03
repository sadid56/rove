"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../utils";

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a <Dropdown>");
  }
  return context;
}

export function Dropdown({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider
      value={{ isOpen, setIsOpen, close: () => setIsOpen(false) }}
    >
      <div ref={dropdownRef} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isOpen, setIsOpen } = useDropdown();

  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className={cn("cursor-pointer select-none inline-flex items-center", className)}
      aria-haspopup="true"
      aria-expanded={isOpen}
    >
      {children}
    </div>
  );
}

export function DropdownMenu({
  children,
  align = "right",
  className,
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const { isOpen } = useDropdown();

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[12rem] rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100",
        align === "right" ? "right-0" : "left-0",
        className
      )}
      role="menu"
    >
      {children}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon,
  variant = "default",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}) {
  const { close } = useDropdown();

  const handleClick = () => {
    onClick?.();
    close();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left select-none cursor-pointer",
        variant === "default"
          ? "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          : "text-destructive hover:bg-destructive/15 hover:text-destructive",
        className
      )}
    >
      {icon && <span className="text-current opacity-80">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function DropdownSeparator({
  className,
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("my-1 h-px bg-border -mx-1", className)}
      role="separator"
    />
  );
}
