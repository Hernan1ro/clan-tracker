"use client";

import { useMemo } from "react";
import { formatNumber, formatRep } from "@/lib/utils";
import type { ClanData } from "@/lib/types";
import { Globe, Droplets } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";

interface GlobalRankingProps {
  clans: ClanData[];
  onSelectClan: (clanId: number) => void;
}

export function GlobalRanking({ clans, onSelectClan }: GlobalRankingProps) {
  const top10 = useMemo(() => clans.slice(0, 10), [clans]);

  const chartData = useMemo(
    () =>
      top10.map((c) => ({
        name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
        reputation: c.reputation,
        fullName: c.name,
      })),
    [top10]
  );

  const totalRep = useMemo(
    () => clans.reduce((sum, c) => sum + c.reputation, 0),
    [clans]
  );

  const totalMembers = useMemo(
    () => clans.reduce((sum, c) => sum + c.members, 0),
    [clans]
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Clans</p>
          <p className="text-2xl font-bold">{clans.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Players</p>
          <p className="text-2xl font-bold">{totalMembers.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Reputation</p>
          <p className="text-2xl font-bold font-mono">{formatNumber(totalRep)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Bleeding</p>
          <p className="text-2xl font-bold text-red-500">
            {clans.filter((c) => c.is_bleeding).length}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Top 10 Clans by Reputation</h3>
        </div>
        <ChartWrapper height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatNumber(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [formatRep(Number(value)), "Reputation"]}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item?.fullName || label;
                }}
              />
              <Bar dataKey="reputation" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Full list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">All Clans</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="px-4 py-3 text-xs font-bold text-left text-foreground">Rank</th>
                <th className="px-4 py-3 text-xs font-bold text-left text-primary">Name</th>
                <th className="px-4 py-3 text-xs font-bold text-left text-foreground">Master</th>
                <th className="px-4 py-3 text-xs font-bold text-left text-foreground">Members</th>
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
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">{clan.name}</span>
                      {clan.is_bleeding && (
                        <Droplets className="h-3.5 w-3.5 text-red-500 animate-bleed" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{clan.master}</td>
                  <td className="px-4 py-3 text-muted-foreground">{clan.members}</td>
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
