import { useMatches, usePlayers, useGoalRecords } from "@/hooks/useStaticData";
import Layout from "@/components/Layout";
import { PLAYER_PHOTOS } from "@shared/constants";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Trophy, Target, Handshake, Crown, Medal, Award } from "lucide-react";

type BoardType = "goals" | "assists" | "value";

export default function Leaderboard() {
  const { data: matches, isLoading: matchesLoading } = useMatches();
  const { data: players, isLoading: playersLoading } = usePlayers();
  const { data: goalRecords, isLoading: goalRecordsLoading } = useGoalRecords();
  const [board, setBoard] = useState<BoardType>("goals");

  const playerIdMap = useMemo(() => {
    if (!players || !Array.isArray(players)) return {};
    const map: Record<string, string> = {};
    players.forEach((p: any) => { if (p.name && p.id) map[p.name] = p.id; });
    return map;
  }, [players]);

  const topScorers = useMemo(() => {
    if (!goalRecords || !Array.isArray(goalRecords)) return [];
    const map: Record<string, number> = {};
    goalRecords.forEach((record: any) => {
      (record.goals || []).forEach((goal: any) => {
        const name = goal.scorer_name;
        if (name) map[name] = (map[name] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([name, goals], i) => ({ name, value: goals, rank: i + 1 }));
  }, [goalRecords]);

  const topAssists = useMemo(() => {
    if (!goalRecords || !Array.isArray(goalRecords)) return [];
    const map: Record<string, number> = {};
    goalRecords.forEach((record: any) => {
      (record.goals || []).forEach((goal: any) => {
        const name = goal.assister_name;
        if (name) map[name] = (map[name] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([name, assists], i) => ({ name, value: assists, rank: i + 1 }));
  }, [goalRecords]);

  const topValue = useMemo(() => {
    if (!players || !Array.isArray(players)) return [];
    return players.filter((p: any) => p.value && p.value > 0)
      .sort((a: any, b: any) => b.value - a.value).slice(0, 20)
      .map((p: any, i: number) => ({
        name: p.name, value: Math.round(p.value * 10) / 10, rank: i + 1, jerseyNumber: p.number,
      }));
  }, [players]);

  const currentList = board === "goals" ? topScorers : board === "assists" ? topAssists : topValue;
  const unitLabel = board === "goals" ? "球" : board === "assists" ? "助攻" : "万";
  const isLoading = matchesLoading || playersLoading || goalRecordsLoading;

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

  const maxValue = currentList.length > 0 ? currentList[0]?.value || 1 : 1;

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#070b14] to-[#020309]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.03),transparent_70%)]" />

        <div className="relative z-10 container text-center">
          <p className="text-amber-400/60 text-xs font-[Oswald] tracking-[0.3em] mb-3">LEADERBOARD</p>
          <h1 className="text-5xl md:text-6xl font-[Oswald] text-white font-bold mb-4">排行榜</h1>
          <p className="text-white/30 text-sm max-w-md mx-auto mb-10">
            京蔚联足球俱乐部球员数据排名
          </p>

          <div className="flex justify-center gap-3">
            {boards.map((b) => (
              <button
                key={b.key}
                onClick={() => setBoard(b.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  board === b.key
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10"
                    : "bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/70"
                }`}
              >
                <b.icon size={16} />
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-12 bg-[#020309]">
        <div className="container max-w-3xl">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-white/10" />
              <p className="text-white/30">{board === "assists" ? "暂无助攻数据" : "暂无数据"}</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {currentList.length >= 3 && (
                <div className="flex items-end justify-center gap-4 mb-12 px-4">
                  {[1, 0, 2].map((idx) => {
                    const item = currentList[idx];
                    const jerseyNum = (item as any).jerseyNumber || findJerseyNumber(item.name);
                    const photo = jerseyNum ? PLAYER_PHOTOS[jerseyNum] : null;
                    const pid = playerIdMap[item.name];
                    const isFirst = idx === 0;
                    const heights = ["h-36", "h-28", "h-24"];
                    const sizes = isFirst ? "w-20 h-20" : "w-16 h-16";
                    const rankIcons = [
                      <Crown key={0} className="w-6 h-6 text-amber-400" />,
                      <Medal key={1} className="w-5 h-5 text-gray-300" />,
                      <Award key={2} className="w-5 h-5 text-orange-400" />,
                    ];
                    const rankColors = ["border-amber-400/30 bg-amber-500/5", "border-gray-400/20 bg-gray-500/5", "border-orange-400/20 bg-orange-500/5"];
                    const textColors = ["text-amber-400", "text-gray-300", "text-orange-400"];

                    const content = (
                      <div className={`flex flex-col items-center ${isFirst ? "order-2" : idx === 1 ? "order-1" : "order-3"}`}>
                        <div className="mb-3">{rankIcons[idx]}</div>
                        <div className={`${sizes} rounded-full overflow-hidden border-2 ${rankColors[idx]} mb-3`}>
                          {photo ? (
                            <img src={photo} alt={item.name} className="w-full h-full object-cover object-top" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
                              <span className="stat-number text-white/20">{jerseyNum || "?"}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-white text-sm font-medium mb-1">{item.name}</span>
                        <span className={`stat-number text-2xl ${textColors[idx]}`}>{item.value}</span>
                        <span className="text-white/20 text-[10px]">{unitLabel}</span>
                        <div className={`w-24 ${heights[idx]} mt-3 rounded-t-lg ${rankColors[idx]} border`} />
                      </div>
                    );

                    return pid ? (
                      <Link key={idx} href={`/players/${pid}`} className="no-underline">{content}</Link>
                    ) : (
                      <div key={idx}>{content}</div>
                    );
                  })}
                </div>
              )}

              {/* Full List */}
              <div className="space-y-2">
                {currentList.map((item: any) => {
                  const jerseyNum = item.jerseyNumber || findJerseyNumber(item.name);
                  const photo = jerseyNum ? PLAYER_PHOTOS[jerseyNum] : null;
                  const pid = playerIdMap[item.name];
                  const barWidth = (item.value / maxValue) * 100;

                  const inner = (
                    <div className="flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all">
                      {/* Rank */}
                      <span className={`stat-number text-lg w-8 text-center shrink-0 ${
                        item.rank === 1 ? "text-amber-400" :
                        item.rank === 2 ? "text-gray-300" :
                        item.rank === 3 ? "text-orange-400" : "text-white/20"
                      }`}>
                        {item.rank}
                      </span>

                      {/* Avatar */}
                      {photo ? (
                        <img src={photo} alt={item.name} className="w-10 h-10 rounded-full object-cover object-top shrink-0 border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                          <span className="text-white/20 text-xs stat-number">{jerseyNum || "?"}</span>
                        </div>
                      )}

                      {/* Name + Bar */}
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-sm font-medium">{item.name}</span>
                        <div className="h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              item.rank <= 3 ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-cyan-500/60 to-cyan-400/40"
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>

                      {/* Value */}
                      <div className="text-right shrink-0">
                        <span className={`stat-number text-xl ${
                          item.rank <= 3 ? "text-amber-400" : "text-cyan-400"
                        }`}>{item.value}</span>
                        <span className="text-white/20 text-xs ml-1">{unitLabel}</span>
                      </div>
                    </div>
                  );

                  return pid ? (
                    <Link key={item.name} href={`/players/${pid}`} className="block no-underline">{inner}</Link>
                  ) : (
                    <div key={item.name}>{inner}</div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
