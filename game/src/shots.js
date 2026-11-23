// The screenshot scenes behind ?shot=title|table|win|loss. Each one plays the real
// rules forward from a fresh world, steered by a simple autopilot, so the frame is
// what a real game looks like and the same seed always gives the same frame.
// The win scene uses a greedy pilot (best damage first); the loss scene uses a
// passive pilot (never plays), so the rival wins — both are honest games.
import { CARDS } from './config.js';
import { SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

const MAX_ROUNDS = 40;

/** The greedy pilot: play the best affordable card, then end the turn. */
function greedyPilot(world) {
  const s = world.state;
  while (s.phase === 'player') {
    let best = -1;
    let bestScore = -1;
    for (let i = 0; i < s.player.hand.length; i++) {
      const card = CARDS.find((c) => c.id === s.player.hand[i]);
      if (card.cost > s.player.mana) continue;
      const score = card.kind === 'attack' || card.kind === 'leech' ? card.value * 2 : card.value;
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
    if (best < 0) break;
    world.playCard('player', best);
    if (s.phase === 'over') return;
  }
  if (s.phase === 'player') world.endTurn();
}

/** The passive pilot: never play a card, just end the turn. */
function passivePilot(world) {
  if (world.state.phase === 'player') world.endTurn();
}

function playRounds(world, pilot, rounds) {
  for (let i = 0; i < rounds; i++) {
    if (world.state.phase === 'over') return;
    pilot(world);
  }
}

/**
 * Set `world` to the named scene (title, table, win or loss; any other name is
 * title) and return the screen to draw over it.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'table') {
    playRounds(world, greedyPilot, 4);
    return { screen: SCREEN_PLAY };
  }
  if (name === 'win') {
    playRounds(world, greedyPilot, MAX_ROUNDS);
    return { screen: world.state.winner === 'player' ? SCREEN_WIN : SCREEN_PLAY };
  }
  if (name === 'loss') {
    playRounds(world, passivePilot, MAX_ROUNDS);
    return { screen: world.state.winner === 'rival' ? SCREEN_LOSS : SCREEN_PLAY };
  }
  return { screen: SCREEN_TITLE };
}
