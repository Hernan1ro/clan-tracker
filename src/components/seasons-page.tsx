"use client";

import { useState, useEffect } from "react";
import { formatRep } from "@/lib/utils";
import type { ApiSeason, ClanData } from "@/lib/types";
import { Calendar, Clock } from "lucide-react";

function SeasonCountdown({ endTimestamp }: { endTimestamp: number }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const diff = endTimestamp * 1000 - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTimestamp]);

  return (
    <span className="font-mono font-bold tabular-nums text-sm">{timeLeft}</span>
  );
}

interface SeasonsPageProps {
  season: ApiSeason | null;
  clans: ClanData[];
  onSelectClan: (clanId: number) => void;
}

export function SeasonsPage({ season, clans, onSelectClan }: SeasonsPageProps) {
  const [now] = useState(() => Date.now());

  if (!season) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No season data available yet
      </div>
    );
  }

  const isActive = season.end_time_ts * 1000 > now;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Season Info</h2>

      {/* Current season card */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{season.name}</span>
              {isActive && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {season.start_time} → {season.end_time}
            </p>
          </div>
        </div>

        {isActive && (
          <div className="mt-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Ends in:</span>
            <SeasonCountdown endTimestamp={season.end_time_ts} />
          </div>
        )}
      </div>

      {/* Season ranking */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Season Ranking — {season.name}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="px-4 py-3 text-xs font-bold text-left text-foreground">Rank</th>
                <th className="px-4 py-3 text-xs font-bold text-left text-primary">Name</th>
                <th className="px-4 py-3 text-xs font-bold text-left text-foreground">Master</th>
                <th className="px-4 py-3 text-xs font-bold text-left text-foreground hidden sm:table-cell">Members</th>
                <th className="px-4 py-3 text-xs font-bold text-left text-foreground">Reputation</th>
              </tr>
            </thead>
            <tbody>
              {clans.map((clan) => (
                <tr
                  key={clan.id}
                  onClick={() => onSelectClan(clan.id)}
                  className="border-b border-border/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-foreground">{clan.rank}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-primary">{clan.name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{clan.master}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{clan.members}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatRep(clan.reputation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
