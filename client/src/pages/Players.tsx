import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Link } from "wouter";
import { PLAYER_PHOTOS } from "@shared/constants";
import { useState, useMemo } from "react";
import { Search, Users, Swords, Gamepad2 } from "lucide-react";

type FilterType = "all" | "competitive" | "entertainment" | "hasPhoto";

export default function Players() {
  const { data: players, isLoading } = trpc.players.list.useQuery();
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
    { key: "hasPhoto", label: "有写真", icon: Users },
  ];

  return (
    <Layout>
      <section className="pt-12 pb-8 bg-gradient-to-b from-[#070b14] to-[#020309]">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-[Oswald] text-white text-center mb-2">球员阵容</h1>
          <p className="text-white/40 text-center text-sm tracking-wider mb-8">SQUAD</p>

          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索球员姓名、号码..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#070b14] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#4fc3f7]/50"
              />
            </div>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-[Oswald] tracking-wider transition-all ${
                  filter === f.key
                    ? "bg-[#1a237e] text-[#4fc3f7] border border-[#4fc3f7]/30"
                    : "bg-[#070b14] text-white/50 border border-white/5 hover:text-white/80"
                }`}
              >
                <f.icon size={14} />
                {f.label}
              </button>
            ))}
          </div>

          <p className="text-center text-white/30 text-xs mt-4">共 {filteredPlayers.length} 名球员</p>
        </div>
      </section>

      <section className="py-8 bg-[#020309]">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-[#070b14] rounded-lg aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredPlayers.map((p: any) => {
                const hasPhoto = p.number && PLAYER_PHOTOS[p.number];
                return (
                  <Link
                    key={p.id}
                    href={`/players/${p.id}`}
                    className="group bg-[#070b14] border border-white/5 rounded-lg overflow-hidden hover:border-[#1a237e]/50 transition-all no-underline"
                  >
                    <div className="aspect-square bg-gradient-to-b from-[#1a237e]/10 to-transparent relative overflow-hidden">
                      {hasPhoto ? (
                        <img
                          src={PLAYER_PHOTOS[p.number]}
                          alt={p.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-[#1a237e]/20 flex items-center justify-center">
                            <span className="stat-number text-2xl text-[#4fc3f7]/40">{p.number || "?"}</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#020309] to-transparent h-1/3" />
                      {p.group === "competitive" && (
                        <div className="absolute top-2 right-2 bg-[#1a237e]/80 text-[#4fc3f7] text-[10px] px-1.5 py-0.5 rounded">竞技</div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium truncate">{p.name}</span>
                        <span className="stat-number text-[#4fc3f7] text-base">#{p.number || "-"}</span>
                      </div>
                      <span className="text-white/30 text-xs">{p.positions?.[0] || "球员"}</span>
                    </div>
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
