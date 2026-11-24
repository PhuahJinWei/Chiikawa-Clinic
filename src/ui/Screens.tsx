// Everything that is not the clinic itself: the title, the morning line-up, pause, and the day's log.
// Each is a small scene of its own, built from the same rooms and cutouts as the game.

import { CHARACTERS, PROBLEMS, ROLE_JOB, ROLE_NAME, ROLE_PLACE } from '../game/data';
import { day, endDay, gamePhase, nextDay, outcomes, paused, shift, startDay } from '../game/state';
import type { CharId, Job, Outcome, Role, SceneId } from '../game/types';
import { UI, fmt, lang, setLang, tr } from '../i18n';
import { useEffect, useState } from 'preact/hooks';
import { sfx, soundOn } from '../sfx';
import { asset, cls } from '../stage/assets';
import { lensOn, setLens } from '../stage/lens';
import { Bg, Cutout, Fg } from '../stage/Cutout';
import { Sign } from '../stage/Props';
import { standY } from '../stage/stand';
import { view } from '../stage/Stage';
import { Seal } from './Chart';

const ROLES: Role[] = ['nurse', 'doctor', 'counter'];

/**
 * One setting, on paper: its choices are written out, and the one in force is ringed in red pen.
 * `latin` marks a choice written in the Latin alphabet, which the Japanese hand has no small letters for.
 */
function Choose<T>({ label, value, options, onPick }: { label: string; value: T; options: { v: T; name: string; latin?: boolean }[]; onPick: (v: T) => void }) {
  return (
    <div class="setting">
      <span>{label}</span>
      <div class="choose">
        {options.map(o => (
          <button key={o.name} class={cls(o.v === value && 'on', o.latin && 'latin')} role="radio" aria-checked={o.v === value} onClick={() => onPick(o.v)}>
            {o.name}
            {o.v === value && <i class="ring" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The language, as a setting to ring. Each is written in its own language. */
function LangChoice() {
  return (
    <Choose
      label={tr(UI.language)}
      value={lang.value}
      options={[
        { v: 'ja' as const, name: 'にほんご' },
        { v: 'en' as const, name: 'English', latin: true },
      ]}
      onPick={l => {
        sfx.tap();
        setLang(l);
      }}
    />
  );
}

/** On phones that allow it (Android), fill the screen and lock to landscape. Elsewhere this does nothing. */
function goFullscreen() {
  if (!window.matchMedia('(pointer: coarse)').matches) return;
  const root = document.documentElement as HTMLElement & { requestFullscreen?: () => Promise<void> };
  const orientation = window.screen.orientation as unknown as { lock?: (o: string) => Promise<void> } | undefined;
  root
    .requestFullscreen?.()
    .then(() => orientation?.lock?.('landscape'))
    .catch(() => {
      /* not supported here; the stage rotates itself instead */
    });
}

/**
 * Where the title's staff stand: in a row outside the clinic, two each side of the start sign,
 * with room between them, their feet on one line of the ground (`TITLE_GROUND`).
 */
const TITLE_CAST: { char: CharId; job: Job; x: number; s: number; z: number }[] = [
  { char: 'hachiware', job: 'nurse', x: 185, s: 0.8, z: 5 },
  { char: 'chiikawa', job: 'nurse', x: 530, s: 0.84, z: 6 },
  { char: 'usagi', job: 'nurse', x: 1745, s: 0.8, z: 5 },
  { char: 'rakko', job: 'doctor', x: 1400, s: 0.84, z: 6 },
];

/** Where the title's staff's feet are, down the screen: on the ground, a little in front of the wall. */
const TITLE_GROUND = 1072;

/**
 * The title: outside the clinic, under its signboard, with the staff waiting either side of the
 * doors. The start button is a signboard standing on the ground in front of the doors,
 * and the language is a small notice taped to the glass. The picture (`bg/title`) has the clinic's name on it; without one, the door
 * view stands in, with the name on a board of the game's own.
 */
export function Title() {
  const front = asset('bg/title');
  const logo = asset('ui/logo');
  return (
    <div class="screen title">
      {front ? (
        <img class="bg" src={front} alt={tr(UI.title)} draggable={false} />
      ) : (
        <>
          <Bg id="door" />
          <div class="wash" />
          <div class="signboard paper">{logo ? <img src={logo} alt={tr(UI.title)} draggable={false} /> : <h1>{tr(UI.title)}</h1>}</div>
        </>
      )}
      {/* A shadow on the ground under each of them, so they stand on it. */}
      {TITLE_CAST.map(c => (
        <i key={c.char} class="ground-shadow" style={`left:${c.x - 130}px;top:${TITLE_GROUND - 16}px`} />
      ))}
      {TITLE_CAST.map(c => (
        <Cutout key={c.char} char={c.char} x={c.x} y={standY(c.char, c.job, c.s, TITLE_GROUND)} s={c.s} z={c.z} job={c.job} />
      ))}
      <div class="door-note paper taped">
        <LangChoice />
      </div>
      <p class="fan-note">{tr(UI.fanNote)}</p>
      {view.value.rotated && <p class="turn-hint">{tr(UI.turnPhone)}</p>}
      <button
        class="tag big yes start"
        onClick={() => {
          sfx.good();
          goFullscreen();
          gamePhase.value = 'intro';
        }}
      >
        {/* Only the word moves, a slow nod, so the screen is not quite still. */}
        <span>{tr(UI.start)}</span>
      </button>
    </div>
  );
}

/**
 * Where today's three stand behind the counter, left to right: nurse, doctor, reception. They
 * are sized so that the widest drawings (long ears, a mane, a big tail) still leave a gap between
 * neighbours, and stand high enough to show head and shoulders over the counter.
 */
const LINEUP_X = [330, 790, 1250];
const LINEUP_S = 0.94;
const LINEUP_Y = 968;

/** The room sign printed on each name card, for where that job is done. */
const ROLE_SIGN: Record<Role, SceneId> = { nurse: 'door', doctor: 'doctor', counter: 'counter' };

/** How long the opening moment runs before the day starts by itself. */
const OPENING_MS = 1700;
/** When, after the line-up comes on screen, yesterday's page comes off the calendar. */
const TEAR_MS = 550;

/**
 * The morning line-up: today's staff behind the counter, each with a name card in front, under a
 * taped-up heading. The day is on a tear-off calendar on the wall, with a memo under it for
 * whoever is off. All of it is paper in the clinic's one ink, the names written by hand.
 *
 * It arrives as a small scene: the calendar hangs large in the middle, yesterday's page comes
 * off, the calendar goes to its place on the wall, and the staff and their cards turn up one
 * after another. Opening the clinic is another: the clinic from outside, a bell, and in. Neither
 * can be skipped: they are short, and they are the pause between one day and the next.
 */
export function Intro() {
  const s = shift.value;
  const n = day.value;
  // "{n}にちめ" or "Day {n}": the number is printed large, the word small beside it.
  const [before, after] = tr(UI.dayN).split('{n}');
  const [opening, setOpening] = useState(false);
  const outside = asset('bg/title') ?? asset('bg/door.day');

  // The sound of the page coming off.
  useEffect(() => {
    if (n < 2) return;
    const id = window.setTimeout(() => sfx.page(), TEAR_MS);
    return () => window.clearTimeout(id);
  }, [n]);

  // Once the doors are opening, the day starts when the moment is over.
  useEffect(() => {
    if (!opening) return;
    const id = window.setTimeout(startDay, OPENING_MS);
    return () => window.clearTimeout(id);
  }, [opening]);

  const page = (num: number) => (
    <>
      {before.trim() && <small>{before.trim()}</small>}
      <b>{num}</b>
      {after.trim() && <small>{after.trim()}</small>}
    </>
  );

  return (
    <div class="screen intro">
      <Bg id="counter" />
      {ROLES.map((r, i) => (
        <Cutout key={r} char={s[r]} x={LINEUP_X[i]} y={LINEUP_Y} s={LINEUP_S} z={5} job={ROLE_JOB[r]} />
      ))}
      <Fg id="counter" />
      <div class="banner paper taped">{tr(UI.shiftTitle)}</div>
      <div class="calendar">
        {page(n)}
        {/* Yesterday's page, still on top, about to come off. */}
        {n > 1 && <i class="cal-old">{page(n - 1)}</i>}
      </div>
      {ROLES.map((r, i) => (
        <div key={r} class="plate" style={`left:${LINEUP_X[i] - 200}px;--i:${i}`}>
          <span>
            <Sign id={ROLE_SIGN[r]} />
            {tr(ROLE_NAME[r])}
          </span>
          <b>{tr(CHARACTERS[s[r]].name)}</b>
          <small>{tr(ROLE_PLACE[r])}</small>
        </div>
      ))}
      {s.off.length > 0 && (
        <p class="sticky">
          {s.off.map(id => (
            <span key={id}>{fmt(UI.dayOff, { name: tr(CHARACTERS[id].name) })}</span>
          ))}
        </p>
      )}
      <button
        class="tag big yes start"
        onClick={() => {
          // Without a picture of the clinic there is nothing to show, so the day just starts.
          if (outside) {
            sfx.bell();
            setOpening(true);
          } else {
            sfx.good();
            startDay();
          }
        }}
      >
        {tr(UI.openUp)}
      </button>
      {/* Opening: the clinic from outside, the view moving in on its doors, then white. */}
      {opening && outside && (
        <div class="opening">
          <img class="bg" src={outside} alt="" draggable={false} />
          <p class="opening-word paper taped">{tr(UI.openUp)}</p>
          <i class="opening-white" />
        </div>
      )}
    </div>
  );
}

/** Taking a breather: today's nurse, in uniform, stands beside a taped-up note with the settings on it. */
export function Pause() {
  const onOff = [
    { v: true, name: tr(UI.on) },
    { v: false, name: tr(UI.off) },
  ];
  return (
    <div class="overlay pause">
      {/* She stands close, cut off by the bottom of the screen like the cutout in the corner, so
          she is in front of the room and not hanging in it. */}
      <Cutout char={shift.value.nurse} x={262} y={1250} s={1.7} z={49} job="nurse" />
      <div class="card paper taped">
        <h1>{tr(UI.paused)}</h1>
        <div class="settings">
          <LangChoice />
          <Choose
            label={tr(UI.sound)}
            value={soundOn.value}
            options={onOff}
            onPick={on => {
              soundOn.value = on;
              sfx.tap();
            }}
          />
          <Choose
            label={tr(UI.lens)}
            value={lensOn.value}
            options={onOff}
            onPick={on => {
              sfx.tap();
              setLens(on);
            }}
          />
        </div>
        <div class="pause-buttons">
          {/* Closing early is the smaller, quieter button. */}
          <button
            class="tag end"
            onClick={() => {
              sfx.page();
              endDay();
            }}
          >
            {tr(UI.endDay)}
          </button>
          <button
            class="tag big yes"
            onClick={() => {
              sfx.tap();
              paused.value = false;
            }}
          >
            {tr(UI.resume)}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The red-pen mark beside a line of the day's log: a circle for spot on, a triangle for not quite. */
function Mark({ r }: { r: Outcome['result'] }) {
  return (
    <svg class="mark" viewBox="0 0 60 60" aria-hidden="true">
      {r === 'cured' && <ellipse cx="30" cy="30" rx="22" ry="20" transform="rotate(-8 30 30)" />}
      {r === 'wrong' && <path d="M30 10L52 49H8Z" />}
      {(r === 'sentHome' || r === 'unfinished') && <path class="none" d="M16 31H44" />}
    </svg>
  );
}

function resultLine(o: Outcome): string {
  const truth = PROBLEMS[o.problem];
  switch (o.result) {
    case 'cured':
      return tr(UI.resCured);
    case 'wrong':
      return fmt(UI.resWrong, { dx: tr(truth.name) });
    case 'sentHome':
      return tr(UI.resHome);
    case 'unfinished':
      return tr(UI.resUnfinished);
  }
}

/** Where the day's three stand beside the log, left to right (nurse, doctor, reception), and the line their feet are on. */
const SUMMARY_X = [150, 420, 690];
const SUMMARY_GROUND = 1040;

/**
 * The end of the day: night outside, the staff done for the day, and the day's log to read. It
 * opens with a moment for closing time. The
 * log is written by hand, marked in red pen the way homework is, and sealed by the doctor.
 */
export function Summary() {
  const list = outcomes.value;
  const s = shift.value;
  const count = (...rs: Outcome['result'][]) => list.filter(o => rs.includes(o.result)).length;
  // Closing time has its own sound, as the day's light goes.
  useEffect(() => sfx.close(), []);
  return (
    <div class="screen summary">
      <Bg id="door" />
      <div class="wash" />
      {/* Closing time: the day's light goes, a slip says the clinic is shut, and only then do the
          staff and the day's log come in. */}
      <i class="dusk" />
      <p class="closing-word paper taped">{tr(UI.dayOver)}</p>
      {/* The three who were on shift, side by side on the ground beside the day's log. */}
      {SUMMARY_X.map(x => (
        <i key={x} class="ground-shadow" style={`left:${x - 130}px;top:${SUMMARY_GROUND - 16}px`} />
      ))}
      {ROLES.map((r, i) => (
        <Cutout key={r} char={s[r]} x={SUMMARY_X[i]} y={standY(s[r], ROLE_JOB[r], 0.7, SUMMARY_GROUND)} s={0.7} z={5} job={ROLE_JOB[r]} />
      ))}
      <div class="report paper taped">
        <h1>{fmt(UI.sumTitle, { n: day.value })}</h1>
        <Seal by={s.doctor} />
        {/* The day's three totals, as three boxes of the form. */}
        <div class="totals">
          <div>
            <small>{tr(UI.sumSeen)}</small>
            <b>{count('cured', 'wrong')}</b>
          </div>
          <div>
            <small>
              <Mark r="cured" />
              {tr(UI.sumCured)}
            </small>
            <b>{count('cured')}</b>
          </div>
          <div>
            <small>{tr(UI.sumHome)}</small>
            <b>{count('sentHome')}</b>
          </div>
        </div>
        {list.length ? (
          <ul class="results">
            {list.map((o, i) => (
              <li key={i} class={o.result}>
                <Mark r={o.result} />
                <b>{tr(CHARACTERS[o.char].name)}</b>
                <span>{resultLine(o)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p class="hint">{tr(UI.noPatients)}</p>
        )}
        <button
          class="tag big yes"
          onClick={() => {
            sfx.good();
            nextDay();
          }}
        >
          {tr(UI.nextDay)}
        </button>
      </div>
    </div>
  );
}
