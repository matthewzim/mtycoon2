import { create } from 'zustand';
import type {
  GameTime, GamePhase, GameSettings, Player, CityGrid, Block, Building,
  Auction, ChanceCard, GameEvent, Election, Citizen, GameSpeed,
  BuildingType, ColorGroup, MenuScreen, CharacterType, AIProfile,
  UtilityProperty, RailroadProperty, MayorBonus,
} from '../types/game';
import { createCityGrid, COLOR_GROUP_BLOCKS } from '../data/city';
import { BUILDING_TEMPLATES } from '../data/buildings';
import { shuffleDeck } from '../data/chanceCards';

// --- Constants ---
const GAME_MINUTES_PER_REAL_MS = 24 * 60 / (10 * 60 * 1000); // 24h in 10min real
const LEASE_DURATION_DAYS = 5; // 25 game years
const SPOILAGE_RATE = 0.5;
const PARK_PRESTIGE_RATIO = 10; // every 10 park units = +1 prestige

// --- Helpers ---
function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function createPlayer(name: string, character: CharacterType, isAI: boolean, aiProfile: AIProfile): Player {
  return {
    id: generateId(),
    name,
    character,
    cash: 15000,
    cashWarning: false,
    warningDeadline: 0,
    ownedBlocks: [],
    ownedBuildings: [],
    ownedUtilities: [],
    ownedRailroads: [],
    chanceCards: [],
    colorGroupsOwned: [],
    totalRevenue: 0,
    totalExpenses: 0,
    isAI,
    aiProfile,
    isEliminated: false,
    score: 0,
  };
}

function createDefaultTime(): GameTime {
  return {
    hour: 9,
    minute: 0,
    day: 1,
    year: 1930,
    decade: 1930,
    era: '1930s',
    isPaused: false,
    speed: 1,
    totalElapsedMs: 0,
  };
}

// --- Store Interface ---
interface GameStore {
  // Core State
  phase: GamePhase;
  menuScreen: MenuScreen;
  settings: GameSettings;
  time: GameTime;
  city: CityGrid;
  players: Player[];
  currentPlayerId: string;
  citizens: Citizen[];
  events: GameEvent[];
  notifications: string[];

  // Auction
  activeAuction: Auction | null;

  // Chance Cards
  chanceDeck: ChanceCard[];
  activeChanceCard: ChanceCard | null;
  crosshairMode: boolean;

  // Election
  election: Election | null;
  currentMayor: string | null;
  mayorBonus: MayorBonus | null;

  // UI State
  selectedBlockId: string | null;
  cameraTarget: [number, number, number] | null;
  viewMode: 'city' | 'block';
  showMinimap: boolean;
  infoPanel: 'block' | 'city' | 'player' | 'building' | null;

  // Actions - Game Flow
  setPhase: (phase: GamePhase) => void;
  setMenuScreen: (screen: MenuScreen) => void;
  startGame: (playerName: string, character: CharacterType, aiCount: number) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;

  // Actions - Time
  tick: (deltaMs: number) => void;
  setSpeed: (speed: GameSpeed) => void;
  togglePause: () => void;

  // Actions - Player
  getCurrentPlayer: () => Player;
  updatePlayerCash: (playerId: string, amount: number) => void;

  // Actions - Blocks & Buildings
  selectBlock: (blockId: string | null) => void;
  buildOnBlock: (blockId: string, buildingType: BuildingType) => void;
  demolishBuilding: (blockId: string, buildingId: string) => void;
  addParkToBlock: (blockId: string) => void;
  setPriceMultiplier: (buildingId: string, multiplier: number) => void;

  // Actions - Auctions
  startAuction: (blockId: string) => void;
  placeBid: (playerId: string, amount: number) => void;
  resolveAuction: () => void;

  // Actions - Chance Cards
  drawChanceCard: () => void;
  useChanceCard: (cardId: number, targetId?: string) => void;
  setCrosshairMode: (active: boolean) => void;

  // Actions - Elections
  triggerElection: () => void;
  castVote: (voterId: string, candidateId: string) => void;
  resolveElection: () => void;

  // Actions - UI
  setViewMode: (mode: 'city' | 'block') => void;
  setCameraTarget: (target: [number, number, number] | null) => void;
  setInfoPanel: (panel: 'block' | 'city' | 'player' | 'building' | null) => void;
  addNotification: (msg: string) => void;
  dismissNotification: (index: number) => void;

  // Computed
  getBlock: (id: string) => Block | undefined;
  getPlayerBlocks: (playerId: string) => Block[];
  getBlockBuildings: (blockId: string) => Building[];
  ownsColorGroup: (playerId: string, group: ColorGroup) => boolean;
  getUtilityIncome: (playerId: string) => number;
  getRailroadIncome: (playerId: string) => number;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // --- Initial State ---
  phase: 'menu',
  menuScreen: 'main',
  settings: { difficulty: 'bronze', scenario: 'Starting Out', playerCount: 2, musicVolume: 0.5, sfxVolume: 0.7 },
  time: createDefaultTime(),
  city: createCityGrid(),
  players: [],
  currentPlayerId: '',
  citizens: [],
  events: [],
  notifications: [],
  activeAuction: null,
  chanceDeck: shuffleDeck(),
  activeChanceCard: null,
  crosshairMode: false,
  election: null,
  currentMayor: null,
  mayorBonus: null,
  selectedBlockId: null,
  cameraTarget: null,
  viewMode: 'city',
  showMinimap: true,
  infoPanel: null,

  // --- Game Flow ---
  setPhase: (phase) => set({ phase }),
  setMenuScreen: (screen) => set({ menuScreen: screen }),

  startGame: (playerName, character, aiCount) => {
    const human = createPlayer(playerName, character, false, 'none');
    const aiChars: CharacterType[] = ['iron', 'dog', 'car', 'hat', 'boot', 'thimble'];
    const aiNames = ['Morgan', 'Rockefeller', 'Carnegie', 'Vanderbilt', 'Astor', 'Ford'];
    const aiProfiles: AIProfile[] = ['aggressive', 'cautious', 'balanced', 'aggressive', 'cautious', 'balanced'];
    const aiPlayers = Array.from({ length: Math.min(aiCount, 5) }, (_, i) =>
      createPlayer(aiNames[i], aiChars[i], true, aiProfiles[i])
    );

    // Generate citizens
    const citizens: Citizen[] = [];
    const types: Array<Citizen['type']> = ['child', 'teenager', 'adult', 'retired', 'tourist'];
    const bands: Array<Citizen['salaryBand']> = ['low', 'medium', 'high'];
    const city = createCityGrid();
    for (let i = 0; i < 420; i++) {
      const typeIdx = i < 80 ? 0 : i < 150 ? 1 : i < 320 ? 2 : i < 390 ? 3 : 4;
      citizens.push({
        id: i,
        type: types[typeIdx],
        salaryBand: bands[i % 3],
        x: Math.random() * 7,
        y: Math.random() * 7,
        targetX: Math.random() * 7,
        targetY: Math.random() * 7,
        currentBlockId: null,
        needs: { hunger: 30 + Math.random() * 30, entertainment: 20 + Math.random() * 30, shopping: 20 + Math.random() * 20, housing: 50 + Math.random() * 30 },
        state: 'idle',
        satisfaction: 50,
        housed: Math.random() > 0.7,
        homeBlockId: null,
      });
    }

    set({
      phase: 'playing',
      players: [human, ...aiPlayers],
      currentPlayerId: human.id,
      city,
      citizens,
      time: createDefaultTime(),
      chanceDeck: shuffleDeck(),
      events: [],
      notifications: [],
      activeAuction: null,
      election: null,
      selectedBlockId: null,
    });
  },

  updateSettings: (partial) => set(s => ({ settings: { ...s.settings, ...partial } })),

  // --- Time ---
  tick: (deltaMs) => {
    const state = get();
    if (state.time.isPaused || state.phase !== 'playing') return;

    const scaledDelta = deltaMs * state.time.speed;
    const gameMinutesElapsed = scaledDelta * GAME_MINUTES_PER_REAL_MS;
    const prevHour = state.time.hour;
    let newMinute = state.time.minute + gameMinutesElapsed;
    let newHour = state.time.hour;
    let newDay = state.time.day;
    let newYear = state.time.year;

    while (newMinute >= 60) {
      newMinute -= 60;
      newHour++;
    }
    while (newHour >= 24) {
      newHour -= 24;
      newDay++;
      newYear += 5; // Each day = 5 years
    }

    const newDecade = Math.floor(newYear / 10) * 10;
    const eraMap: Record<number, GameTime['era']> = {
      1930: '1930s', 1940: '1940s', 1950: '1950s', 1960: '1960s',
      1970: '1970s', 1980: '1980s', 1990: '1990s', 2000: '2000s',
    };
    const newEra = eraMap[newDecade] || '2000s';

    const newTime: GameTime = {
      ...state.time,
      hour: Math.floor(newHour),
      minute: Math.floor(newMinute),
      day: newDay,
      year: newYear,
      decade: newDecade,
      era: newEra,
      totalElapsedMs: state.time.totalElapsedMs + scaledDelta,
    };

    // --- Scheduled Events ---
    const updatedCity = { ...state.city };
    const updatedPlayers = [...state.players];
    const newNotifications = [...state.notifications];

    // 6AM: Financial settling
    if (prevHour < 6 && newTime.hour >= 6) {
      for (const player of updatedPlayers) {
        if (player.isEliminated) continue;
        // Deduct utility bills per building
        let totalUtilCost = 0;
        for (const block of updatedCity.blocks) {
          for (const building of block.buildings) {
            if (building.ownerId === player.id) {
              const template = BUILDING_TEMPLATES[building.type];
              totalUtilCost += (template.gasUsage + template.electricUsage + template.waterUsage) * 10;
            }
          }
        }
        player.cash -= totalUtilCost;
        player.totalExpenses += totalUtilCost;

        // Collect rent from buildings on owned blocks
        for (const blockId of player.ownedBlocks) {
          const block = updatedCity.blocks.find(b => b.id === blockId);
          if (!block) continue;
          for (const building of block.buildings) {
            if (building.ownerId !== player.id) {
              const rent = BUILDING_TEMPLATES[building.type].baseRevenue * 0.3;
              player.cash += rent;
              player.totalRevenue += rent;
            }
          }
        }

        // Restock all stores
        for (const block of updatedCity.blocks) {
          for (const building of block.buildings) {
            if (building.ownerId === player.id) {
              const template = BUILDING_TEMPLATES[building.type];
              building.stock = template.baseStock * building.level;
            }
          }
        }
      }
    }

    // Midnight: spoilage + bank check
    if (prevHour < 24 && newTime.hour === 0 || (prevHour > 0 && newTime.day > state.time.day)) {
      // Spoilage
      for (const block of updatedCity.blocks) {
        for (const building of block.buildings) {
          building.stock = Math.floor(building.stock * (1 - SPOILAGE_RATE));
        }
      }
      // Bank solvency check
      for (const player of updatedPlayers) {
        if (player.isEliminated) continue;
        if (player.cash < 0) {
          if (!player.cashWarning) {
            player.cashWarning = true;
            player.warningDeadline = newTime.day + 1;
            newNotifications.push(`${player.name} is in debt! 24 hours to recover.`);
          } else if (newTime.day >= player.warningDeadline) {
            player.isEliminated = true;
            newNotifications.push(`${player.name} has gone bankrupt!`);
          }
        } else {
          player.cashWarning = false;
        }
      }

      // Check for auction triggers (lease expiry)
      for (const block of updatedCity.blocks) {
        if (!block.isSpecial && block.leaseExpiry <= newTime.day && block.landlord === 'city') {
          // Queue auction
          newNotifications.push(`Lease auction starting for ${block.name}!`);
        }
      }

      // Chance card once per day
      if (state.chanceDeck.some(c => !c.isUsed)) {
        const unusedCards = state.chanceDeck.filter(c => !c.isUsed);
        if (unusedCards.length > 0) {
          // auto-deal to current player
        }
      }
    }

    // Every 3rd day at 6PM: elections
    if (prevHour < 18 && newTime.hour >= 18 && newTime.day % 3 === 0) {
      if (!state.election?.isActive) {
        get().triggerElection();
      }
    }

    // Update citizen needs over time
    const updatedCitizens = state.citizens.map(c => ({
      ...c,
      needs: {
        hunger: Math.min(100, c.needs.hunger + gameMinutesElapsed * 0.02),
        entertainment: Math.min(100, c.needs.entertainment + gameMinutesElapsed * 0.01),
        shopping: Math.min(100, c.needs.shopping + gameMinutesElapsed * 0.008),
        housing: c.needs.housing,
      },
    }));

    // Simple citizen movement
    for (const citizen of updatedCitizens) {
      const dx = citizen.targetX - citizen.x;
      const dy = citizen.targetY - citizen.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.1) {
        const speed = 0.001 * gameMinutesElapsed;
        citizen.x += (dx / dist) * Math.min(speed, dist);
        citizen.y += (dy / dist) * Math.min(speed, dist);
        citizen.state = 'walking';
      } else {
        citizen.state = 'idle';
        // Pick new random target occasionally
        if (Math.random() < 0.01) {
          citizen.targetX = Math.random() * 7;
          citizen.targetY = Math.random() * 7;
        }
      }

      // Check if citizen is shopping at a block
      const blockX = Math.floor(citizen.x);
      const blockY = Math.floor(citizen.y);
      const block = updatedCity.blocks.find(b => b.gridX === blockX && b.gridY === blockY);
      if (block && block.buildings.length > 0) {
        citizen.currentBlockId = block.id;

        // Find best business for highest need
        const needs = citizen.needs;
        let highestNeed: keyof typeof needs = 'hunger';
        let highestVal = 0;
        for (const [key, val] of Object.entries(needs)) {
          if (val > highestVal && val > 60) {
            highestVal = val;
            highestNeed = key as keyof typeof needs;
          }
        }

        if (highestVal > 60) {
          // Find an open building that satisfies this need
          const hour = newTime.hour;
          for (const building of block.buildings) {
            const template = BUILDING_TEMPLATES[building.type];
            if (template.satisfies.includes(highestNeed as any) && building.stock > 0 && building.isOpen) {
              const isOpenNow = (template.openHour <= hour && hour < template.closeHour) ||
                (template.openHour === 0 && template.closeHour === 24);
              if (isOpenNow) {
                building.stock--;
                const revenue = template.baseRevenue * building.priceMultiplier;
                const owner = updatedPlayers.find(p => p.id === building.ownerId);
                if (owner) {
                  owner.cash += revenue;
                  owner.totalRevenue += revenue;
                  building.dailyRevenue += revenue;
                }
                citizen.needs[highestNeed] = Math.max(0, citizen.needs[highestNeed] - 30);
                citizen.satisfaction = Math.min(100, citizen.satisfaction + 5);
                citizen.state = 'shopping';
                break;
              }
            }
          }
        }
      }
    }

    // Calculate player scores
    for (const player of updatedPlayers) {
      player.score = Math.floor(player.cash + player.totalRevenue * 0.1);
    }

    // Update all building open/close status
    for (const block of updatedCity.blocks) {
      for (const building of block.buildings) {
        const template = BUILDING_TEMPLATES[building.type];
        building.isOpen = (template.openHour <= newTime.hour && newTime.hour < template.closeHour) ||
          (template.openHour === 0 && template.closeHour === 24);
      }
    }

    set({
      time: newTime,
      city: updatedCity,
      players: updatedPlayers,
      citizens: updatedCitizens,
      notifications: newNotifications,
    });
  },

  setSpeed: (speed) => set(s => ({ time: { ...s.time, speed } })),
  togglePause: () => set(s => ({ time: { ...s.time, isPaused: !s.time.isPaused } })),

  // --- Player ---
  getCurrentPlayer: () => {
    const s = get();
    return s.players.find(p => p.id === s.currentPlayerId)!;
  },
  updatePlayerCash: (playerId, amount) => set(s => ({
    players: s.players.map(p => p.id === playerId ? { ...p, cash: p.cash + amount } : p),
  })),

  // --- Blocks & Buildings ---
  selectBlock: (blockId) => {
    const block = blockId ? get().city.blocks.find(b => b.id === blockId) : null;
    set({
      selectedBlockId: blockId,
      viewMode: blockId ? 'block' : 'city',
      infoPanel: blockId ? 'block' : null,
      cameraTarget: block ? [block.gridX * 12, 0, block.gridY * 12] : null,
    });
  },

  buildOnBlock: (blockId, buildingType) => {
    const state = get();
    const player = state.getCurrentPlayer();
    const template = BUILDING_TEMPLATES[buildingType];
    if (player.cash < template.baseCost) {
      state.addNotification('Not enough cash!');
      return;
    }

    set(s => {
      const blocks = s.city.blocks.map(block => {
        if (block.id !== blockId) return block;
        if (block.isSpecial) return block;
        if (block.buildings.length >= block.maxSlots) return block;

        // Check building rights
        if (block.buildingRights === 'exclusive' && block.exclusiveOwnerId !== player.id) return block;
        if (block.buildingRights === 'closed') return block;

        const newBuilding: Building = {
          id: generateId(),
          type: buildingType,
          ownerId: player.id,
          level: 1,
          slotIndex: block.buildings.length,
          stock: template.baseStock,
          maxStock: template.baseStock,
          priceMultiplier: 1.0,
          dailyRevenue: 0,
          dailyCost: template.baseUpkeep,
          condition: 100,
          isOpen: true,
        };

        return { ...block, buildings: [...block.buildings, newBuilding] };
      });

      const updatedPlayers = s.players.map(p =>
        p.id === player.id ? { ...p, cash: p.cash - template.baseCost } : p
      );

      return { city: { ...s.city, blocks }, players: updatedPlayers };
    });
  },

  demolishBuilding: (blockId, buildingId) => {
    set(s => ({
      city: {
        ...s.city,
        blocks: s.city.blocks.map(b =>
          b.id === blockId
            ? { ...b, buildings: b.buildings.filter(bld => bld.id !== buildingId) }
            : b
        ),
      },
    }));
  },

  addParkToBlock: (blockId) => {
    const state = get();
    const player = state.getCurrentPlayer();
    const parkCost = BUILDING_TEMPLATES.park.baseCost;
    if (player.cash < parkCost) return;

    set(s => ({
      city: {
        ...s.city,
        blocks: s.city.blocks.map(b => {
          if (b.id !== blockId) return b;
          const newParkUnits = b.parkUnits + 1;
          const prestigeBoost = Math.floor(newParkUnits / PARK_PRESTIGE_RATIO);
          return { ...b, parkUnits: newParkUnits, prestige: Math.min(5, b.prestige + (newParkUnits % PARK_PRESTIGE_RATIO === 0 ? 1 : 0)) };
        }),
      },
      players: s.players.map(p => p.id === player.id ? { ...p, cash: p.cash - parkCost } : p),
    }));
  },

  setPriceMultiplier: (buildingId, multiplier) => {
    set(s => ({
      city: {
        ...s.city,
        blocks: s.city.blocks.map(b => ({
          ...b,
          buildings: b.buildings.map(bld =>
            bld.id === buildingId ? { ...bld, priceMultiplier: Math.max(0.5, Math.min(2.0, multiplier)) } : bld
          ),
        })),
      },
    }));
  },

  // --- Auctions ---
  startAuction: (blockId) => {
    const state = get();
    const block = state.city.blocks.find(b => b.id === blockId);
    if (!block || state.activeAuction) return;

    const auction: Auction = {
      id: generateId(),
      blockId,
      currentBid: 500,
      currentBidderId: null,
      participants: state.players.filter(p => !p.isEliminated).map(p => p.id),
      timeRemaining: 120,
      phase: 'warning',
      warningStartTime: state.time.totalElapsedMs,
    };

    set({ activeAuction: auction });
    state.addNotification(`Auction starting for ${block.name}! 2 minute warning.`);
  },

  placeBid: (playerId, amount) => {
    set(s => {
      if (!s.activeAuction || s.activeAuction.phase !== 'active') return s;
      const player = s.players.find(p => p.id === playerId);
      if (!player || player.cash < amount) return s;

      const newBid = s.activeAuction.currentBid + amount;
      if (newBid > player.cash) return s;

      return {
        activeAuction: {
          ...s.activeAuction,
          currentBid: newBid,
          currentBidderId: playerId,
          timeRemaining: Math.max(s.activeAuction.timeRemaining, 15), // reset timer
        },
      };
    });
  },

  resolveAuction: () => {
    const state = get();
    const auction = state.activeAuction;
    if (!auction || !auction.currentBidderId) {
      set({ activeAuction: null });
      return;
    }

    set(s => {
      const winnerId = auction.currentBidderId!;
      return {
        activeAuction: null,
        city: {
          ...s.city,
          blocks: s.city.blocks.map(b => {
            if (b.id !== auction.blockId) return b;
            return {
              ...b,
              landlord: winnerId,
              buildingRights: 'exclusive',
              exclusiveOwnerId: winnerId,
              exclusiveExpiresAt: s.time.day + 1,
              leaseExpiry: s.time.day + LEASE_DURATION_DAYS,
            };
          }),
        },
        players: s.players.map(p => {
          if (p.id === winnerId) {
            return {
              ...p,
              cash: p.cash - auction.currentBid,
              ownedBlocks: [...p.ownedBlocks, auction.blockId],
            };
          }
          return p;
        }),
      };
    });

    const block = state.city.blocks.find(b => b.id === auction.blockId);
    const winner = state.players.find(p => p.id === auction.currentBidderId);
    if (block && winner) {
      state.addNotification(`${winner.name} won the auction for ${block.name}!`);
    }
  },

  // --- Chance Cards ---
  drawChanceCard: () => {
    set(s => {
      const deck = [...s.chanceDeck];
      const card = deck.find(c => !c.isUsed);
      if (!card) return s;
      card.isUsed = true;
      return { chanceDeck: deck, activeChanceCard: card };
    });
  },

  useChanceCard: (cardId, targetId) => {
    const state = get();
    const card = state.chanceDeck.find(c => c.id === cardId);
    if (!card) return;

    const player = state.getCurrentPlayer();
    const effect = card.effect;

    switch (effect.type) {
      case 'cash':
        state.updatePlayerCash(player.id, effect.amount);
        state.addNotification(`${player.name} received $${effect.amount}!`);
        break;
      case 'tax':
        const tax = Math.floor(player.cash * effect.percentage / 100);
        state.updatePlayerCash(player.id, -tax);
        state.addNotification(`${player.name} paid $${tax} in taxes.`);
        break;
      case 'prestige':
        if (targetId) {
          set(s => ({
            city: {
              ...s.city,
              blocks: s.city.blocks.map(b =>
                b.id === targetId ? { ...b, prestige: Math.min(5, b.prestige + effect.amount) } : b
              ),
            },
          }));
        }
        break;
      case 'strike':
        // Close target building for duration
        state.addNotification('Workers are on strike!');
        break;
      case 'repair':
        const repairCost = player.ownedBuildings.length * effect.cost;
        state.updatePlayerCash(player.id, -repairCost);
        state.addNotification(`${player.name} paid $${repairCost} for repairs.`);
        break;
    }

    set({ activeChanceCard: null, crosshairMode: false });
  },

  setCrosshairMode: (active) => set({ crosshairMode: active }),

  // --- Elections ---
  triggerElection: () => {
    const state = get();
    const candidates = state.players.filter(p => !p.isEliminated).map(p => p.id);
    set({
      election: {
        candidates,
        votes: Object.fromEntries(candidates.map(c => [c, 0])),
        winner: null,
        isActive: true,
        dayTriggered: state.time.day,
      },
    });
    state.addNotification('Mayor election is underway!');
  },

  castVote: (voterId, candidateId) => {
    set(s => {
      if (!s.election?.isActive) return s;
      const votes = { ...s.election.votes };
      votes[candidateId] = (votes[candidateId] || 0) + 1;
      return { election: { ...s.election, votes } };
    });
  },

  resolveElection: () => {
    const state = get();
    if (!state.election) return;
    const entries = Object.entries(state.election.votes);
    entries.sort((a, b) => b[1] - a[1]);
    const winnerId = entries[0]?.[0] || null;
    const winner = state.players.find(p => p.id === winnerId);

    const bonuses: MayorBonus[] = [
      { type: 'tax_break', value: 0.1 },
      { type: 'prestige_boost', value: 1 },
      { type: 'building_discount', value: 0.15 },
      { type: 'utility_bonus', value: 0.2 },
    ];
    const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];

    set({
      election: { ...state.election, isActive: false, winner: winnerId },
      currentMayor: winnerId,
      mayorBonus: bonus,
    });

    if (winner) {
      state.addNotification(`${winner.name} elected Mayor! Bonus: ${bonus.type}`);
    }
  },

  // --- UI ---
  setViewMode: (mode) => set({ viewMode: mode }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setInfoPanel: (panel) => set({ infoPanel: panel }),
  addNotification: (msg) => set(s => ({ notifications: [...s.notifications.slice(-9), msg] })),
  dismissNotification: (index) => set(s => ({ notifications: s.notifications.filter((_, i) => i !== index) })),

  // --- Computed ---
  getBlock: (id) => get().city.blocks.find(b => b.id === id),
  getPlayerBlocks: (playerId) => get().city.blocks.filter(b => b.landlord === playerId),
  getBlockBuildings: (blockId) => {
    const block = get().city.blocks.find(b => b.id === blockId);
    return block?.buildings || [];
  },
  ownsColorGroup: (playerId, group) => {
    const blockNames = COLOR_GROUP_BLOCKS[group];
    if (!blockNames) return false;
    const playerBlocks = get().city.blocks.filter(b => b.landlord === playerId);
    return blockNames.every(name => playerBlocks.some(b => b.name === name));
  },
  getUtilityIncome: (playerId) => {
    const state = get();
    const ownedCount = state.city.utilities.filter(u => u.ownerId === playerId).length;
    const percentage = [0, 0.25, 0.5, 0.75, 1.0][ownedCount] || 0;
    // Calculate total city utility usage
    let totalUsage = 0;
    for (const block of state.city.blocks) {
      for (const building of block.buildings) {
        const t = BUILDING_TEMPLATES[building.type];
        totalUsage += (t.gasUsage + t.electricUsage + t.waterUsage) * 10;
      }
    }
    return totalUsage * percentage;
  },
  getRailroadIncome: (playerId) => {
    const state = get();
    const ownedCount = state.city.railroads.filter(r => r.ownerId === playerId).length;
    const percentage = [0, 0.25, 0.5, 0.75, 1.0][ownedCount] || 0;
    const freightBase = 800;
    const passengerBase = state.citizens.length * 5 * 0.1; // 10% enter/leave per day
    return (freightBase + passengerBase) * percentage;
  },
}));
