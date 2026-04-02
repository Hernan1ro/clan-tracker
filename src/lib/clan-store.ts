"use client";

import type { ApiResponse, ApiClan, ApiMember, ClanData, EnrichedMember, Snapshot } from "./types";

const MAX_SNAPSHOTS = 2000; // in-memory limit; localStorage handles long-term history
const POLL_INTERVAL = 1_000; // 1 second for near-real-time
const STORAGE_KEY = "ns_clan_snapshots";
const STORAGE_SAVE_INTERVAL = 10_000; // persist to localStorage every 10s to avoid thrashing

function createSnapshot(data: ApiResponse): Snapshot {
  const clans: Snapshot["clans"] = {};
  for (const c of data.clans) {
    const members: Record<number, number> = {};
    for (const m of c.member_list) {
      members[m.id] = m.reputation;
    }
    clans[c.id] = { reputation: c.reputation, members };
  }
  return {
    timestamp: Date.now(),
    generated_at: data.generated_at,
    clans,
  };
}

function getSnapshotNear(snapshots: Snapshot[], msAgo: number): Snapshot | null {
  const target = Date.now() - msAgo;
  let best: Snapshot | null = null;
  let bestDist = Infinity;
  for (const s of snapshots) {
    const dist = Math.abs(s.timestamp - target);
    if (dist < bestDist) {
      bestDist = dist;
      best = s;
    }
  }
  // Only use if within 2x the target range
  if (best && bestDist < msAgo * 2) return best;
  return null;
}

function computeGain(
  currentRep: number,
  clanId: number,
  snapshots: Snapshot[],
  msAgo: number
): number {
  const snap = getSnapshotNear(snapshots, msAgo);
  if (!snap || !snap.clans[clanId]) return 0;
  return currentRep - snap.clans[clanId].reputation;
}

export function enrichClans(
  apiClans: ApiClan[],
  snapshots: Snapshot[]
): ClanData[] {
  return apiClans.map((clan) => {
    const gain30m = computeGain(clan.reputation, clan.id, snapshots, 30 * 60_000);
    const gain1h = computeGain(clan.reputation, clan.id, snapshots, 60 * 60_000);
    const gain6h = computeGain(clan.reputation, clan.id, snapshots, 6 * 60 * 60_000);
    const gain1d = computeGain(clan.reputation, clan.id, snapshots, 24 * 60 * 60_000);

    // Bleed: rep went DOWN in last snapshot comparison
    const prevSnap = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;
    const prevRep = prevSnap?.clans[clan.id]?.reputation ?? null;
    const isBleeding = prevRep !== null && clan.reputation < prevRep;
    const bleedAmount = isBleeding && prevRep !== null ? prevRep - clan.reputation : 0;

    return {
      ...clan,
      gain_30m: Math.max(gain30m, 0),
      gain_1h: Math.max(gain1h, 0),
      gain_6h: Math.max(gain6h, 0),
      gain_1d: Math.max(gain1d, 0),
      is_bleeding: isBleeding,
      bleed_amount: bleedAmount,
      prev_reputation: prevRep,
    };
  });
}

export function enrichMembers(
  members: ApiMember[],
  clanId: number,
  snapshots: Snapshot[]
): EnrichedMember[] {
  const now = Date.now();
  const firstSnap = snapshots.length > 0 ? snapshots[0] : null;
  const trackingStart = firstSnap?.timestamp ?? now;

  return members.map((member) => {
    // Find first snapshot where this member appears in this clan
    let firstSeen = 0;
    for (const s of snapshots) {
      if (s.clans[clanId]?.members[member.id] !== undefined) {
        firstSeen = s.timestamp;
        break;
      }
    }

    // If never seen in snapshots, they appeared in current data only
    if (firstSeen === 0) firstSeen = now;

    const isNew = firstSeen > trackingStart + 60_000; // appeared >1min after tracking started

    // Compute gains using snapshot member data
    const computeMemberGain = (msAgo: number): number => {
      const snap = getSnapshotNear(snapshots, msAgo);
      if (!snap || !snap.clans[clanId]) return 0;
      const oldRep = snap.clans[clanId].members[member.id];
      if (oldRep === undefined) return 0;
      return Math.max(member.reputation - oldRep, 0);
    };

    const gain30m = computeMemberGain(30 * 60_000);
    const gain1h = computeMemberGain(60 * 60_000);
    const gain6h = computeMemberGain(6 * 60 * 60_000);
    const gain1d = computeMemberGain(24 * 60 * 60_000);

    // Time since first seen
    const msTracked = Math.max(now - firstSeen, 1);
    const daysTracked = msTracked / (24 * 60 * 60_000);
    const hoursTracked = msTracked / (60 * 60_000);

    // Compute total rep gained since first seen
    let repSinceJoin = 0;
    const joinSnap = getSnapshotNear(snapshots, msTracked);
    if (joinSnap && joinSnap.clans[clanId]?.members[member.id] !== undefined) {
      repSinceJoin = Math.max(member.reputation - joinSnap.clans[clanId].members[member.id], 0);
    }

    return {
      ...member,
      gain_30m: gain30m,
      gain_1h: gain1h,
      gain_6h: gain6h,
      gain_1d: gain1d,
      first_seen: firstSeen,
      is_new: isNew,
      days_tracked: Math.max(daysTracked, 0.01),
      rep_per_day: daysTracked > 0.01 ? repSinceJoin / daysTracked : 0,
      rep_per_hour: hoursTracked > 0.1 ? repSinceJoin / hoursTracked : 0,
    };
  });
}

// Singleton store
type Listener = () => void;

class ClanStore {
  private data: ApiResponse | null = null;
  private snapshots: Snapshot[] = [];
  private enrichedClans: ClanData[] = [];
  private listeners = new Set<Listener>();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private saveTimer: ReturnType<typeof setInterval> | null = null;
  private loading = true;
  private error: string | null = null;
  private cachedSnapshot: ReturnType<ClanStore["buildSnapshot"]> | null = null;
  private dirty = false;
  private fetching = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: Snapshot[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Only keep snapshots from last 7 days
        const cutoff = Date.now() - 7 * 24 * 60 * 60_000;
        this.snapshots = parsed.filter((s) => s.timestamp > cutoff);
      }
    } catch {
      // Ignore corrupt data
    }
  }

  private saveToStorage() {
    try {
      if (typeof window === "undefined" || !this.dirty) return;
      // Thin out snapshots for storage: keep 1 per minute for data older than 1h,
      // 1 per 10s for last hour, all for last 5 min
      const now = Date.now();
      const thinned: Snapshot[] = [];
      let lastKept = 0;
      for (const s of this.snapshots) {
        const age = now - s.timestamp;
        const minGap =
          age > 60 * 60_000 ? 60_000 : // >1h old: keep 1/min
          age > 5 * 60_000 ? 10_000 :  // >5min old: keep 1/10s
          0;                            // recent: keep all
        if (s.timestamp - lastKept >= minGap) {
          thinned.push(s);
          lastKept = s.timestamp;
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(thinned));
      this.dirty = false;
    } catch {
      // Storage full or unavailable
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    if (!this.pollTimer) this.startPolling();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stopPolling();
    };
  }

  private buildSnapshot() {
    return {
      data: this.data,
      clans: this.enrichedClans,
      snapshots: this.snapshots,
      loading: this.loading,
      error: this.error,
    };
  }

  getSnapshot() {
    if (!this.cachedSnapshot) {
      this.cachedSnapshot = this.buildSnapshot();
    }
    return this.cachedSnapshot;
  }

  private notify() {
    this.cachedSnapshot = this.buildSnapshot();
    for (const fn of this.listeners) fn();
  }

  private startPolling() {
    this.fetchData();
    this.pollTimer = setInterval(() => this.fetchData(), POLL_INTERVAL);
    this.saveTimer = setInterval(() => this.saveToStorage(), STORAGE_SAVE_INTERVAL);
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
    this.saveToStorage(); // flush on stop
  }

  private async fetchData() {
    if (this.fetching) return; // skip if previous request still in-flight
    this.fetching = true;
    try {
      const res = await fetch(`/api/clans`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();

      // Check if data actually changed (different generated_at)
      const lastGen = this.data?.generated_at;
      this.data = json;

      if (!lastGen || lastGen !== json.generated_at) {
        const snap = createSnapshot(json);
        this.snapshots.push(snap);
        if (this.snapshots.length > MAX_SNAPSHOTS) {
          this.snapshots = this.snapshots.slice(-MAX_SNAPSHOTS);
        }
        this.dirty = true;
      }

      // Only re-enrich & notify when data actually changed
      if (!lastGen || lastGen !== json.generated_at) {
        this.enrichedClans = enrichClans(json.clans, this.snapshots);
      }
      const wasLoading = this.loading;
      this.loading = false;
      this.error = null;
      // Always notify on first load, otherwise only when data changed
      if (wasLoading || !lastGen || lastGen !== json.generated_at) {
        this.notify();
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Failed to fetch";
      this.loading = false;
      this.notify();
    } finally {
      this.fetching = false;
    }
  }
}

export const clanStore = new ClanStore();
