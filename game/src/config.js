// Every tuning number and colour in one place. Ember Duel is a turn-based card
// battler: you and a rival mage each have 20 life, a hand of cards and mana that
// grows by 1 each round. Play cards to hurt, block, heal or draw; reduce the
// rival to 0 life before they do the same to you.

export const MAX_HP = 20;
export const MAX_MANA = 10;
export const HAND_LIMIT = 7;
export const START_HAND = 3;
export const DRAW_PER_TURN = 1;

/** The eight cards. `kind` is attack, block, heal, leech or draw. */
export const CARDS = [
  { id: 'ember', name: 'Ember Strike', cost: 1, kind: 'attack', value: 3, color: '#e5534b', icon: '🔥', text: 'Deal 3 damage.' },
  { id: 'frost', name: 'Frost Bolt', cost: 2, kind: 'attack', value: 5, color: '#4fc3f7', icon: '❄️', text: 'Deal 5 damage.' },
  { id: 'nova', name: 'Ember Nova', cost: 4, kind: 'attack', value: 10, color: '#f2a33c', icon: '☀️', text: 'Deal 10 damage.' },
  { id: 'guard', name: 'Stone Guard', cost: 1, kind: 'block', value: 5, color: '#7fb069', icon: '🛡️', text: 'Gain 5 block.' },
  { id: 'wall', name: 'Iron Wall', cost: 2, kind: 'block', value: 9, color: '#8b93a3', icon: '🧱', text: 'Gain 9 block.' },
  { id: 'mend', name: 'Mend', cost: 2, kind: 'heal', value: 5, color: '#e58fb1', icon: '✚', text: 'Restore 5 life.' },
  { id: 'leech', name: 'Soul Leech', cost: 2, kind: 'leech', value: 3, color: '#9b7ede', icon: '🩸', text: 'Deal 3, heal 3.' },
  { id: 'insight', name: 'Insight', cost: 1, kind: 'draw', value: 2, color: '#f2c94c', icon: '👁️', text: 'Draw 2 cards.' },
];

/** The deck: three copies of each card, shuffled with the seeded random. */
export const DECK_COPIES = 3;

export const PALETTE = {
  backdrop: '#14101f',
  table: '#1e1830',
  panel: '#262040',
  panelEdge: '#3a3160',
  text: '#f2ede4',
  muted: '#a99fc4',
  gold: '#f2c94c',
  red: '#e5534b',
  blue: '#4fc3f7',
  green: '#7fb069',
  player: '#4fc3f7',
  rival: '#e5534b',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
