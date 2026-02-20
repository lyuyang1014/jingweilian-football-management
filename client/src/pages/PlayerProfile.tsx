import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { useParams, Link } from "wouter";
import { PLAYER_PHOTOS } from "@shared/constants";
import { useState, useMemo } from "react";
import { ArrowLeft, Star, TrendingUp, MessageCircle, BarChart3, Sparkles, Ruler, Weight, Footprints } from "lucide-react";

type TabType = "reviews" | "stats" | "highlights";

// Skill name translations
const SKILL_NAMES: Record<string, string> = {
  aggression: "侵略性", agility: "灵活性", anticipation: "预判", bravery: "勇气",
  composure: "沉着", concentration: "专注力", crossing: "传中", dribbling: "盘带",
  finishing: "射门", first_touch: "第一脚触球", heading: "头球", jumping: "弹跳",
  leadership: "领导力", long_shots: "远射", natural_fitness: "身体素质", pace: "速度",
  passing: "传球", set_pieces: "定位球", stamina: "耐力", strength: "力量",
  tackling: "抢断", teamwork: "团队合作", technique: "技术", vision: "视野",
  aerial_ability: "制空能力", communication: "沟通", handling: "扑救", kicking: "开球",
  one_on_ones: "一对一", reflexes: "反应", rushing_out: "出击",
};

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: player, isLoading } = trpc.players.getById.useQuery({ id: id || "" });
  const [activeTab, setActiveTab] = useState<TabType>("reviews");

  const playerPhoto = useMemo(() => {
    if (!player?.number) return null;
    return PLAYER_PHOTOS[player.number] || null;
  }, [player]);

  // Get teammate evaluations
  const evaluations = useMemo(() => {
    if (!player?.teammate_evaluations || !Array.isArray(player.teammate_evaluations)) return [];
    return [...player.teammate_evaluations].sort((a: any, b: any) => (b.count || 0) - (a.count || 0));
  }, [player]);

  // Get skill ratings sorted by value
  const ratings = useMemo(() => {
    if (!player?.skill_ratings || typeof player.skill_ratings !== "object") return [];
    return Object.entries(player.skill_ratings)
      .filter(([key, v]) => key !== "_meta" && typeof v === "number" && (v as number) > 0)
      .sort((a, b) => (b[1] as number) - (a[1] as number));
  }, [player]);

  // Get self-rated skills
  const selfRatings = useMemo(() => {
    if (!player?.self_skill_ratings || typeof player.self_skill_ratings !== "object") return [];
    return Object.entries(player.self_skill_ratings)
      .filter(([_, v]) => typeof v === "number" && (v as number) > 0)
      .sort((a, b) => (b[1] as number) - (a[1] as number));
  }, [player]);

  const ratingColor = (val: number) => {
    if (val >= 90) return "bg-[#4caf50]";
    if (val >= 85) return "bg-[#2196f3]";
    if (val >= 80) return "bg-[#ff9800]";
    if (val >= 70) return "bg-[#ffd700]";
    return "bg-white/20";
  };

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: "reviews", label: "队友评价", icon: MessageCircle },
    { key: "stats", label: "能力值", icon: BarChart3 },
    { key: "highlights", label: "高光数据", icon: Sparkles },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#4fc3f7] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!player) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-white/60">球员未找到</p>
          <Link href="/players" className="text-[#4fc3f7] hover:underline">返回球员列表</Link>
        </div>
      </Layout>
    );
  }

  const meta = player.skill_ratings?._meta as any;
  const avgScore = meta?.averageScore;
  const evalCount = meta?.evaluationCount;

  return (
    <Layout>
      <div className="container pt-6">
        <Link href="/players" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm no-underline">
          <ArrowLeft size={16} /> 返回球员列表
        </Link>
      </div>

      {/* Player Header */}
      <section className="py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-80 shrink-0">
              <div className="aspect-square bg-gradient-to-b from-[#1a237e]/20 to-[#070b14] rounded-xl overflow-hidden border border-white/5">
                {playerPhoto ? (
                  <img src={playerPhoto} alt={player.name} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="stat-number text-6xl text-[#4fc3f7]/20">{player.number || "?"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-[Oswald] text-white">{player.name}</h1>
                <span className="stat-number text-5xl text-[#4fc3f7]/30">#{player.number || "-"}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {player.positions?.map((pos: string, i: number) => (
                  <span key={i} className="bg-[#1a237e]/30 text-[#4fc3f7] text-xs px-3 py-1 rounded-full">{pos}</span>
                ))}
                <span className={`text-xs px-3 py-1 rounded-full ${
                  player.group === "competitive"
                    ? "bg-[#4caf50]/10 text-[#66bb6a]"
                    : "bg-[#ff9800]/10 text-[#ff9800]"
                }`}>
                  {player.group === "competitive" ? "竞技组" : "娱乐组"}
                </span>
              </div>

              {/* Physical info */}
              <div className="flex flex-wrap gap-4 mb-6 text-white/50 text-sm">
                {player.height_cm && (
                  <span className="flex items-center gap-1"><Ruler size={14} /> {player.height_cm}cm</span>
                )}
                {player.weight_kg && (
                  <span className="flex items-center gap-1"><Weight size={14} /> {player.weight_kg}kg</span>
                )}
                {player.preferred_foot && (
                  <span className="flex items-center gap-1"><Footprints size={14} /> {player.preferred_foot}</span>
                )}
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {avgScore && (
                  <div className="bg-[#070b14] border border-white/5 rounded-lg p-3 text-center">
                    <Star className="w-4 h-4 mx-auto mb-1 text-[#ffd700]" />
                    <div className="stat-number text-xl text-white">{avgScore.toFixed(1)}</div>
                    <div className="text-white/30 text-[10px]">综合评分</div>
                  </div>
                )}
                {player.value !== undefined && player.value > 0 && (
                  <div className="bg-[#070b14] border border-white/5 rounded-lg p-3 text-center">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1 text-[#4caf50]" />
                    <div className="stat-number text-xl text-white">{player.value}</div>
                    <div className="text-white/30 text-[10px]">身价</div>
                  </div>
                )}
                {evaluations.length > 0 && (
                  <div className="bg-[#070b14] border border-white/5 rounded-lg p-3 text-center">
                    <MessageCircle className="w-4 h-4 mx-auto mb-1 text-[#4fc3f7]" />
                    <div className="stat-number text-xl text-white">{evaluations.length}</div>
                    <div className="text-white/30 text-[10px]">评价标签</div>
                  </div>
                )}
                {evalCount && (
                  <div className="bg-[#070b14] border border-white/5 rounded-lg p-3 text-center">
                    <Star className="w-4 h-4 mx-auto mb-1 text-[#ef5350]" />
                    <div className="stat-number text-xl text-white">{evalCount}</div>
                    <div className="text-white/30 text-[10px]">评价人数</div>
                  </div>
                )}
              </div>

              {player.bio && (
                <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{player.bio}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="pb-20">
        <div className="container">
          <div className="flex gap-1 mb-8 border-b border-white/5">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-[Oswald] tracking-wider transition-all border-b-2 ${
                  activeTab === t.key
                    ? "text-[#4fc3f7] border-[#4fc3f7]"
                    : "text-white/40 border-transparent hover:text-white/60"
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div>
              {evaluations.length === 0 ? (
                <p className="text-white/30 text-center py-12">暂无队友评价</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evaluations.map((ev: any, i: number) => (
                    <div key={i} className="bg-[#070b14] border border-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{ev.icon}</span>
                          <span className="text-white font-medium">{ev.text}</span>
                        </div>
                        <span className="text-[#4fc3f7] text-xs stat-number">{ev.count || ev.evaluators?.length || 0} 人评价</span>
                      </div>
                      {ev.description && (
                        <p className="text-white/40 text-xs mb-3">{ev.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {ev.evaluators?.map((name: string, j: number) => (
                          <span key={j} className="bg-[#1a237e]/20 text-white/50 text-xs px-2 py-0.5 rounded">{name}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div>
              {ratings.length === 0 && selfRatings.length === 0 ? (
                <p className="text-white/30 text-center py-12">暂无能力数据</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {ratings.length > 0 && (
                    <div>
                      <h3 className="text-white/60 text-sm font-[Oswald] tracking-wider mb-4">队友评分</h3>
                      <div className="space-y-2">
                        {ratings.map(([key, val]) => (
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-white/50 text-xs w-20 text-right truncate">{SKILL_NAMES[key] || key}</span>
                            <div className="flex-1 h-5 bg-[#070b14] rounded overflow-hidden">
                              <div
                                className={`h-full ${ratingColor(val as number)} rounded transition-all duration-500`}
                                style={{ width: `${val}%` }}
                              />
                            </div>
                            <span className="stat-number text-sm text-white w-8">{Math.round(val as number)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selfRatings.length > 0 && (
                    <div>
                      <h3 className="text-white/60 text-sm font-[Oswald] tracking-wider mb-4">自我评分</h3>
                      <div className="space-y-2">
                        {selfRatings.map(([key, val]) => (
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-white/50 text-xs w-20 text-right truncate">{SKILL_NAMES[key] || key}</span>
                            <div className="flex-1 h-5 bg-[#070b14] rounded overflow-hidden">
                              <div
                                className={`h-full ${ratingColor(val as number)} rounded opacity-60 transition-all duration-500`}
                                style={{ width: `${val}%` }}
                              />
                            </div>
                            <span className="stat-number text-sm text-white/60 w-8">{Math.round(val as number)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Highlights Tab */}
          {activeTab === "highlights" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {avgScore && (
                <div className="bg-[#070b14] border border-white/5 rounded-lg p-6 text-center">
                  <div className="stat-number text-4xl text-[#ffd700] mb-2">{avgScore.toFixed(1)}</div>
                  <div className="text-white/40 text-xs tracking-wider">综合评分</div>
                </div>
              )}
              {player.value !== undefined && player.value > 0 && (
                <div className="bg-[#070b14] border border-white/5 rounded-lg p-6 text-center">
                  <div className="stat-number text-4xl text-[#4caf50] mb-2">{player.value}</div>
                  <div className="text-white/40 text-xs tracking-wider">身价</div>
                </div>
              )}
              {evalCount && (
                <div className="bg-[#070b14] border border-white/5 rounded-lg p-6 text-center">
                  <div className="stat-number text-4xl text-[#ef5350] mb-2">{evalCount}</div>
                  <div className="text-white/40 text-xs tracking-wider">评价人数</div>
                </div>
              )}
              {ratings.length > 0 && (
                <div className="bg-[#070b14] border border-white/5 rounded-lg p-6 text-center">
                  <div className="stat-number text-4xl text-[#4fc3f7] mb-2">{Math.round(ratings[0][1] as number)}</div>
                  <div className="text-white/40 text-xs tracking-wider">最强: {SKILL_NAMES[ratings[0][0]] || ratings[0][0]}</div>
                </div>
              )}
              {evaluations.length > 0 && (
                <div className="bg-[#070b14] border border-white/5 rounded-lg p-6 text-center">
                  <div className="text-2xl mb-2">{evaluations[0]?.icon} {evaluations[0]?.text}</div>
                  <div className="text-white/40 text-xs tracking-wider">
                    最多评价标签 ({evaluations[0]?.count || evaluations[0]?.evaluators?.length}人)
                  </div>
                </div>
              )}
              {player.height_cm && player.weight_kg && (
                <div className="bg-[#070b14] border border-white/5 rounded-lg p-6 text-center">
                  <div className="stat-number text-2xl text-white/80 mb-2">{player.height_cm}cm / {player.weight_kg}kg</div>
                  <div className="text-white/40 text-xs tracking-wider">身高/体重</div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
