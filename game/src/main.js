// Boot and the one loop: input is read every frame and the renderer paints what is
// there. The game moves between four screens: title, play, win and loss. A turn is
// event-driven (click a card, click End Turn), so there is no per-frame simulation
// to step — the loop only polls input and re-renders on change.
//
// ?seed=N fixes the shuffle. ?shot=title|table|win|loss (with &seed=N) stages that
// scene instead of running the loop, paints it twice and sets window.__shotReady
// for a screenshot.
import { createRandom } from './random.js';
import { createWorld } from './world.js';
import { ACTION_CONFIRM, createInput } from './input.js';
import { createRenderer, SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const stage = document.getElementById('stage');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(stage);

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.render(world.state, scene.screen);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(stage);
  let screen = SCREEN_TITLE;

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    screen = SCREEN_PLAY;
    announce('Playing. Your move — play a card, then End Turn.');
  }

  function endGame() {
    screen = world.state.winner === 'player' ? SCREEN_WIN : SCREEN_LOSS;
    announce(world.state.winner === 'player' ? 'Victory! The rival mage is defeated.' : 'Defeat. Your mage has fallen.');
  }

  function handleInput() {
    const card = input.takeCard();
    if (card >= 0 && screen === SCREEN_PLAY) {
      if (world.playCard('player', card)) {
        if (world.state.phase === 'over') endGame();
        renderer.render(world.state, screen);
        announce(world.state.log);
      }
      return;
    }
    const button = input.takeButton();
    const actions = input.takeActions();
    if (button === 'start' || button === 'again' || (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_WIN || screen === SCREEN_LOSS))) {
      startGame();
      renderer.render(world.state, screen);
      return;
    }
    if (button === 'end' && screen === SCREEN_PLAY) {
      const result = world.endTurn();
      if (world.state.phase === 'over') endGame();
      renderer.render(world.state, screen);
      announce(world.state.log);
    }
  }

  function frame() {
    requestAnimationFrame(frame);
    handleInput();
  }

  renderer.render(world.state, screen);
  announce('Ember Duel. Click Start Duel or press Space to begin.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
