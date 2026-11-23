// Keyboard and pointer input. Clicks land on elements with a data-action or
// data-index attribute; the renderer owns the DOM, this module only turns raw
// events into one-shot actions the loop takes once, so a click between two frames
// is never lost and never counted twice.

export const ACTION_CONFIRM = 1;

export function createInput(root) {
  let actions = 0;
  let cardIndex = -1;
  let button = null;

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'Enter') {
      if (!event.repeat) actions |= ACTION_CONFIRM;
      event.preventDefault();
    }
  });
  root.addEventListener('click', (event) => {
    const el = event.target.closest('[data-action], [data-index]');
    if (!el) return;
    if (el.dataset.action) {
      button = el.dataset.action;
      actions |= ACTION_CONFIRM;
    } else if (el.dataset.index !== undefined) {
      cardIndex = Number.parseInt(el.dataset.index, 10);
    }
  });

  return {
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The button pressed since the last call ('start' | 'end' | 'again'), or null. */
    takeButton() {
      const taken = button;
      button = null;
      return taken;
    },
    /** The card index clicked since the last call, or -1. */
    takeCard() {
      const taken = cardIndex;
      cardIndex = -1;
      return taken;
    },
  };
}
