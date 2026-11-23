// Drawing only: the world's state and the current screen in, DOM out. The table is
// a fixed 1280x720 area scaled to the window, built from divs so cards, life bars
// and mana read crisply in a screenshot. One render() call rebuilds the whole
// table from the state; nothing here owns game rules.
import { CARDS, FONT, MAX_HP, PALETTE } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSS = 'loss';

function cardById(id) {
  return CARDS.find((c) => c.id === id);
}

function hpBar(hp, block, color) {
  const pct = Math.max(0, (hp / MAX_HP) * 100);
  const blockTag = block > 0 ? `<span class="block">🛡️ ${block}</span>` : '';
  return `<div class="hpwrap"><div class="hpbar"><div class="hpfill" style="width:${pct}%;background:${color}"></div></div><div class="hptext">❤️ ${hp} / ${MAX_HP} ${blockTag}</div></div>`;
}

function cardHtml(card, playable, index) {
  const cls = playable ? 'card playable' : 'card';
  return `<div class="${cls}" data-index="${index}" style="--c:${card.color}">
    <div class="card-cost">◆ ${card.cost}</div>
    <div class="card-icon">${card.icon}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-text">${card.text}</div>
  </div>`;
}

function backHtml() {
  return `<div class="card back"><div class="card-back">✦</div></div>`;
}

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; overflow: hidden; background: ${PALETTE.backdrop}; font-family: ${FONT}; }
  #stage { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
  #table { width: 1280px; height: 720px; flex: none; background: radial-gradient(ellipse at 50% 30%, ${PALETTE.table} 0%, #171227 70%); border: 2px solid ${PALETTE.panelEdge}; border-radius: 18px; color: ${PALETTE.text}; display: flex; flex-direction: column; padding: 18px 26px; transform-origin: center center; }
  .row { display: flex; align-items: center; gap: 16px; }
  .side-label { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
  .side-label .who { color: ${PALETTE.rival}; }
  .side-label.you .who { color: ${PALETTE.player}; }
  .hpwrap { display: flex; align-items: center; gap: 10px; }
  .hpbar { width: 220px; height: 20px; background: #0d0a18; border: 1px solid ${PALETTE.panelEdge}; border-radius: 10px; overflow: hidden; }
  .hpfill { height: 100%; transition: width .3s; }
  .hptext { font-size: 19px; font-weight: 700; }
  .block { color: ${PALETTE.green}; margin-left: 6px; }
  .mana { font-size: 20px; font-weight: 700; color: ${PALETTE.gold}; }
  .mana .pip { color: ${PALETTE.gold}; }
  .hand { display: flex; gap: 10px; min-height: 178px; align-items: center; }
  .hand.rival-hand { justify-content: center; }
  .hand.you-hand { justify-content: center; }
  .card { width: 128px; height: 178px; border-radius: 12px; background: linear-gradient(160deg, #2c2547, #1d1830); border: 2px solid var(--c, #888); padding: 8px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; box-shadow: 0 4px 14px rgba(0,0,0,.45); }
  .card.playable { cursor: pointer; }
  .card.playable:hover { transform: translateY(-10px); border-color: ${PALETTE.gold}; box-shadow: 0 8px 22px rgba(242,201,76,.35); }
  .card .card-cost { align-self: flex-start; font-size: 17px; font-weight: 800; color: ${PALETTE.gold}; }
  .card .card-icon { font-size: 40px; line-height: 1; margin: 6px 0 4px; }
  .card .card-name { font-size: 15px; font-weight: 800; line-height: 1.15; }
  .card .card-text { font-size: 12.5px; color: ${PALETTE.muted}; margin-top: 6px; line-height: 1.3; }
  .card.back { background: linear-gradient(160deg, #3a2b5e, #241a3d); border-color: ${PALETTE.panelEdge}; }
  .card-back { font-size: 56px; color: ${PALETTE.gold}; margin-top: 46px; }
  .mid { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
  .vs { font-size: 34px; font-weight: 900; letter-spacing: 6px; color: ${PALETTE.gold}; }
  .round { font-size: 16px; color: ${PALETTE.muted}; }
  .log { font-size: 17px; color: ${PALETTE.text}; background: ${PALETTE.panel}; border: 1px solid ${PALETTE.panelEdge}; border-radius: 10px; padding: 8px 18px; min-width: 420px; text-align: center; }
  .endturn { margin-left: auto; font-size: 18px; font-weight: 800; color: #171227; background: ${PALETTE.gold}; border: none; border-radius: 10px; padding: 12px 26px; cursor: pointer; }
  .endturn:hover { filter: brightness(1.1); }
  .endturn:disabled { opacity: .45; cursor: default; }
  .title { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; }
  .title h1 { font-size: 84px; font-weight: 900; letter-spacing: 4px; color: ${PALETTE.gold}; text-shadow: 0 4px 0 #7a5b12, 0 8px 24px rgba(0,0,0,.6); }
  .title h2 { font-size: 24px; color: ${PALETTE.text}; font-weight: 600; }
  .title p { font-size: 17px; color: ${PALETTE.muted}; max-width: 640px; line-height: 1.5; }
  .title .start { margin-top: 10px; font-size: 22px; font-weight: 800; color: #171227; background: ${PALETTE.gold}; border: none; border-radius: 12px; padding: 14px 40px; cursor: pointer; }
  .title .cards-row { display: flex; gap: 12px; margin-top: 6px; }
  .end { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; }
  .end h1 { font-size: 76px; font-weight: 900; letter-spacing: 4px; }
  .end h1.win { color: ${PALETTE.gold}; }
  .end h1.loss { color: ${PALETTE.red}; }
  .end p { font-size: 20px; color: ${PALETTE.muted}; }
  .end .again { font-size: 20px; font-weight: 800; color: #171227; background: ${PALETTE.gold}; border: none; border-radius: 12px; padding: 12px 34px; cursor: pointer; }
  .hint { font-size: 14px; color: ${PALETTE.muted}; text-align: center; margin-top: 6px; }
`;

export function createRenderer(root) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  const table = document.createElement('div');
  table.id = 'table';
  root.appendChild(table);

  function fit() {
    const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    table.style.transform = `scale(${scale})`;
  }
  window.addEventListener('resize', fit);
  fit();

  function render(state, screen) {
    if (screen === SCREEN_TITLE) {
      const sample = [CARDS[0], CARDS[3], CARDS[2], CARDS[6]];
      table.innerHTML = `<div class="title">
        <h1>EMBER DUEL</h1>
        <h2>A tiny card battler — you vs the rival mage</h2>
        <p>Each round you gain mana and draw a card. Play cards to strike, block, heal or draw. Reduce the rival mage to 0 life before they do the same to you.</p>
        <div class="cards-row">${sample.map((c) => cardHtml(c, false, -1)).join('')}</div>
        <button class="start" data-action="start">▶ &nbsp;Start Duel</button>
        <p class="hint">Click a card to play it · End Turn passes to the rival · Space also starts</p>
      </div>`;
      return;
    }
    if (screen === SCREEN_WIN || screen === SCREEN_LOSS) {
      const win = screen === SCREEN_WIN;
      table.innerHTML = `<div class="end">
        <h1 class="${win ? 'win' : 'loss'}">${win ? '🏆 VICTORY!' : '💀 DEFEAT'}</h1>
        <p>${win ? 'The rival mage is defeated. The embers are yours.' : 'Your mage has fallen. The rival takes the table.'}</p>
        <p>Final life — You ${state.player.hp} · Rival ${state.rival.hp} &nbsp;·&nbsp; Rounds played: ${state.round}</p>
        <button class="again" data-action="again">↻ &nbsp;Play again</button>
        <p class="hint">Click Play again or press Space</p>
      </div>`;
      return;
    }
    // Play screen.
    const p = state.player;
    const r = state.rival;
    const manaPips = '◆'.repeat(p.mana) + '◇'.repeat(Math.max(0, p.maxMana - p.mana));
    const rivalBacks = r.hand.map(() => backHtml()).join('');
    const yourCards = p.hand
      .map((id, i) => {
        const card = cardById(id);
        return cardHtml(card, state.phase === 'player' && card.cost <= p.mana, i);
      })
      .join('');
    table.innerHTML = `
      <div class="row">
        <div class="side-label"><span class="who">🔮 RIVAL MAGE</span></div>
        ${hpBar(r.hp, r.block, PALETTE.rival)}
        <span class="mana">◆ ${r.mana}/${r.maxMana}</span>
        <span class="hint" style="margin-left:auto">Round ${state.round}</span>
      </div>
      <div class="hand rival-hand">${rivalBacks}</div>
      <div class="mid">
        <div class="vs">⚔️ EMBER DUEL ⚔️</div>
        <div class="log">${state.log}</div>
      </div>
      <div class="hand you-hand">${yourCards}</div>
      <div class="row">
        <div class="side-label you"><span class="who">🧙 YOU</span></div>
        ${hpBar(p.hp, p.block, PALETTE.player)}
        <span class="mana"><span class="pip">${manaPips}</span> ${p.mana}/${p.maxMana}</span>
        <button class="endturn" data-action="end" ${state.phase === 'player' ? '' : 'disabled'}>End Turn ⏎</button>
      </div>
      <div class="hint">Click a glowing card to play it · Your block fades at the start of your next turn</div>`;
  }

  return { render };
}
