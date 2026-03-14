import { useGameStore } from '../../store/gameStore';

export function ChanceCardOverlay() {
  const activeCard = useGameStore(s => s.activeChanceCard);
  const useChanceCard = useGameStore(s => s.useChanceCard);
  const setCrosshairMode = useGameStore(s => s.setCrosshairMode);
  const crosshairMode = useGameStore(s => s.crosshairMode);

  if (!activeCard) return null;

  const needsTarget = activeCard.targetType === 'opponent' || activeCard.targetType === 'block';

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
      <div className="bg-gradient-to-b from-yellow-600 to-orange-700 border-4 border-yellow-400 rounded-xl shadow-2xl p-6 min-w-[350px] max-w-[400px]">
        {/* Card face */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🃏</div>
            <h3 className="text-gray-900 font-bold text-lg">{activeCard.title}</h3>
            <p className="text-gray-600 text-sm mt-2">{activeCard.description}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          {needsTarget ? (
            <button
              onClick={() => setCrosshairMode(true)}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow"
            >
              🎯 Select Target
            </button>
          ) : (
            <button
              onClick={() => useChanceCard(activeCard.id)}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow"
            >
              Use Card
            </button>
          )}
          <button
            onClick={() => useGameStore.setState({ activeChanceCard: null, crosshairMode: false })}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow"
          >
            Keep
          </button>
        </div>

        {crosshairMode && (
          <div className="text-center mt-3 text-yellow-200 text-sm animate-pulse">
            Click a target on the map...
          </div>
        )}
      </div>
    </div>
  );
}
