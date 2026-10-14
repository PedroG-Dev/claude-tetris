'use strict';

// Pause menu: state and DOM wiring. Only defines functions; game.js calls into it.

const MAX_START_LEVEL = 10;

let startLevel = 1;
let resumeGuard = false;

function dropIntervalForLevel(lvl) {
  return Math.max(100, 1000 - (lvl - 1) * 90);
}

function levelForLines(lineCount) {
  return Math.max(startLevel, Math.floor(lineCount / 10) + 1);
}

function showPauseMenu() {
  document.getElementById('pause-controls').classList.add('hidden');
  document.getElementById('pause-controls-btn').setAttribute('aria-expanded', 'false');
  document.getElementById('pause-menu').classList.remove('hidden');
  document.getElementById('pause-resume-btn').focus();
}

function hidePauseMenu() {
  const menu = document.getElementById('pause-menu');
  if (menu.classList.contains('hidden')) return;
  menu.classList.add('hidden');
  if (document.activeElement && menu.contains(document.activeElement)) document.activeElement.blur();
}

// Called by game.js when the game resumes; swallows held-key repeats until release.
function armResumeGuard() {
  resumeGuard = true;
}

function shouldIgnoreKey(e) {
  return resumeGuard && e.repeat;
}

// handlers: { onResume, onRestart }
function initPauseMenu(handlers) {
  const select = document.getElementById('start-level');
  for (let i = 1; i <= MAX_START_LEVEL; i++) {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = String(i);
    select.appendChild(opt);
  }
  select.value = String(startLevel);
  select.addEventListener('change', () => {
    const v = parseInt(select.value, 10);
    startLevel = Math.min(MAX_START_LEVEL, Math.max(1, v || 1));
  });

  document.getElementById('pause-resume-btn').addEventListener('click', handlers.onResume);
  document.getElementById('pause-restart-btn').addEventListener('click', handlers.onRestart);

  const controlsBtn = document.getElementById('pause-controls-btn');
  const controlsEl = document.getElementById('pause-controls');
  controlsBtn.addEventListener('click', () => {
    const hidden = controlsEl.classList.toggle('hidden');
    controlsBtn.setAttribute('aria-expanded', String(!hidden));
  });

  document.addEventListener('keyup', () => { resumeGuard = false; });
}
