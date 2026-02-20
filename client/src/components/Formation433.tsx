import { PLAYER_PHOTOS } from "@shared/constants";

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

// Position mapping: map API positions to 4-3-3 formation slots
const POSITION_MAP: Record<string, string[]> = {
  GK: ["门将"],
  LB: ["左后卫"],
  CB1: ["中后卫"],
  CB2: ["中后卫"],
  RB: ["右后卫"],
  CM1: ["后腰", "中前卫"],
  CM2: ["后腰", "中前卫"],
  CM3: ["前腰", "中前卫"],
  LW: ["左边锋", "左边前卫"],
  ST: ["前锋"],
  RW: ["右边锋", "右边前卫"],
};

function getPlayersForPosition(
  players: Player[],
  positionKey: string
): Player[] {
  const validPositions = POSITION_MAP[positionKey] || [];
  return players.filter(
    (p) =>
      p.photo && // Only players with photos
      p.positions.some((pos) => validPositions.includes(pos))
  );
}

function PlayerAvatar({
  player,
  index,
  total,
}: {
  player: Player;
  index: number;
  total: number;
}) {
  // First 2 players: full opacity
  // 3rd player: 70% opacity
  // 4th player: 50% opacity
  // 5th+ player: 30% opacity
  let opacity = 1;
  if (index === 2) opacity = 0.7;
  else if (index === 3) opacity = 0.5;
  else if (index >= 4) opacity = 0.3;

  // Stack players with slight offset for depth
  const zIndex = total - index;
  const leftOffset = index * (index < 2 ? 0 : -8); // Overlap after 2nd player

  return (
    <div
      className="absolute"
      style={{
        opacity,
        zIndex,
        left: `${leftOffset}px`,
      }}
    >
      <div className="relative group">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400/50 bg-slate-800/80 shadow-lg">
          <img
            src={player.photo}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
          #{player.number}
        </div>
        {/* Tooltip on hover */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {player.name}
        </div>
      </div>
    </div>
  );
}

function PositionSlot({
  label,
  positionKey,
  players,
}: {
  label: string;
  positionKey: string;
  players: Player[];
}) {
  const positionPlayers = getPlayersForPosition(players, positionKey);
  const displayCount = Math.min(positionPlayers.length, 5); // Max 5 players per position

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center h-16">
        {positionPlayers.slice(0, displayCount).map((player, index) => (
          <PlayerAvatar
            key={player.id}
            player={player}
            index={index}
            total={displayCount}
          />
        ))}
        {positionPlayers.length === 0 && (
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-600/50 bg-slate-800/30 flex items-center justify-center">
            <span className="text-slate-600 text-xs">-</span>
          </div>
        )}
      </div>
      <div className="text-xs text-slate-400 font-medium">{label}</div>
      {positionPlayers.length > 5 && (
        <div className="text-[10px] text-cyan-400">
          +{positionPlayers.length - 5}
        </div>
      )}
    </div>
  );
}

export default function Formation433({ players }: Formation433Props) {
  // Enrich players with photo URLs
  const enrichedPlayers: Player[] = players.map((p) => ({
    ...p,
    photo: PLAYER_PHOTOS[p.number],
  }));

  return (
    <div className="w-full bg-gradient-to-b from-slate-900/50 to-slate-800/30 rounded-lg border border-slate-700/50 p-8 mb-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-1">4-3-3 阵型</h3>
        <p className="text-sm text-slate-400">
          展示有写真照片的球员在各位置的分布
        </p>
      </div>

      {/* Football field background */}
      <div className="relative w-full max-w-4xl mx-auto aspect-[3/4] bg-gradient-to-b from-green-900/20 to-green-800/20 rounded-lg border-2 border-green-700/30 overflow-hidden">
        {/* Field lines */}
        <div className="absolute inset-0">
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/10" />
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
        </div>

        {/* Formation layout */}
        <div className="relative h-full flex flex-col justify-between py-8 px-4">
          {/* Forwards (3) */}
          <div className="flex justify-around items-center px-8">
            <PositionSlot label="左边锋" positionKey="LW" players={enrichedPlayers} />
            <PositionSlot label="前锋" positionKey="ST" players={enrichedPlayers} />
            <PositionSlot label="右边锋" positionKey="RW" players={enrichedPlayers} />
          </div>

          {/* Midfielders (3) */}
          <div className="flex justify-around items-center px-12">
            <PositionSlot label="中前卫" positionKey="CM1" players={enrichedPlayers} />
            <PositionSlot label="中前卫" positionKey="CM2" players={enrichedPlayers} />
            <PositionSlot label="前腰" positionKey="CM3" players={enrichedPlayers} />
          </div>

          {/* Defenders (4) */}
          <div className="flex justify-around items-center px-4">
            <PositionSlot label="左后卫" positionKey="LB" players={enrichedPlayers} />
            <PositionSlot label="中后卫" positionKey="CB1" players={enrichedPlayers} />
            <PositionSlot label="中后卫" positionKey="CB2" players={enrichedPlayers} />
            <PositionSlot label="右后卫" positionKey="RB" players={enrichedPlayers} />
          </div>

          {/* Goalkeeper (1) */}
          <div className="flex justify-center items-center">
            <PositionSlot label="门将" positionKey="GK" players={enrichedPlayers} />
          </div>
        </div>
      </div>
    </div>
  );
}
