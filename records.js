'use strict';

const RECORDS_KEY = 'tetris-records';
const BEST_KEY = 'tetris-best';
const MAX_RECORDS = 5;
const MAX_NAME_LENGTH = 12;
const DEFAULT_NAME = 'PLAYER';

// Current run combo state (consecutive piece locks that cleared >= 1 line)
let runCombo = 0;
let runBestCombo = 0;

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function sanitizeName(name) {
  const clean = String(name == null ? '' : name).replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH).trim();
  return clean || DEFAULT_NAME;
}

function loadRecords() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(RECORDS_KEY)); } catch (e) { /* unavailable or corrupted */ }
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(r => r && typeof r === 'object')
    .map(r => ({
      name: sanitizeName(r.name),
      score: toNumber(r.score),
      lines: toNumber(r.lines),
      level: toNumber(r.level),
      date: typeof r.date === 'string' ? r.date : '',
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RECORDS);
}

function saveRecords(list) {
  try { localStorage.setItem(RECORDS_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
}

function loadBest() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(BEST_KEY)); } catch (e) { /* unavailable or corrupted */ }
  if (!raw || typeof raw !== 'object') raw = {};
  return { combo: toNumber(raw.combo), lines: toNumber(raw.lines) };
}

function saveBest(best) {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch (e) { /* storage unavailable */ }
}

// Returns true if the score would enter the top list
function scoreQualifies(score, list) {
  if (!(score > 0)) return false;
  const records = list || loadRecords();
  return records.length < MAX_RECORDS || score > records[records.length - 1].score;
}

// Inserts a record; returns its index in the top list, or -1 if it did not make it
function addRecord(entry) {
  const records = loadRecords();
  const rec = {
    name: sanitizeName(entry.name),
    score: toNumber(entry.score),
    lines: toNumber(entry.lines),
    level: toNumber(entry.level),
    date: new Date().toISOString(),
  };
  let idx = records.findIndex(r => rec.score > r.score);
  if (idx === -1) idx = records.length;
  records.splice(idx, 0, rec);
  records.length = Math.min(records.length, MAX_RECORDS);
  saveRecords(records);
  return idx < MAX_RECORDS ? idx : -1;
}

function resetRecords() {
  try {
    localStorage.removeItem(RECORDS_KEY);
    localStorage.removeItem(BEST_KEY);
  } catch (e) { /* storage unavailable */ }
}

function resetRunStats() {
  runCombo = 0;
  runBestCombo = 0;
}

// Call after each piece lock with the number of cleared lines
function trackCombo(cleared) {
  if (cleared > 0) {
    runCombo++;
    if (runCombo > runBestCombo) runBestCombo = runCombo;
  } else {
    runCombo = 0;
  }
}

// Persists best combo / max lines when beaten
function saveRunBest(totalLines) {
  const best = loadBest();
  let changed = false;
  if (runBestCombo > best.combo) { best.combo = runBestCombo; changed = true; }
  if (totalLines > best.lines) { best.lines = totalLines; changed = true; }
  if (changed) saveBest(best);
}

function formatDate(iso) {
  const d = new Date(iso);
  return isNaN(d) ? '-' : d.toLocaleDateString();
}

// Renders the top list into a container using textContent only
function renderRecords(container, highlightIndex) {
  container.textContent = '';
  const records = loadRecords();
  if (!records.length) {
    const empty = document.createElement('p');
    empty.className = 'records-empty';
    empty.textContent = 'No records yet';
    container.appendChild(empty);
    return;
  }
  const table = document.createElement('table');
  table.className = 'records-table';
  const head = table.createTHead().insertRow();
  ['#', 'NAME', 'SCORE', 'LINES', 'LVL', 'DATE'].forEach(t => {
    const th = document.createElement('th');
    th.textContent = t;
    head.appendChild(th);
  });
  const body = table.createTBody();
  records.forEach((r, i) => {
    const tr = body.insertRow();
    if (i === highlightIndex) tr.className = 'highlight';
    [i + 1, r.name, r.score.toLocaleString(), r.lines, r.level, formatDate(r.date)].forEach(v => {
      tr.insertCell().textContent = String(v);
    });
  });
  container.appendChild(table);
}

function renderBest(container) {
  const best = loadBest();
  container.textContent = `Best combo: ${best.combo} | Max lines: ${best.lines}`;
}
