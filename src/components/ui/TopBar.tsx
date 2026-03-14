import { useGameStore } from '../../store/gameStore';
import type { GameSpeed } from '../../types/game';

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const m = String(Math.floor(minute)).padStart(2, '0');
  const ampm = hour < 12 ? 'am' : 'pm';
  return `${h}:${m}${ampm}`;
}

export function TopBar() {
  const time = useGameStore(s => s.time);
  const players = useGameStore(s => s.players);
  const currentPlayerId = useGameStore(s => s.currentPlayerId);
  const setSpeed = useGameStore(s => s.setSpeed);
  const togglePause = useGameStore(s => s.togglePause);
  const setPhase = useGameStore(s => s.setPhase);

  const player = players.find(p => p.id === currentPlayerId);
  if (!player) return null;

  const speeds: GameSpeed[] = [1, 2, 4, 8];

  return (
    <div className="absolute top-0 right-0 z-50 flex flex-col items-end gap-1 p-2">
      {/* Clock & Date */}
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg px-4 py-1 flex items-center gap-3 shadow-lg border border-blue-400">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
              <line x1="10" y1="10" x2="10" y2="4" stroke="currentColor" strokeWidth="2" />
              <line x1="10" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-white font-bold text-sm font-mono">
              {formatTime(time.hour, time.minute)}
            </span>
          </div>
          <span className="text-yellow-300 font-bold text-sm">{time.year}</span>
        </div>

        <button
          onClick={() => setPhase('paused')}
          className="bg-gradient-to-b from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-xs px-3 py-1.5 rounded shadow-lg border border-yellow-700"
        >
          Options
        </button>
      </div>

      {/* Player Info */}
      <div className="bg-gradient-to-b from-blue-800 to-blue-900 rounded-lg px-4 py-2 shadow-lg border border-blue-600 min-w-[180px]">
        <div className="text-white font-bold text-sm uppercase tracking-wide">{player.name}</div>
        <div className={`font-bold text-lg font-mono ${player.cash >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          ${player.cash.toFixed(2)}
        </div>
      </div>

      {/* Speed controls */}
      <div className="flex items-center gap-1 bg-black/60 rounded px-2 py-1">
        <button
          onClick={togglePause}
          className={`px-2 py-0.5 text-xs font-bold rounded ${time.isPaused ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          {time.isPaused ? '▶' : '⏸'}
        </button>
        {speeds.map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
              time.speed === s && !time.isPaused
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
