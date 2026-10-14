# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vanilla JS Tetris (HTML5 Canvas). No dependencies, no `package.json`, no build, no tests, no linter. README.md is in Spanish; code stays in English.

## Running

Open `index.html` directly, or serve statically: `python3 -m http.server 8000` then visit `http://localhost:8000`.

## Architecture

Four files: `index.html` (DOM + two canvases), `style.css`, `pause-menu.js`, `game.js` (all logic, ~300 lines, single global scope, `'use strict'`).

- **State**: module-level `let` globals (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, `dropInterval`, ...) initialized in `init()`. `init()` is also the restart handler.
- **Board**: `ROWS x COLS` matrix; `0` = empty, `1-7` = color/piece index into `COLORS`/`PIECES` (index 0 is `null` in both). Piece shapes embed their own color index as cell values.
- **Pieces**: `{ type, shape, x, y }`; rotation via `rotateCW` (transpose + reverse), `tryRotate` tries kicks `[0,-1,1,-2,2]` horizontally.
- **Flow**: `loop` (rAF) accumulates `dropAccum`; on `dropInterval` it moves down or calls `lockPiece` -> `merge` -> `clearLines` -> `spawn`. `spawn` calls `endGame` if the new piece collides. Pause/game over cancel the rAF (`animId`); resuming calls `loop` manually.
- **Input**: single `keydown` listener (uses `e.code`); `P` toggles pause, other keys ignored while paused/game over.
- **Pause menu** (`pause-menu.js`, loaded before `game.js`): P/Escape pause shows `#pause-menu` (Resume, Restart, controls toggle, starting-level select 1-10). Owns `startLevel`, `dropIntervalForLevel`, `levelForLines`; `init()` starts at `startLevel`. Keydown ignores `e.repeat` after resume (`resumeGuard`). Game over still uses `#overlay`.
- **Rendering**: `draw()` repaints everything each frame (grid, board, ghost at alpha 0.2, current piece); `drawNext()` renders the preview only on `spawn`.

## Gotchas

- Canvas `width`/`height` in `index.html` (300x600 board, 120x120 next) are hardcoded; if `COLS`, `ROWS` or `BLOCK` change, update them manually (`COLS*BLOCK` x `ROWS*BLOCK`).
- UI strings in `game.js`/`index.html` are currently a mix of Spanish and English (e.g. `Puntuación`, `Reiniciar`, `SCORE`); per user rules, new code/strings should be English.
