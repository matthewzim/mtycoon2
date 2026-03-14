import { useGameStore } from './store/gameStore';
import { useGameLoop } from './hooks/useGameLoop';
import { useAIPlayers } from './hooks/useAIPlayers';
import { CityScene } from './components/three/CityScene';
import { MainMenu, CharacterSelect } from './components/ui/MainMenu';
import { TopBar } from './components/ui/TopBar';
import { LeftPanel } from './components/ui/LeftPanel';
import { Minimap } from './components/ui/Minimap';
import { AuctionPanel } from './components/ui/AuctionPanel';
import { ChanceCardOverlay } from './components/ui/ChanceCardOverlay';
import { NotificationFeed } from './components/ui/NotificationFeed';
import { PauseMenu } from './components/ui/PauseMenu';
import { GameOverScreen } from './components/ui/GameOverScreen';

function GameView() {
  useGameLoop();
  useAIPlayers();

  const drawChanceCard = useGameStore(s => s.drawChanceCard);
  const activeChanceCard = useGameStore(s => s.activeChanceCard);

  return (
    <div className="w-full h-full relative">
      {/* 3D Scene */}
      <CityScene />

      {/* UI Overlays */}
      <TopBar />
      <LeftPanel />
      <Minimap />
      <NotificationFeed />
      <AuctionPanel />
      <ChanceCardOverlay />

      {/* Chance card draw button */}
      {!activeChanceCard && (
        <button
          onClick={drawChanceCard}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-lg"
        >
          Draw Chance Card
        </button>
      )}
    </div>
  );
}

export default function App() {
  const phase = useGameStore(s => s.phase);
  const menuScreen = useGameStore(s => s.menuScreen);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black" style={{ fontFamily: 'Roboto, sans-serif' }}>
      {phase === 'menu' && menuScreen === 'main' && <MainMenu />}
      {phase === 'menu' && menuScreen === 'single_player' && <CharacterSelect />}
      {phase === 'playing' && <GameView />}
      {phase === 'paused' && (
        <>
          <GameView />
          <PauseMenu />
        </>
      )}
      {phase === 'game_over' && <GameOverScreen />}
    </div>
  );
}
