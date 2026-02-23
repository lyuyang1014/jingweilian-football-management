import axios from "axios";
import {
  fetchPlayersFromCloud,
  fetchMatchesFromCloud,
  fetchPlayerByIdFromCloud,
  fetchMatchByIdFromCloud,
  fetchSignupsFromCloud,
  fetchAppreciationsFromCloud,
} from "./wechat-cloud";

// Use the existing API from the old Vercel deployment as data source
// Falls back to WeChat Cloud API if old API fails
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
    console.error("[SCF] Failed to fetch players from old API:", error instanceof Error ? error.message : error);
    console.log("[SCF] Falling back to WeChat Cloud API...");
    try {
      const cloudPlayers = await fetchPlayersFromCloud();
      playersCache = cloudPlayers;
      playersCacheTime = now;
      return cloudPlayers;
    } catch (cloudError) {
      console.error("[SCF] WeChat Cloud API also failed:", cloudError instanceof Error ? cloudError.message : cloudError);
      return playersCache || [];
    }
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
    console.error("[SCF] Failed to fetch matches from old API:", error instanceof Error ? error.message : error);
    console.log("[SCF] Falling back to WeChat Cloud API...");
    try {
      const cloudMatches = await fetchMatchesFromCloud();
      matchesCache = cloudMatches;
      matchesCacheTime = now;
      return cloudMatches;
    } catch (cloudError) {
      console.error("[SCF] WeChat Cloud API also failed:", cloudError instanceof Error ? cloudError.message : cloudError);
      return matchesCache || [];
    }
  }
}

export async function fetchPlayerById(id: string): Promise<Player | null> {
  try {
    const players = await fetchPlayers();
    const player = players.find((p) => p.id === id);
    if (player) return player;
    
    // If not found in list, try direct cloud API call
    return await fetchPlayerByIdFromCloud(id);
  } catch (error) {
    console.error("[SCF] Failed to fetch player by ID:", error);
    return null;
  }
}

export async function fetchMatchById(id: string): Promise<Match | null> {
  try {
    const matches = await fetchMatches();
    const match = matches.find((m) => m.id === id);
    if (match) return match;
    
    // If not found in list, try direct cloud API call
    return await fetchMatchByIdFromCloud(id);
  } catch (error) {
    console.error("[SCF] Failed to fetch match by ID:", error);
    return null;
  }
}

let signupsCache: any[] | null = null;
let signupsCacheTime = 0;
let appreciationsCache: any[] | null = null;
let appreciationsCacheTime = 0;

/**
 * Fetch all signups from WeChat Cloud (signups collection)
 * Returns records with openid (mapped from _openid) and status fields
 */
export async function fetchSignups(): Promise<any[]> {
  const now = Date.now();
  if (signupsCache && now - signupsCacheTime < CACHE_TTL) {
    return signupsCache;
  }
  try {
    const data = await fetchSignupsFromCloud();
    signupsCache = data;
    signupsCacheTime = now;
    console.log(`[SCF] Fetched ${data.length} signups`);
    return data;
  } catch (error) {
    console.error("[SCF] Failed to fetch signups:", error instanceof Error ? error.message : error);
    return signupsCache || [];
  }
}

/**
 * Fetch all appreciations from WeChat Cloud (event_appreciations collection)
 * Returns records with event_id and receiver_openid for MVP calculation
 */
export async function fetchAppreciations(): Promise<any[]> {
  const now = Date.now();
  if (appreciationsCache && now - appreciationsCacheTime < CACHE_TTL) {
    return appreciationsCache;
  }
  try {
    const data = await fetchAppreciationsFromCloud();
    appreciationsCache = data;
    appreciationsCacheTime = now;
    console.log(`[SCF] Fetched ${data.length} appreciations`);
    return data;
  } catch (error) {
    console.error("[SCF] Failed to fetch appreciations:", error instanceof Error ? error.message : error);
    return appreciationsCache || [];
  }
}
