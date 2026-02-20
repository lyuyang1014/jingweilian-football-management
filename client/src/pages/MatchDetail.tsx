import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { useParams, Link } from "wouter";
import { ArrowLeft, Shield, MapPin, Calendar, Target } from "lucide-react";
import { useMemo } from "react";

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: match, isLoading } = trpc.matches.getById.useQuery({ id: id || "" });

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
    return Object.entries(map).sort((a, b) => b[1].goals - a[1].goals);
  }, [match]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#4fc3f7] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-white/60">比赛未找到</p>
          <Link href="/matches" className="text-[#4fc3f7] hover:underline">返回比赛列表</Link>
        </div>
      </Layout>
    );
  }

  const result = match.result === "胜" ? "win" : match.result === "负" ? "loss" : "draw";
  const resultText = result === "win" ? "胜利" : result === "loss" ? "失利" : "平局";
  const resultColor = result === "win" ? "text-[#66bb6a]" : result === "loss" ? "text-[#ef5350]" : "text-[#ff9800]";
  const isCompetitive = match.typeLabel === "竞技赛" || match.type?.includes("competitive");

  return (
    <Layout>
      <div className="container pt-6">
        <Link href="/matches" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm no-underline">
          <ArrowLeft size={16} /> 返回比赛列表
        </Link>
      </div>

      <section className="py-12">
        <div className="container max-w-2xl">
          {/* Score Card */}
          <div className="bg-[#070b14] border border-white/5 rounded-xl p-8 text-center mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/30 text-xs flex items-center gap-1">
                <Calendar size={12} />
                {match.date}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                isCompetitive ? "bg-[#1a237e]/30 text-[#4fc3f7]" : "bg-[#4caf50]/10 text-[#66bb6a]"
              }`}>
                {match.typeLabel || (isCompetitive ? "竞技赛" : "友谊赛")}
              </span>
            </div>

            <div className="flex items-center justify-center gap-8 my-8">
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-[#4fc3f7]" />
                <span className="text-white font-[Oswald] text-lg">京蔚联</span>
              </div>
              <div>
                <div className="stat-number text-5xl text-white">
                  {match.ourScore} <span className="text-white/20 mx-2">-</span> {match.opponentScore}
                </div>
                <div className={`text-sm mt-2 ${resultColor}`}>{resultText}</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs">VS</div>
                <span className="text-white/60 font-[Oswald] text-lg">{match.opponent}</span>
              </div>
            </div>

            {match.venue && (
              <div className="flex items-center justify-center gap-1 text-white/30 text-xs">
                <MapPin size={12} /> {match.venue}
              </div>
            )}
          </div>

          {/* Goal Scorers */}
          {scorersSummary.length > 0 && (
            <div className="bg-[#070b14] border border-white/5 rounded-xl p-6 mb-4">
              <h3 className="text-white font-[Oswald] text-sm tracking-wider mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#4fc3f7]" /> 进球 / 助攻
              </h3>
              <div className="space-y-2">
                {scorersSummary.map(([name, stats]) => (
                  <div key={name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-white text-sm">{name}</span>
                    <div className="flex items-center gap-3">
                      {stats.goals > 0 && (
                        <span className="stat-number text-[#4fc3f7]">{stats.goals} 球</span>
                      )}
                      {stats.assists > 0 && (
                        <span className="stat-number text-[#66bb6a] text-sm">{stats.assists} 助攻</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goal Timeline */}
          {match.events?.goalScorers && match.events.goalScorers.length > 0 && (
            <div className="bg-[#070b14] border border-white/5 rounded-xl p-6">
              <h3 className="text-white font-[Oswald] text-sm tracking-wider mb-4">进球详情</h3>
              <div className="space-y-3">
                {match.events.goalScorers.map((g: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-[#4fc3f7] stat-number w-6 text-center">{i + 1}</span>
                    <span className="text-white">{g.scorer}</span>
                    {g.assister && (
                      <span className="text-white/30">
                        (助攻: <span className="text-white/50">{g.assister}</span>)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
