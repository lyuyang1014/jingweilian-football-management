import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Link } from "wouter";
import { SITE_ASSETS, PLAYER_PHOTOS } from "@shared/constants";
import { useMemo } from "react";
import { ChevronRight, MapPin, Trophy, Users, Calendar, Target, Shield, Zap, Heart, Beer } from "lucide-react";

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
    const activePlayers = players?.filter((p: any) => p.group)?.length || 0;
    return { total, wins, draws, losses, goalsFor, goalsAgainst, competitive, friendly, activePlayers };
  }, [matches, players]);

  const recentMatches = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    return [...matches]
      .sort((a: any, b: any) => new Date(b.dateRaw || b.date).getTime() - new Date(a.dateRaw || a.date).getTime())
      .slice(0, 4);
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
      .slice(0, 5)
      .map(([name, goals], i) => ({ name, goals, rank: i + 1 }));
  }, [matches]);

  const squadPreview = useMemo(() => {
    if (!players || !Array.isArray(players)) return [];
    return players
      .filter((p: any) => p.number && PLAYER_PHOTOS[p.number])
      .slice(0, 12);
  }, [players]);

  const getResult = (m: any) => {
    if (m.result === "胜") return "win";
    if (m.result === "负") return "loss";
    if (m.result === "平") return "draw";
    if (m.ourScore > m.opponentScore) return "win";
    if (m.ourScore < m.opponentScore) return "loss";
    return "draw";
  };

  const resultColor = (r: string) => {
    switch (r) {
      case "win": return "text-emerald-400";
      case "loss": return "text-red-400";
      default: return "text-amber-400";
    }
  };

  return (
    <Layout>
      {/* ===== HERO SECTION - Full viewport, dramatic background ===== */}
      <section className="relative h-screen min-h-[700px] flex items-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={SITE_ASSETS.heroBg}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020309]/95 via-[#020309]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020309] via-transparent to-[#020309]/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container pb-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/50 text-sm font-[Oswald] tracking-[0.2em]">EST. 2018 · BEIJING</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-[Oswald] font-bold text-white leading-[0.95] mb-2">
              京蔚联
            </h1>
            <h2 className="text-4xl md:text-6xl font-[Oswald] font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 leading-tight mb-6">
              足球俱乐部
            </h2>

            <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-lg mb-8">
              源自蔚来车主的热爱，以球会友。我们不只是一支球队，更是一个充满激情的足球大家庭。
            </p>

            <div className="flex items-center gap-4 mb-16">
              <Link
                href="/players"
                className="inline-flex items-center gap-2 bg-cyan-500/90 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium transition-colors no-underline"
              >
                查看阵容 <ChevronRight size={18} />
              </Link>
              <Link
                href="/matches"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/80 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors no-underline"
              >
                比赛记录
              </Link>
            </div>

            {/* Stats Bar */}
            {stats && (
              <div className="grid grid-cols-4 gap-6 border-t border-white/10 pt-8">
                {[
                  { value: players?.length || 0, unit: "人", label: "注册球员" },
                  { value: stats.total, unit: "场", label: "比赛场次" },
                  { value: "2018", unit: "", label: "成立年份" },
                  { value: stats.activePlayers, unit: "人", label: "活跃球员" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-baseline gap-0.5">
                      <span className="stat-number text-3xl md:text-4xl text-white">{s.value}</span>
                      {s.unit && <span className="text-white/30 text-sm">{s.unit}</span>}
                    </div>
                    <div className="text-white/30 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="relative py-24 bg-[#03060d]">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-cyan-400/60 text-xs font-[Oswald] tracking-[0.3em] block mb-3">ABOUT THE CLUB</span>
            <h2 className="text-3xl md:text-5xl font-[Oswald] text-white font-bold">关于球队</h2>
          </div>

          {/* Club Spirit Tags */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { icon: "🦁", label: "京城狮吵" },
              { icon: "⚽", label: "以球会友" },
              { icon: "💙", label: "京蔚联心" },
              { icon: "🍻", label: "撈串喝酒" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5">
                <span className="text-lg">{t.icon}</span>
                <span className="text-white/80 text-sm">{t.label}</span>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <p className="text-white/50 text-base md:text-lg leading-relaxed text-center mb-8">
              北京京蔚联足球俱乐部（BEIJING NIO UNITED FOOTBALL CLUB）成立于2018年，是由北京地区蔚来汽车车主自发组建的业余足球俱乐部。从建队初期的20余人，到如今核心会员超过100人，我们始终秉持"以球会友、享受足球"的理念。
            </p>
            <p className="text-white/50 text-base md:text-lg leading-relaxed text-center mb-12">
              俱乐部设有竞技组和娱乐组，定期组织队内对抗赛和对外友谊赛。我们秉持"队长和队委会无特权，财务透明，上场时间安排一视同仁"的管理理念，把自己定位为球队的服务者，使命是让兄弟们畅快踢球。
            </p>

            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
              <div className="text-center bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="text-cyan-400 font-[Oswald] text-sm mb-2">竞技组</div>
                <div className="text-white/40 text-xs">追求更高水平</div>
              </div>
              <div className="text-center bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="text-emerald-400 font-[Oswald] text-sm mb-2">娱乐组</div>
                <div className="text-white/40 text-xs">享受足球乐趣</div>
              </div>
              <div className="text-center bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="text-amber-400 font-[Oswald] text-2xl font-bold mb-1">7+</div>
                <div className="text-white/40 text-xs">年历史</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RECENT MATCHES ===== */}
      <section className="py-24 bg-[#020309]">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-cyan-400/60 text-xs font-[Oswald] tracking-[0.3em] block mb-3">RECENT MATCHES</span>
              <h2 className="text-3xl md:text-5xl font-[Oswald] text-white font-bold">最近比赛</h2>
            </div>
            <Link href="/matches" className="text-cyan-400 text-sm flex items-center gap-1 hover:underline no-underline">
              查看全部 <ChevronRight size={16} />
            </Link>
          </div>

          {matchesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 rounded-xl h-20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((m: any) => {
                const result = getResult(m);
                const rc = resultColor(result);
                return (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className="flex items-center bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-xl px-6 py-4 transition-all no-underline group"
                  >
                    <div className="w-24 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded ${
                        m.typeLabel === "竞技赛" || m.type?.includes("competitive")
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {m.typeLabel || m.type}
                      </span>
                    </div>
                    <div className="w-28 text-white/30 text-sm shrink-0">{m.date}</div>
                    <div className="flex-1 flex items-center justify-center gap-4">
                      <span className="text-white font-medium text-right flex-1">蔚来联队</span>
                      <div className="flex items-center gap-3">
                        <span className={`stat-number text-2xl ${rc}`}>{m.ourScore}</span>
                        <span className="text-white/20">:</span>
                        <span className={`stat-number text-2xl ${rc}`}>{m.opponentScore}</span>
                      </div>
                      <span className="text-white/60 text-left flex-1">{m.opponent}</span>
                    </div>
                    <div className="w-32 text-right text-white/20 text-xs shrink-0 flex items-center justify-end gap-1">
                      <MapPin size={10} /> {m.venue || "—"}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== TOP SCORERS ===== */}
      {topScorers.length > 0 && (
        <section className="py-24 bg-[#03060d]">
          <div className="container">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-cyan-400/60 text-xs font-[Oswald] tracking-[0.3em] block mb-3">TOP SCORERS</span>
                <h2 className="text-3xl md:text-5xl font-[Oswald] text-white font-bold">射手榜</h2>
              </div>
              <Link href="/leaderboard" className="text-cyan-400 text-sm flex items-center gap-1 hover:underline no-underline">
                完整排行 <ChevronRight size={16} />
              </Link>
            </div>
            <div className="max-w-3xl">
              {topScorers.map((s) => (
                <div key={s.name} className="flex items-center gap-6 py-4 border-b border-white/5 last:border-0 group">
                  <span className={`stat-number text-2xl w-10 text-center ${
                    s.rank === 1 ? "text-amber-400" : s.rank === 2 ? "text-gray-300" : s.rank === 3 ? "text-orange-400" : "text-white/20"
                  }`}>
                    {s.rank}
                  </span>
                  <span className="text-white text-lg flex-1 group-hover:text-cyan-400 transition-colors">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-40 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                        style={{ width: `${(s.goals / topScorers[0].goals) * 100}%` }}
                      />
                    </div>
                    <span className="stat-number text-xl text-cyan-400 w-8 text-right">{s.goals}</span>
                    <span className="text-white/20 text-xs">球</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== SQUAD PREVIEW ===== */}
      {squadPreview.length > 0 && (
        <section className="py-24 bg-[#020309]">
          <div className="container">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-cyan-400/60 text-xs font-[Oswald] tracking-[0.3em] block mb-3">OUR SQUAD</span>
                <h2 className="text-3xl md:text-5xl font-[Oswald] text-white font-bold">球员风采</h2>
              </div>
              <Link href="/players" className="text-cyan-400 text-sm flex items-center gap-1 hover:underline no-underline">
                查看全部球员 <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {squadPreview.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/players/${p.id}`}
                  className="group relative bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all no-underline"
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={PLAYER_PHOTOS[p.number]}
                      alt={p.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020309] via-transparent to-transparent" />
                    {/* Number watermark */}
                    <span className="absolute top-2 right-2 stat-number text-3xl text-white/10">
                      {p.number}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="text-white text-sm font-medium">{p.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/30 text-xs">{p.group === "竞技组" ? "竞技组" : "娱乐组"}</span>
                      <span className="text-cyan-400/60 text-xs font-[Oswald]">#{p.number}</span>
                    </div>
                    <span className="text-white/20 text-[10px]">{p.positions?.[0] || "球员"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== JERSEY SHOWCASE ===== */}
      <section className="py-24 bg-[#03060d]">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-cyan-400/60 text-xs font-[Oswald] tracking-[0.3em] block mb-3">TEAM JERSEYS</span>
            <h2 className="text-3xl md:text-5xl font-[Oswald] text-white font-bold">球队队服</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-10 text-center group hover:border-white/10 transition-all">
              <h3 className="text-white font-[Oswald] text-lg mb-1">主场队服</h3>
              <p className="text-white/30 text-xs font-[Oswald] tracking-wider mb-8">HOME JERSEY · 白色</p>
              <div className="flex justify-center gap-8">
                <img src={SITE_ASSETS.jerseyHomeFront} alt="主场球衣正面" className="h-72 object-contain group-hover:scale-105 transition-transform duration-500" />
                <img src={SITE_ASSETS.jerseyHomeBack} alt="主场球衣背面" className="h-72 object-contain group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="text-white/30 text-xs mt-6">白色主场队服，胸前印有京蔚联狮子logo和YOUMAGIC赞助商标识</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-10 text-center group hover:border-white/10 transition-all">
              <h3 className="text-white font-[Oswald] text-lg mb-1">客场队服</h3>
              <p className="text-white/30 text-xs font-[Oswald] tracking-wider mb-8">AWAY JERSEY · 红色</p>
              <div className="flex justify-center gap-8">
                <img src={SITE_ASSETS.jerseyAwayFront} alt="客场球衣正面" className="h-72 object-contain group-hover:scale-105 transition-transform duration-500" />
                <img src={SITE_ASSETS.jerseyAwayBack} alt="客场球衣背面" className="h-72 object-contain group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="text-white/30 text-xs mt-6">红色客场队服，激情与活力的象征，展现球队的战斗精神</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
