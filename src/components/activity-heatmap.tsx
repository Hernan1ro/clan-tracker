"use client";

import { cn } from "@/lib/utils";
import type { HeatmapCell } from "@/lib/mock-data";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface ActivityHeatmapProps {
  data: HeatmapCell[];
}

function getColor(value: number, max: number): string {
  if (max === 0) return "bg-muted";
  const pct = value / max;
  if (pct === 0) return "bg-muted";
  if (pct < 0.25) return "bg-emerald-500/20";
  if (pct < 0.5) return "bg-emerald-500/40";
  if (pct < 0.75) return "bg-emerald-500/60";
  return "bg-emerald-500";
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const maxVal = Math.max(...data.map((c) => c.value), 1);

  const grid: Record<string, number> = {};
  for (const cell of data) {
    grid[`${cell.day}-${cell.hour}`] = cell.value;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Hour labels */}
        <div className="flex ml-10 mb-1">
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex-1 text-center text-[9px] text-muted-foreground"
            >
              {h % 3 === 0 ? `${String(h).padStart(2, "0")}` : ""}
            </div>
          ))}
        </div>

        {/* Rows */}
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex items-center gap-1 mb-0.5">
            <span className="w-9 text-[10px] text-muted-foreground text-right pr-1">
              {day}
            </span>
            <div className="flex flex-1 gap-[2px]">
              {HOURS.map((hour) => {
                const val = grid[`${dayIdx}-${hour}`] || 0;
                return (
                  <div
                    key={hour}
                    className={cn(
                      "flex-1 h-4 rounded-sm transition-colors cursor-default",
                      getColor(val, maxVal)
                    )}
                    title={`${day} ${String(hour).padStart(2, "0")}:00 — ${val}`}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 ml-10">
          <span className="text-[10px] text-muted-foreground">Less</span>
          <div className="flex gap-[2px]">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500/20" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500/40" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          </div>
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}
