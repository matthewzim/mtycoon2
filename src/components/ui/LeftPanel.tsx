import { useGameStore } from '../../store/gameStore';
import { BUILDING_TEMPLATES, DAY_SHOPS, NIGHT_SHOPS, RESIDENTIAL } from '../../data/buildings';
import type { BuildingType } from '../../types/game';

function PrestigeStars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < count ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
      ))}
    </div>
  );
}

export function LeftPanel() {
  const selectedBlockId = useGameStore(s => s.selectedBlockId);
  const city = useGameStore(s => s.city);
  const players = useGameStore(s => s.players);
  const currentPlayerId = useGameStore(s => s.currentPlayerId);
  const buildOnBlock = useGameStore(s => s.buildOnBlock);
  const selectBlock = useGameStore(s => s.selectBlock);
  const startAuction = useGameStore(s => s.startAuction);
  const time = useGameStore(s => s.time);
  const citizens = useGameStore(s => s.citizens);

  const selectedBlock = selectedBlockId ? city.blocks.find(b => b.id === selectedBlockId) : null;
  const player = players.find(p => p.id === currentPlayerId);

  if (!selectedBlock) {
    // City overview
    const housed = citizens.filter(c => c.housed).length;
    const pop = citizens.length;
    const children = citizens.filter(c => c.type === 'child').length;
    const adults = citizens.filter(c => c.type === 'adult').length;
    const retired = citizens.filter(c => c.type === 'retired').length;
    const lowIncome = citizens.filter(c => c.salaryBand === 'low').length;
    const medIncome = citizens.filter(c => c.salaryBand === 'medium').length;
    const highIncome = citizens.filter(c => c.salaryBand === 'high').length;

    return (
      <div className="absolute top-0 left-0 z-50 w-72 h-full pointer-events-none">
        <div className="pointer-events-auto bg-gradient-to-b from-[#1a2744] to-[#0d1b2a] border-r-2 border-blue-800 h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-3 py-2 border-b border-blue-600">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">City Information</h2>
          </div>

          {/* Info tabs */}
          <div className="flex gap-1 p-2">
            {['👤', '🏠', '📊', '🏛️'].map((icon, i) => (
              <button key={i} className="bg-blue-800 hover:bg-blue-700 text-white w-8 h-8 rounded text-sm">{icon}</button>
            ))}
          </div>

          {/* People section */}
          <div className="px-3 space-y-3 overflow-y-auto flex-1">
            <div>
              <div className="bg-green-700 text-white text-xs font-bold px-2 py-1 rounded mb-2">PEOPLE</div>
              <div className="text-gray-300 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Population</span>
                  <span className="text-white font-bold">{pop}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-gray-400 text-xs font-bold mb-1">Housing</div>
              <div className="text-gray-300 text-xs space-y-0.5">
                <div className="flex justify-between"><span>Housed</span><span>{Math.round(housed / pop * 100)}%</span></div>
                <div className="flex justify-between"><span>Commuters</span><span>{Math.round((pop - housed) / pop * 100)}%</span></div>
                <div className="flex justify-between"><span>Tourists</span><span>{Math.round(citizens.filter(c => c.type === 'tourist').length / pop * 100)}%</span></div>
              </div>
            </div>

            <div>
              <div className="text-blue-400 text-xs font-bold mb-1">Age Split</div>
              <div className="text-gray-300 text-xs space-y-0.5">
                <div className="flex justify-between"><span>Children</span><span>{Math.round(children / pop * 100)}%</span></div>
                <div className="flex justify-between"><span>Adults</span><span>{Math.round(adults / pop * 100)}%</span></div>
                <div className="flex justify-between"><span>Senior Citizens</span><span>{Math.round(retired / pop * 100)}%</span></div>
              </div>
            </div>

            <div>
              <div className="text-green-400 text-xs font-bold mb-1">Income Split</div>
              <div className="text-gray-300 text-xs space-y-0.5">
                <div className="flex justify-between"><span>High</span><span>{Math.round(highIncome / pop * 100)}%</span></div>
                <div className="flex justify-between"><span>Medium</span><span>{Math.round(medIncome / pop * 100)}%</span></div>
                <div className="flex justify-between"><span>Low</span><span>{Math.round(lowIncome / pop * 100)}%</span></div>
              </div>
            </div>
          </div>

          {/* Bottom: Sales & Score */}
          <div className="border-t border-blue-800 p-2">
            <div className="flex items-center gap-2 bg-blue-900/50 rounded px-2 py-1">
              <span className="text-blue-400 text-xs">📊 Sales</span>
              <div className="flex-1 h-2 bg-blue-950 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
            {players.map(p => (
              <div key={p.id} className={`flex items-center gap-2 mt-1 px-2 py-0.5 rounded ${p.id === currentPlayerId ? 'bg-blue-800/50' : ''}`}>
                <span className="text-white text-xs font-bold uppercase flex-1">{p.name}</span>
                <span className="text-yellow-400 text-xs font-mono">{p.score}↑</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Block detail view
  const landlord = selectedBlock.landlord === 'city'
    ? 'The City'
    : players.find(p => p.id === selectedBlock.landlord)?.name || 'Unknown';
  const isOwner = selectedBlock.landlord === currentPlayerId;
  const canBuild = !selectedBlock.isSpecial &&
    (selectedBlock.buildingRights === 'open' ||
      (selectedBlock.buildingRights === 'exclusive' && selectedBlock.exclusiveOwnerId === currentPlayerId));

  const allBuildTypes: BuildingType[] = [...DAY_SHOPS, ...NIGHT_SHOPS, ...RESIDENTIAL];

  return (
    <div className="absolute top-0 left-0 z-50 w-72 h-full pointer-events-none">
      <div className="pointer-events-auto bg-gradient-to-b from-[#1a2744] to-[#0d1b2a] border-r-2 border-blue-800 h-full flex flex-col overflow-hidden">
        {/* Block name header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-3 py-2 border-b border-blue-600">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">{selectedBlock.name}</h2>
            <button
              onClick={() => selectBlock(null)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Info tabs */}
        <div className="flex gap-1 p-2">
          {['🏗️', '📊', '💰', '%'].map((icon, i) => (
            <button key={i} className="bg-blue-800 hover:bg-blue-700 text-white w-8 h-8 rounded text-sm">{icon}</button>
          ))}
        </div>

        {/* Block info */}
        <div className="px-3 space-y-3 overflow-y-auto flex-1">
          <div>
            <div className="bg-blue-700 text-white text-xs font-bold px-2 py-1 rounded mb-2">BLOCK INFORMATION</div>
            <div className="text-gray-300 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span>Landlord</span>
                <span className="text-white font-bold">{landlord}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Prestige</span>
                <PrestigeStars count={selectedBlock.prestige} />
              </div>
              <div className="flex justify-between">
                <span>Building Rights</span>
                <span className={`font-bold ${selectedBlock.buildingRights === 'open' ? 'text-green-400' : selectedBlock.buildingRights === 'exclusive' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {selectedBlock.buildingRights === 'open' ? 'Open' : selectedBlock.buildingRights === 'exclusive' ? 'Exclusive' : 'Closed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Buildings</span>
                <span className="text-white">{selectedBlock.buildings.length}/{selectedBlock.maxSlots}</span>
              </div>
              <div className="flex justify-between">
                <span>Parks</span>
                <span className="text-green-400">{selectedBlock.parkUnits}</span>
              </div>
            </div>
          </div>

          {/* Existing buildings */}
          {selectedBlock.buildings.length > 0 && (
            <div>
              <div className="bg-green-700 text-white text-xs font-bold px-2 py-1 rounded mb-2">BUILDINGS</div>
              <div className="space-y-1">
                {selectedBlock.buildings.map(b => {
                  const t = BUILDING_TEMPLATES[b.type];
                  return (
                    <div key={b.id} className="flex items-center justify-between bg-blue-900/50 rounded px-2 py-1">
                      <div>
                        <span className="text-white text-xs">{t.name}</span>
                        <span className="text-gray-500 text-[10px] ml-1">Lv{b.level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${b.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                          {b.isOpen ? 'OPEN' : 'CLOSED'}
                        </span>
                        <span className="text-yellow-400 text-[10px]">{b.stock}/{b.maxStock}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Build menu */}
          {canBuild && (
            <div>
              <div className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded mb-2">BUILD</div>
              <div className="grid grid-cols-2 gap-1">
                {allBuildTypes.map(type => {
                  const t = BUILDING_TEMPLATES[type];
                  const canAfford = player && player.cash >= t.baseCost;
                  return (
                    <button
                      key={type}
                      onClick={() => buildOnBlock(selectedBlock.id, type)}
                      disabled={!canAfford}
                      className={`text-left px-2 py-1.5 rounded text-[10px] transition-colors ${
                        canAfford
                          ? 'bg-blue-800 hover:bg-blue-700 text-white'
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-bold">{t.name}</div>
                      <div className="text-yellow-400">${t.baseCost}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Auction button */}
          {!selectedBlock.isSpecial && selectedBlock.landlord === 'city' && (
            <button
              onClick={() => startAuction(selectedBlock.id)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs py-2 rounded shadow-lg"
            >
              Start Auction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
