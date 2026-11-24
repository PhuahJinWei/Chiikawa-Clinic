// Always on screen while playing: the wall clock, the four rooms as index tabs down the left edge,
// and in the bottom-right corner a cutout of whoever you currently are.

import { CHARACTERS, ROLE_JOB, ROLE_NAME } from '../game/data';
import { clockMin, closed, goTo, knock, patients, paused, scene, shift, timeOfDay } from '../game/state';
import type { Character, Job, L10n, Role, SceneId, Where } from '../game/types';
import { UI, tr } from '../i18n';
import { sfx } from '../sfx';
import { SkyIcon } from '../stage/art';
import { asset, cls } from '../stage/assets';
import { Sign } from '../stage/Props';

const SCENES: { id: SceneId; label: L10n }[] = [
  { id: 'door', label: UI.navDoor },
  { id: 'waiting', label: UI.navWaiting },
  { id: 'doctor', label: UI.navDoctor },
  { id: 'counter', label: UI.navCounter },
];

/** Which staff member the player is while standing in each room. */
export const roleIn = (s: SceneId): Role => (s === 'doctor' ? 'doctor' : s === 'counter' ? 'counter' : 'nurse');

/** The icon for a character's face: in uniform (`icons/<id>.nurse`) when at work, else `icons/<id>`. */
const faceUrl = (c: Character, job?: Job) => (job && asset(`icons/${c.id}.${job}`)) || asset(`icons/${c.id}`);

/** A character's face in a small circle: their drawn icon, or a tinted initial. */
export function Face({ c, job }: { c: Character; job?: Job }) {
  const url = faceUrl(c, job);
  if (url) {
    return (
      <i class="face pic">
        <img src={url} alt="" draggable={false} />
      </i>
    );
  }
  return (
    <i class="face" style={`background:${c.body};border-color:${c.accent}`}>
      {tr(c.name)[0]}
    </i>
  );
}

export function Hud() {
  const m = clockMin.value;
  const time = `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const count = (w: Where) => patients.value.filter(p => p.where === w).length;
  const pause = () => {
    sfx.tap();
    paused.value = true;
  };
  return (
    <>
    <div class="hud">
      <button class="clock" onClick={pause}>
        {/* A wall clock whose hands follow the clinic's day, with the light outside pinned to it. */}
        <span class="dial">
          <i class="hand hour" style={`rotate:${((m / 60) % 12) * 30}deg`} />
          <i class="hand min" style={`rotate:${(m % 60) * 6}deg`} />
        </span>
        <SkyIcon t={timeOfDay.value} />
        <span class="time">{closed.value ? tr(UI.closedNow) : time}</span>
      </button>
      <nav class="nav">
        {SCENES.map(({ id, label }) => {
          const n = count(id);
          const badge = id === 'door' ? (n ? '!' : '') : n ? String(n) : '';
          return (
            <button
              key={id}
              class={cls('sign', id, scene.value === id && 'on', id === 'door' && knock.value && 'alert')}
              onClick={() => {
                sfx.tap();
                goTo(id);
              }}
            >
              <Sign id={id} />
              <span>
                {tr(label)}
                {/* The room you are in is ringed in red pen. */}
                {scene.value === id && <i class="ring" />}
              </span>
              {badge && <b class="dot">{badge}</b>}
            </button>
          );
        })}
      </nav>
    </div>
    {/* The way to the pause note, and through it to the settings: two bars, in the top-right
        corner. Tapping the clock does the same. */}
    <button class="pause-btn" aria-label={tr(UI.paused)} onClick={pause} />
    </>
  );
}

/**
 * Who you are right now: a cutout of them in uniform, peeking up from the bottom-right corner.
 * It is drawn inside the room, so the room's notes and buttons sit on top of it.
 */
export function Me() {
  const role = roleIn(scene.value);
  const me = CHARACTERS[shift.value[role]];
  const job = ROLE_JOB[role];
  // The whole drawing of them in uniform, standing in the corner like a cutout.
  const cutout = asset(`characters/${me.id}.${job}`) ?? asset(`characters/${me.id}`);
  // The pause note has the nurse standing beside it, so the corner stays empty while paused.
  if (paused.value) return null;

  return (
    <div class={cls('me', !cutout && 'badge')} role="img" aria-label={`${tr(ROLE_NAME[role])}: ${tr(me.name)}`}>
      {cutout ? <img src={cutout} alt="" draggable={false} /> : <Face c={me} job={job} />}
    </div>
  );
}
