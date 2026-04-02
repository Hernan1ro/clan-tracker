"use client";

import { useState, useMemo, useEffect } from "react";
import { cn, formatNumber, formatRep } from "@/lib/utils";
import type { ClanData, ApiSeason } from "@/lib/types";
import {
  Flame,
  ChevronUp,
  ChevronDown,
  Search,
  Droplets,
  ArrowUpDown,
  Target,
  CheckCircle2,
} from "lucide-react";

type SortKey =
  | "rank"
  | "reputation"
  | "gain_30m"
  | "gain_1h"
  | "gain_6h"
  | "gain_1d";

function SortHeader({
  label,
  field,
  className,
  sortKey,
  sortAsc,
  onSort,
}: {
  label: string;
  field: SortKey;
  className?: string;
  sortKey: SortKey;
  sortAsc: boolean;
  onSort: (key: SortKey) => void;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none",
        className
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === field ? (
          sortAsc ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </div>
    </th>
  );
}

function GainBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono w-14 text-right">
        {value > 0 ? `+${formatNumber(value)}` : "0"}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-[40px]">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CountdownTimer({ endTimestamp }: { endTimestamp: number }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    function update() {
      const diff = endTimestamp * 1000 - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ days, hours, mins, secs });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTimestamp]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {[
        { val: pad(timeLeft.days), label: "DAYS" },
        { val: pad(timeLeft.hours), label: "HOURS" },
        { val: pad(timeLeft.mins), label: "MIN" },
        { val: pad(timeLeft.secs), label: "SEC" },
      ].map((item, i) => (
        <div key={item.label} className="flex items-center gap-2 sm:gap-3">
          {i > 0 && <span className="text-[#FC942E] font-bold text-2xl sm:text-3xl select-none">:</span>}
          <div className="flex flex-col items-center justify-center bg-[#1a1208] border border-[#6b4c1e] rounded-lg px-3 sm:px-5 py-2 sm:py-3 min-w-[54px] sm:min-w-[72px] shadow-lg shadow-black/30">
            <span className="text-[#FC942E] font-bold text-2xl sm:text-3xl leading-none font-mono">{item.val}</span>
            <span className="text-[10px] sm:text-xs text-[#a07840] uppercase tracking-widest mt-1 font-semibold">{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RewardsSection({ clans }: { clans: ClanData[] }) {
  return (
    <div className="rounded-xl border border-[#6b4c1e] bg-[#1a1208] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#6b4c1e] flex items-center gap-2">
        <Target className="h-4 w-4 text-[#FC942E]" />
        <h3 className="text-sm font-bold text-[#FC942E]">Reputation Rewards Tracker</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#6b4c1e]">
              <th className="px-3 py-2.5 text-xs font-bold text-left text-foreground">Rank</th>
              <th className="px-3 py-2.5 text-xs font-bold text-left text-primary">Clan</th>
              <th className="px-3 py-2.5 text-xs font-bold text-left text-foreground">Reputation</th>
              <th className="px-3 py-2.5 text-xs font-bold text-right text-foreground hidden sm:table-cell">30m</th>
              <th className="px-3 py-2.5 text-xs font-bold text-right text-foreground hidden md:table-cell">1h</th>
              <th className="px-3 py-2.5 text-xs font-bold text-right text-foreground hidden lg:table-cell">6h</th>
              <th className="px-3 py-2.5 text-xs font-bold text-center text-foreground">⚔️ Skill</th>
              <th className="px-3 py-2.5 text-xs font-bold text-center text-foreground">🗡️ Weapon</th>
              <th className="px-3 py-2.5 text-xs font-bold text-center text-foreground">🎒 Back Item</th>
              <th className="px-3 py-2.5 text-xs font-bold text-right text-foreground">To 800K</th>
            </tr>
          </thead>
          <tbody>
            {clans.map((clan) => {
              const hasSkill = clan.reputation >= 800_000;
              const hasWeapon = clan.reputation >= 600_000;
              const hasBackItem = clan.reputation >= 400_000;
              const remaining = Math.max(800_000 - clan.reputation, 0);
              const pct = Math.min((clan.reputation / 800_000) * 100, 100);
              const isLowRep = clan.gain_30m === 0 && clan.gain_1h === 0;
              const isDanger = clan.is_bleeding || isLowRep;
              return (
                <tr key={clan.id} className={cn("border-b border-[#6b4c1e]/40", isDanger && "bg-red-950/30")}>
                  <td className="px-3 py-2 text-foreground">{clan.rank}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-primary">{clan.name}</span>
                      {clan.is_bleeding && (
                        <Droplets className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground font-mono text-xs">{formatRep(clan.reputation)}</span>
                      <div className="h-1.5 w-full rounded-full bg-[#2d2416] overflow-hidden max-w-[120px]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: hasSkill ? "#22c55e" : hasWeapon ? "#FC942E" : "#a07840",
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right hidden sm:table-cell">
                    <span className={cn("text-xs font-mono", clan.gain_30m > 0 ? "text-green-400" : "text-muted-foreground")}>
                      {clan.gain_30m > 0 ? `+${formatNumber(clan.gain_30m)}` : "0"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right hidden md:table-cell">
                    <span className={cn("text-xs font-mono", clan.gain_1h > 0 ? "text-green-400" : "text-muted-foreground")}>
                      {clan.gain_1h > 0 ? `+${formatNumber(clan.gain_1h)}` : "0"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right hidden lg:table-cell">
                    <span className={cn("text-xs font-mono", clan.gain_6h > 0 ? "text-green-400" : "text-muted-foreground")}>
                      {clan.gain_6h > 0 ? `+${formatNumber(clan.gain_6h)}` : "0"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {hasSkill ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">-{formatNumber(800_000 - clan.reputation)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {hasWeapon ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">-{formatNumber(600_000 - clan.reputation)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {hasBackItem ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">-{formatNumber(400_000 - clan.reputation)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {remaining === 0 ? (
                      <span className="text-green-500 font-bold text-xs">MAX ✓</span>
                    ) : (
                      <span className="text-[#FC942E] font-mono text-xs font-bold">{formatRep(remaining)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface RankingTableProps {
  clans: ClanData[];
  onSelectClan: (clanId: number) => void;
  season?: ApiSeason | null;
}

export function RankingTable({ clans, onSelectClan, season }: RankingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = clans.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.master.toLowerCase().includes(search.toLowerCase()) ||
      String(c.rank).includes(search)
  );

  const sorted = [...filtered].sort((a, b) => {
    const mul = sortAsc ? 1 : -1;
    if (sortKey === "rank") return (a.rank - b.rank) * mul;
    return ((b[sortKey] as number) - (a[sortKey] as number)) * mul;
  });

  const maxGain30m = useMemo(() => Math.max(...clans.map((c) => c.gain_30m), 1), [clans]);
  const maxGain1h = useMemo(() => Math.max(...clans.map((c) => c.gain_1h), 1), [clans]);
  const maxGain6h = useMemo(() => Math.max(...clans.map((c) => c.gain_6h), 1), [clans]);
  const maxGain1d = useMemo(() => Math.max(...clans.map((c) => c.gain_1d), 1), [clans]);
  const topGain30mId = useMemo(() => {
    if (clans.length === 0) return -1;
    const top = clans.reduce((best, c) => (c.gain_30m > best.gain_30m ? c : best), clans[0]);
    return top && top.gain_30m > 0 ? top.id : -1;
  }, [clans]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "rank");
    }
  }

  return (
    <div className="space-y-5">
      {/* Season countdown — centered */}
      {season && (
        <div className="rounded-xl border border-[#6b4c1e] bg-[#2d2010] py-4 px-4">
          <h2 className="text-center text-lg sm:text-xl font-bold text-[#FC942E] mb-3 tracking-wide">
            {season.name}
          </h2>
          <CountdownTimer endTimestamp={season.end_time_ts} />
        </div>
      )}

      {/* Rewards tracker */}
      <RewardsSection clans={clans} />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search clans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="px-3 py-3 text-xs font-bold text-left text-foreground">Rank</th>
                <th className="px-3 py-3 text-xs font-bold text-left text-primary">Name</th>
                <th className="px-3 py-3 text-xs font-bold text-left text-foreground">Master</th>
                <th className="px-3 py-3 text-xs font-bold text-left text-foreground">Members</th>
                <th className="px-3 py-3 text-xs font-bold text-left text-foreground">Reputation</th>
                <SortHeader label="30m" field="gain_30m" className="hidden md:table-cell" sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
                <SortHeader label="1h" field="gain_1h" className="hidden lg:table-cell" sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
                <SortHeader label="6h" field="gain_6h" className="hidden xl:table-cell" sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
                <SortHeader label="1d" field="gain_1d" className="hidden 2xl:table-cell" sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((clan) => {
                const isLowActivity = clan.gain_30m === 0 && clan.gain_1h === 0;
                const isDanger = clan.is_bleeding || isLowActivity;
                return (
                <tr
                  key={clan.id}
                  onClick={() => onSelectClan(clan.id)}
                  className={cn(
                    "border-b border-border/30 cursor-pointer transition-colors",
                    isDanger && "bg-red-950/30"
                  )}
                >
                  <td className="px-3 py-3 text-foreground">{clan.rank}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">{clan.name}</span>
                      {clan.id === topGain30mId && (
                        <Flame className="h-3.5 w-3.5 text-orange-500 animate-flame" />
                      )}
                      {clan.is_bleeding && (
                        <Droplets className="h-3.5 w-3.5 text-red-500 animate-bleed" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{clan.master}</td>
                  <td className="px-3 py-3 text-muted-foreground">{clan.members}</td>
                  <td className="px-3 py-3 text-muted-foreground">{formatRep(clan.reputation)}</td>
                  <td className="px-3 py-2.5 min-w-[140px] hidden md:table-cell">
                    <GainBar value={clan.gain_30m} max={maxGain30m} color="bg-orange-500" />
                  </td>
                  <td className="px-3 py-2.5 min-w-[140px] hidden lg:table-cell">
                    <GainBar value={clan.gain_1h} max={maxGain1h} color="bg-amber-500" />
                  </td>
                  <td className="px-3 py-2.5 min-w-[140px] hidden xl:table-cell">
                    <GainBar value={clan.gain_6h} max={maxGain6h} color="bg-yellow-600" />
                  </td>
                  <td className="px-3 py-2.5 min-w-[140px] hidden 2xl:table-cell">
                    <GainBar value={clan.gain_1d} max={maxGain1d} color="bg-amber-600" />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
