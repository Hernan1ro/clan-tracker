"use client";

import { useMemo } from "react";
import { formatNumber, formatRep } from "@/lib/utils";
import type { ClanData } from "@/lib/types";
import { TrendingUp, Target, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";

interface ProjectionPageProps {
  clans: ClanData[];
}

export function ProjectionPage({ clans }: ProjectionPageProps) {
  const top5 = useMemo(() => clans.slice(0, 5), [clans]);

  const projectionData = useMemo(() => {
    const days = 14;
    const data: Record<string, string | number>[] = [];
    for (let i = 0; i <= days; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const row: Record<string, string | number> = {
        day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      };
      for (const clan of top5) {
        const dailyRate = clan.gain_1d || clan.gain_6h * 4 || 0;
        row[clan.name] = clan.reputation + dailyRate * i;
      }
      data.push(row);
    }
    return data;
  }, [top5]);

  const COLORS = ["#f97316", "#f59e0b", "#eab308", "#d97706", "#ea580c"];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">Fastest Growth</span>
          </div>
          {top5[0] && (
            <>
              <p className="text-xl font-bold">{top5[0].name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                +{formatNumber(top5[0].gain_1d)} rep/day
              </p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium">Projected Leader (14d)</span>
          </div>
          {top5[0] && (
            <>
              <p className="text-xl font-bold">{top5[0].name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRep(top5[0].reputation + top5[0].gain_1d * 14)} rep
              </p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Projection Period</span>
          </div>
          <p className="text-xl font-bold">14 days</p>
          <p className="text-xs text-muted-foreground mt-1">Based on current daily rates</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-4">
          Top 5 Clans — 14 Day Reputation Projection
        </h3>
        <ChartWrapper height={350}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatNumber(v)}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [formatRep(Number(value)), ""]}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
              />
              {top5.map((clan, i) => (
                <Line
                  key={clan.id}
                  type="monotone"
                  dataKey={clan.name}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Rate table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Daily Growth Rates</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-left">#</th>
                <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-left">Clan</th>
                <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-left">Current Rep</th>
                <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-left">Daily Rate</th>
                <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-left">Est. 7d</th>
                <th className="px-4 py-2 text-xs font-medium text-muted-foreground text-left hidden sm:table-cell">Est. 14d</th>
              </tr>
            </thead>
            <tbody>
              {top5.map((clan, i) => {
                const daily = clan.gain_1d || clan.gain_6h * 4 || 0;
                return (
                  <tr key={clan.id} className="border-b border-border/50">
                    <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2.5 font-semibold">{clan.name}</td>
                    <td className="px-4 py-2.5 font-mono">{formatRep(clan.reputation)}</td>
                    <td className="px-4 py-2.5 font-mono text-orange-500">+{formatNumber(daily)}</td>
                    <td className="px-4 py-2.5 font-mono">{formatRep(clan.reputation + daily * 7)}</td>
                    <td className="px-4 py-2.5 font-mono hidden sm:table-cell">{formatRep(clan.reputation + daily * 14)}</td>
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
