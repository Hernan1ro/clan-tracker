"use client";

import { useMemo } from "react";
import { cn, formatNumber, formatRep } from "@/lib/utils";
import type { ClanData, ApiMember } from "@/lib/types";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Droplets,
  Crown,
  Hash,
} from "lucide-react";

interface ClanDetailViewProps {
  clan: ClanData & { member_list: ApiMember[] };
  onBack: () => void;
}

export function ClanDetailView({ clan, onBack }: ClanDetailViewProps) {
  const maxMemberRep = useMemo(
    () => Math.max(...clan.member_list.map((m) => m.reputation), 1),
    [clan.member_list]
  );

  const totalMemberRep = useMemo(
    () => clan.member_list.reduce((sum, m) => sum + m.reputation, 0),
    [clan.member_list]
  );

  return (
    <div className="space-y-6">
      {/* Back button + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{clan.name}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              Rank #{clan.rank}
            </span>
            {clan.is_bleeding && (
              <Droplets className="h-5 w-5 text-red-500 animate-bleed" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            <Crown className="inline h-3.5 w-3.5 mr-1" />
            {clan.master}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className={cn("grid gap-3", clan.is_bleeding ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3")}>
        <StatCard
          label="Total Reputation"
          value={formatRep(clan.reputation)}
          icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
        />
        <StatCard
          label="Members"
          value={`${clan.members} / ${clan.member_list.length}`}
          icon={<Users className="h-4 w-4 text-amber-500" />}
        />
        <StatCard
          label="Avg Rep / Member"
          value={formatRep(clan.member_list.length > 0 ? Math.round(totalMemberRep / clan.member_list.length) : 0)}
          icon={<Hash className="h-4 w-4 text-yellow-600" />}
        />
        {clan.is_bleeding && (
          <StatCard
            label="Bleeding"
            value={`-${formatNumber(clan.bleed_amount)}`}
            icon={<Droplets className="h-4 w-4 text-red-500 animate-bleed" />}
            valueClass="text-red-500"
            cardClass="border-red-500/30"
          />
        )}
      </div>

      {/* Gain overview row */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Reputation Gains (tracked since session start)</h3>
        <div className="grid grid-cols-4 gap-4">
          <GainStat label="30 min" value={clan.gain_30m} color="text-orange-500" />
          <GainStat label="1 hour" value={clan.gain_1h} color="text-amber-500" />
          <GainStat label="6 hours" value={clan.gain_6h} color="text-yellow-600" />
          <GainStat label="1 day" value={clan.gain_1d} color="text-amber-600" />
        </div>
      </div>

      {/* Members table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">
            Members ({clan.member_list.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-left w-10">
                  #
                </th>
                <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-left">
                  Player
                </th>
                <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-left">
                  Lv
                </th>
                <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-left">
                  Reputation
                </th>
                <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-left hidden sm:table-cell">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {clan.member_list.map((member, idx) => {
                const pct = totalMemberRep > 0 ? (member.reputation / totalMemberRep) * 100 : 0;
                return (
                  <tr
                    key={member.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-medium">{member.name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {member.level}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold">
                          {formatRep(member.reputation)}
                        </span>
                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden max-w-[80px] hidden lg:block">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{
                              width: `${(member.reputation / maxMemberRep) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">
                        {pct > 0 ? `${pct.toFixed(1)}%` : "—"}
                      </span>
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

function StatCard({
  label,
  value,
  icon,
  valueClass,
  cardClass,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueClass?: string;
  cardClass?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", cardClass)}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className={cn("text-2xl font-bold font-mono", valueClass)}>{value}</p>
    </div>
  );
}

function GainStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-lg font-bold font-mono", color)}>
        +{formatNumber(value)}
      </p>
    </div>
  );
}
