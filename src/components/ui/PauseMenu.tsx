import { useGameStore } from '../../store/gameStore';

export function PauseMenu() {
  const setPhase = useGameStore(s => s.setPhase);
  const togglePause = useGameStore(s => s.togglePause);
  const settings = useGameStore(s => s.settings);
  const updateSettings = useGameStore(s => s.updateSettings);
  const time = useGameStore(s => s.time);

  const handleResume = () => {
    setPhase('playing');
    if (time.isPaused) togglePause();
  };

  return (
    <div className="absolute inset-0 z-[200] bg-black/70 flex items-center justify-center">
      <div className="bg-gradient-to-b from-[#2a3a5c] to-[#1a2a44] rounded-xl border-2 border-blue-500 shadow-2xl p-8 min-w-[400px]">
        <h2 className="text-white font-bold text-2xl text-center mb-6 uppercase tracking-wider"
          style={{ fontFamily: 'Oswald, sans-serif' }}
        >
          Options
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Music Volume</label>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.musicVolume * 100}
              onChange={e => updateSettings({ musicVolume: Number(e.target.value) / 100 })}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">SFX Volume</label>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.sfxVolume * 100}
              onChange={e => updateSettings({ sfxVolume: Number(e.target.value) / 100 })}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleResume}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-lg shadow"
          >
            Resume Game
          </button>
          <button
            onClick={() => {
              setPhase('menu');
              useGameStore.setState({ menuScreen: 'main' });
            }}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-lg shadow"
          >
            Quit to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
