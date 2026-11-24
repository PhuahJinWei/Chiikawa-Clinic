// The whole clinic day: who is where, the real-time clock, and every action the player can take.
// Scenes only read these signals and call these functions; no game rule lives in a component.

import { batch, computed, signal } from '@preact/signals';
import { sfx } from '../sfx';
import { CHAR_IDS, PROBLEMS, PROBLEM_IDS, TEMP_RANGE, doorLines, shiftFor } from './data';
import type { CharId, ExamKind, Finding, FixId, Outcome, Patient, ProblemId, Result, SceneId, TimeOfDay, Where } from './types';

const params = new URLSearchParams(location.search);

export const OPEN_MIN = 9 * 60;
export const CLOSE_MIN = 17 * 60;
/** When the light outside turns to evening, then night, on the clinic clock. Night stays after closing. */
export const EVENING_MIN = 14 * 60 + 30;
export const NIGHT_MIN = 16 * 60;
/** Real time one clinic day lasts. `?day=60` in the URL shortens it for testing. */
export const DAY_MS = Math.max(20, Number(params.get('day')) || 300) * 1000;
/** How long a thermometer takes. The player is free to walk away while it runs. */
export const THERMO_MS = 7000;
export const SEAT_COUNT = 3;
/** Pause between one door decision and the next knock. */
const KNOCK_GAP_MS: [number, number] = [5000, 11000];

export type GamePhase = 'title' | 'intro' | 'play' | 'summary';
export const gamePhase = signal<GamePhase>('title');
export const paused = signal(false);
export const scene = signal<SceneId>('waiting');
/** The day to start on: 1, unless the page reloaded itself between two days to pick up an update. */
function firstDay(): number {
  try {
    const kept = Number(sessionStorage.getItem('resumeDay'));
    sessionStorage.removeItem('resumeDay');
    return kept >= 1 ? Math.floor(kept) : 1;
  } catch {
    return 1;
  }
}
export const day = signal(firstDay());
/** Real milliseconds played today, not counting pauses. Everything timed hangs off this. */
export const playMs = signal(0);
export const patients = signal<Patient[]>([]);
export const outcomes = signal<Outcome[]>([]);
/** Someone is at the door and the player has not looked yet. */
export const knock = signal(false);
/** The waiting-room patient brought to the front, if any. */
export const focusId = signal<number | null>(null);

export const shift = computed(() => shiftFor(day.value));
export const closed = computed(() => playMs.value >= DAY_MS);
export const clockMin = computed(() =>
  Math.min(CLOSE_MIN, OPEN_MIN + Math.floor((playMs.value / DAY_MS) * (CLOSE_MIN - OPEN_MIN))),
);
export const timeOfDay = computed<TimeOfDay>(() =>
  clockMin.value >= NIGHT_MIN ? 'night' : clockMin.value >= EVENING_MIN ? 'evening' : 'day',
);

let nextId = 1;
let nextKnockAt = 0;
let lastProblem: ProblemId | null = null;

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const at = (w: Where) => patients.value.filter(p => p.where === w);
const byId = (id: number) => patients.value.find(p => p.id === id);

function update(id: number, fn: (p: Patient) => Patient) {
  patients.value = patients.value.map(p => (p.id === id ? fn(p) : p));
}

function record(p: Patient, result: Result, fix: FixId | null = null) {
  outcomes.value = [...outcomes.value, { char: p.char, problem: p.problem, fix, result }];
}

/** How long a cutout takes to slide out of a room. Scenes wait this long before moving a patient on. */
export const EXIT_MS = 450;

/** The patient who last changed rooms, and when, so the room they arrive in can show them coming in. */
let moved: { id: number; at: number } | null = null;
const noteMove = (id: number) => {
  moved = { id, at: performance.now() };
};
/** Whether this patient came into their room only a moment ago. */
export const justArrived = (id: number): boolean => moved?.id === id && performance.now() - moved.at < 1500;

function spawnVisitor() {
  const s = shift.value;
  const onDuty = new Set<CharId>([s.nurse, s.doctor, s.counter]);
  const inside = new Set(patients.value.filter(p => p.where !== 'gone').map(p => p.char));
  const seenToday = new Set(patients.value.map(p => p.char));
  // Staff on leave are fair game as patients. Nobody comes twice until everyone has been once.
  let pool = CHAR_IDS.filter(c => !onDuty.has(c) && !inside.has(c) && !seenToday.has(c));
  if (!pool.length) pool = CHAR_IDS.filter(c => !onDuty.has(c) && !inside.has(c));
  if (!pool.length) {
    nextKnockAt = playMs.value + 4000;
    return;
  }
  const char = pick(pool);
  // Never the same trouble twice running.
  const problem = pick(PROBLEM_IDS.filter(id => id !== lastProblem));
  lastProblem = problem;
  const c = PROBLEMS[problem];
  const [lo, hi] = TEMP_RANGE[c.temp];

  patients.value = [
    ...patients.value,
    {
      id: nextId++,
      char,
      problem,
      tempValue: Math.round(rand(lo, hi) * 10) / 10,
      told: pick(doorLines(char, problem)),
      where: 'door',
      seat: null,
      thermoEndsAt: null,
      counterAt: null,
      chart: { complaint: null, temp: null, exams: {}, diagnosis: null, stamped: false },
    },
  ];
  if (scene.value !== 'door') knock.value = true;
  sfx.knock();
}

// ---- day flow ----

export function startDay() {
  batch(() => {
    patients.value = [];
    outcomes.value = [];
    playMs.value = 0;
    knock.value = false;
    focusId.value = null;
    scene.value = 'waiting';
    paused.value = false;
    gamePhase.value = 'play';
  });
  nextKnockAt = 1800;
  lastProblem = null;
  lastTick = performance.now();
}

export function endDay() {
  batch(() => {
    for (const p of patients.value) if (p.where !== 'gone') record(p, 'unfinished');
    patients.value = patients.value.map(p => ({ ...p, where: 'gone' as const }));
    paused.value = false;
    gamePhase.value = 'summary';
  });
}

export function nextDay() {
  batch(() => {
    day.value += 1;
    gamePhase.value = 'intro';
  });
}

export function goTo(s: SceneId) {
  if (scene.value === s) return;
  batch(() => {
    focusId.value = null;
    scene.value = s;
    if (s === 'door') knock.value = false;
  });
}

// ---- door ----

export function admit(id: number): boolean {
  if (byId(id)?.where !== 'door') return false;
  const taken = new Set(at('waiting').map(p => p.seat));
  const seat = [...Array(SEAT_COUNT).keys()].find(i => !taken.has(i));
  if (seat === undefined) return false;
  update(id, p => ({ ...p, where: 'waiting', seat }));
  noteMove(id);
  nextKnockAt = playMs.value + rand(...KNOCK_GAP_MS);
  return true;
}

export function sendHome(id: number) {
  const p = byId(id);
  if (!p || p.where !== 'door') return;
  record(p, 'sentHome');
  update(id, q => ({ ...q, where: 'gone' }));
  nextKnockAt = playMs.value + rand(...KNOCK_GAP_MS);
}

// ---- waiting room ----

/** Asking gets the trouble out of anyone, however they talk. */
export function interview(id: number) {
  update(id, p => ({ ...p, chart: { ...p.chart, complaint: p.problem } }));
}

export function startThermo(id: number) {
  update(id, p => ({ ...p, thermoEndsAt: playMs.value + THERMO_MS }));
}

export function callIn(id: number): boolean {
  if (byId(id)?.where !== 'waiting' || at('doctor').length) return false;
  batch(() => {
    update(id, p => ({ ...p, where: 'doctor', seat: null, thermoEndsAt: null }));
    noteMove(id);
    if (focusId.value === id) focusId.value = null;
  });
  return true;
}

/** Past the doctor, straight to the help counter, with only the nurse's memo to go on. */
export function toCounter(id: number): boolean {
  if (byId(id)?.where !== 'waiting') return false;
  batch(() => {
    update(id, p => ({ ...p, where: 'counter', seat: null, thermoEndsAt: null, counterAt: playMs.value }));
    noteMove(id);
    if (focusId.value === id) focusId.value = null;
  });
  return true;
}

// ---- doctor room ----

/** What the instrument shows. Nothing is written down: the doctor ticks the chart by hand. */
export function examine(id: number, kind: ExamKind): Finding {
  const p = byId(id);
  return p ? PROBLEMS[p.problem].exams[kind] : 'ok';
}

/** Tick a finding on the chart, or rub it out by ticking it again. It is the doctor's own note and may be wrong. */
export function tickExam(id: number, kind: ExamKind, f: Finding) {
  update(id, p => {
    const exams = { ...p.chart.exams };
    if (exams[kind] === f) delete exams[kind];
    else exams[kind] = f;
    return { ...p, chart: { ...p.chart, exams } };
  });
}

export function circle(id: number, dx: ProblemId) {
  update(id, p => ({ ...p, chart: { ...p.chart, diagnosis: dx } }));
}

/** Stamping the chart finishes the examination and sends the patient to the counter. */
export function stamp(id: number) {
  if (byId(id)?.where !== 'doctor') return;
  update(id, p => ({ ...p, where: 'counter', counterAt: playMs.value, chart: { ...p.chart, stamped: true } }));
  noteMove(id);
}

// ---- counter ----

/** Only the fix for what is really wrong helps, whatever the paperwork says. */
export function judge(p: Patient, fix: FixId): 'cured' | 'wrong' {
  return fix === PROBLEMS[p.problem].fix ? 'cured' : 'wrong';
}

export function dispense(id: number, med: FixId) {
  const p = byId(id);
  if (!p || p.where !== 'counter') return;
  record(p, judge(p, med), med);
  update(id, q => ({ ...q, where: 'gone' }));
}

// ---- real-time clock ----

let lastTick = performance.now();

function tick() {
  const now = performance.now();
  // Clamp so a backgrounded tab does not jump the clock forward when it wakes up.
  const dt = Math.min(now - lastTick, 400);
  lastTick = now;
  if (gamePhase.value !== 'play' || paused.value) return;

  const t = playMs.value + dt;
  playMs.value = t;

  for (const p of patients.value) {
    if (p.thermoEndsAt !== null && t >= p.thermoEndsAt) {
      update(p.id, q => ({ ...q, thermoEndsAt: null, chart: { ...q.chart, temp: q.tempValue } }));
      sfx.beep();
    }
  }

  const open = t < DAY_MS;
  if (open && !at('door').length && t >= nextKnockAt) spawnVisitor();
  // After closing nobody new arrives, but everyone already here can still be finished.
  if (!open && !patients.value.some(p => p.where !== 'gone')) endDay();
}

const ticker = window.setInterval(tick, 100);
// When this file is hot-reloaded during development, stop the old clock.
import.meta.hot?.dispose(() => window.clearInterval(ticker));

document.addEventListener('visibilitychange', () => {
  if (document.hidden && gamePhase.value === 'play') paused.value = true;
});

if (import.meta.env.DEV) {
  // Handy from the browser console while testing.
  Object.assign(window, { clinic: { gamePhase, scene, day, playMs, patients, outcomes, paused, knock, focusId } });
}
