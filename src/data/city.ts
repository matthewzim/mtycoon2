import type { Block, ColorGroup, UtilityProperty, RailroadProperty, CityGrid } from '../types/game';

interface BlockDef {
  name: string;
  gridX: number;
  gridY: number;
  colorGroup: ColorGroup;
  prestige: number;
  isSpecial: boolean;
  specialType?: 'utility' | 'railroad' | 'community';
}

const BLOCK_DEFS: BlockDef[] = [
  // Row 0 (top) - left to right
  { name: 'Oriental', gridX: 0, gridY: 0, colorGroup: 'brown', prestige: 2, isSpecial: false },
  { name: 'Vermont', gridX: 1, gridY: 0, colorGroup: 'brown', prestige: 2, isSpecial: false },
  { name: 'Telecoms', gridX: 2, gridY: 0, colorGroup: 'utility', prestige: 0, isSpecial: true, specialType: 'utility' },
  { name: 'Conn Ave', gridX: 3, gridY: 0, colorGroup: 'lightblue', prestige: 3, isSpecial: false },
  { name: 'B&O Rail', gridX: 4, gridY: 0, colorGroup: 'railroad', prestige: 0, isSpecial: true, specialType: 'railroad' },
  { name: 'Bus/Taxi', gridX: 5, gridY: 0, colorGroup: 'special', prestige: 0, isSpecial: true, specialType: 'community' },
  { name: 'Airport', gridX: 6, gridY: 0, colorGroup: 'special', prestige: 0, isSpecial: true, specialType: 'community' },

  // Row 1
  { name: 'Zoo', gridX: 0, gridY: 1, colorGroup: 'special', prestige: 3, isSpecial: true, specialType: 'community' },
  { name: 'Indiana', gridX: 1, gridY: 1, colorGroup: 'red', prestige: 3, isSpecial: false },
  { name: 'Kentucky', gridX: 2, gridY: 1, colorGroup: 'red', prestige: 3, isSpecial: false },
  { name: 'Campus', gridX: 3, gridY: 1, colorGroup: 'special', prestige: 4, isSpecial: true, specialType: 'community' },
  { name: 'St. James', gridX: 4, gridY: 1, colorGroup: 'orange', prestige: 3, isSpecial: false },
  { name: 'Tenn Ave', gridX: 5, gridY: 1, colorGroup: 'orange', prestige: 3, isSpecial: false },
  { name: 'Pacific', gridX: 6, gridY: 1, colorGroup: 'green', prestige: 4, isSpecial: false },

  // Row 2
  { name: 'School', gridX: 0, gridY: 2, colorGroup: 'special', prestige: 3, isSpecial: true, specialType: 'community' },
  { name: 'Illinois', gridX: 1, gridY: 2, colorGroup: 'red', prestige: 3, isSpecial: false },
  { name: 'Community', gridX: 2, gridY: 2, colorGroup: 'special', prestige: 2, isSpecial: true, specialType: 'community' },
  { name: 'New York', gridX: 3, gridY: 2, colorGroup: 'orange', prestige: 4, isSpecial: false },
  { name: 'Electric', gridX: 4, gridY: 2, colorGroup: 'utility', prestige: 0, isSpecial: true, specialType: 'utility' },
  { name: 'N Carolina', gridX: 5, gridY: 2, colorGroup: 'green', prestige: 4, isSpecial: false },
  { name: 'Penn Rail', gridX: 6, gridY: 2, colorGroup: 'railroad', prestige: 0, isSpecial: true, specialType: 'railroad' },

  // Row 3
  { name: 'Short Rail', gridX: 0, gridY: 3, colorGroup: 'railroad', prestige: 0, isSpecial: true, specialType: 'railroad' },
  { name: 'Hospital', gridX: 1, gridY: 3, colorGroup: 'special', prestige: 3, isSpecial: true, specialType: 'community' },
  { name: 'Police', gridX: 2, gridY: 3, colorGroup: 'special', prestige: 3, isSpecial: true, specialType: 'community' },
  { name: 'Marvin', gridX: 3, gridY: 3, colorGroup: 'yellow', prestige: 4, isSpecial: false },
  { name: 'Museum', gridX: 4, gridY: 3, colorGroup: 'special', prestige: 5, isSpecial: true, specialType: 'community' },
  { name: 'Penn Ave', gridX: 5, gridY: 3, colorGroup: 'green', prestige: 4, isSpecial: false },
  { name: 'Marina', gridX: 6, gridY: 3, colorGroup: 'special', prestige: 3, isSpecial: true, specialType: 'community' },

  // Row 4
  { name: 'St. Charles', gridX: 0, gridY: 4, colorGroup: 'pink', prestige: 3, isSpecial: false },
  { name: 'Virginia', gridX: 1, gridY: 4, colorGroup: 'pink', prestige: 3, isSpecial: false },
  { name: 'Ventnor', gridX: 2, gridY: 4, colorGroup: 'yellow', prestige: 4, isSpecial: false },
  { name: 'Boardwalk', gridX: 3, gridY: 4, colorGroup: 'darkblue', prestige: 5, isSpecial: false },
  { name: 'Park Place', gridX: 4, gridY: 4, colorGroup: 'darkblue', prestige: 5, isSpecial: false },
  { name: 'Atlantic', gridX: 5, gridY: 4, colorGroup: 'yellow', prestige: 4, isSpecial: false },
  { name: 'Baltic', gridX: 6, gridY: 4, colorGroup: 'brown', prestige: 2, isSpecial: false },

  // Row 5
  { name: 'States Ave', gridX: 0, gridY: 5, colorGroup: 'pink', prestige: 3, isSpecial: false },
  { name: 'Gasworks', gridX: 1, gridY: 5, colorGroup: 'utility', prestige: 0, isSpecial: true, specialType: 'utility' },
  { name: 'Reading Rail', gridX: 2, gridY: 5, colorGroup: 'railroad', prestige: 0, isSpecial: true, specialType: 'railroad' },
  { name: 'Jefferson', gridX: 3, gridY: 5, colorGroup: 'lightblue', prestige: 3, isSpecial: false },
  { name: 'Hempstead', gridX: 4, gridY: 5, colorGroup: 'lightblue', prestige: 3, isSpecial: false },
  { name: 'Albany', gridX: 5, gridY: 5, colorGroup: 'special', prestige: 2, isSpecial: true, specialType: 'community' },
  { name: 'Water Works', gridX: 6, gridY: 5, colorGroup: 'utility', prestige: 0, isSpecial: true, specialType: 'utility' },

  // Row 6 (bottom)
  { name: 'Med Ave', gridX: 0, gridY: 6, colorGroup: 'brown', prestige: 2, isSpecial: false },
];

let blockIdCounter = 0;

function createBlock(def: BlockDef): Block {
  blockIdCounter++;
  return {
    id: `block_${blockIdCounter}`,
    name: def.name,
    gridX: def.gridX,
    gridY: def.gridY,
    colorGroup: def.colorGroup,
    landlord: 'city',
    prestige: def.prestige,
    buildingRights: 'open',
    exclusiveOwnerId: null,
    exclusiveExpiresAt: 0,
    leaseExpiry: 5, // 5 game days = 25 years
    buildings: [],
    parkUnits: 0,
    maxSlots: def.isSpecial ? 0 : 20,
    isSpecial: def.isSpecial,
    specialType: def.specialType,
  };
}

export function createCityGrid(): CityGrid {
  blockIdCounter = 0;
  const blocks = BLOCK_DEFS.map(createBlock);

  const utilities: UtilityProperty[] = [
    { id: 'util_electric', type: 'electric', name: 'Electric Company', ownerId: null, dailyIncome: 0 },
    { id: 'util_water', type: 'water', name: 'Water Works', ownerId: null, dailyIncome: 0 },
    { id: 'util_gas', type: 'gas', name: 'Gasworks', ownerId: null, dailyIncome: 0 },
    { id: 'util_telecom', type: 'telecom', name: 'Telecoms', ownerId: null, dailyIncome: 0 },
  ];

  const railroads: RailroadProperty[] = [
    { id: 'rail_short', name: 'Short Line', ownerId: null, freightIncome: 800, passengerIncome: 0 },
    { id: 'rail_reading', name: 'Reading Railroad', ownerId: null, freightIncome: 800, passengerIncome: 0 },
    { id: 'rail_bo', name: 'B&O Railroad', ownerId: null, freightIncome: 800, passengerIncome: 0 },
    { id: 'rail_penn', name: 'Penn Railroad', ownerId: null, freightIncome: 800, passengerIncome: 0 },
  ];

  return { blocks, utilities, railroads, width: 7, height: 7 };
}

export const COLOR_GROUP_BLOCKS: Record<string, string[]> = {
  brown: ['Oriental', 'Vermont', 'Baltic', 'Med Ave'],
  lightblue: ['Conn Ave', 'Jefferson', 'Hempstead'],
  pink: ['St. Charles', 'Virginia', 'States Ave'],
  orange: ['St. James', 'Tenn Ave', 'New York'],
  red: ['Indiana', 'Kentucky', 'Illinois'],
  yellow: ['Marvin', 'Ventnor', 'Atlantic'],
  green: ['Pacific', 'N Carolina', 'Penn Ave'],
  darkblue: ['Boardwalk', 'Park Place'],
};
