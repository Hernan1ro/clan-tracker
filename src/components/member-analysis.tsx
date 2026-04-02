"use client";

import { useState, useMemo } from "react";
import { cn, formatNumber, formatRep } from "@/lib/utils";
import type { ClanData } from "@/lib/types";
import { useEnrichedMembers } from "@/lib/use-clan-data";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  UserPlus,
  AlertTriangle,
  Crown,
  TrendingUp,
  Clock,
} from "lucide-react";

function MemberSortTh({
  label,
  field,
  className,
  sortKey,
  sortAsc,
  onSort,
}: {
  label: string;
  field: MemberSortKey;
  className?: string;
  sortKey: MemberSortKey;
  sortAsc: boolean;
  onSort: (key: MemberSortKey) => void;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 text-xs font-bold cursor-pointer hover:text-foreground transition-colors select-none text-left",
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

type MemberSortKey =
  | "name"
  | "level"
  | "reputation"
  | "gain_30m"
  | "gain_1h"
  | "gain_6h"
  | "gain_1d"
  | "rep_per_day"
  | "rep_per_hour";

interface MemberAnalysisProps {
  clans: ClanData[];
}

export function MemberAnalysis({ clans }: MemberAnalysisProps) {
  const [selectedClanId, setSelectedClanId] = useState<number | null>(
    clans.length > 0 ? clans[0].id : null
  );

  const enrichedMembers = useEnrichedMembers(selectedClanId);

  const [sortKey, setSortKey] = useState<MemberSortKey>("reputation");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");
  const [showNewOnly, setShowNewOnly] = useState(false);

  const selectedClan = clans.find((c) => c.id === selectedClanId) ?? null;

  const filtered = useMemo(() => {
    let list = enrichedMembers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }
    if (showNewOnly) {
      list = list.filter((m) => m.is_new);
    }
    return list;
  }, [enrichedMembers, search, showNewOnly]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const mul = sortAsc ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * mul;
      return ((b[sortKey] as number) - (a[sortKey] as number)) * mul;
    });
  }, [filtered, sortKey, sortAsc]);

  // Stats
  const stats = useMemo(() => {
    if (enrichedMembers.length === 0) return null;
    const totalGain1h = enrichedMembers.reduce((s, m) => s + m.gain_1h, 0);
    const totalGain1d = enrichedMembers.reduce((s, m) => s + m.gain_1d, 0);
    const avgRep = enrichedMembers.reduce((s, m) => s + m.reputation, 0) / enrichedMembers.length;
    const topMember = enrichedMembers.reduce((best, m) => (m.gain_1d > best.gain_1d ? m : best), enrichedMembers[0]);
    const lowPerformers = enrichedMembers.filter(
      (m) => !m.is_new && m.gain_1h === 0 && m.gain_30m === 0
    );
    const newMembers = enrichedMembers.filter((m) => m.is_new);
    return { totalGain1h, totalGain1d, avgRep, topMember, lowPerformers, newMembers };
  }, [enrichedMembers]);

  function handleSort(key: MemberSortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "name");
    }
  }

  const sortThProps = { sortKey, sortAsc, onSort: handleSort };

  return (
    <div className="space-y-5">
      {/* Clan selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-[#FC942E]">Select Clan:</label>
          <select
            value={selectedClanId ?? ""}
            onChange={(e) => setSelectedClanId(Number(e.target.value))}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          >
            {clans.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.rank} {c.name} ({formatRep(c.reputation)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats cards */}
      {stats && selectedClan && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Members"
            value={String(enrichedMembers.length)}
            icon={<Clock className="h-4 w-4 text-[#FC942E]" />}
          />
          <StatCard
            label="Gain 1h"
            value={`+${formatNumber(stats.totalGain1h)}`}
            icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          />
          <StatCard
            label="Gain 1d"
            value={`+${formatNumber(stats.totalGain1d)}`}
            icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
          />
          <StatCard
            label="Avg Rep"
            value={formatRep(Math.round(stats.avgRep))}
            icon={<Crown className="h-4 w-4 text-yellow-500" />}
          />
          <StatCard
            label="Top (1d)"
            value={stats.topMember.name}
            sub={`+${formatNumber(stats.topMember.gain_1d)}`}
            icon={<Crown className="h-4 w-4 text-[#FC942E]" />}
          />
          <StatCard
            label="Inactive"
            value={String(stats.lowPerformers.length)}
            sub={stats.newMembers.length > 0 ? `${stats.newMembers.length} new` : undefined}
            icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
            danger={stats.lowPerformers.length > 3}
          />
        </div>
      )}

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <button
          onClick={() => setShowNewOnly(!showNewOnly)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition-colors",
            showNewOnly
              ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <UserPlus className="h-3.5 w-3.5" />
          New Members Only
        </button>
      </div>

      {/* Member table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="px-3 py-2.5 text-xs font-bold text-left text-foreground">#</th>
                <MemberSortTh label="Name" field="name" className="text-primary" {...sortThProps} />
                <MemberSortTh label="Lvl" field="level" {...sortThProps} />
                <MemberSortTh label="Reputation" field="reputation" {...sortThProps} />
                <MemberSortTh label="30m" field="gain_30m" className="hidden md:table-cell" {...sortThProps} />
                <MemberSortTh label="1h" field="gain_1h" className="hidden md:table-cell" {...sortThProps} />
                <MemberSortTh label="6h" field="gain_6h" className="hidden lg:table-cell" {...sortThProps} />
                <MemberSortTh label="1d" field="gain_1d" className="hidden lg:table-cell" {...sortThProps} />
                <MemberSortTh label="Rep/Day" field="rep_per_day" className="hidden xl:table-cell" {...sortThProps} />
                <MemberSortTh label="Rep/Hour" field="rep_per_hour" className="hidden xl:table-cell" {...sortThProps} />
                <th className="px-3 py-2.5 text-xs font-bold text-left text-foreground hidden 2xl:table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((member, idx) => {
                const isInactive = !member.is_new && member.gain_30m === 0 && member.gain_1h === 0;
                return (
                  <tr
                    key={member.id}
                    className={cn(
                      "border-b border-border/30 transition-colors",
                      member.is_new && "bg-blue-950/20",
                      isInactive && "bg-red-950/20"
                    )}
                  >
                    <td className="px-3 py-2 text-muted-foreground text-xs">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-primary">{member.name}</span>
                        {member.is_new && (
                          <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold uppercase">New</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{member.level}</td>
                    <td className="px-3 py-2 text-foreground font-mono text-xs">
                      {formatRep(member.reputation)}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      <GainCell value={member.gain_30m} />
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      <GainCell value={member.gain_1h} />
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      <GainCell value={member.gain_6h} />
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      <GainCell value={member.gain_1d} />
                    </td>
                    <td className="px-3 py-2 hidden xl:table-cell">
                      <span className="text-xs font-mono text-amber-400">
                        {member.rep_per_day > 0 ? formatNumber(Math.round(member.rep_per_day)) : "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2 hidden xl:table-cell">
                      <span className="text-xs font-mono text-amber-400">
                        {member.rep_per_hour > 0 ? formatNumber(Math.round(member.rep_per_hour)) : "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2 hidden 2xl:table-cell">
                      <MemberStatus isNew={member.is_new} isInactive={isInactive} daysTracked={member.days_tracked} />
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-muted-foreground">
                    {selectedClanId ? "No members found" : "Select a clan to view members"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low performers section */}
      {stats && stats.lowPerformers.length > 0 && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-red-900/50 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-bold text-red-400">
              Low Performance Alert — {stats.lowPerformers.length} member{stats.lowPerformers.length !== 1 ? "s" : ""} with 0 rep in the last hour
            </h3>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {stats.lowPerformers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-900/30 text-xs"
                >
                  <span className="text-red-400 font-semibold">{m.name}</span>
                  <span className="text-muted-foreground">Lv.{m.level}</span>
                  <span className="text-muted-foreground">{formatRep(m.reputation)} rep</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New members section */}
      {stats && stats.newMembers.length > 0 && (
        <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-blue-900/50 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-blue-400">
              New Members — {stats.newMembers.length} member{stats.newMembers.length !== 1 ? "s" : ""} joined after tracking started
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-900/50">
                  <th className="px-3 py-2 text-xs font-bold text-left text-foreground">Name</th>
                  <th className="px-3 py-2 text-xs font-bold text-left text-foreground">Level</th>
                  <th className="px-3 py-2 text-xs font-bold text-left text-foreground">Rep</th>
                  <th className="px-3 py-2 text-xs font-bold text-left text-foreground">Days Tracked</th>
                  <th className="px-3 py-2 text-xs font-bold text-left text-foreground">Rep/Day</th>
                  <th className="px-3 py-2 text-xs font-bold text-left text-foreground">Rep/Hour</th>
                  <th className="px-3 py-2 text-xs font-bold text-left text-foreground">Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {stats.newMembers.map((m) => {
                  // Compare new member's rep/hour to clan average rep/hour
                  const avgRepPerHour =
                    enrichedMembers
                      .filter((em) => !em.is_new && em.rep_per_hour > 0)
                      .reduce((s, em) => s + em.rep_per_hour, 0) /
                    Math.max(enrichedMembers.filter((em) => !em.is_new && em.rep_per_hour > 0).length, 1);
                  const ratio = avgRepPerHour > 0 ? m.rep_per_hour / avgRepPerHour : 0;
                  const evaluation =
                    ratio >= 1.2 ? "Excellent" :
                    ratio >= 0.8 ? "Good" :
                    ratio >= 0.5 ? "Average" :
                    ratio > 0 ? "Below Avg" :
                    "No Data";
                  const evalColor =
                    ratio >= 1.2 ? "text-green-400" :
                    ratio >= 0.8 ? "text-blue-400" :
                    ratio >= 0.5 ? "text-yellow-400" :
                    ratio > 0 ? "text-red-400" :
                    "text-muted-foreground";
                  return (
                    <tr key={m.id} className="border-b border-blue-900/30">
                      <td className="px-3 py-2 font-semibold text-primary">{m.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{m.level}</td>
                      <td className="px-3 py-2 text-foreground font-mono text-xs">{formatRep(m.reputation)}</td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">{m.days_tracked.toFixed(1)}d</td>
                      <td className="px-3 py-2 text-amber-400 font-mono text-xs">
                        {m.rep_per_day > 0 ? formatNumber(Math.round(m.rep_per_day)) : "-"}
                      </td>
                      <td className="px-3 py-2 text-amber-400 font-mono text-xs">
                        {m.rep_per_hour > 0 ? formatNumber(Math.round(m.rep_per_hour)) : "-"}
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn("text-xs font-bold", evalColor)}>
                          {evaluation}
                          {ratio > 0 && ` (${(ratio * 100).toFixed(0)}%)`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components

function StatCard({
  label,
  value,
  sub,
  icon,
  danger,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5",
        danger
          ? "border-red-900/50 bg-red-950/20"
          : "border-[#6b4c1e] bg-[#1a1208]"
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-sm font-bold text-foreground truncate">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function GainCell({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-muted-foreground">0</span>;
  return (
    <span className="text-xs font-mono text-green-400">+{formatNumber(value)}</span>
  );
}

function MemberStatus({
  isNew,
  isInactive,
  daysTracked,
}: {
  isNew: boolean;
  isInactive: boolean;
  daysTracked: number;
}) {
  if (isNew) {
    return (
      <span className="text-[10px] font-bold text-blue-400">
        NEW ({daysTracked.toFixed(1)}d)
      </span>
    );
  }
  if (isInactive) {
    return (
      <span className="text-[10px] font-bold text-red-400">INACTIVE</span>
    );
  }
  return (
    <span className="text-[10px] font-bold text-green-400">ACTIVE</span>
  );
}
