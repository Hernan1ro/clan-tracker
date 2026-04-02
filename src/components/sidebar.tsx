"use client";

import { cn } from "@/lib/utils";
import {
  Trophy,
  Swords,
  Flame,
  Calendar,
  BarChart3,
  Globe,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type Page =
  | "ranking"
  | "clan"
  | "bleed"
  | "seasons"
  | "global"
  | "projection"
  | "members";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: { page: Page; icon: React.ElementType; label: string }[] = [
  { page: "ranking", icon: Trophy, label: "Clan Ranking" },
  { page: "members", icon: Users, label: "Member Analysis" },
  { page: "bleed", icon: Flame, label: "Bleed Tracker" },
  { page: "seasons", icon: Calendar, label: "Seasons" },
  { page: "global", icon: Globe, label: "Global Ranking" },
  { page: "projection", icon: BarChart3, label: "Projection" },
];

export function Sidebar({
  currentPage,
  onNavigate,
  collapsed,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
        <Swords className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight truncate">
            Ninja Saga CW
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={cn(
                "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Toggle */}
      <div className="border-t border-border p-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
