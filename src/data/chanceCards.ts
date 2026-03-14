import type { ChanceCard } from '../types/game';

export const CHANCE_DECK: Omit<ChanceCard, 'isUsed'>[] = [
  { id: 1, title: 'Tax Refund', description: 'Receive a $500 tax refund.', effect: { type: 'cash', amount: 500 }, targetType: 'self' },
  { id: 2, title: 'Street Repairs', description: 'Pay $200 for street repairs on each property you own.', effect: { type: 'repair', cost: 200 }, targetType: 'self' },
  { id: 3, title: 'Store Strike!', description: 'Workers go on strike at a target store for 1 day.', effect: { type: 'strike', duration: 1 }, targetType: 'opponent' },
  { id: 4, title: 'Bakery Boom', description: 'All your bakeries earn double for 1 day.', effect: { type: 'boost', buildingType: 'bakery', multiplier: 2, duration: 1 }, targetType: 'self' },
  { id: 5, title: 'Windfall', description: 'Bank error in your favor. Collect $1000.', effect: { type: 'cash', amount: 1000 }, targetType: 'self' },
  { id: 6, title: 'Property Tax', description: 'Pay 10% tax on all property values.', effect: { type: 'tax', percentage: 10 }, targetType: 'self' },
  { id: 7, title: 'Free Building', description: 'Build a free grocery store on any block you own.', effect: { type: 'freeBuilding', buildingType: 'grocery' }, targetType: 'self' },
  { id: 8, title: 'Eviction Notice', description: 'Evict one opponent building from a block you own.', effect: { type: 'evict' }, targetType: 'opponent' },
  { id: 9, title: 'Tourism Boom', description: 'Receive $300 per hotel you own.', effect: { type: 'cash', amount: 300 }, targetType: 'self' },
  { id: 10, title: 'Double Rent', description: 'Collect double rent for 2 days.', effect: { type: 'doubleRent', duration: 2 }, targetType: 'self' },
  { id: 11, title: 'Stock Delivery', description: 'All stores gain +50% stock.', effect: { type: 'stockBoost', amount: 50 }, targetType: 'self' },
  { id: 12, title: 'Prestige Award', description: 'A block you own gains +1 prestige star.', effect: { type: 'prestige', amount: 1 }, targetType: 'self' },
  { id: 13, title: 'Fire Sale', description: 'Collect $200 insurance.', effect: { type: 'cash', amount: 200 }, targetType: 'self' },
  { id: 14, title: 'Restaurant Rush', description: 'All restaurants earn double tonight.', effect: { type: 'boost', buildingType: 'restaurant', multiplier: 2, duration: 1 }, targetType: 'self' },
  { id: 15, title: 'Utility Rebate', description: 'Receive $400 utility rebate.', effect: { type: 'cash', amount: 400 }, targetType: 'self' },
  { id: 16, title: 'Theatre Season', description: 'Theatres earn double for 1 day.', effect: { type: 'boost', buildingType: 'theatre', multiplier: 2, duration: 1 }, targetType: 'self' },
  { id: 17, title: 'Block Party', description: 'A block you own gains +2 prestige stars.', effect: { type: 'prestige', amount: 2 }, targetType: 'self' },
  { id: 18, title: 'Mall Craze', description: 'All clothing stores earn double.', effect: { type: 'boost', buildingType: 'clothing', multiplier: 2, duration: 1 }, targetType: 'self' },
  { id: 19, title: 'Income Tax', description: 'Pay 5% of your cash.', effect: { type: 'tax', percentage: 5 }, targetType: 'self' },
  { id: 20, title: 'Arcade Fever', description: 'All arcades earn double.', effect: { type: 'boost', buildingType: 'arcade', multiplier: 2, duration: 1 }, targetType: 'self' },
  { id: 21, title: 'Worker Strike', description: 'Target opponent store goes on strike.', effect: { type: 'strike', duration: 2 }, targetType: 'opponent' },
  { id: 22, title: 'Nightlife Boom', description: 'All nightclubs earn double.', effect: { type: 'boost', buildingType: 'nightclub', multiplier: 2, duration: 1 }, targetType: 'self' },
  { id: 23, title: 'Bonus Dividend', description: 'Collect $750.', effect: { type: 'cash', amount: 750 }, targetType: 'self' },
  { id: 24, title: 'Emergency Repairs', description: 'Pay $150 per building for maintenance.', effect: { type: 'repair', cost: 150 }, targetType: 'self' },
  { id: 25, title: 'Grand Opening', description: 'Free hardware store on any owned block.', effect: { type: 'freeBuilding', buildingType: 'hardware' }, targetType: 'self' },
];

export function shuffleDeck(): ChanceCard[] {
  const deck = CHANCE_DECK.map(c => ({ ...c, isUsed: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
