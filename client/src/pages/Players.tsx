import { usePlayers } from "@/hooks/useStaticData";
import Layout from "@/components/Layout";
import { Link } from "wouter";
import { PLAYER_PHOTOS } from "@shared/constants";
import { useState, useMemo } from "react";
import { Search, Users, Swords, Gamepad2, Camera, Star } from "lucide-react";
import Formation433 from "@/components/Formation433";

type FilterType = "all" | "competitive" | "entertainment" | "hasPhoto";

export default function Players() {
  const { data: players, isLoading } = usePlayers();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredPlayers = useMemo(() => {
    if (!players || !Array.isArray(players)) return [];
    let list = [...players];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(q) ||
          String(p.number).includes(q) ||
          p.positions?.some((pos: string) => pos.toLowerCase().includes(q))
      );
    }

    switch (filter) {
      case "competitive":
        list = list.filter((p: any) => p.group === "competitive");
        break;
      case "entertainment":
        list = list.filter((p: any) => p.group === "recreational");
        break;
      case "hasPhoto":
        list = list.filter((p: any) => p.number && PLAYER_PHOTOS[p.number]);
        break;
    }

    return list.sort((a: any, b: any) => (a.number || 999) - (b.number || 999));
  }, [players, search, filter]);

  const filters: { key: FilterType; label: string; icon: any }[] = [
    { key: "all", label: "全部", icon: Users },
    { key: "competitive", label: "竞技组", icon: Swords },
    { key: "entertainment", label: "娱乐组", icon: Gamepad2 },
    { key: "hasPhoto", label: "有写真", icon: Camera },
  ];

  return (
    <Layout>
      {/* Formation tactical board */}
      {!isLoading && players && (
        <div className="container pt-20">
          <Formation433 players={players as any[]} />
        </div>
      )}

      {/* Hero Header */}
      <section className="relative pt-8 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#070b14] to-[#020309]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,195,247,0.05),transparent_70%)]" />

        <div className="relative z-10 container text-center">
          <p className="text-cyan-400/60 text-xs font-[Oswald] tracking-[0.3em] mb-3">OUR SQUAD</p>
          <h1 className="text-5xl md:text-6xl font-[Oswald] text-white font-bold mb-4">球员阵容</h1>
          <p className="text-white/30 text-sm max-w-md mx-auto mb-10">
            京蔚联足球俱乐部全体注册球员，包含竞技组和娱乐组成员
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索球员姓名、号码、位置..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex justify-center gap-3 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  filter === f.key
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                    : "bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/70 hover:border-white/10"
                }`}
              >
                <f.icon size={15} />
                {f.label}
              </button>
            ))}
          </div>

          <p className="text-white/20 text-xs mt-6 font-[Oswald] tracking-wider">
            {filteredPlayers.length} PLAYERS
          </p>
        </div>
      </section>

      {/* Player Grid */}
      <section className="py-12 bg-[#020309]">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="bg-white/[0.03] rounded-xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filteredPlayers.map((p: any) => {
                const hasPhoto = p.number && PLAYER_PHOTOS[p.number];
                const meta = p.skill_ratings?._meta;
                const avgScore = meta?.averageScore;

                return (
                  <Link
                    key={p.id}
                    href={`/players/${p.id}`}
                    className="group relative bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/5 rounded-xl overflow-hidden hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 no-underline"
                  >
                    {/* Photo Area */}
                    <div className="aspect-square relative overflow-hidden">
                      {hasPhoto ? (
                        <img
                          src={PLAYER_PHOTOS[p.number]}
                          alt={p.name}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#0a0e1a] to-[#020309]">
                          <span className="stat-number text-6xl text-white/[0.05]">{p.number || "?"}</span>
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020309] via-[#020309]/30 to-transparent" />

                      {/* Group badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm ${
                          p.group === "competitive"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {p.group === "competitive" ? "竞技" : "娱乐"}
                        </span>
                      </div>

                      {/* Score badge */}
                      {avgScore && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/20 backdrop-blur-sm border border-amber-500/20 rounded-full px-2 py-0.5">
                          <Star size={10} className="text-amber-400" />
                          <span className="stat-number text-xs text-amber-400">{avgScore.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Number watermark */}
                      <div className="absolute bottom-0 right-2 stat-number text-5xl text-white/[0.06] leading-none">
                        {p.number || ""}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm truncate">{p.name}</span>
                        <span className="stat-number text-cyan-400/80 text-sm">#{p.number || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.positions?.slice(0, 2).map((pos: string, i: number) => (
                          <span key={i} className="text-white/20 text-[10px] bg-white/[0.03] px-1.5 py-0.5 rounded">{pos}</span>
                        ))}
                      </div>
                    </div>

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-cyan-500/5 to-transparent" />
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
