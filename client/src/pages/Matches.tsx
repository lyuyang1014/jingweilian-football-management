import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Calendar, Shield, MapPin, Filter } from "lucide-react";

export default function Matches() {
  const { data: matches, isLoading } = trpc.matches.list.useQuery();
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
    return { total: filteredMatches.length, wins, draws, losses };
  }, [filteredMatches]);

  const getResult = (m: any) => {
    if (m.ourScore > m.opponentScore) return "win";
    if (m.ourScore < m.opponentScore) return "loss";
    return "draw";
  };

  const resultStyle = (r: string) => {
    switch (r) {
      case "win": return { text: "胜", cls: "bg-[#4caf50]/20 text-[#66bb6a]", border: "border-l-[#4caf50]" };
      case "loss": return { text: "负", cls: "bg-[#ef5350]/20 text-[#ef5350]", border: "border-l-[#ef5350]" };
      default: return { text: "平", cls: "bg-[#ff9800]/20 text-[#ff9800]", border: "border-l-[#ff9800]" };
    }
  };

  return (
    <Layout>
      <section className="pt-12 pb-8 bg-gradient-to-b from-[#070b14] to-[#020309]">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-[Oswald] text-white text-center mb-2">
            比赛记录
          </h1>
          <p className="text-white/40 text-center text-sm tracking-wider mb-8">MATCH HISTORY</p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/30" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-[#070b14] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4fc3f7]/50"
              >
                <option value="all">全部年份</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/30" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#070b14] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4fc3f7]/50"
              >
                <option value="all">全部类型</option>
                <option value="competitive">竞技赛</option>
                <option value="friendly">友谊赛</option>
              </select>
            </div>
          </div>

          {/* Summary stats */}
          <div className="flex justify-center gap-6 text-center">
            <div>
              <div className="stat-number text-2xl text-white">{stats.total}</div>
              <div className="text-white/30 text-xs">总场次</div>
            </div>
            <div>
              <div className="stat-number text-2xl text-[#66bb6a]">{stats.wins}</div>
              <div className="text-white/30 text-xs">胜</div>
            </div>
            <div>
              <div className="stat-number text-2xl text-[#ff9800]">{stats.draws}</div>
              <div className="text-white/30 text-xs">平</div>
            </div>
            <div>
              <div className="stat-number text-2xl text-[#ef5350]">{stats.losses}</div>
              <div className="text-white/30 text-xs">负</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-[#020309]">
        <div className="container max-w-3xl">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-[#070b14] rounded-lg h-20 animate-pulse" />
              ))}
            </div>
          ) : filteredMatches.length === 0 ? (
            <p className="text-white/30 text-center py-12">暂无比赛记录</p>
          ) : (
            <div className="space-y-2">
              {filteredMatches.map((m: any) => {
                const result = getResult(m);
                const rs = resultStyle(result);
                return (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className={`block bg-[#070b14] border border-white/5 border-l-2 ${rs.border} rounded-lg p-4 hover:bg-[#0a0f1a] transition-colors no-underline`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-white/20 text-xs w-20">
                          {new Date(m.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#4fc3f7]" />
                          <span className="text-white text-sm">京蔚联</span>
                        </div>
                        <div className="stat-number text-xl text-white">
                          {m.ourScore} <span className="text-white/20 mx-1">-</span> {m.opponentScore}
                        </div>
                        <span className="text-white/60 text-sm">{m.opponent}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          m.typeLabel === "竞技赛" || m.type?.includes("competitive")
                            ? "bg-[#1a237e]/30 text-[#4fc3f7]"
                            : "bg-[#4caf50]/10 text-[#66bb6a]"
                        }`}>
                          {m.typeLabel || (m.type?.includes("competitive") ? "竞技赛" : "友谊赛")}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${rs.cls}`}>
                          {rs.text}
                        </span>
                      </div>
                    </div>
                    {m.venue && (
                      <div className="flex items-center gap-1 mt-2 text-white/20 text-xs ml-20">
                        <MapPin size={10} /> {m.venue}
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
