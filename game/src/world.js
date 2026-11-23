// Ember Duel's rules and state, with no drawing and no browser in it: the two
// mages, their decks, hands, mana and block, and the turn flow. Everything is
// driven by explicit calls (playCard, endTurn, aiTurn), so the renderer and the
// screenshot autopilot both just call the rules. Pure logic: nothing here touches
// the DOM, so the same code can be stepped in Node to find screenshot seeds.
import { CARDS, DECK_COPIES, DRAW_PER_TURN, HAND_LIMIT, MAX_HP, MAX_MANA, START_HAND } from './config.js';

export const EVENT_PLAYED = 1;
export const EVENT_TURN = 2;
export const EVENT_OVER = 4;

function buildDeck(random) {
  const deck = [];
  for (const card of CARDS) for (let i = 0; i < DECK_COPIES; i++) deck.push(card.id);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardById(id) {
  return CARDS.find((c) => c.id === id);
}

export function createWorld(random) {
  const state = {
    round: 1,
    phase: 'player', // 'player' | 'rival' | 'over'
    winner: null, // 'player' | 'rival' | null
    player: { hp: MAX_HP, block: 0, mana: 1, maxMana: 1, hand: [], deck: [], discard: [] },
    rival: { hp: MAX_HP, block: 0, mana: 1, maxMana: 1, hand: [], deck: [], discard: [] },
    log: '',
  };

  function drawCard(side) {
    const s = state[side];
    if (s.deck.length === 0) {
      if (s.discard.length === 0) return;
      s.deck = s.discard;
      s.discard = [];
      for (let i = s.deck.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [s.deck[i], s.deck[j]] = [s.deck[j], s.deck[i]];
      }
    }
    if (s.hand.length >= HAND_LIMIT) {
      s.deck.pop();
      return;
    }
    s.hand.push(s.deck.pop());
  }

  function dealDamage(target, amount) {
    const s = state[target];
    const blocked = Math.min(s.block, amount);
    s.block -= blocked;
    s.hp = Math.max(0, s.hp - (amount - blocked));
  }

  function heal(side, amount) {
    const s = state[side];
    s.hp = Math.min(MAX_HP, s.hp + amount);
  }

  /** Apply one card's effect. `side` is who played it, `foe` the other side. */
  function applyCard(side, card) {
    const foe = side === 'player' ? 'rival' : 'player';
    if (card.kind === 'attack') dealDamage(foe, card.value);
    else if (card.kind === 'block') state[side].block += card.value;
    else if (card.kind === 'heal') heal(side, card.value);
    else if (card.kind === 'leech') {
      dealDamage(foe, card.value);
      heal(side, card.value);
    } else if (card.kind === 'draw') {
      for (let i = 0; i < card.value; i++) drawCard(side);
    }
  }

  /** Play the card at `handIndex` from `side`'s hand. Returns false when illegal. */
  function playCard(side, handIndex) {
    if (state.phase === 'over') return false;
    if (side === 'player' && state.phase !== 'player') return false;
    if (side === 'rival' && state.phase !== 'rival') return false;
    const s = state[side];
    const id = s.hand[handIndex];
    if (id === undefined) return false;
    const card = cardById(id);
    if (card.cost > s.mana) return false;
    s.mana -= card.cost;
    s.hand.splice(handIndex, 1);
    s.discard.push(id);
    applyCard(side, card);
    state.log = `${side === 'player' ? 'You' : 'Rival'} played ${card.name}.`;
    if (state.rival.hp <= 0) {
      state.phase = 'over';
      state.winner = 'player';
      state.log = 'Rival mage defeated!';
      return true;
    }
    if (state.player.hp <= 0) {
      state.phase = 'over';
      state.winner = 'rival';
      state.log = 'Your mage has fallen.';
      return true;
    }
    return true;
  }

  /** Begin a side's turn: block fades, mana refills, a card is drawn. */
  function startTurn(side) {
    const s = state[side];
    s.block = 0;
    s.maxMana = Math.min(MAX_MANA, state.round);
    s.mana = s.maxMana;
    for (let i = 0; i < DRAW_PER_TURN; i++) drawCard(side);
  }

  /** The rival's turn: play up to three cards, best value first, then pass. */
  function aiTurn() {
    state.phase = 'rival';
    startTurn('rival');
    let played = 0;
    while (played < 3) {
      let best = -1;
      let bestScore = -1;
      for (let i = 0; i < state.rival.hand.length; i++) {
        const card = cardById(state.rival.hand[i]);
        if (card.cost > state.rival.mana) continue;
        const score = card.kind === 'attack' || card.kind === 'leech' ? card.value * 2 : card.value;
        if (score > bestScore) {
          bestScore = score;
          best = i;
        }
      }
      if (best < 0) break;
      playCard('rival', best);
      played += 1;
      if (state.phase === 'over') return EVENT_OVER;
    }
    state.round += 1;
    state.phase = 'player';
    startTurn('player');
    return EVENT_TURN;
  }

  /** End the player's turn and run the rival's turn. Returns EVENT_OVER when the game ends. */
  function endTurn() {
    if (state.phase !== 'player') return 0;
    return aiTurn();
  }

  function reset() {
    state.round = 1;
    state.phase = 'player';
    state.winner = null;
    state.log = 'Your move — play a card, then End Turn.';
    for (const side of ['player', 'rival']) {
      const s = state[side];
      s.hp = MAX_HP;
      s.block = 0;
      s.mana = 1;
      s.maxMana = 1;
      s.hand = [];
      s.deck = buildDeck(random);
      s.discard = [];
      for (let i = 0; i < START_HAND; i++) drawCard(side);
    }
  }

  reset();
  return { state, reset, playCard, endTurn, cardById };
}
