"use client";

import React, { memo, useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { NavChildItem, NavItem } from "./types";
import { isPathActive } from "./nav-data";
import { SidebarBadge } from "./sidebar-badge";
import { ITEM_ROW_BASE, SidebarNavItem } from "./sidebar-item";

const EASE_OUT: [number, number, number, number] = [0.05, 0.7, 0.1, 1];

export const SidebarNavGroup = memo(function SidebarNavGroup({
  item,
  pathname,
  isOpen,
  onToggle,
  onClose,
}: {
  item: NavItem & { children: NavChildItem[] };
  pathname: string;
  isOpen: boolean;
  onToggle: (label: string) => void;
  onClose?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const Icon = item.icon;
  const hasActiveChild = item.children.some((c) => isPathActive(pathname, c.href));

  return (
    <div>
      <button
        type='button'
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => onToggle(item.label)}
        className={cn(
          ITEM_ROW_BASE,
          "h-10 cursor-pointer hover:bg-accent",
          hasActiveChild ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span className='flex min-w-0 items-center gap-3'>
          <Icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-colors",
              hasActiveChild ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
            )}
          />
          <span className='truncate'>{item.label}</span>
        </span>

        <span className='flex shrink-0 items-center gap-2'>
          {item.badge && <SidebarBadge variant={item.badgeVariant ?? "info"}>{item.badge}</SidebarBadge>}
          <motion.span
            aria-hidden
            className='flex'
            initial={false}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30 }}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-colors",
                hasActiveChild ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
              )}
            />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            key='panel'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    height: { duration: 0.32, ease: EASE_OUT },
                    opacity: { duration: 0.2, ease: "easeOut" },
                  }
            }
            className='overflow-hidden'
          >
            <div className='ml-[22px] mt-1 space-y-0.5 border-l-2 border-foreground/[0.08] pl-2'>
              {item.children.map((child, i) => (
                <motion.div
                  key={child.href}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.22,
                    ease: EASE_OUT,
                    delay: reduceMotion ? 0 : 0.03 * i,
                  }}
                >
                  <SidebarNavItem {...child} compact active={isPathActive(pathname, child.href)} onClose={onClose} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
