import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { BUILDING_TEMPLATES, DAY_SHOPS, NIGHT_SHOPS, RESIDENTIAL } from '../data/buildings';
import type { BuildingType } from '../types/game';

export function useAIPlayers() {
  const phase = useGameStore(s => s.phase);
  const intervalRef = useRef<number>(0);

  useEffect(() => {
    if (phase !== 'playing') return;

    intervalRef.current = window.setInterval(() => {
      const state = useGameStore.getState();
      if (state.time.isPaused) return;

      for (const player of state.players) {
        if (!player.isAI || player.isEliminated) continue;

        // AI Strategy: build on owned or open blocks
        const ownedBlocks = state.city.blocks.filter(
          b => b.landlord === player.id && !b.isSpecial && b.buildings.length < b.maxSlots
        );

        // Open blocks the AI might claim via auction
        const openBlocks = state.city.blocks.filter(
          b => b.landlord === 'city' && !b.isSpecial && b.buildingRights === 'open'
        );

        // Build on owned blocks
        if (ownedBlocks.length > 0 && player.cash > 2000) {
          const block = ownedBlocks[Math.floor(Math.random() * ownedBlocks.length)];
          const hour = state.time.hour;

          let candidates: BuildingType[];
          if (player.aiProfile === 'aggressive') {
            candidates = hour < 17 ? [...DAY_SHOPS, ...NIGHT_SHOPS] : [...NIGHT_SHOPS];
          } else if (player.aiProfile === 'cautious') {
            candidates = [...RESIDENTIAL, 'park'];
          } else {
            candidates = [...DAY_SHOPS, ...RESIDENTIAL];
          }

          // Check what's already built
          const existingTypes = new Set(block.buildings.map(b => b.type));
          const diverseCandidates = candidates.filter(c => !existingTypes.has(c));
          const buildType = diverseCandidates.length > 0
            ? diverseCandidates[Math.floor(Math.random() * diverseCandidates.length)]
            : candidates[Math.floor(Math.random() * candidates.length)];

          const template = BUILDING_TEMPLATES[buildType];
          if (player.cash >= template.baseCost * 1.5) { // AI keeps reserve
            useGameStore.getState().buildOnBlock(block.id, buildType);
          }
        }

        // Consider starting auctions on unclaimed blocks
        if (openBlocks.length > 0 && !state.activeAuction && player.cash > 5000) {
          if (Math.random() < 0.05) { // Low chance per tick
            const target = openBlocks[Math.floor(Math.random() * openBlocks.length)];
            // Prefer blocks matching prestige preference
            const prestige = player.aiProfile === 'aggressive' ? 3 : player.aiProfile === 'cautious' ? 2 : 3;
            if (target.prestige >= prestige - 1) {
              useGameStore.getState().startAuction(target.id);
            }
          }
        }
      }
    }, 3000); // AI acts every 3 seconds

    return () => clearInterval(intervalRef.current);
  }, [phase]);
}
