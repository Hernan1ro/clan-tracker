// Types matching the real ninjasaga.cc API response

export interface ApiResponse {
  generated_at: string;
  season: ApiSeason;
  clans: ApiClan[];
}

export interface ApiSeason {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  end_time_ts: number;
}

export interface ApiClan {
  rank: number;
  id: number;
  name: string;
  master: string;
  members: number;
  reputation: number;
  member_list: ApiMember[];
}

export interface ApiMember {
  id: number;
  name: string;
  level: number;
  reputation: number;
}

// Enriched types with computed gain/bleed data from snapshot comparison

export interface ClanData extends ApiClan {
  gain_30m: number;
  gain_1h: number;
  gain_6h: number;
  gain_1d: number;
  is_bleeding: boolean;
  bleed_amount: number;
  prev_reputation: number | null;
}

export interface MemberData extends ApiMember {
  gain_session: number;
  is_online: boolean;
}

export interface EnrichedMember extends ApiMember {
  gain_30m: number;
  gain_1h: number;
  gain_6h: number;
  gain_1d: number;
  /** Timestamp of first appearance in snapshots (0 = present since tracking start) */
  first_seen: number;
  /** Whether this member was not in earlier snapshots (joined mid-season) */
  is_new: boolean;
  /** Days tracked — how many days this member has been seen */
  days_tracked: number;
  /** Average rep per day since first seen (for fair comparison of new members) */
  rep_per_day: number;
  /** Rep gained per hour since first seen */
  rep_per_hour: number;
}

export interface Snapshot {
  timestamp: number;
  generated_at: string;
  clans: Record<number, { reputation: number; members: Record<number, number> }>;
}
