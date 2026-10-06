"use client";

import React, { type ReactNode, useEffect, useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "../utils";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  side?: "right" | "left";
  className?: string;
  headerAction?: ReactNode;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = "right",
  className,
  headerAction,
}: SheetProps) {
  const [mounted, setMounted] = useState(isOpen);
  const [active, setActive] = useState(false);
  const isClosingRef = useRef(false);

  const startClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setActive(false);
    setTimeout(() => {
      onClose();
      setMounted(false);
      isClosingRef.current = false;
      document.body.style.overflow = "unset";
    }, 280);
  }, [onClose]);

  useEffect(() => {
    let animId: number;
    let timer: ReturnType<typeof setTimeout>;

    if (isOpen) {
      isClosingRef.current = false;
      setMounted(true);
      document.body.style.overflow = "hidden";
      // Double rAF ensures DOM paint before transition kicks in
      animId = requestAnimationFrame(() => {
        animId = requestAnimationFrame(() => {
          setActive(true);
        });
      });
      return () => cancelAnimationFrame(animId);
    } else if (mounted && !isClosingRef.current) {
      isClosingRef.current = true;
      setActive(false);
      timer = setTimeout(() => {
        setMounted(false);
        isClosingRef.current = false;
        document.body.style.overflow = "unset";
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isClosingRef.current) {
        startClose();
      }
    };
    if (mounted) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [mounted, isOpen, startClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300 ease-out",
          active ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={startClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col h-full w-full max-w-2xl bg-[#0f1015] border-border/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]",
          side === "right"
            ? "right-0 border-l"
            : "left-0 border-r",
          side === "right"
            ? active
              ? "translate-x-0"
              : "translate-x-full"
            : active
              ? "translate-x-0"
              : "-translate-x-full",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border/70 bg-[#12131a]/80 backdrop-blur-md">
          <div className="space-y-1 pr-4 flex-1">
            {typeof title === "string" ? (
              <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
            ) : (
              title
            )}
            {typeof description === "string" ? (
              <p className="text-xs text-muted-foreground/90">{description}</p>
            ) : (
              description
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerAction}
            <button
              onClick={startClose}
              type="button"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-transparent hover:border-border/60 transition-all active:scale-95 cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
}
