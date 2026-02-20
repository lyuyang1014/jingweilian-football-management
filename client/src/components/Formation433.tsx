import { PLAYER_PHOTOS } from "@shared/constants";
import { useMemo } from "react";

interface Player {
  id: string;
  name: string;
  number: number;
  positions: string[];
  photo?: string;
}

interface Formation433Props {
  players: Player[];
}

// Map primary positions to 4-3-3 slots
const SLOT_POSITIONS: Record<string, string[]> = {
  LW: ["左边锋", "左边前卫"],
  ST: ["前锋"],
  RW: ["右边锋", "右边前卫"],
  LCM: ["中前卫"],
  CDM: ["后腰"],
  RCM: ["中前卫"],
  LB: ["左后卫"],
  LCB: ["中后卫"],
  RCB: ["中后卫"],
  RB: ["右后卫"],
  GK: ["门将"],
};

// Staggered Y offsets for natural look (percentage from top)
const SLOT_LAYOUT: Record<string, { x: number; y: number; label: string }> = {
  // Forwards - slight stagger
  LW:  { x: 18, y: 10, label: "左边锋" },
  ST:  { x: 50, y: 6,  label: "前锋" },
  RW:  { x: 82, y: 10, label: "右边锋" },
  // Midfielders - staggered triangle
  LCM: { x: 22, y: 36, label: "中前卫" },
  CDM: { x: 50, y: 38, label: "后腰" },
  RCM: { x: 78, y: 36, label: "中前卫" },
  // Defenders - slight curve
  LB:  { x: 12, y: 60, label: "左后卫" },
  LCB: { x: 37, y: 56, label: "中后卫" },
  RCB: { x: 63, y: 56, label: "中后卫" },
  RB:  { x: 88, y: 60, label: "右后卫" },
  // Goalkeeper
  GK:  { x: 50, y: 82, label: "门将" },
};

function PlayerBubble({ player, index }: { player: Player; index: number }) {
  // Opacity: first 2 = 100%, 3rd = 70%, 4th = 50%, 5th+ = 30%
  const opacity = index < 2 ? 1 : index === 2 ? 0.7 : index === 3 ? 0.5 : 0.3;
  const offset = index < 2 ? index * 52 : 52 + (index - 2) * 20;

  return (
    <div
      className="absolute group"
      style={{
        opacity,
        zIndex: 20 - index,
        left: `${offset}px`,
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <div className="relative">
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-cyan-400/60 bg-slate-800 shadow-[0_0_12px_rgba(0,200,255,0.15)]">
          <img src={player.photo} alt={player.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-[9px] font-bold px-1 py-px rounded shadow">
          #{player.number}
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2 py-1 bg-slate-900/95 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-cyan-500/20">
          {player.name}
        </div>
      </div>
    </div>
  );
}

function PositionNode({ slotKey, players }: { slotKey: string; players: Player[] }) {
  const layout = SLOT_LAYOUT[slotKey];
  const validPositions = SLOT_POSITIONS[slotKey] || [];

  // Only use primary position (positions[0]) for each player
  const slotPlayers = players.filter(
    (p) => p.photo && validPositions.includes(p.positions[0])
  );

  const displayMax = 5;
  const shown = slotPlayers.slice(0, displayMax);
  const extra = slotPlayers.length - displayMax;

  // Calculate container width based on player count
  const containerWidth = shown.length <= 2
    ? shown.length * 52
    : 52 + (shown.length - 2) * 20 + 44;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {slotPlayers.length > 0 ? (
        <div className="relative" style={{ width: `${containerWidth}px`, height: "48px" }}>
          {shown.map((p, i) => (
            <PlayerBubble key={p.id} player={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="w-11 h-11 rounded-full border-2 border-dashed border-slate-600/40 bg-slate-800/20 flex items-center justify-center">
          <span className="text-slate-600 text-[10px]">—</span>
        </div>
      )}
      <div className="text-[11px] text-slate-400/80 mt-2 font-medium tracking-wide">{layout.label}</div>
      {extra > 0 && (
        <div className="text-[10px] text-cyan-400/70 -mt-0.5">+{extra}</div>
      )}
    </div>
  );
}

export default function Formation433({ players }: Formation433Props) {
  const enrichedPlayers = useMemo(() =>
    players.map((p) => ({ ...p, photo: PLAYER_PHOTOS[p.number] })),
    [players]
  );

  return (
    <div className="w-full max-w-5xl mx-auto mb-12">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white font-[Oswald] mb-1">4-3-3 阵型</h3>
        <p className="text-sm text-slate-500">展示有写真照片的球员在各首选位置的分布</p>
      </div>

      {/* Football pitch */}
      <div className="relative w-full aspect-[5/4] rounded-xl overflow-hidden border border-green-800/30"
        style={{
          background: "linear-gradient(180deg, #0a2e1a 0%, #0d3820 30%, #0a2e1a 50%, #0d3820 70%, #0a2e1a 100%)",
        }}
      >
        {/* Field markings */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer boundary */}
          <rect x="40" y="30" width="920" height="740" rx="4" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />
          {/* Center line */}
          <line x1="40" y1="400" x2="960" y2="400" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          {/* Center circle */}
          <circle cx="500" cy="400" r="80" stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none" />
          <circle cx="500" cy="400" r="4" fill="rgba(255,255,255,0.08)" />
          {/* Top penalty area */}
          <rect x="300" y="30" width="400" height="120" stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none" />
          <rect x="380" y="30" width="240" height="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="none" />
          {/* Bottom penalty area */}
          <rect x="300" y="650" width="400" height="120" stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none" />
          <rect x="380" y="720" width="240" height="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="none" />
          {/* Penalty arcs */}
          <path d="M 380 150 Q 500 190 620 150" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="none" />
          <path d="M 380 650 Q 500 610 620 650" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Subtle grass stripes */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.5) 60px, rgba(255,255,255,0.5) 62px)",
          }}
        />

        {/* Position nodes */}
        {Object.keys(SLOT_LAYOUT).map((key) => (
          <PositionNode key={key} slotKey={key} players={enrichedPlayers} />
        ))}
      </div>
    </div>
  );
}
