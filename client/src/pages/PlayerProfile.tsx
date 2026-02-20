import { usePlayer, useMatches } from "@/hooks/useStaticData";
import Layout from "@/components/Layout";
import { useParams, Link } from "wouter";
import { PLAYER_PHOTOS } from "@shared/constants";
import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft, Star, TrendingUp, MessageCircle, BarChart3, Sparkles, Trophy, Calendar, Swords, Eye } from "lucide-react";

type TabType = "overview" | "reviews" | "history" | "highlights";

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

// 6-axis radar categories
const RADAR_CATEGORIES = [
  { key: "attack", label: "进攻", skills: ["finishing", "long_shots", "heading", "crossing"] },
  { key: "technique", label: "技术", skills: ["dribbling", "first_touch", "technique", "passing", "vision"] },
  { key: "physical", label: "体能", skills: ["stamina", "natural_fitness", "agility"] },
  { key: "defense", label: "防守", skills: ["tackling", "anticipation", "concentration", "composure"] },
  { key: "power", label: "力量", skills: ["strength", "aggression", "bravery", "jumping"] },
  { key: "speed", label: "速度", skills: ["pace"] },
];

const POSITION_COLORS: Record<string, string> = {
  "ST": "bg-red-500", "CF": "bg-red-500", "LW": "bg-red-400", "RW": "bg-red-400",
  "CAM": "bg-orange-500", "CM": "bg-emerald-500", "CDM": "bg-emerald-600",
  "LM": "bg-orange-400", "RM": "bg-orange-400",
  "CB": "bg-blue-500", "LB": "bg-blue-400", "RB": "bg-blue-400", "GK": "bg-amber-500",
  "前锋": "bg-red-500", "中场": "bg-emerald-500", "后卫": "bg-blue-500", "门将": "bg-amber-500",
};

function RadarChart({ scores }: { scores: { label: string; value: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || scores.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const maxR = 100;
    const n = scores.length;
    const angleStep = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, size, size);

    // Draw grid rings
    for (let ring = 1; ring <= 5; ring++) {
      const r = (ring / 5) * maxR;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis lines
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw data polygon
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const angle = startAngle + idx * angleStep;
      const r = (scores[idx].value / 100) * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(79, 195, 247, 0.25)";
    ctx.fill();
    ctx.strokeStyle = "rgba(79, 195, 247, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      const r = (scores[i].value / 100) * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#4fc3f7";
      ctx.fill();
      ctx.strokeStyle = "#020309";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw labels
    ctx.font = "12px 'Noto Sans SC', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      const labelR = maxR + 24;
      const x = cx + labelR * Math.cos(angle);
      const y = cy + labelR * Math.sin(angle);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(scores[i].label, x, y);
      // Draw score below label
      ctx.font = "bold 11px 'Oswald', sans-serif";
      ctx.fillStyle = "#4fc3f7";
      ctx.fillText(scores[i].value.toFixed(1), x, y + 14);
      ctx.font = "12px 'Noto Sans SC', sans-serif";
    }
  }, [scores]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: player, isLoading } = usePlayer(id || "");
  const { data: matches } = useMatches();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const playerPhoto = useMemo(() => {
    if (!player?.number) return null;
    return PLAYER_PHOTOS[player.number] || null;
  }, [player]);

  const evaluations = useMemo(() => {
    if (!player?.teammate_evaluations || !Array.isArray(player.teammate_evaluations)) return [];
    return [...player.teammate_evaluations].sort((a: any, b: any) => (b.count || 0) - (a.count || 0));
  }, [player]);

  const ratings = useMemo(() => {
    if (!player?.skill_ratings || typeof player.skill_ratings !== "object") return [];
    return Object.entries(player.skill_ratings)
      .filter(([key, v]) => key !== "_meta" && typeof v === "number" && (v as number) > 0)
      .sort((a, b) => (b[1] as number) - (a[1] as number));
  }, [player]);

  // Compute 6-axis radar scores from skill_ratings
  const radarScores = useMemo(() => {
    if (!player?.skill_ratings || typeof player.skill_ratings !== "object") return [];
    const sr = player.skill_ratings as Record<string, any>;
    return RADAR_CATEGORIES.map((cat) => {
      const vals = cat.skills.map((s) => sr[s]).filter((v) => typeof v === "number" && v > 0) as number[];
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { label: cat.label, value: Math.round(avg * 10) / 10, key: cat.key };
    });
  }, [player]);

  // Player match history
  const playerMatches = useMemo(() => {
    if (!matches || !Array.isArray(matches) || !player?.name) return [];
    return matches.filter((m: any) => {
      const scorers = m.events?.goalScorers || [];
      const assists = m.events?.assists || [];
      const allNames = [
        ...scorers.map((s: any) => s.scorer || s.name),
        ...assists.map((a: any) => a.assister || a.name),
      ];
      return allNames.includes(player.name);
    }).sort((a: any, b: any) => new Date(b.dateRaw || b.date).getTime() - new Date(a.dateRaw || a.date).getTime());
  }, [matches, player]);

  const ratingColor = (val: number) => {
    if (val >= 90) return "bg-emerald-500";
    if (val >= 85) return "bg-cyan-500";
    if (val >= 80) return "bg-amber-500";
    if (val >= 70) return "bg-yellow-500";
    return "bg-white/20";
  };

  const ratingBarColor = (val: number) => {
    if (val >= 90) return "from-emerald-500 to-emerald-400";
    if (val >= 85) return "from-cyan-500 to-cyan-400";
    if (val >= 80) return "from-amber-500 to-amber-400";
    if (val >= 70) return "from-yellow-500 to-yellow-400";
    return "from-white/20 to-white/10";
  };

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: "overview", label: "概览", icon: Eye },
    { key: "reviews", label: "队友评价", icon: MessageCircle },
    { key: "history", label: "历史比赛", icon: Calendar },
    { key: "highlights", label: "高光时刻", icon: Sparkles },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!player) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-white/60">球员未找到</p>
          <Link href="/players" className="text-cyan-400 hover:underline">返回球员列表</Link>
        </div>
      </Layout>
    );
  }

  const meta = player.skill_ratings?._meta as any;
  const avgScore = meta?.averageScore;
  const evalCount = meta?.evaluationCount;
  const mainPos = player.positions?.[0] || "球员";
  const posColor = POSITION_COLORS[mainPos] || "bg-cyan-600";

  return (
    <Layout>
      {/* Player Hero - FIFA Style */}
      <section className="relative min-h-[500px] overflow-hidden">
        {/* Giant number watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="stat-number text-[300px] md:text-[400px] text-white/[0.03] leading-none">
            {player.number || "?"}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#020309] via-[#020309]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020309] via-transparent to-[#020309]/50" />

        <div className="relative z-10 container pt-6 pb-12">
          <Link href="/players" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm no-underline mb-8">
            <ArrowLeft size={16} /> 返回球员列表
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-end">
            {/* Left: Player Info */}
            <div className="flex-1 pb-4">
              {/* Badges */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs px-3 py-1 rounded-full ${
                  player.group === "competitive"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {player.group === "competitive" ? "竞技组" : "娱乐组"}
                </span>
                {player.value !== undefined && player.value > 0 && (
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    身价 {player.value}万
                  </span>
                )}
              </div>

              {/* Name */}
              {(player as any).englishName && (
                <p className="text-white/30 text-sm font-[Oswald] tracking-wider mb-1">{(player as any).englishName}</p>
              )}
              <div className="flex items-baseline gap-4 mb-4">
                <h1 className="text-5xl md:text-6xl font-[Oswald] text-white font-bold">{player.name}</h1>
              </div>

              {/* Number + Position */}
              <div className="flex items-center gap-3 mb-6">
                <span className="stat-number text-4xl text-cyan-400">#{player.number || "-"}</span>
                {player.positions?.map((pos: string, i: number) => (
                  <span key={i} className={`${posColor} text-white text-xs font-bold px-2.5 py-1 rounded`}>
                    {pos}
                  </span>
                ))}
              </div>

              {/* Bio */}
              {player.bio && (
                <p className="text-white/40 text-sm leading-relaxed max-w-lg mb-6">{player.bio}</p>
              )}

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6">
                {avgScore && (
                  <div>
                    <div className="stat-number text-2xl text-amber-400">{avgScore.toFixed(1)}</div>
                    <div className="text-white/30 text-[10px] tracking-wider">综合评分</div>
                  </div>
                )}
                {evalCount && (
                  <div>
                    <div className="stat-number text-2xl text-white">{evalCount}</div>
                    <div className="text-white/30 text-[10px] tracking-wider">评估样本</div>
                  </div>
                )}
                {player.value !== undefined && player.value > 0 && (
                  <div>
                    <div className="stat-number text-2xl text-emerald-400">{player.value}</div>
                    <div className="text-white/30 text-[10px] tracking-wider">身价(万)</div>
                  </div>
                )}
                {playerMatches.length > 0 && (
                  <div>
                    <div className="stat-number text-2xl text-white">{playerMatches.length}</div>
                    <div className="text-white/30 text-[10px] tracking-wider">有记录比赛</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Player Photo */}
            <div className="w-full md:w-80 lg:w-96 shrink-0">
              <div className="relative">
                {playerPhoto ? (
                  <img
                    src={playerPhoto}
                    alt={player.name}
                    className="w-full h-auto max-h-[500px] object-contain object-bottom drop-shadow-[0_0_40px_rgba(79,195,247,0.15)]"
                  />
                ) : (
                  <div className="aspect-[3/4] bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl flex items-center justify-center border border-white/5">
                    <span className="stat-number text-8xl text-white/10">{player.number || "?"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="pb-20 bg-[#020309]">
        <div className="container">
          <div className="flex gap-1 mb-10 border-b border-white/5 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-[Oswald] tracking-wider transition-all border-b-2 whitespace-nowrap ${
                  activeTab === t.key
                    ? "text-cyan-400 border-cyan-400"
                    : "text-white/30 border-transparent hover:text-white/60"
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Personal Info */}
              <div>
                <h3 className="text-white/60 text-xs font-[Oswald] tracking-[0.2em] mb-6">个人信息</h3>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                  {[
                    { label: "位置", value: player.positions?.join(", ") || "—" },
                    { label: "惯用脚", value: player.preferred_foot || "—" },
                    { label: "身高", value: player.height_cm ? `${player.height_cm} cm` : "—" },
                    { label: "体重", value: player.weight_kg ? `${player.weight_kg} kg` : "—" },
                    { label: "分组", value: player.group === "competitive" ? "竞技组" : "娱乐组" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? "border-t border-white/5" : ""}`}>
                      <span className="text-white/30 text-sm">{item.label}</span>
                      <span className="text-white text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Teammate evaluation tags preview */}
                {evaluations.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-white/60 text-xs font-[Oswald] tracking-[0.2em] mb-4">队友印象</h3>
                    <div className="flex flex-wrap gap-2">
                      {evaluations.slice(0, 6).map((ev: any, i: number) => (
                        <span key={i} className="bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-sm flex items-center gap-1.5">
                          <span>{ev.icon}</span>
                          <span className="text-white/70">{ev.text}</span>
                          <span className="text-cyan-400/60 text-xs ml-1">x{ev.count || ev.evaluators?.length || 0}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Radar Chart + Category Scores */}
              <div>
                <h3 className="text-white/60 text-xs font-[Oswald] tracking-[0.2em] mb-6">能力评估</h3>
                {radarScores.length > 0 && radarScores.some((s) => s.value > 0) ? (
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
                    <RadarChart scores={radarScores} />

                    {/* Category score bars */}
                    <div className="mt-6 space-y-3">
                      {radarScores.map((s) => (
                        <div key={s.key} className="flex items-center gap-3">
                          <span className="text-white/50 text-xs w-10 text-right">{s.label}</span>
                          <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${ratingBarColor(s.value)} rounded-full transition-all duration-700`}
                              style={{ width: `${s.value}%` }}
                            />
                          </div>
                          <span className="stat-number text-sm text-white w-10">{s.value.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Overall score */}
                    {avgScore && (
                      <div className="mt-6 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg p-4 flex items-center justify-between">
                        <span className="text-white/60 text-sm">综合评分</span>
                        <span className="stat-number text-3xl text-amber-400">{avgScore.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-12 text-center">
                    <p className="text-white/20">暂无能力评估数据</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== REVIEWS TAB ===== */}
          {activeTab === "reviews" && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                  <span className="text-white text-lg">{evalCount || 0} 位队友参与评价</span>
                </div>
                {avgScore && (
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="stat-number text-xl text-amber-400">{avgScore.toFixed(1)}</span>
                    <span className="text-white/40 text-xs">综合评分</span>
                  </div>
                )}
              </div>

              {evaluations.length === 0 ? (
                <p className="text-white/30 text-center py-12">暂无队友评价</p>
              ) : (
                <>
                  {/* Impression Tags */}
                  <div className="mb-10">
                    <h3 className="text-white/60 text-xs font-[Oswald] tracking-[0.2em] mb-4">队友印象标签</h3>
                    <div className="flex flex-wrap gap-3">
                      {evaluations.map((ev: any, i: number) => (
                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
                          <span className="text-xl">{ev.icon}</span>
                          <span className="text-white/80 text-sm">{ev.text}</span>
                          <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full ml-1">
                            x{ev.count || ev.evaluators?.length || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6-axis detailed scores */}
                  {radarScores.length > 0 && radarScores.some((s) => s.value > 0) && (
                    <div className="mb-10">
                      <h3 className="text-white/60 text-xs font-[Oswald] tracking-[0.2em] mb-4">六维能力详评</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {radarScores.map((s) => (
                          <div key={s.key} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                            <div className="text-white/40 text-xs mb-2">{s.label}</div>
                            <div className="stat-number text-3xl text-white mb-3">{s.value.toFixed(1)}</div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${ratingBarColor(s.value)} rounded-full`}
                                style={{ width: `${s.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed skill scores */}
                  {ratings.length > 0 && (
                    <div>
                      <h3 className="text-white/60 text-xs font-[Oswald] tracking-[0.2em] mb-4">细分技能评分</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {ratings.map(([key, val]) => (
                          <div key={key} className="bg-white/[0.03] border border-white/5 rounded-lg px-4 py-3 flex items-center justify-between">
                            <div>
                              <div className="text-white/30 text-[10px] font-[Oswald] tracking-wider">{key}</div>
                              <div className="text-white/60 text-xs">{SKILL_NAMES[key] || key}</div>
                            </div>
                            <span className={`stat-number text-lg ${
                              (val as number) >= 90 ? "text-emerald-400" :
                              (val as number) >= 85 ? "text-cyan-400" :
                              (val as number) >= 80 ? "text-amber-400" : "text-white/50"
                            }`}>{Math.round(val as number)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evaluator details */}
                  <div className="mt-10">
                    <h3 className="text-white/60 text-xs font-[Oswald] tracking-[0.2em] mb-4">评价详情</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {evaluations.map((ev: any, i: number) => (
                        <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{ev.icon}</span>
                              <span className="text-white font-medium text-sm">{ev.text}</span>
                            </div>
                            <span className="text-cyan-400/60 text-xs">{ev.count || ev.evaluators?.length || 0}人</span>
                          </div>
                          {ev.description && (
                            <p className="text-white/30 text-xs mb-3">{ev.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {ev.evaluators?.map((name: string, j: number) => (
                              <span key={j} className="bg-white/5 text-white/40 text-xs px-2 py-0.5 rounded">{name}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== HISTORY TAB ===== */}
          {activeTab === "history" && (
            <div>
              {playerMatches.length === 0 ? (
                <p className="text-white/30 text-center py-12">暂无比赛记录（仅显示有进球/助攻记录的比赛）</p>
              ) : (
                <div className="space-y-3">
                  {playerMatches.map((m: any) => {
                    const isWin = m.ourScore > m.opponentScore;
                    const isDraw = m.ourScore === m.opponentScore;
                    const scorers = m.events?.goalScorers || [];
                    const assists = m.events?.assists || [];
                    const playerGoals = scorers.filter((s: any) => (s.scorer || s.name) === player.name).length;
                    const playerAssists = assists.filter((a: any) => (a.assister || a.name) === player.name).length;

                    return (
                      <Link
                        key={m.id}
                        href={`/matches/${m.id}`}
                        className="flex items-center bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-xl px-5 py-4 transition-all no-underline"
                      >
                        <div className="w-24 text-white/30 text-xs shrink-0">{m.date}</div>
                        <div className="flex-1 flex items-center gap-4">
                          <span className="text-white text-sm">京蔚联</span>
                          <span className={`stat-number text-xl ${isWin ? "text-emerald-400" : isDraw ? "text-amber-400" : "text-red-400"}`}>
                            {m.ourScore} : {m.opponentScore}
                          </span>
                          <span className="text-white/60 text-sm">{m.opponent}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {playerGoals > 0 && (
                            <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded flex items-center gap-1">
                              <Trophy size={12} /> {playerGoals}球
                            </span>
                          )}
                          {playerAssists > 0 && (
                            <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2 py-1 rounded flex items-center gap-1">
                              <Swords size={12} /> {playerAssists}助
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== HIGHLIGHTS TAB ===== */}
          {activeTab === "highlights" && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {avgScore && (
                  <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-6 text-center">
                    <Star className="w-6 h-6 mx-auto mb-3 text-amber-400" />
                    <div className="stat-number text-4xl text-amber-400 mb-1">{avgScore.toFixed(1)}</div>
                    <div className="text-white/40 text-xs tracking-wider">综合评分</div>
                  </div>
                )}
                {player.value !== undefined && player.value > 0 && (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-6 text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-3 text-emerald-400" />
                    <div className="stat-number text-4xl text-emerald-400 mb-1">{player.value}</div>
                    <div className="text-white/40 text-xs tracking-wider">身价(万)</div>
                  </div>
                )}
                {evalCount && (
                  <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl p-6 text-center">
                    <MessageCircle className="w-6 h-6 mx-auto mb-3 text-cyan-400" />
                    <div className="stat-number text-4xl text-cyan-400 mb-1">{evalCount}</div>
                    <div className="text-white/40 text-xs tracking-wider">评价人数</div>
                  </div>
                )}
              </div>

              {/* Best stats */}
              {ratings.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-white/60 text-xs font-[Oswald] tracking-[0.2em] mb-4">最强属性 TOP 5</h3>
                  <div className="space-y-3">
                    {ratings.slice(0, 5).map(([key, val], i) => (
                      <div key={key} className="flex items-center gap-4">
                        <span className={`stat-number text-lg w-8 text-center ${
                          i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-white/30"
                        }`}>{i + 1}</span>
                        <span className="text-white/70 text-sm w-24">{SKILL_NAMES[key] || key}</span>
                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${ratingBarColor(val as number)} rounded-full`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                        <span className="stat-number text-lg text-white w-10 text-right">{Math.round(val as number)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top evaluation tag */}
              {evaluations.length > 0 && (
                <div>
                  <h3 className="text-white/60 text-xs font-[Oswald] tracking-[0.2em] mb-4">最多评价标签</h3>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 flex items-center gap-4">
                    <span className="text-4xl">{evaluations[0]?.icon}</span>
                    <div>
                      <div className="text-white text-lg font-medium">{evaluations[0]?.text}</div>
                      <div className="text-white/30 text-xs">
                        {evaluations[0]?.count || evaluations[0]?.evaluators?.length}位队友给出此评价
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
