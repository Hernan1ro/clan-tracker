"use client";

import { cn } from "@/lib/utils";
import type { Page } from "./sidebar";
import {
  Trophy,
  Flame,
  Calendar,
  BarChart3,
  Globe,
  Users,
  X,
  Swords,
} from "lucide-react";

const navItems: { page: Page; icon: React.ElementType; label: string }[] = [
  { page: "ranking", icon: Trophy, label: "Clan Ranking" },
  { page: "members", icon: Users, label: "Member Analysis" },
  { page: "bleed", icon: Flame, label: "Bleed Tracker" },
  { page: "seasons", icon: Calendar, label: "Seasons" },
  { page: "global", icon: Globe, label: "Global Ranking" },
  { page: "projection", icon: BarChart3, label: "Projection" },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function MobileNav({
  open,
  onClose,
  currentPage,
  onNavigate,
}: MobileNavProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border md:hidden animate-in slide-in-from-left duration-200" style={{ backgroundColor: "var(--nav-bg, #DF8F39)" }}>
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <Swords className="h-6 w-6 text-[#2d2416]" />
          <span className="text-sm font-bold tracking-tight text-[#2d2416]">
            Ninja Saga CW
          </span>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-md hover:bg-[#c47e2e] transition-colors text-[#2d2416]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#4F3614] text-white"
                    : "text-[#2d2416] hover:bg-[#c47e2e] hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
