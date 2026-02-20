import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { useParams, Link } from "wouter";
import { ArrowLeft, Shield, MapPin, Calendar, Target, Swords, Trophy, Clock } from "lucide-react";
import { useMemo } from "react";

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: match, isLoading } = trpc.matches.getById.useQuery({ id: id || "" });
  const { data: players } = trpc.players.list.useQuery();

  // Build a name -> player id lookup
  const playerIdMap = useMemo(() => {
    if (!players || !Array.isArray(players)) return {};
    const map: Record<string, string> = {};
    players.forEach((p: any) => {
      if (p.name && p.id) map[p.name] = p.id;
    });
    return map;
  }, [players]);

  // Aggregate scorers by name
  const scorersSummary = useMemo(() => {
    if (!match?.events?.goalScorers) return [];
    const map: Record<string, { goals: number; assists: number }> = {};
    match.events.goalScorers.forEach((s: any) => {
      const name = s.scorer;
      if (!name) return;
      if (!map[name]) map[name] = { goals: 0, assists: 0 };
      map[name].goals += 1;
      if (s.assister && s.assister !== name) {
        if (!map[s.assister]) map[s.assister] = { goals: 0, assists: 0 };
        map[s.assister].assists += 1;
      }
    });
    return Object.entries(map).sort((a, b) => b[1].goals - a[1].goals || b[1].assists - a[1].assists);
  }, [match]);

  // Clickable player name component
  const PlayerName = ({ name, className = "" }: { name: string; className?: string }) => {
    const pid = playerIdMap[name];
    if (pid) {
      return (
        <Link href={`/players/${pid}`} className={`hover:text-cyan-400 transition-colors no-underline ${className}`}>
          {name}
        </Link>
      );
    }
    return <span className={className}>{name}</span>;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-white/60">比赛未找到</p>
          <Link href="/matches" className="text-cyan-400 hover:underline">返回比赛列表</Link>
        </div>
      </Layout>
    );
  }

  const isWin = match.ourScore > match.opponentScore;
  const isDraw = match.ourScore === match.opponentScore;
  const resultText = isWin ? "胜利" : isDraw ? "平局" : "失利";
  const resultColor = isWin ? "text-emerald-400" : isDraw ? "text-amber-400" : "text-red-400";
  const resultBg = isWin ? "from-emerald-500/10" : isDraw ? "from-amber-500/10" : "from-red-500/10";
  const isCompetitive = match.typeLabel === "竞技赛" || match.type?.includes("competitive");

  return (
    <Layout>
      {/* Match Hero */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] to-[#020309]" />
        <div className={`absolute inset-0 bg-gradient-to-r ${resultBg} to-transparent opacity-30`} />

        <div className="relative z-10 container">
          <Link href="/matches" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm no-underline mb-8">
            <ArrowLeft size={16} /> 返回比赛列表
          </Link>

          {/* Match Info Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`text-xs px-3 py-1 rounded-full ${
              isCompetitive ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {match.typeLabel || (isCompetitive ? "竞技赛" : "友谊赛")}
            </span>
            <span className="text-white/30 text-sm flex items-center gap-1">
              <Calendar size={14} /> {match.date}
            </span>
            {match.venue && (
              <span className="text-white/30 text-sm flex items-center gap-1">
                <MapPin size={14} /> {match.venue}
              </span>
            )}
          </div>

          {/* Score Board */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 md:p-12 max-w-3xl">
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-white font-[Oswald] text-xl md:text-2xl">蔚来联队</h3>
                <p className="text-white/30 text-xs mt-1">NIO UNITED</p>
              </div>

              {/* Score */}
              <div className="px-8 md:px-12 text-center">
                <div className="stat-number text-6xl md:text-7xl text-white leading-none">
                  {match.ourScore}
                  <span className="text-white/10 mx-3">:</span>
                  {match.opponentScore}
                </div>
                <div className={`text-sm mt-3 font-medium ${resultColor}`}>{resultText}</div>
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-white/30 text-xs font-bold">VS</span>
                </div>
                <h3 className="text-white/80 font-[Oswald] text-xl md:text-2xl">{match.opponent}</h3>
                <p className="text-white/20 text-xs mt-1">OPPONENT</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Match Details */}
      <section className="py-12 bg-[#020309]">
        <div className="container max-w-3xl">
          {/* Goal Timeline */}
          {match.events?.goalScorers && match.events.goalScorers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-white/60 text-xs font-[Oswald] tracking-[0.2em] mb-6 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" /> 进球时间线
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-white/5" />

                <div className="space-y-4">
                  {match.events.goalScorers.map((g: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      {/* Timeline dot */}
                      <div className="w-12 h-12 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center z-10">
                        <Trophy className="w-5 h-5 text-amber-400" />
                      </div>

                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <PlayerName name={g.scorer} className="text-white font-medium" />
                          <span className="text-amber-400 text-xs stat-number">进球 #{i + 1}</span>
                        </div>
                        {g.assister && (
                          <div className="flex items-center gap-1 text-white/30 text-xs">
                            <Swords size={12} className="text-cyan-400/60" />
                            <span>助攻:</span>
                            <PlayerName name={g.assister} className="text-white/50" />
                          </div>
                        )}
                        {g.minute && (
                          <div className="flex items-center gap-1 text-white/20 text-xs mt-1">
                            <Clock size={10} /> {g.minute}'
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Player Stats Summary */}
          {scorersSummary.length > 0 && (
            <div className="mb-8">
              <h3 className="text-white/60 text-xs font-[Oswald] tracking-[0.2em] mb-6 flex items-center gap-2">
                <Swords className="w-4 h-4 text-cyan-400" /> 球员数据
              </h3>
              <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-3 px-5 py-3 border-b border-white/5 text-white/30 text-xs font-[Oswald] tracking-wider">
                  <span>球员</span>
                  <span className="text-center">进球</span>
                  <span className="text-center">助攻</span>
                </div>
                {scorersSummary.map(([name, stats], i) => (
                  <div key={name} className={`grid grid-cols-3 px-5 py-3.5 items-center ${i > 0 ? "border-t border-white/5" : ""} hover:bg-white/[0.02]`}>
                    <PlayerName name={name} className="text-white text-sm" />
                    <div className="text-center">
                      {stats.goals > 0 ? (
                        <span className="stat-number text-amber-400">{stats.goals}</span>
                      ) : (
                        <span className="text-white/10">—</span>
                      )}
                    </div>
                    <div className="text-center">
                      {stats.assists > 0 ? (
                        <span className="stat-number text-cyan-400">{stats.assists}</span>
                      ) : (
                        <span className="text-white/10">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No goal data notice */}
          {(!match.events?.goalScorers || match.events.goalScorers.length === 0) && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-8 text-center">
              <Target className="w-8 h-8 mx-auto mb-3 text-white/10" />
              <p className="text-white/30 text-sm">本场比赛暂无详细进球数据记录</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
