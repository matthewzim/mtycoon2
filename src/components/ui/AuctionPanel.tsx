import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export function AuctionPanel() {
  const auction = useGameStore(s => s.activeAuction);
  const players = useGameStore(s => s.players);
  const currentPlayerId = useGameStore(s => s.currentPlayerId);
  const city = useGameStore(s => s.city);
  const placeBid = useGameStore(s => s.placeBid);
  const resolveAuction = useGameStore(s => s.resolveAuction);

  useEffect(() => {
    if (!auction) return;
    if (auction.phase === 'warning') {
      const timer = setTimeout(() => {
        useGameStore.setState(s => ({
          activeAuction: s.activeAuction ? { ...s.activeAuction, phase: 'active', timeRemaining: 60 } : null,
        }));
      }, 5000); // 5s warning in real time
      return () => clearTimeout(timer);
    }
    if (auction.phase === 'active' && auction.timeRemaining > 0) {
      const timer = setInterval(() => {
        useGameStore.setState(s => {
          if (!s.activeAuction || s.activeAuction.phase !== 'active') return s;
          const newTime = s.activeAuction.timeRemaining - 1;
          if (newTime <= 0) {
            // Auto-resolve
            return s;
          }
          return { activeAuction: { ...s.activeAuction, timeRemaining: newTime } };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [auction?.phase, auction?.timeRemaining]);

  // Auto-resolve when timer hits 0
  useEffect(() => {
    if (auction?.phase === 'active' && auction.timeRemaining <= 0) {
      resolveAuction();
    }
  }, [auction?.timeRemaining]);

  // AI bidding
  useEffect(() => {
    if (!auction || auction.phase !== 'active') return;
    const aiTimer = setInterval(() => {
      const state = useGameStore.getState();
      const a = state.activeAuction;
      if (!a || a.phase !== 'active') return;

      for (const player of state.players) {
        if (!player.isAI || player.isEliminated) continue;
        if (player.id === a.currentBidderId) continue;

        // Simple AI: bid if affordable and profile matches
        const maxBid = player.aiProfile === 'aggressive'
          ? player.cash * 0.6
          : player.aiProfile === 'cautious'
          ? player.cash * 0.3
          : player.cash * 0.45;

        if (a.currentBid + 100 < maxBid && Math.random() < 0.3) {
          const increment = [50, 100, 500][Math.floor(Math.random() * 3)];
          placeBid(player.id, increment);
          break; // Only one AI bids per tick
        }
      }
    }, 2000);
    return () => clearInterval(aiTimer);
  }, [auction?.phase]);

  if (!auction) return null;

  const block = city.blocks.find(b => b.id === auction.blockId);
  const currentBidder = players.find(p => p.id === auction.currentBidderId);
  const player = players.find(p => p.id === currentPlayerId);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
      <div className="bg-gradient-to-b from-[#2a1a44] to-[#1a0d2a] border-2 border-purple-500 rounded-xl shadow-2xl p-6 min-w-[400px]">
        <h2 className="text-yellow-400 font-bold text-xl text-center uppercase tracking-wider mb-4">
          {auction.phase === 'warning' ? '⚠ Auction Starting!' : '🔨 Live Auction'}
        </h2>

        <div className="text-center mb-4">
          <div className="text-white text-lg font-bold">{block?.name}</div>
          <div className="text-gray-400 text-sm">Property Lease - 25 Years</div>
        </div>

        {auction.phase === 'warning' ? (
          <div className="text-center text-yellow-300 text-lg animate-pulse">
            Bidding begins shortly...
          </div>
        ) : (
          <>
            <div className="bg-black/40 rounded-lg p-4 mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Current Bid</span>
                <span>Time Remaining</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400 font-bold text-2xl">${auction.currentBid}</span>
                <span className={`font-bold text-2xl ${auction.timeRemaining < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {auction.timeRemaining}s
                </span>
              </div>
              {currentBidder && (
                <div className="text-blue-400 text-sm mt-1">
                  Leading: {currentBidder.name}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              {[50, 100, 500].map(amount => {
                const canBid = player && player.cash >= auction.currentBid + amount;
                return (
                  <button
                    key={amount}
                    onClick={() => placeBid(currentPlayerId, amount)}
                    disabled={!canBid}
                    className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                      canBid
                        ? 'bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    +${amount}
                  </button>
                );
              })}
            </div>

            <div className="text-center mt-3 text-gray-500 text-xs">
              Your cash: ${player?.cash.toFixed(2)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
