// Keyboard only: WASD or arrows to move, Shift to sprint, Ctrl or C to crouch, R to restart.
const held = new Set();

export function bindInput(handlers) {
  addEventListener('keydown', (event) => {
    held.add(event.key.toLowerCase());
    if (event.key === 'Shift') held.add('shift');
    if (event.key === 'Control') held.add('control');
    if (event.key.toLowerCase() === 'r') handlers.onRestart();
    if (event.key === ' ' || event.key.startsWith('Arrow')) event.preventDefault();
    handlers.onFirstKey();
  });
  addEventListener('keyup', (event) => {
    held.delete(event.key.toLowerCase());
    if (event.key === 'Shift') held.delete('shift');
    if (event.key === 'Control') held.delete('control');
  });
  addEventListener('blur', () => held.clear());
}

export function readMove() {
  let dx = 0;
  let dy = 0;
  if (held.has('a') || held.has('arrowleft')) dx -= 1;
  if (held.has('d') || held.has('arrowright')) dx += 1;
  if (held.has('w') || held.has('arrowup')) dy -= 1;
  if (held.has('s') || held.has('arrowdown')) dy += 1;
  const len = Math.hypot(dx, dy);
  const moving = len > 0.01;
  return {
    dx: moving ? dx / len : 0,
    dy: moving ? dy / len : 0,
    moving,
    sprint: held.has('shift'),
    crouch: held.has('control') || held.has('c'),
  };
}

export const anyHeld = () => held.size > 0;
