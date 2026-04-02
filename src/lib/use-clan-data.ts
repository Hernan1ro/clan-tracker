"use client";

import { useSyncExternalStore, useMemo } from "react";
import { clanStore, enrichMembers } from "./clan-store";
import type { ApiResponse, ClanData, ApiClan, ApiMember, EnrichedMember } from "./types";

// Stable references at module level for useSyncExternalStore
const subscribe = (cb: () => void) => clanStore.subscribe(cb);
const getSnapshot = () => clanStore.getSnapshot();

export function useClanData() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Get a single enriched clan with member details
export function useClanDetail(clanId: number | null) {
  const { data, clans } = useClanData();

  return useMemo(() => {
    if (!clanId || !data) return null;

    const enriched = clans.find((c) => c.id === clanId);
    const raw = data.clans.find((c) => c.id === clanId);
    if (!enriched || !raw) return null;

    return {
      ...enriched,
      member_list: raw.member_list,
    };
  }, [clanId, data, clans]);
}

// Get enriched member data for a specific clan
export function useEnrichedMembers(clanId: number | null): EnrichedMember[] {
  const { data, snapshots } = useClanData();

  return useMemo(() => {
    if (!clanId || !data) return [];
    const raw = data.clans.find((c) => c.id === clanId);
    if (!raw) return [];
    return enrichMembers(raw.member_list, clanId, snapshots);
  }, [clanId, data, snapshots]);
}

export type { ApiResponse, ClanData, ApiClan, ApiMember, EnrichedMember };
