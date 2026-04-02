export interface ClanData {
  clan_id: number;
  rank: number;
  name: string;
  master: string;
  members: number;
  reputation: number;
  gain_30m: number;
  gain_6h: number;
  gain_1d: number;
  gain_7d: number;
  active_1h: number;
  is_bleeding: boolean;
  bleed_amount: number;
}

export interface ClanMember {
  member_id: number;
  member_name: string;
  level: number;
  reputation: number;
  gain_today: number;
  gain_7d: number;
  is_online: boolean;
}

export interface ClanDetail {
  clan_id: number;
  name: string;
  master: string;
  members: number;
  reputation: number;
  gain_30m: number;
  gain_6h: number;
  gain_1d: number;
  gain_7d: number;
  is_bleeding: boolean;
  bleed_amount: number;
  member_list: ClanMember[];
  daily_chart: { date: string; gain: number }[];
  heatmap: { day: number; hour: number; value: number }[];
}

export interface SeasonInfo {
  season_name: string;
  is_current: boolean;
  season_end: string;
  start_date: string;
}

export interface HeatmapCell {
  day: number;
  hour: number;
  value: number;
}

const clanNames = [
  "Shadow Legion", "Phoenix Rising", "Dark Vortex", "Storm Breakers",
  "Blood Moon", "Iron Wolves", "Dragon Fang", "Crimson Tide",
  "Thunder Gods", "Frost Bite", "Silent Blade", "Night Hawks",
  "Solar Flare", "Venom Strike", "Ghost Riders", "Demon Slayers",
  "Ice Phantom", "War Titans", "Rogue Ninjas", "Eternal Flame",
  "Lightning Corps", "Mystic Shadows", "Death Whisper", "Void Walkers",
  "Steel Serpents"
];

const masterNames = [
  "XxShadowLordxX", "PhoenixMaster99", "DarkNinja420", "StormKing",
  "BloodMoonRise", "WolfAlpha", "DragonSlayer7", "CrimsonBlade",
  "ThunderGod", "FrostByte", "SilentKill", "NightHawk01",
  "SolarPower", "VenomKing", "GhostRider33", "DemonHunter",
  "IceQueen", "WarLord99", "RogueNinja", "EternalFire",
  "LightningBolt", "MysticSage", "DeathWhisper", "VoidMaster",
  "SteelFang"
];

const memberFirstNames = [
  "Shadow", "Dark", "Light", "Fire", "Ice", "Storm", "Thunder",
  "Wind", "Earth", "Water", "Blaze", "Frost", "Nova", "Void",
  "Steel", "Iron", "Gold", "Silver", "Crystal", "Diamond"
];

const memberLastNames = [
  "Ninja", "Warrior", "Master", "Knight", "Hunter", "Slayer",
  "Blade", "Fang", "Claw", "Strike", "Storm", "Wolf", "Hawk",
  "Dragon", "Phoenix", "Ghost", "Shadow", "Demon", "Angel", "King"
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMembers(clanId: number, count: number): ClanMember[] {
  const members: ClanMember[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = memberFirstNames[randInt(0, memberFirstNames.length - 1)];
    const lastName = memberLastNames[randInt(0, memberLastNames.length - 1)];
    const rep = randInt(5000, 500000);
    members.push({
      member_id: clanId * 1000 + i,
      member_name: `${firstName}${lastName}${randInt(1, 99)}`,
      level: randInt(40, 100),
      reputation: rep,
      gain_today: randInt(0, Math.floor(rep * 0.05)),
      gain_7d: randInt(0, Math.floor(rep * 0.2)),
      is_online: Math.random() > 0.6,
    });
  }
  return members.sort((a, b) => b.reputation - a.reputation);
}

function generateDailyChart(): { date: string; gain: number }[] {
  const chart: { date: string; gain: number }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    chart.push({
      date: d.toISOString().slice(0, 10),
      gain: randInt(2000, 80000),
    });
  }
  return chart;
}

function generateHeatmap(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isActive = (hour >= 8 && hour <= 23);
      cells.push({
        day,
        hour,
        value: isActive ? randInt(0, 100) : randInt(0, 20),
      });
    }
  }
  return cells;
}

export function generateClans(): ClanData[] {
  const clans: ClanData[] = [];
  for (let i = 0; i < 25; i++) {
    const rep = randInt(500000, 15000000) - i * 200000;
    const isBleeding = Math.random() < 0.12;
    clans.push({
      clan_id: i + 1,
      rank: i + 1,
      name: clanNames[i],
      master: masterNames[i],
      members: randInt(15, 50),
      reputation: Math.max(rep, 100000),
      gain_30m: randInt(0, 15000),
      gain_6h: randInt(0, 80000),
      gain_1d: randInt(0, 200000),
      gain_7d: randInt(0, 1000000),
      active_1h: randInt(0, 20),
      is_bleeding: isBleeding,
      bleed_amount: isBleeding ? randInt(1000, 50000) : 0,
    });
  }
  return clans.sort((a, b) => b.reputation - a.reputation);
}

export function getClanDetail(clanId: number): ClanDetail {
  const clans = generateClans();
  const clan = clans.find(c => c.clan_id === clanId) || clans[0];
  const memberList = generateMembers(clan.clan_id, clan.members);

  return {
    clan_id: clan.clan_id,
    name: clan.name,
    master: clan.master,
    members: clan.members,
    reputation: clan.reputation,
    gain_30m: clan.gain_30m,
    gain_6h: clan.gain_6h,
    gain_1d: clan.gain_1d,
    gain_7d: clan.gain_7d,
    is_bleeding: clan.is_bleeding,
    bleed_amount: clan.bleed_amount,
    member_list: memberList,
    daily_chart: generateDailyChart(),
    heatmap: generateHeatmap(),
  };
}

export function getSeasons(): SeasonInfo[] {
  return [
    {
      season_name: "Season 12",
      is_current: true,
      season_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    },
    {
      season_name: "Season 11",
      is_current: false,
      season_end: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      start_date: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    },
    {
      season_name: "Season 10",
      is_current: false,
      season_end: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
      start_date: new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    },
  ];
}

export function getGlobalHeatmap(): HeatmapCell[] {
  return generateHeatmap();
}

// Singleton to keep data consistent within a session
let cachedClans: ClanData[] | null = null;

export function getClansStable(): ClanData[] {
  if (!cachedClans) {
    cachedClans = generateClans();
  }
  return cachedClans;
}

let cachedDetails: Record<number, ClanDetail> = {};

export function getClanDetailStable(clanId: number): ClanDetail {
  if (!cachedDetails[clanId]) {
    cachedDetails[clanId] = getClanDetail(clanId);
  }
  return cachedDetails[clanId];
}
