// ============================================================
// Monopoly Tycoon - Core Type Definitions
// ============================================================

// --- Time & Simulation ---
export interface GameTime {
  hour: number;        // 0-23
  minute: number;      // 0-59
  day: number;         // 1+
  year: number;        // starts 1930
  decade: number;      // 1930, 1940, etc.
  era: EraType;
  isPaused: boolean;
  speed: GameSpeed;
  totalElapsedMs: number;
}

export type GameSpeed = 1 | 2 | 4 | 8;
export type EraType = '1930s' | '1940s' | '1950s' | '1960s' | '1970s' | '1980s' | '1990s' | '2000s';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

// --- City & Blocks ---
export interface CityGrid {
  blocks: Block[];
  utilities: UtilityProperty[];
  railroads: RailroadProperty[];
  width: number;
  height: number;
}

export interface Block {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  colorGroup: ColorGroup;
  landlord: string | null;     // player id or 'city'
  prestige: number;            // 0-5 stars
  buildingRights: 'open' | 'exclusive' | 'closed';
  exclusiveOwnerId: string | null;
  exclusiveExpiresAt: number;  // game timestamp
  leaseExpiry: number;         // game day when lease expires
  buildings: Building[];
  parkUnits: number;
  maxSlots: number;            // 7x7 = 49 but usable ~20
  isSpecial: boolean;          // utility/railroad/community
  specialType?: 'utility' | 'railroad' | 'community';
}

export type ColorGroup =
  | 'brown' | 'lightblue' | 'pink' | 'orange'
  | 'red' | 'yellow' | 'green' | 'darkblue'
  | 'railroad' | 'utility' | 'special';

export const COLOR_GROUP_HEX: Record<ColorGroup, string> = {
  brown: '#8B4513',
  lightblue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#FFA500',
  red: '#FF0000',
  yellow: '#FFD700',
  green: '#228B22',
  darkblue: '#00008B',
  railroad: '#808080',
  utility: '#A0A0A0',
  special: '#606060',
};

// --- Buildings & Businesses ---
export interface Building {
  id: string;
  type: BuildingType;
  ownerId: string;
  level: number;         // 1-3 (house, duplex, hotel)
  slotIndex: number;     // position in block grid
  stock: number;         // current inventory
  maxStock: number;
  priceMultiplier: number; // 0.5 - 2.0
  dailyRevenue: number;
  dailyCost: number;
  condition: number;     // 0-100
  isOpen: boolean;
}

export type BuildingType =
  | 'bakery' | 'grocery' | 'hardware' | 'clothing'
  | 'restaurant' | 'theatre' | 'arcade' | 'nightclub'
  | 'hotel' | 'office' | 'park'
  | 'house' | 'duplex' | 'apartment';

export interface BuildingTemplate {
  type: BuildingType;
  name: string;
  category: 'day_shop' | 'night_shop' | 'residential' | 'park' | 'office';
  baseCost: number;
  baseStock: number;
  baseRevenue: number;
  baseUpkeep: number;
  gasUsage: number;     // 0-3
  electricUsage: number; // 0-3
  waterUsage: number;    // 0-3
  satisfies: NeedType[];
  openHour: number;
  closeHour: number;
  color: string;
}

// --- Players ---
export interface Player {
  id: string;
  name: string;
  character: CharacterType;
  cash: number;
  cashWarning: boolean;    // negative cash warning active
  warningDeadline: number; // game day
  ownedBlocks: string[];   // block ids
  ownedBuildings: string[];
  ownedUtilities: string[];
  ownedRailroads: string[];
  chanceCards: ChanceCard[];
  colorGroupsOwned: ColorGroup[];
  totalRevenue: number;
  totalExpenses: number;
  isAI: boolean;
  aiProfile: AIProfile;
  isEliminated: boolean;
  score: number;
}

export type CharacterType =
  | 'wheelbarrow' | 'iron' | 'dog' | 'car'
  | 'hat' | 'boot' | 'thimble' | 'cannon';

export type AIProfile = 'aggressive' | 'cautious' | 'balanced' | 'none';

// --- Citizens ---
export interface Citizen {
  id: number;
  type: CitizenType;
  salaryBand: SalaryBand;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  currentBlockId: string | null;
  needs: CitizenNeeds;
  state: CitizenState;
  satisfaction: number; // 0-100
  housed: boolean;
  homeBlockId: string | null;
}

export type CitizenType = 'child' | 'teenager' | 'adult' | 'retired' | 'tourist';
export type SalaryBand = 'low' | 'medium' | 'high';
export type CitizenState = 'idle' | 'walking' | 'shopping' | 'working' | 'sleeping' | 'leaving';

export interface CitizenNeeds {
  hunger: number;       // 0-100
  entertainment: number;
  shopping: number;
  housing: number;
}

export type NeedType = 'hunger' | 'entertainment' | 'shopping' | 'housing';

// --- Auctions ---
export interface Auction {
  id: string;
  blockId: string;
  currentBid: number;
  currentBidderId: string | null;
  participants: string[];
  timeRemaining: number;  // seconds
  phase: 'warning' | 'active' | 'sold';
  warningStartTime: number;
}

// --- Utilities & Railroads ---
export interface UtilityProperty {
  id: string;
  type: UtilityType;
  name: string;
  ownerId: string | null;
  dailyIncome: number;
}

export type UtilityType = 'electric' | 'water' | 'gas' | 'telecom';

export interface RailroadProperty {
  id: string;
  name: string;
  ownerId: string | null;
  freightIncome: number;
  passengerIncome: number;
}

// --- Chance Cards ---
export interface ChanceCard {
  id: number;
  title: string;
  description: string;
  effect: ChanceEffect;
  targetType: 'self' | 'opponent' | 'block' | 'city';
  isUsed: boolean;
}

export type ChanceEffect =
  | { type: 'cash'; amount: number }
  | { type: 'strike'; duration: number }
  | { type: 'boost'; buildingType: BuildingType; multiplier: number; duration: number }
  | { type: 'prestige'; amount: number }
  | { type: 'tax'; percentage: number }
  | { type: 'repair'; cost: number }
  | { type: 'freeBuilding'; buildingType: BuildingType }
  | { type: 'evict' }
  | { type: 'doubleRent'; duration: number }
  | { type: 'stockBoost'; amount: number };

// --- Game State ---
export type GamePhase = 'menu' | 'character_select' | 'playing' | 'paused' | 'game_over';
export type MenuScreen = 'main' | 'tutorials' | 'single_player' | 'multiplayer' | 'load' | 'settings';

export interface GameSettings {
  difficulty: 'bronze' | 'silver' | 'gold';
  scenario: string;
  playerCount: number;
  musicVolume: number;
  sfxVolume: number;
}

// --- Events ---
export interface GameEvent {
  id: string;
  type: 'auction' | 'election' | 'chance' | 'bankrupt' | 'lease_expire' | 'milestone';
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

// --- Mayor / Elections ---
export interface Election {
  candidates: string[];  // player ids
  votes: Record<string, number>;
  winner: string | null;
  isActive: boolean;
  dayTriggered: number;
}

export interface MayorBonus {
  type: 'tax_break' | 'prestige_boost' | 'building_discount' | 'utility_bonus';
  value: number;
}
