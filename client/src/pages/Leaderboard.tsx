import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { PLAYER_PHOTOS } from "@shared/constants";
import { useState, useMemo } from "react";
import { Trophy, Target, Handshake } from "lucide-react";

type BoardType = "goals" | "assists" | "value";

export default function Leaderboard() {
  const { data: matches, isLoading: matchesLoading } = trpc.matches.list.useQuery();
  const { data: players, isLoading: playersLoading } = trpc.players.list.useQuery();
  const [board, setBoard] = useState<BoardType>("goals");

  const topScorers = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    const map: Record<string, number> = {};
    matches.forEach((m: any) => {
      const goalScorers = m.events?.goalScorers || [];
      goalScorers.forEach((g: any) => {
        const name = g.scorer || g.name || g.playerName;
        if (name) map[name] = (map[name] || 0) + 1;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, goals], i) => ({ name, value: goals, rank: i + 1 }));
  }, [matches]);

  const topAssists = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    const map: Record<string, number> = {};
    matches.forEach((m: any) => {
      const goalScorers = m.events?.goalScorers || [];
      goalScorers.forEach((g: any) => {
        const assister = g.assister;
        if (assister) map[assister] = (map[assister] || 0) + 1;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, assists], i) => ({ name, value: assists, rank: i + 1 }));
  }, [matches]);

  const topValue = useMemo(() => {
    if (!players || !Array.isArray(players)) return [];
    return players
      .filter((p: any) => p.value && p.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 20)
      .map((p: any, i: number) => ({
        name: p.name,
        value: Math.round(p.value * 10) / 10,
        rank: i + 1,
        jerseyNumber: p.number,
      }));
  }, [players]);

  const currentList =
    board === "goals" ? topScorers : board === "assists" ? topAssists : topValue;
  const unitLabel = board === "goals" ? "球" : board === "assists" ? "助攻" : "";
  const isLoading = matchesLoading || playersLoading;

  const medalColor = (rank: number) => {
    if (rank === 1) return "text-[#ffd700] bg-[#ffd700]/10";
    if (rank === 2) return "text-[#c0c0c0] bg-[#c0c0c0]/10";
    if (rank === 3) return "text-[#cd7f32] bg-[#cd7f32]/10";
    return "text-white/30 bg-transparent";
  };

  const findJerseyNumber = (name: string) => {
    if (!players || !Array.isArray(players)) return null;
    const p = (players as any[]).find((p: any) => p.name === name);
    return p?.number || null;
  };

  const boards: { key: BoardType; label: string; icon: any }[] = [
    { key: "goals", label: "射手榜", icon: Target },
    { key: "assists", label: "助攻榜", icon: Handshake },
    { key: "value", label: "身价榜", icon: Trophy },
  ];

  return (
    <Layout>
      <section className="pt-12 pb-8 bg-gradient-to-b from-[#070b14] to-[#020309]">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-[Oswald] text-white text-center mb-2">
            排行榜
          </h1>
          <p className="text-white/40 text-center text-sm tracking-wider mb-8">LEADERBOARD</p>

          <div className="flex justify-center gap-2">
            {boards.map((b) => (
              <button
                key={b.key}
                onClick={() => setBoard(b.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-[Oswald] tracking-wider transition-all ${
                  board === b.key
                    ? "bg-[#1a237e] text-[#4fc3f7] border border-[#4fc3f7]/30"
                    : "bg-[#070b14] text-white/50 border border-white/5 hover:text-white/80"
                }`}
              >
                <b.icon size={16} />
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-[#020309]">
        <div className="container max-w-2xl">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#4fc3f7]/30 border-t-[#4fc3f7] rounded-full animate-spin" />
            </div>
          ) : currentList.length === 0 ? (
            <p className="text-white/30 text-center py-12">
              {board === "assists" ? "暂无助攻数据" : "暂无数据"}
            </p>
          ) : (
            <div className="space-y-1">
              {currentList.map((item: any) => {
                const jerseyNum = item.jerseyNumber || findJerseyNumber(item.name);
                const photo = jerseyNum ? PLAYER_PHOTOS[jerseyNum] : null;
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-4 bg-[#070b14] border border-white/5 rounded-lg p-4 hover:bg-[#0a0f1a] transition-colors"
                  >
                    <span
                      className={`font-[Oswald] text-lg w-8 h-8 rounded-full flex items-center justify-center ${medalColor(item.rank)}`}
                    >
                      {item.rank}
                    </span>
                    {photo ? (
                      <img
                        src={photo}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#1a237e]/20 flex items-center justify-center">
                        <span className="text-[#4fc3f7]/40 text-xs font-[Oswald]">
                          {jerseyNum || "?"}
                        </span>
                      </div>
                    )}
                    <span className="text-white flex-1">{item.name}</span>
                    <div className="text-right">
                      <span className="font-[Oswald] text-xl text-[#4fc3f7]">{item.value}</span>
                      {unitLabel && (
                        <span className="text-white/30 text-xs ml-1">{unitLabel}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
