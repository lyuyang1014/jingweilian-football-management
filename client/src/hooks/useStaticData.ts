import { useState, useEffect } from "react";
import { loadStaticData, Player, Match } from "@/lib/dataAdapter";

interface StaticData {
  players: Player[];
  matches: Match[];
  goalRecords: any[];
}

/**
 * Hook to load static data from JSON files
 * This replaces tRPC calls with static data loading for production deployment
 */
export function useStaticData() {
  const [data, setData] = useState<StaticData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadStaticData()
      .then((loadedData) => {
        setData(loadedData);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  return { data, isLoading, error };
}

/**
 * Hook to get all players
 */
export function usePlayers() {
  const { data, isLoading, error } = useStaticData();
  
  return {
    data: data?.players || [],
    isLoading,
    error,
  };
}

/**
 * Hook to get a single player by ID
 */
export function usePlayer(id: string) {
  const { data, isLoading, error } = useStaticData();
  
  const player = data?.players.find(p => p.id === id) || null;
  
  return {
    data: player,
    isLoading,
    error,
  };
}

/**
 * Hook to get all matches
 */
export function useMatches() {
  const { data, isLoading, error } = useStaticData();
  
  return {
    data: data?.matches || [],
    isLoading,
    error,
  };
}

/**
 * Hook to get a single match by ID
 */
export function useMatch(id: string) {
  const { data, isLoading, error } = useStaticData();
  
  const match = data?.matches.find(m => m.id === id) || null;
  
  return {
    data: match,
    isLoading,
    error,
  };
}

/**
 * Hook to get all goal records
 */
export function useGoalRecords() {
  const { data, isLoading, error } = useStaticData();
  
  return {
    data: data?.goalRecords || [],
    isLoading,
    error,
  };
}
