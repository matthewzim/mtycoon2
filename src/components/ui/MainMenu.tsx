import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { CharacterType } from '../../types/game';

const MENU_BUTTONS = [
  { label: 'NAME:', action: 'name' as const },
  { label: 'TUTORIALS', action: 'tutorials' as const },
  { label: 'SINGLE PLAYER', action: 'single_player' as const },
  { label: 'MULTI-PLAYER', action: 'multiplayer' as const },
  { label: 'LOAD GAME', action: 'load' as const },
  { label: 'SETTINGS', action: 'settings' as const },
  { label: 'QUIT TO DESKTOP', action: 'quit' as const },
] as const;

const RAINBOW_COLORS = [
  'from-red-600 to-red-500',
  'from-orange-500 to-orange-400',
  'from-yellow-500 to-yellow-400',
  'from-green-500 to-green-400',
  'from-blue-500 to-blue-400',
  'from-indigo-500 to-indigo-400',
  'from-purple-500 to-purple-400',
];

export function MainMenu() {
  const [playerName, setPlayerName] = useState('ANDREW');
  const setPhase = useGameStore(s => s.setPhase);
  const setMenuScreen = useGameStore(s => s.setMenuScreen);

  const handleClick = (action: string) => {
    if (action === 'single_player') {
      setMenuScreen('single_player');
    } else if (action === 'settings') {
      setMenuScreen('settings');
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* 3D city background placeholder */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(45deg, #333 25%, transparent 25%),
            linear-gradient(-45deg, #333 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #333 75%),
            linear-gradient(-45deg, transparent 75%, #333 75%)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
        }} />
      </div>

      {/* Logo */}
      <div className="relative mb-8 z-10">
        <div className="relative">
          <h1 className="text-red-600 font-bold text-xl tracking-widest text-center" style={{ fontFamily: 'Oswald, sans-serif' }}>
            MONOPOLY
          </h1>
          <h1 className="text-yellow-400 font-black text-6xl tracking-tight -mt-2 text-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            style={{
              fontFamily: 'Oswald, sans-serif',
              textShadow: '3px 3px 0 #8B6914, -1px -1px 0 #FFD700, 0 0 20px rgba(255,215,0,0.3)',
              WebkitTextStroke: '1px #8B6914',
            }}
          >
            TYCOON
          </h1>
        </div>
      </div>

      {/* Menu buttons */}
      <div className="flex flex-col gap-2 w-[500px] max-w-[90vw] z-10">
        {MENU_BUTTONS.map((btn, i) => (
          <button
            key={btn.action}
            onClick={() => handleClick(btn.action)}
            className={`bg-gradient-to-r ${RAINBOW_COLORS[i % RAINBOW_COLORS.length]}
              hover:brightness-110 active:brightness-90
              text-white font-bold text-lg py-3 px-6 rounded shadow-lg
              border-b-4 border-black/30 transition-all hover:translate-y-[-1px]
              uppercase tracking-wider text-center`}
            style={{ fontFamily: 'Oswald, sans-serif' }}
          >
            {btn.action === 'name' ? `${btn.label}  ${playerName}` : btn.label}
          </button>
        ))}
      </div>

      {/* Footer logos */}
      <div className="absolute bottom-4 flex gap-8 items-center opacity-60 z-10">
        <span className="text-red-500 font-bold italic text-xl" style={{ fontFamily: 'cursive' }}>deep red</span>
        <span className="text-white font-bold text-sm">INFOGRAMES</span>
      </div>
    </div>
  );
}

// --- Character Selection Screen ---
const CHARACTERS: { type: CharacterType; name: string; desc: string }[] = [
  { type: 'wheelbarrow', name: 'Wheelbarrow', desc: 'A shrewd investor with a background as a builder. Likes firm foundations and does not like going into the red. Generally good-natured but can become aggressive.' },
  { type: 'iron', name: 'Iron', desc: 'A meticulous planner who presses every advantage. Known for hostile takeovers and aggressive expansion into high-prestige areas.' },
  { type: 'dog', name: 'Dog', desc: 'A loyal community builder. Focuses on creating diverse neighborhoods with parks and amenities. Preferred by citizens for quality of life.' },
  { type: 'car', name: 'Racing Car', desc: 'Fast-moving and decisive. Specializes in nightlife and entertainment venues. Takes risks but reaps big rewards.' },
  { type: 'hat', name: 'Top Hat', desc: 'An old-money aristocrat who targets premium properties. Only builds in high-prestige areas and charges premium prices.' },
  { type: 'boot', name: 'Boot', desc: 'A working-class hero. Builds affordable housing and budget stores. Low margins but high volume.' },
];

export function CharacterSelect() {
  const [selectedChar, setSelectedChar] = useState(0);
  const [playerName, setPlayerName] = useState('ANDREW');
  const [aiCount, setAiCount] = useState(2);
  const startGame = useGameStore(s => s.startGame);
  const setMenuScreen = useGameStore(s => s.setMenuScreen);

  const char = CHARACTERS[selectedChar];

  return (
    <div className="w-full h-full flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0d1b2a 0%, #1b2838 100%)' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 py-3 px-6 text-center">
        <h2 className="text-white font-bold text-2xl uppercase tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Character Selection
        </h2>
      </div>

      <div className="flex-1 flex flex-col p-6 gap-6">
        {/* Player name input */}
        <div className="flex items-center gap-3">
          <label className="text-gray-400 text-sm">Player Name:</label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value.toUpperCase())}
            className="bg-blue-900 border border-blue-600 text-white px-3 py-1 rounded text-sm uppercase"
            maxLength={12}
          />
        </div>

        {/* Character slots */}
        <div className="text-gray-400 text-xs mb-1">Players In This Game</div>
        <div className="flex gap-3">
          {CHARACTERS.map((c, i) => (
            <button
              key={c.type}
              onClick={() => setSelectedChar(i)}
              className={`w-24 h-28 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                selectedChar === i
                  ? 'border-yellow-400 bg-blue-800 shadow-lg shadow-yellow-400/20'
                  : i === 0
                  ? 'border-blue-600 bg-blue-900'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <div className="text-3xl">
                {c.type === 'wheelbarrow' ? '🧰' : c.type === 'iron' ? '👔' : c.type === 'dog' ? '🐕' :
                 c.type === 'car' ? '🏎️' : c.type === 'hat' ? '🎩' : '🥾'}
              </div>
              <span className="text-white text-[10px] font-bold uppercase">{i === 0 ? playerName : i <= aiCount ? 'AI' : 'Locked'}</span>
              {i > 0 && i > aiCount && (
                <div className="text-yellow-600 text-lg">🔒</div>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-6 flex-1">
          {/* Character info */}
          <div className="flex-1 bg-blue-900/50 rounded-lg p-4 border border-blue-800">
            <h3 className="text-yellow-400 font-bold text-lg mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{char.name}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{char.desc}</p>
          </div>

          {/* Scenario info */}
          <div className="w-64 space-y-3">
            <div className="text-gray-400 text-sm font-bold">Scenario Information</div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-600 text-white text-xs px-3 py-1 rounded font-bold">Scenario</span>
              <span className="text-white text-sm">Starting Out</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded font-bold">Difficulty</span>
              <span className="text-white text-sm">Bronze Cup - Easy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">AI Players:</span>
              <select
                value={aiCount}
                onChange={e => setAiCount(Number(e.target.value))}
                className="bg-blue-900 border border-blue-600 text-white text-xs px-2 py-1 rounded"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => startGame(playerName, char.type, aiCount)}
            className="bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold px-8 py-2 rounded shadow-lg border border-green-400"
            style={{ fontFamily: 'Oswald, sans-serif' }}
          >
            Start
          </button>
          <button
            onClick={() => setMenuScreen('main')}
            className="bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold px-8 py-2 rounded shadow-lg border border-red-400"
            style={{ fontFamily: 'Oswald, sans-serif' }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
