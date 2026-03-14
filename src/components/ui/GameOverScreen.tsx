import { useGameStore } from '../../store/gameStore';

export function GameOverScreen() {
  const players = useGameStore(s => s.players);
  const setPhase = useGameStore(s => s.setPhase);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="absolute inset-0 z-[200] bg-black/80 flex items-center justify-center">
      <div className="bg-gradient-to-b from-[#2a1a44] to-[#1a0d2a] rounded-xl border-2 border-yellow-500 shadow-2xl p-8 min-w-[500px]">
        <h2 className="text-yellow-400 font-bold text-3xl text-center mb-6 uppercase tracking-wider"
          style={{ fontFamily: 'Oswald, sans-serif' }}
        >
          Game Over
        </h2>

        <div className="space-y-2 mb-6">
          {sortedPlayers.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                i === 0 ? 'bg-yellow-600/30 border border-yellow-500' : 'bg-blue-900/30'
              }`}
            >
              <span className={`font-bold text-xl w-8 ${
                i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-orange-400'
              }`}>
                #{i + 1}
              </span>
              <div className="flex-1">
                <div className="text-white font-bold">{p.name}</div>
                <div className="text-gray-400 text-xs">
                  Revenue: ${p.totalRevenue.toFixed(0)} | Blocks: {p.ownedBlocks.length}
                </div>
              </div>
              <div className="text-yellow-400 font-bold text-lg">${p.score.toFixed(0)}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setPhase('menu');
            useGameStore.setState({ menuScreen: 'main' });
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 rounded-lg shadow"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
}
