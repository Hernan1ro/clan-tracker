"use client";

import { useMemo } from "react";
import { cn, formatNumber, formatRep } from "@/lib/utils";
import type { ClanData } from "@/lib/types";
import {
  Droplets,
  AlertTriangle,
  TrendingDown,
  Shield,
  Activity,
} from "lucide-react";

interface BleedTrackerProps {
  clans: ClanData[];
  onSelectClan: (clanId: number) => void;
}

export function BleedTracker({ clans, onSelectClan }: BleedTrackerProps) {
  const bleedingClans = useMemo(
    () => clans.filter((c) => c.is_bleeding).sort((a, b) => b.bleed_amount - a.bleed_amount),
    [clans]
  );

  const gainingClans = useMemo(
    () =>
      clans
        .filter((c) => !c.is_bleeding && c.gain_30m > 0)
        .sort((a, b) => b.gain_30m - a.gain_30m)
        .slice(0, 10),
    [clans]
  );

  const totalBleed = useMemo(
    () => bleedingClans.reduce((sum, c) => sum + c.bleed_amount, 0),
    [bleedingClans]
  );

  const totalGaining = useMemo(
    () => gainingClans.reduce((sum, c) => sum + c.gain_30m, 0),
    [gainingClans]
  );

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-500">Bleeding Clans</span>
          </div>
          <p className="text-3xl font-bold text-red-500">{bleedingClans.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Total bleed: <span className="text-red-500 font-mono">-{formatNumber(totalBleed)}</span> rep
          </p>
        </div>

        <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Active Clans</span>
          </div>
          <p className="text-3xl font-bold text-orange-500">{gainingClans.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Total gain (30m): <span className="text-orange-500 font-mono">+{formatNumber(totalGaining)}</span> rep
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Idle Clans</span>
          </div>
          <p className="text-3xl font-bold">
            {clans.length - bleedingClans.length - gainingClans.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">No activity in 30 min</p>
        </div>
      </div>

      {/* Bleeding clans section */}
      <div className="rounded-xl border border-red-500/20 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-semibold text-red-500">
            Clans Bleeding Reputation
          </h3>
        </div>

        {bleedingClans.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="h-10 w-10 mx-auto text-orange-500/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No clans are bleeding reputation right now
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {bleedingClans.map((clan) => (
              <button
                key={clan.id}
                onClick={() => onSelectClan(clan.id)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-red-500/5 transition-colors text-left"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-500/10 shrink-0">
                  <Droplets className="h-5 w-5 text-red-500 animate-bleed" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">#{clan.rank} {clan.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{clan.master}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-red-500">
                    -{formatNumber(clan.bleed_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRep(clan.reputation)} rep
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gaining clans section */}
      <div className="rounded-xl border border-orange-500/20 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-orange-500 rotate-180" />
          <h3 className="text-sm font-semibold text-orange-500">
            Top Gaining Clans (30 min)
          </h3>
        </div>

        <div className="divide-y divide-border/50">
          {gainingClans.map((clan, idx) => {
            const maxGain = gainingClans[0]?.gain_30m || 1;
            const pct = (clan.gain_30m / maxGain) * 100;
            return (
              <button
                key={clan.id}
                onClick={() => onSelectClan(clan.id)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-orange-500/5 transition-colors text-left"
              >
                <span className={cn(
                  "text-sm font-bold w-6",
                  idx === 0 ? "text-amber-500" : "text-muted-foreground"
                )}>
                  #{idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm truncate">
                      #{clan.rank} {clan.name}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold font-mono text-orange-500">
                    +{formatNumber(clan.gain_30m)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
