"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon, Swords, Menu } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border backdrop-blur-sm px-4 bg-[#DF8F39]">
      <button
        onClick={onMenuToggle}
        className="md:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 md:hidden">
        <Swords className="h-5 w-5 text-primary" />
        <span className="text-sm font-bold">Ninja Saga CW</span>
      </div>

      {title && (
        <h1 className="hidden md:block text-lg font-semibold">{title}</h1>
      )}

      {/* <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div> */}
    </header>
  );
}
