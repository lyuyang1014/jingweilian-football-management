import { useMatches } from "@/hooks/useStaticData";
import Layout from "@/components/Layout";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Calendar, Shield, MapPin, Trophy, Minus, X } from "lucide-react";

export default function Matches() {
  const { data: matches, isLoading } = useMatches();
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const years = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    const yrs = new Set(matches.map((m: any) => new Date(m.date).getFullYear()));
    return Array.from(yrs).sort((a, b) => b - a);
  }, [matches]);

  const filteredMatches = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    let list = [...matches];
    if (yearFilter !== "all") {
      list = list.filter((m: any) => new Date(m.date).getFullYear() === parseInt(yearFilter));
    }
    if (typeFilter !== "all") {
      list = list.filter((m: any) => {
        if (typeFilter === "competitive") return m.typeLabel === "竞技赛" || m.type?.includes("competitive");
        if (typeFilter === "friendly") return m.typeLabel === "友谊赛" || m.type?.includes("friendly");
        return true;
      });
    }
    return list.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches, yearFilter, typeFilter]);

  const stats = useMemo(() => {
    const wins = filteredMatches.filter((m: any) => m.ourScore > m.opponentScore).length;
    const draws = filteredMatches.filter((m: any) => m.ourScore === m.opponentScore).length;
    const losses = filteredMatches.filter((m: any) => m.ourScore < m.opponentScore).length;
    const goalsFor = filteredMatches.reduce((s: number, m: any) => s + (m.ourScore || 0), 0);
    const goalsAgainst = filteredMatches.reduce((s: number, m: any) => s + (m.opponentScore || 0), 0);
    return { total: filteredMatches.length, wins, draws, losses, goalsFor, goalsAgainst };
  }, [filteredMatches]);

  const getResult = (m: any) => {
    if (m.ourScore > m.opponentScore) return "win";
    if (m.ourScore < m.opponentScore) return "loss";
    return "draw";
  };

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#070b14] to-[#020309]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,195,247,0.05),transparent_70%)]" />

        <div className="relative z-10 container text-center">
          <p className="text-cyan-400/60 text-xs font-[Oswald] tracking-[0.3em] mb-3">MATCH HISTORY</p>
          <h1 className="text-5xl md:text-6xl font-[Oswald] text-white font-bold mb-4">比赛记录</h1>
          <p className="text-white/30 text-sm max-w-md mx-auto mb-10">
            京蔚联足球俱乐部全部比赛历史记录
          </p>

          {/* Stats Bar */}
          <div className="flex justify-center gap-8 md:gap-12 mb-10">
            {[
              { label: "总场次", value: stats.total, color: "text-white" },
              { label: "胜", value: stats.wins, color: "text-emerald-400" },
              { label: "平", value: stats.draws, color: "text-amber-400" },
              { label: "负", value: stats.losses, color: "text-red-400" },
              { label: "进球", value: stats.goalsFor, color: "text-cyan-400" },
              { label: "失球", value: stats.goalsAgainst, color: "text-white/50" },
            ].map((s) => (
              <div key={s.label}>
                <div className={`stat-number text-3xl ${s.color}`}>{s.value}</div>
                <div className="text-white/20 text-[10px] font-[Oswald] tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/20" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/40 transition-all appearance-none cursor-pointer"
              >
                <option value="all">全部年份</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              {[
                { key: "all", label: "全部" },
                { key: "competitive", label: "竞技赛" },
                { key: "friendly", label: "友谊赛" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTypeFilter(t.key)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    typeFilter === t.key
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/70"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Match List */}
      <section className="py-12 bg-[#020309]">
        <div className="container max-w-4xl">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/[0.03] rounded-xl h-20 animate-pulse" />
              ))}
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-20">
              <Shield className="w-12 h-12 mx-auto mb-4 text-white/10" />
              <p className="text-white/30">暂无比赛记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((m: any) => {
                const result = getResult(m);
                const isWin = result === "win";
                const isDraw = result === "draw";
                const isCompetitive = m.typeLabel === "竞技赛" || m.type?.includes("competitive");
                const scorers = m.events?.goalScorers || [];

                return (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className="group block bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all duration-200 no-underline"
                  >
                    <div className="flex items-center gap-4">
                      {/* Date */}
                      <div className="w-16 text-center shrink-0">
                        <div className="text-white/20 text-[10px] font-[Oswald] tracking-wider">
                          {new Date(m.date).getFullYear()}
                        </div>
                        <div className="text-white/50 text-sm font-medium">
                          {new Date(m.date).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-10 bg-white/5 shrink-0" />

                      {/* Teams & Score */}
                      <div className="flex-1 flex items-center gap-4">
                        <div className="flex items-center gap-2 w-28 justify-end shrink-0">
                          <span className="text-white text-sm font-medium">京蔚联</span>
                          <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`stat-number text-2xl ${isWin ? "text-white" : "text-white/60"}`}>{m.ourScore}</span>
                          <span className="text-white/10">:</span>
                          <span className={`stat-number text-2xl ${!isWin && !isDraw ? "text-white" : "text-white/60"}`}>{m.opponentScore}</span>
                        </div>

                        <div className="flex items-center gap-2 w-28 shrink-0">
                          <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                            <span className="text-white/20 text-[6px]">VS</span>
                          </div>
                          <span className="text-white/60 text-sm truncate">{m.opponent}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isCompetitive ? "bg-cyan-500/10 text-cyan-400/60" : "bg-emerald-500/10 text-emerald-400/60"
                        }`}>
                          {m.typeLabel || (isCompetitive ? "竞技赛" : "友谊赛")}
                        </span>
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isWin ? "bg-emerald-500/20" : isDraw ? "bg-amber-500/20" : "bg-red-500/20"
                        }`}>
                          {isWin ? (
                            <Trophy size={14} className="text-emerald-400" />
                          ) : isDraw ? (
                            <Minus size={14} className="text-amber-400" />
                          ) : (
                            <X size={14} className="text-red-400" />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Scorers preview */}
                    {scorers.length > 0 && (
                      <div className="mt-3 ml-[84px] flex items-center gap-2 text-white/20 text-xs">
                        <Trophy size={10} className="text-amber-400/40" />
                        {scorers.slice(0, 3).map((s: any, i: number) => (
                          <span key={i}>{s.scorer}{i < Math.min(scorers.length, 3) - 1 ? "," : ""}</span>
                        ))}
                        {scorers.length > 3 && <span>+{scorers.length - 3}</span>}
                      </div>
                    )}

                    {m.venue && (
                      <div className="mt-1 ml-[84px] flex items-center gap-1 text-white/10 text-[10px]">
                        <MapPin size={8} /> {m.venue}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
