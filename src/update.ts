// Which build is running, and noticing when a newer one has been published.
//
// The build stamps itself (see vite.config.ts) and writes the same stamp to version.json on the
// server. The game fetches that file fresh when it loads, when its tab comes back into view, and
// at the end of each day. If the server has a different build, the page reloads to pick it up,
// but only where nothing is lost: on the title screen, or between two days.

import { effect } from '@preact/signals';
import { day, gamePhase } from './game/state';

declare const __BUILD__: { version: string; date: string; commit: string };

export const BUILD = __BUILD__;
/** What the title screen shows, for checking that an update has arrived. */
export const versionLabel = `v${BUILD.version}  ${BUILD.date}  ${BUILD.commit}`;

/** The newer build on the server, once one has been seen. */
let newer: string | null = null;
/** When the server was last asked. Several things can ask at once (loading, the tab coming into view). */
let askedAt = 0;

const TRIED = 'updateTried';
/** A reload that came back with the old build is not tried again for a while: the server can take
    some minutes to hand out a new page, and the game must not reload in circles meanwhile. */
const RETRY_MS = 5 * 60 * 1000;

function mayReload(commit: string): boolean {
  try {
    const [was, at] = (sessionStorage.getItem(TRIED) ?? '').split('@');
    if (was === commit && Date.now() - Number(at) < RETRY_MS) return false;
    sessionStorage.setItem(TRIED, `${commit}@${Date.now()}`);
    return true;
  } catch {
    // Nowhere to remember the attempt, so there is no telling a second one from a first.
    return false;
  }
}

function reload(): boolean {
  if (!newer || !mayReload(newer)) return false;
  location.reload();
  return true;
}

async function check() {
  if (Date.now() - askedAt < 10_000) return;
  askedAt = Date.now();
  try {
    const res = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const latest = (await res.json()) as { commit?: unknown };
    newer = typeof latest.commit === 'string' && latest.commit !== BUILD.commit ? latest.commit : null;
  } catch {
    // Offline, or no such file: carry on with the build already here.
    return;
  }
  if (gamePhase.value === 'title') reload();
}

/**
 * Called when the player moves on from the end-of-day log. If a newer build is waiting, the page
 * reloads into it and comes back at the title with the next day kept; returns true if it did.
 */
export function updateBetweenDays(): boolean {
  if (!newer) return false;
  try {
    sessionStorage.setItem('resumeDay', String(day.value + 1));
  } catch {
    return false;
  }
  if (reload()) return true;
  try {
    sessionStorage.removeItem('resumeDay');
  } catch {
    /* nothing to undo */
  }
  return false;
}

/** Starts watching for updates. Only the published game does this; there is nothing to compare with while developing. */
export function watchForUpdates() {
  if (!import.meta.env.PROD) return;
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void check();
  });
  // On loading (the game opens on the title), and again each time a day ends.
  effect(() => {
    const phase = gamePhase.value;
    if (phase === 'title' || phase === 'summary') void check();
  });
}
