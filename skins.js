'use strict';

// Visual skins. Defines data and drawing helpers only; game.js calls into it.
// Colors are index-aligned with COLORS in game.js (null at 0, then 9 entries).
// background: fixed canvas fill, or null to use the theme surface.
// grid: fixed grid color, or null to use the theme --grid.

function fillRoundedRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + w - r, y);
  context.quadraticCurveTo(x + w, y, x + w, y + r);
  context.lineTo(x + w, y + h - r);
  context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  context.lineTo(x + r, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
  context.fill();
}

function drawRetroBlock(context, x, y, color, size) {
  context.fillStyle = color;
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  // highlight
  context.fillStyle = 'rgba(255,255,255,0.12)';
  context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
}

function drawNeonBlock(context, x, y, color, size) {
  const px = x * size + 3, py = y * size + 3, s = size - 6;
  context.shadowColor = color;
  context.shadowBlur = context.globalAlpha < 1 ? 0 : 12; // no glow on the ghost piece
  context.fillStyle = color;
  context.fillRect(px, py, s, s);
  // bright core
  context.shadowBlur = 0;
  context.fillStyle = 'rgba(255,255,255,0.35)';
  context.fillRect(px + 3, py + 3, s - 6, s - 6);
}

function drawPastelBlock(context, x, y, color, size) {
  context.fillStyle = color;
  fillRoundedRect(context, x * size + 2, y * size + 2, size - 4, size - 4, 7);
  context.fillStyle = 'rgba(255,255,255,0.35)';
  fillRoundedRect(context, x * size + 6, y * size + 5, size - 12, 5, 2);
}

function drawPixelBlock(context, x, y, color, size) {
  const px = x * size, py = y * size;
  const u = size / 6; // 6x6 pixel texture per block
  context.fillStyle = color;
  context.fillRect(px + 1, py + 1, size - 2, size - 2);
  // light top/left edge, dark bottom/right edge
  context.fillStyle = 'rgba(255,255,255,0.35)';
  context.fillRect(px + 1, py + 1, size - 2, u);
  context.fillRect(px + 1, py + 1, u, size - 2);
  context.fillStyle = 'rgba(0,0,0,0.3)';
  context.fillRect(px + 1, py + size - 1 - u, size - 2, u);
  context.fillRect(px + size - 1 - u, py + 1, u, size - 2);
  // checker texture in the middle
  context.fillStyle = 'rgba(0,0,0,0.12)';
  for (let i = 1; i < 5; i++)
    for (let j = 1; j < 5; j++)
      if ((i + j) % 2 === 0) context.fillRect(px + i * u, py + j * u, u, u);
}

const SKINS = {
  retro: {
    label: 'Retro',
    colors: [null, '#4dd0e1', '#ffd54f', '#ba68c8', '#81c784', '#e57373', '#90caf9', '#ffb74d', '#ff1744', '#f06292'],
    background: null,
    grid: null,
    drawBlock: drawRetroBlock,
  },
  neon: {
    label: 'Neon',
    colors: [null, '#00fff0', '#ffee00', '#d500f9', '#39ff14', '#ff073a', '#2979ff', '#ff9100', '#ff1744', '#ff4fd8'],
    background: '#000000',
    grid: '#1c1c2c',
    drawBlock: drawNeonBlock,
  },
  pastel: {
    label: 'Pastel',
    colors: [null, '#a8e6ef', '#fff1b0', '#d9b8f0', '#bfe8c4', '#f7b6b6', '#b9d4f5', '#fcd2a1', '#ff8a80', '#f8bbd0'],
    background: null,
    grid: null,
    drawBlock: drawPastelBlock,
  },
  pixel: {
    label: 'Pixel art',
    colors: [null, '#29b6f6', '#fbc02d', '#8e24aa', '#43a047', '#e53935', '#3949ab', '#fb8c00', '#d50000', '#ec407a'],
    background: null,
    grid: null,
    drawBlock: drawPixelBlock,
  },
};

const DEFAULT_SKIN = 'retro';
let activeSkinId = DEFAULT_SKIN;

function isValidSkin(id) {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(SKINS, id);
}

function activeSkin() {
  return SKINS[activeSkinId];
}

function setActiveSkin(id) {
  activeSkinId = isValidSkin(id) ? id : DEFAULT_SKIN;
  return activeSkinId;
}

function loadSavedSkin() {
  try {
    const saved = localStorage.getItem('skin');
    if (isValidSkin(saved)) return saved;
  } catch (e) { /* storage unavailable */ }
  return DEFAULT_SKIN;
}

function saveSkin(id) {
  try { localStorage.setItem('skin', id); } catch (e) { /* storage unavailable */ }
}

// Fills a canvas with the skin background, or clears it to show the theme surface.
function paintBackground(context, cvs) {
  context.clearRect(0, 0, cvs.width, cvs.height);
  const bg = activeSkin().background;
  if (bg) {
    context.fillStyle = bg;
    context.fillRect(0, 0, cvs.width, cvs.height);
  }
}

// Draws one regular (non-bomb) block. Honors the globalAlpha set by the caller;
// save/restore guarantees shadow and style state does not leak.
function drawSkinBlock(context, x, y, colorIndex, size) {
  const skin = activeSkin();
  context.save();
  skin.drawBlock(context, x, y, skin.colors[colorIndex], size);
  context.restore();
}
