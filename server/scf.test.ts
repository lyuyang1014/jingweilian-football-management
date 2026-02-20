import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from "axios";
const mockedAxios = vi.mocked(axios);

// Reset module cache between tests
beforeEach(() => {
  vi.resetModules();
});

describe("SCF API Proxy", () => {
  it("fetchPlayers returns player array from API", async () => {
    const mockPlayers = [
      {
        id: "abc123",
        name: "杨林",
        number: 1,
        positions: ["前锋"],
        group: "competitive",
        bio: "Test bio",
        value: 289.4,
        avatar_url: "",
        preferred_foot: "左脚",
        height_cm: 180,
        weight_kg: 83,
        teammate_evaluations: [],
        skill_ratings: {},
        self_skill_ratings: null,
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, data: mockPlayers },
    });

    // Import fresh module to avoid cache
    const { fetchPlayers } = await import("./scf");
    const result = await fetchPlayers();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("杨林");
    expect(result[0].number).toBe(1);
    expect(result[0].value).toBe(289.4);
  });

  it("fetchMatches returns match array from API", async () => {
    const mockMatches = [
      {
        id: "match1",
        date: "2025/9/27",
        dateRaw: "2025-09-27T04:00:00.000Z",
        type: "external_competitive_match",
        typeLabel: "竞技赛",
        opponent: "中信银行",
        ourScore: 4,
        opponentScore: 2,
        result: "胜",
        venue: "聚加球场",
        title: "9月27日 vs 中信银行",
        status: "finished",
        participants: { starters: 0, substitutes: 0, total: 0 },
        events: {
          goals: 4,
          goalScorers: [
            { scorer: "杨林", assister: null, minute: 0 },
            { scorer: "杨林", assister: null, minute: 0 },
          ],
        },
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, data: { totalMatches: 1, matches: mockMatches } },
    });

    const { fetchMatches } = await import("./scf");
    const result = await fetchMatches();

    expect(result).toHaveLength(1);
    expect(result[0].opponent).toBe("中信银行");
    expect(result[0].ourScore).toBe(4);
    expect(result[0].events.goalScorers).toHaveLength(2);
    expect(result[0].events.goalScorers[0].scorer).toBe("杨林");
  });

  it("fetchPlayers handles API error gracefully", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

    const { fetchPlayers } = await import("./scf");
    const result = await fetchPlayers();

    // Should return empty array on first failure (no cache)
    expect(Array.isArray(result)).toBe(true);
  });

  it("fetchMatches handles API error gracefully", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

    const { fetchMatches } = await import("./scf");
    const result = await fetchMatches();

    expect(Array.isArray(result)).toBe(true);
  });

  it("fetchPlayerById returns correct player", async () => {
    const mockPlayers = [
      { id: "p1", name: "杨林", number: 1, positions: ["前锋"], group: "competitive", bio: "", value: 289.4, avatar_url: "", preferred_foot: "左脚", height_cm: 180, weight_kg: 83, teammate_evaluations: [], skill_ratings: {}, self_skill_ratings: null },
      { id: "p2", name: "张健", number: 99, positions: ["前锋"], group: "competitive", bio: "", value: 327.3, avatar_url: "", preferred_foot: "右脚", height_cm: 175, weight_kg: 70, teammate_evaluations: [], skill_ratings: {}, self_skill_ratings: null },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, data: mockPlayers },
    });

    const { fetchPlayerById } = await import("./scf");
    const result = await fetchPlayerById("p2");

    expect(result).not.toBeNull();
    expect(result!.name).toBe("张健");
    expect(result!.number).toBe(99);
  });

  it("fetchPlayerById returns null for non-existent player", async () => {
    const mockPlayers = [
      { id: "p1", name: "杨林", number: 1, positions: ["前锋"], group: "competitive", bio: "", value: 289.4, avatar_url: "", preferred_foot: "左脚", height_cm: 180, weight_kg: 83, teammate_evaluations: [], skill_ratings: {}, self_skill_ratings: null },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, data: mockPlayers },
    });

    const { fetchPlayerById } = await import("./scf");
    const result = await fetchPlayerById("nonexistent");

    expect(result).toBeNull();
  });
});
