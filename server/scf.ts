import axios from "axios";

// Use the existing API from the old Vercel deployment as data source
// This will be replaced with direct DB calls once we migrate the data
const API_BASE = "https://niounited.yang-lyu.com";

// Player data structure from the API
export interface Player {
  id: string;
  name: string;
  number: number;
  positions: string[];
  group: "competitive" | "recreational";
  bio: string;
  value: number;
  avatar_url: string;
  preferred_foot: string;
  height_cm: number;
  weight_kg: number;
  teammate_evaluations: Array<{
    text: string;
    icon: string;
    category: string;
    description: string;
    count: number;
    evaluators: string[];
  }>;
  skill_ratings: Record<string, number | { averageScore?: number; evaluationCount?: number; lastUpdated?: string }>;
  self_skill_ratings: Record<string, number> | null;
}

// Match data structure from the API
export interface Match {
  id: string;
  date: string;
  dateRaw: string;
  type: string;
  typeLabel: string;
  opponent: string;
  ourScore: number;
  opponentScore: number;
  result: string;
  venue: string;
  title: string;
  status: string;
  participants: { starters: number; substitutes: number; total: number };
  events: {
    goals: number;
    goalScorers: Array<{ scorer: string; assister: string | null; minute: number }>;
  };
}

let playersCache: Player[] | null = null;
let playersCacheTime = 0;
let matchesCache: Match[] | null = null;
let matchesCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchPlayers(): Promise<Player[]> {
  const now = Date.now();
  if (playersCache && now - playersCacheTime < CACHE_TTL) {
    return playersCache;
  }
  try {
    const response = await axios.get(`${API_BASE}/api/players`, { timeout: 20000 });
    const data = response.data;
    // API returns { success: true, data: [...] } or just an array
    const players = Array.isArray(data) ? data : (data?.data || []);
    playersCache = players;
    playersCacheTime = now;
    return players;
  } catch (error) {
    console.error("[SCF] Failed to fetch players:", error instanceof Error ? error.message : error);
    return playersCache || [];
  }
}

export async function fetchMatches(): Promise<Match[]> {
  const now = Date.now();
  if (matchesCache && now - matchesCacheTime < CACHE_TTL) {
    return matchesCache;
  }
  try {
    const response = await axios.get(`${API_BASE}/api/matches`, { timeout: 20000 });
    const data = response.data;
    // API returns { success: true, data: { matches: [...], ... } }
    const matches = data?.data?.matches || (Array.isArray(data) ? data : []);
    matchesCache = matches;
    matchesCacheTime = now;
    return matches;
  } catch (error) {
    console.error("[SCF] Failed to fetch matches:", error instanceof Error ? error.message : error);
    return matchesCache || [];
  }
}

export async function fetchPlayerById(id: string): Promise<Player | null> {
  const players = await fetchPlayers();
  return players.find((p) => p.id === id) || null;
}

export async function fetchMatchById(id: string): Promise<Match | null> {
  const matches = await fetchMatches();
  return matches.find((m) => m.id === id) || null;
}
