import { useGameStore } from '../../store/gameStore';
import type { ColorGroup } from '../../types/game';

const CELL = 14;
const GAP = 1;

const OWNER_COLORS = [
  '#4488FF', // player 0
  '#FF4444', // player 1
  '#44FF44', // player 2
  '#FFAA00', // player 3
  '#FF44FF', // player 4
  '#44FFFF', // player 5
];

const GROUP_COLORS: Record<ColorGroup, string> = {
  brown: '#8B6914',
  lightblue: '#6CB4D8',
  pink: '#E87DA0',
  orange: '#E8962C',
  red: '#D63030',
  yellow: '#D4C830',
  green: '#2C8B2C',
  darkblue: '#2C3CB4',
  railroad: '#666',
  utility: '#888',
  special: '#555',
};

export function Minimap() {
  const blocks = useGameStore(s => s.city.blocks);
  const players = useGameStore(s => s.players);
  const selectedBlockId = useGameStore(s => s.selectedBlockId);
  const selectBlock = useGameStore(s => s.selectBlock);

  const width = 7;
  const height = 7;
  const totalW = width * (CELL + GAP);
  const totalH = height * (CELL + GAP);

  return (
    <div className="absolute bottom-2 right-2 z-50">
      <div className="bg-black/80 rounded-lg p-2 border border-blue-800 shadow-xl">
        <svg width={totalW} height={totalH}>
          {blocks.map(block => {
            const x = block.gridX * (CELL + GAP);
            const y = block.gridY * (CELL + GAP);
            const isSelected = block.id === selectedBlockId;

            // Determine color
            let fill = GROUP_COLORS[block.colorGroup] || '#444';
            if (block.name === 'Waterfront') fill = '#1A5276';
            else if (block.name === 'Stadium') fill = '#2E7D32';
            else if (block.landlord && block.landlord !== 'city') {
              const idx = players.findIndex(p => p.id === block.landlord);
              fill = OWNER_COLORS[idx] || fill;
            }

            // Special block icons
            let icon = '';
            if (block.specialType === 'railroad') icon = '🚂';
            else if (block.specialType === 'utility') icon = '⚡';
            else if (block.specialType === 'community') icon = '';

            return (
              <g key={block.id} onClick={() => selectBlock(block.id)} style={{ cursor: 'pointer' }}>
                <rect
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  fill={fill}
                  stroke={isSelected ? '#FFFFFF' : '#333'}
                  strokeWidth={isSelected ? 2 : 0.5}
                  rx={1}
                />
                {block.buildings.length > 0 && (
                  <rect
                    x={x + 2}
                    y={y + 2}
                    width={CELL - 4}
                    height={CELL - 4}
                    fill="rgba(255,255,255,0.3)"
                    rx={1}
                  />
                )}
                {icon && (
                  <text x={x + CELL / 2} y={y + CELL / 2 + 3} textAnchor="middle" fontSize={8}>
                    {icon}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Player legend */}
        <div className="flex flex-wrap gap-1 mt-1">
          {players.map((p, i) => (
            <div key={p.id} className="flex items-center gap-0.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: OWNER_COLORS[i] }} />
              <span className="text-[8px] text-gray-400">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
