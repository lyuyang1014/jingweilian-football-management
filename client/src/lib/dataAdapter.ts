/**
 * Data adapter to transform WeChat Cloud database format to website format
 */

import { PLAYER_PHOTOS } from "@shared/constants";

// WeChat Cloud user (player) format
interface WeChatUser {
  _id: string;
  _openid: string;
  nickname: string;
  real_name?: string;
  current_jersey_number: number;
  current_squad: string;
  group: string;
  bio?: string;
  positions?: string[];
  preferred_foot?: string;
  height_cm?: number;
  weight_kg?: number;
  player_value?: number;
  avatar_url?: string;
  skill_ratings?: Record<string, any>;
  self_skill_ratings?: Record<string, number>;
  teammate_evaluations?: Array<{
    tag: {
      text: string;
      icon: string;
      category: string;
      description: string;
    };
    count: number;
    evaluators: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

// Website player format
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

// WeChat Cloud event (match) format
interface WeChatEvent {
  _id: string;
  opponent?: string;
  location?: string;
  activity_category?: string;
  field_size?: string;
  start_time?: string;
  end_time?: string;
  competition_id?: string;
}

// Website match format
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

/**
 * Transform WeChat user to website player format
 */
export function transformUser(user: WeChatUser): Player {
  const jerseyNumber = user.current_jersey_number || 0;
  
  return {
    id: user._id,
    name: user.real_name || user.nickname || "未知",
    number: jerseyNumber,
    positions: user.positions || [],
    group: user.group === "competitive" ? "competitive" : "recreational",
    bio: user.bio || "",
    value: user.player_value || 0,
    avatar_url: PLAYER_PHOTOS[jerseyNumber] || user.avatar_url || "",
    preferred_foot: user.preferred_foot || "右脚",
    height_cm: user.height_cm || 175,
    weight_kg: user.weight_kg || 70,
    teammate_evaluations: (user.teammate_evaluations || []).map(evaluation => ({
      text: evaluation.tag.text,
      icon: evaluation.tag.icon,
      category: evaluation.tag.category,
      description: evaluation.tag.description,
      count: evaluation.count,
      evaluators: evaluation.evaluators.map(e => e.name),
    })),
    skill_ratings: user.skill_ratings || {},
    self_skill_ratings: user.self_skill_ratings || null,
  };
}

/**
 * Transform WeChat event to website match format
 */
export function transformEvent(event: WeChatEvent, goalRecords: any[]): Match {
  // Find goal records for this event
  const eventGoalRecords = goalRecords.filter(g => g.event_id === event._id);
  
  // Flatten nested goals array
  const allGoals = eventGoalRecords.flatMap(record => 
    (record.goals || []).map((goal: any) => ({
      scorer_name: goal.scorer_name,
      assister_name: goal.assister_name,
      minute: goal.minute,
      is_own_goal: goal.is_own_goal || false,
    }))
  );
  
  // Calculate scores (own goals count for opponent)
  const ourGoals = allGoals.filter((g: any) => !g.is_own_goal);
  const opponentGoals = allGoals.filter((g: any) => g.is_own_goal);
  
  const ourScore = ourGoals.length;
  const opponentScore = opponentGoals.length;
  
  // Determine result
  let result = "平";
  if (ourScore > opponentScore) result = "胜";
  if (ourScore < opponentScore) result = "负";
  
  // Format date
  const date = event.start_time ? new Date(event.start_time) : new Date();
  const dateStr = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  
  // Determine type
  const isCompetitive = event.activity_category === "competitive" || event.competition_id;
  const type = isCompetitive ? "competitive" : "friendly";
  const typeLabel = isCompetitive ? "竞技赛" : "友谊赛";
  
  return {
    id: event._id,
    date: dateStr,
    dateRaw: event.start_time || "",
    type,
    typeLabel,
    opponent: event.opponent || "对手",
    ourScore,
    opponentScore,
    result,
    venue: event.location || "未知场地",
    title: `蔚来联队 ${ourScore}:${opponentScore} ${event.opponent || "对手"}`,
    status: "completed",
    participants: {
      starters: 0,
      substitutes: 0,
      total: 0,
    },
    events: {
      goals: ourGoals.length,
      goalScorers: allGoals.map((g: any) => ({
        scorer: g.scorer_name || "未知",
        assister: g.assister_name || null,
        minute: g.minute || 0,
      })),
    },
  };
}

/**
 * Load and transform all data
 */
export async function loadStaticData() {
  try {
    // Load raw data from static JSON files
    const [usersRes, eventsRes, goalRecordsRes] = await Promise.all([
      fetch("/data/users.json"),
      fetch("/data/events.json"),
      fetch("/data/goal_records.json"),
    ]);

    const users: WeChatUser[] = await usersRes.json();
    const events: WeChatEvent[] = await eventsRes.json();
    const goalRecords: any[] = await goalRecordsRes.json();

    // Transform to website format
    const players = users.map(u => transformUser(u));
    const matches = events.map(e => transformEvent(e, goalRecords));

    return { players, matches };
  } catch (error) {
    console.error("Failed to load static data:", error);
    return { players: [], matches: [] };
  }
}
