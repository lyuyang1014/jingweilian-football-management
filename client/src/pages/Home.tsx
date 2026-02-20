import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Link } from "wouter";
import { SITE_ASSETS, PLAYER_PHOTOS } from "@shared/constants";
import { useMemo } from "react";
import { ChevronRight, MapPin, Trophy, Users, Calendar, Target, Shield } from "lucide-react";

export default function Home() {
  const { data: players, isLoading: playersLoading } = trpc.players.list.useQuery();
  const { data: matches, isLoading: matchesLoading } = trpc.matches.list.useQuery();

  const stats = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return null;
    const total = matches.length;
    const wins = matches.filter((m: any) => m.result === "胜" || m.ourScore > m.opponentScore).length;
    const draws = matches.filter((m: any) => m.result === "平" || (m.ourScore === m.opponentScore && m.result !== "胜" && m.result !== "负")).length;
    const losses = matches.filter((m: any) => m.result === "负" || m.ourScore < m.opponentScore).length;
    const goalsFor = matches.reduce((s: number, m: any) => s + (m.ourScore || 0), 0);
    const goalsAgainst = matches.reduce((s: number, m: any) => s + (m.opponentScore || 0), 0);
    const competitive = matches.filter((m: any) => m.typeLabel === "竞技赛" || m.type?.includes("competitive")).length;
    const friendly = matches.filter((m: any) => m.typeLabel === "友谊赛" || m.type?.includes("friendly")).length;
    return { total, wins, draws, losses, goalsFor, goalsAgainst, competitive, friendly };
  }, [matches]);

  const recentMatches = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    return [...matches]
      .sort((a: any, b: any) => new Date(b.dateRaw || b.date).getTime() - new Date(a.dateRaw || a.date).getTime())
      .slice(0, 6);
  }, [matches]);

  const topScorers = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    const scorerMap: Record<string, number> = {};
    matches.forEach((m: any) => {
      const scorers = m.events?.goalScorers || m.scorers || [];
      scorers.forEach((s: any) => {
        const name = s.scorer || s.name || s.playerName;
        if (name) scorerMap[name] = (scorerMap[name] || 0) + 1;
      });
    });
    return Object.entries(scorerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, goals], i) => ({ name, goals, rank: i + 1 }));
  }, [matches]);

  const squadPreview = useMemo(() => {
    if (!players || !Array.isArray(players)) return [];
    return players
      .filter((p: any) => p.number && PLAYER_PHOTOS[p.number])
      .slice(0, 8);
  }, [players]);

  const getResult = (m: any) => {
    if (m.result === "胜") return "win";
    if (m.result === "负") return "loss";
    if (m.result === "平") return "draw";
    if (m.ourScore > m.opponentScore) return "win";
    if (m.ourScore < m.opponentScore) return "loss";
    return "draw";
  };

  const resultLabel = (r: string) => {
    switch (r) {
      case "win": return { text: "胜", cls: "bg-[#4caf50]/20 text-[#66bb6a]" };
      case "loss": return { text: "负", cls: "bg-[#ef5350]/20 text-[#ef5350]" };
      default: return { text: "平", cls: "bg-[#ff9800]/20 text-[#ff9800]" };
    }
  };

  const medalColor = (rank: number) => {
    if (rank === 1) return "text-[#ffd700]";
    if (rank === 2) return "text-[#c0c0c0]";
    if (rank === 3) return "text-[#cd7f32]";
    return "text-white/50";
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020309] via-[#070b14] to-[#020309]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(26,35,126,0.3)_0%,_transparent_70%)]" />
        <div className="relative z-10 text-center container">
          <img
            src={SITE_ASSETS.clubLogo}
            alt="京蔚联"
            className="w-28 h-28 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(79,195,247,0.3)]"
          />
          <h1 className="text-5xl md:text-7xl font-[Oswald] font-bold text-white tracking-wider mb-4">
            NIO UNITED FC
          </h1>
          <p className="text-[#4fc3f7] text-xl md:text-2xl font-[Oswald] tracking-[0.3em] mb-2">
            京蔚联足球俱乐部
          </p>
          <p className="text-white/40 text-sm tracking-wider mt-4">
            CLUB BY BEIJING · EST. 2024
          </p>
          {stats && (
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {[
                { label: "总场次", value: stats.total, icon: Calendar },
                { label: "胜场", value: stats.wins, icon: Trophy },
                { label: "进球", value: stats.goalsFor, icon: Target },
                { label: "球员", value: players?.length || 0, icon: Users },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <s.icon className="w-5 h-5 mx-auto mb-2 text-[#4fc3f7]/60" />
                  <div className="stat-number text-3xl md:text-4xl text-white">{s.value}</div>
                  <div className="text-white/40 text-xs tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-20 bg-[#03060d]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-[Oswald] text-white mb-6">
              关于俱乐部
            </h2>
            <div className="w-16 h-0.5 bg-[#4fc3f7] mx-auto mb-8" />
            <p className="text-white/60 leading-relaxed text-lg">
              京蔚联足球俱乐部（NIO United FC）成立于2024年，是一支由蔚来汽车北京车主组成的业余足球队。
              我们秉承"团结、拼搏、快乐"的精神，在北京各大业余足球联赛中征战。
              俱乐部设有竞技组和娱乐组，满足不同水平球员的需求。
            </p>
          </div>
        </div>
      </section>

      {/* Season Stats */}
      {stats && (
        <section className="py-20 bg-[#020309]">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-[Oswald] text-white text-center mb-12">
              赛季数据
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { label: "总场次", value: stats.total, sub: `竞技${stats.competitive} / 友谊${stats.friendly}` },
                { label: "胜/平/负", value: `${stats.wins}/${stats.draws}/${stats.losses}`, sub: `胜率 ${stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0}%` },
                { label: "进球", value: stats.goalsFor, sub: `场均 ${stats.total > 0 ? (stats.goalsFor / stats.total).toFixed(1) : "0"}` },
                { label: "失球", value: stats.goalsAgainst, sub: `场均 ${stats.total > 0 ? (stats.goalsAgainst / stats.total).toFixed(1) : "0"}` },
              ].map((s) => (
                <div key={s.label} className="bg-[#070b14] border border-white/5 rounded-lg p-6 text-center">
                  <div className="text-white/40 text-xs tracking-wider mb-2 font-[Oswald]">{s.label}</div>
                  <div className="stat-number text-3xl text-white mb-1">{s.value}</div>
                  <div className="text-white/30 text-xs">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Matches */}
      <section className="py-20 bg-[#03060d]">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-[Oswald] text-white">近期比赛</h2>
            <Link href="/matches" className="text-[#4fc3f7] text-sm flex items-center gap-1 hover:underline no-underline">
              查看全部 <ChevronRight size={16} />
            </Link>
          </div>
          {matchesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#070b14] rounded-lg h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMatches.map((m: any) => {
                const result = getResult(m);
                const rl = resultLabel(result);
                return (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className="bg-[#070b14] border border-white/5 rounded-lg p-5 hover:border-[#1a237e]/50 transition-colors no-underline block"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/30 text-xs">{m.date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${rl.cls}`}>{rl.text}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#4fc3f7]" />
                        <span className="text-white text-sm">京蔚联</span>
                      </div>
                      <div className="stat-number text-2xl text-white">
                        {m.ourScore} <span className="text-white/20">-</span> {m.opponentScore}
                      </div>
                      <span className="text-white/60 text-sm truncate max-w-[80px]">{m.opponent}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-white/20 text-xs">
                      <span className={`px-1.5 py-0.5 rounded ${
                        m.typeLabel === "竞技赛" || m.type?.includes("competitive")
                          ? "bg-[#1a237e]/30 text-[#4fc3f7]"
                          : "bg-[#4caf50]/10 text-[#66bb6a]"
                      }`}>
                        {m.typeLabel || m.type}
                      </span>
                      {m.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {m.venue}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Top Scorers */}
      {topScorers.length > 0 && (
        <section className="py-20 bg-[#020309]">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl md:text-4xl font-[Oswald] text-white">射手榜</h2>
              <Link href="/leaderboard" className="text-[#4fc3f7] text-sm flex items-center gap-1 hover:underline no-underline">
                完整排行 <ChevronRight size={16} />
              </Link>
            </div>
            <div className="max-w-2xl mx-auto">
              {topScorers.map((s) => (
                <div key={s.name} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                  <span className={`stat-number text-lg w-8 text-center ${medalColor(s.rank)}`}>{s.rank}</span>
                  <span className="text-white flex-1">{s.name}</span>
                  <span className="stat-number text-xl text-[#4fc3f7]">{s.goals}</span>
                  <span className="text-white/30 text-xs">球</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Squad Preview */}
      {squadPreview.length > 0 && (
        <section className="py-20 bg-[#03060d]">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl md:text-4xl font-[Oswald] text-white">球员风采</h2>
              <Link href="/players" className="text-[#4fc3f7] text-sm flex items-center gap-1 hover:underline no-underline">
                全部球员 <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {squadPreview.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/players/${p.id}`}
                  className="group bg-[#070b14] border border-white/5 rounded-lg overflow-hidden hover:border-[#1a237e]/50 transition-all no-underline"
                >
                  <div className="aspect-square bg-gradient-to-b from-[#1a237e]/20 to-transparent relative overflow-hidden">
                    <img
                      src={PLAYER_PHOTOS[p.number]}
                      alt={p.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#020309] to-transparent h-1/3" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">{p.name}</span>
                      <span className="stat-number text-[#4fc3f7] text-lg">#{p.number}</span>
                    </div>
                    <span className="text-white/30 text-xs">{p.positions?.[0] || "球员"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Jersey Showcase */}
      <section className="py-20 bg-[#020309]">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-[Oswald] text-white text-center mb-12">队服展示</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#070b14] border border-white/5 rounded-lg p-8 text-center">
              <h3 className="text-white/60 font-[Oswald] text-sm tracking-wider mb-6">主场球衣</h3>
              <div className="flex justify-center gap-6">
                <img src={SITE_ASSETS.jerseyHomeFront} alt="主场球衣正面" className="h-64 object-contain" />
                <img src={SITE_ASSETS.jerseyHomeBack} alt="主场球衣背面" className="h-64 object-contain" />
              </div>
            </div>
            <div className="bg-[#070b14] border border-white/5 rounded-lg p-8 text-center">
              <h3 className="text-white/60 font-[Oswald] text-sm tracking-wider mb-6">客场球衣</h3>
              <div className="flex justify-center gap-6">
                <img src={SITE_ASSETS.jerseyAwayFront} alt="客场球衣正面" className="h-64 object-contain" />
                <img src={SITE_ASSETS.jerseyAwayBack} alt="客场球衣背面" className="h-64 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
