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
  planned_start_time?: string;
  competition_id?: string;
  match_score?: {
    opponent_name?: string;
    our_score?: number;
    opponent_score?: number;
    result?: 'win' | 'loss' | 'draw';
  };
  title?: string;
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
  const name = user.real_name || user.nickname || "未知";
  const number = user.current_jersey_number || 0;
  const positions = user.positions || [];
  const group = user.group === "competitive" ? "competitive" : "recreational";
  
  // Get avatar from PLAYER_PHOTOS or use default
  const avatar_url = PLAYER_PHOTOS[number] || user.avatar_url || "";
  
  // Transform teammate evaluations
  const teammate_evaluations = (user.teammate_evaluations || []).map(evaluation => ({
    text: evaluation.tag.text,
    icon: evaluation.tag.icon,
    category: evaluation.tag.category,
    description: evaluation.tag.description,
    count: evaluation.count,
    evaluators: evaluation.evaluators.map(e => e.name),
  }));
  
  return {
    id: user._id,
    name,
    number,
    positions,
    group,
    bio: user.bio || "",
    value: user.player_value || 0,
    avatar_url,
    preferred_foot: user.preferred_foot || "右脚",
    height_cm: user.height_cm || 0,
    weight_kg: user.weight_kg || 0,
    teammate_evaluations,
    skill_ratings: user.skill_ratings || {},
    self_skill_ratings: user.self_skill_ratings || null,
  };
}

/**
 * Transform WeChat event to website match format
 */
export function transformEvent(event: WeChatEvent, goalRecords: any[]): Match {
  // Use match_score if available (official data from WeChat Cloud)
  let ourScore = 0;
  let opponentScore = 0;
  let result = "平";
  let opponentName = "对手";
  
  if (event.match_score) {
    // Use official match score
    ourScore = event.match_score.our_score || 0;
    opponentScore = event.match_score.opponent_score || 0;
    opponentName = event.match_score.opponent_name || "对手";
    
    // Map result
    if (event.match_score.result === 'win') result = "胜";
    else if (event.match_score.result === 'loss') result = "负";
    else result = "平";
  } else {
    // Fallback: calculate from goal records
    const eventGoalRecords = goalRecords.filter(g => g.event_id === event._id);
    const allGoals = eventGoalRecords.flatMap(record => 
      (record.goals || []).map((goal: any) => ({
        is_own_goal: goal.is_own_goal || false,
      }))
    );
    
    const ourGoals = allGoals.filter((g: any) => !g.is_own_goal);
    const opponentGoals = allGoals.filter((g: any) => g.is_own_goal);
    ourScore = ourGoals.length;
    opponentScore = opponentGoals.length;
    
    if (ourScore > opponentScore) result = "胜";
    else if (ourScore < opponentScore) result = "负";
    
    opponentName = event.opponent || "对手";
  }
  
  // Get all goals for goal scorers list
  const eventGoalRecords = goalRecords.filter(g => g.event_id === event._id);
  const allGoals = eventGoalRecords.flatMap(record => 
    (record.goals || []).map((goal: any) => ({
      scorer_name: goal.scorer_name,
      assister_name: goal.assister_name,
      minute: goal.minute,
      is_own_goal: goal.is_own_goal || false,
    }))
  );
  
  // Format date (prefer planned_start_time over start_time)
  const dateSource = event.planned_start_time || event.start_time;
  const date = dateSource ? new Date(dateSource) : new Date();
  const dateStr = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  
  // Determine type
  const isCompetitive = event.activity_category === "competitive" || event.competition_id;
  const type = isCompetitive ? "competitive" : "friendly";
  const typeLabel = isCompetitive ? "竞技赛" : "友谊赛";
  
  return {
    id: event._id,
    date: dateStr,
    dateRaw: dateSource || "",
    type,
    typeLabel,
    opponent: opponentName,
    ourScore,
    opponentScore,
    result,
    venue: event.location || "未知场地",
    title: `京蔚联 ${ourScore}:${opponentScore} ${opponentName}`,
    status: "completed",
    participants: {
      starters: 0,
      substitutes: 0,
      total: 0,
    },
    events: {
      goals: allGoals.filter((g: any) => !g.is_own_goal).length,
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
