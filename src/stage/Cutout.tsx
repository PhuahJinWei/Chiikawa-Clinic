// A character standing in a scene as a paper cutout.
// Position is where its feet touch the ground, in stage pixels. Moving or resizing one that is
// already on stage animates, which is how a seated patient "comes to the camera". Standing still,
// a cutout does not move at all.

import { useEffect, useRef } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { CHARACTERS, PROBLEMS } from '../game/data';
import { justArrived, timeOfDay } from '../game/state';
import type { CharId, Job, ProblemId, SceneId, TimeOfDay } from '../game/types';
import { tr } from '../i18n';
import { BgArt, CharArt, DeskArt, FgArt, FxArt, ShelfArt } from './art';
import { asset, cls } from './assets';

/** The box every character is drawn in at scale 1. Real art is fitted inside it, feet at the bottom. */
export const CUTOUT_W = 400;
export const CUTOUT_H = 460;

interface CutoutProps {
  char: CharId;
  x: number;
  y: number;
  s?: number;
  z?: number;
  /** What is wrong with them, which decides the drawing: `characters/<id>.<problem>`. */
  problem?: ProblemId;
  /** Just helped: `characters/<id>.happy`, and the trouble no longer shows. */
  happy?: boolean;
  /** On the bench: `characters/<id>.sit`, the same whatever the trouble. */
  sit?: boolean;
  /** At work, in uniform: `characters/<id>.nurse` or `characters/<id>.doctor`. */
  job?: Job;
  /** Fade out, for a character who is leaving. */
  gone?: boolean;
  /**
   * How they come on, decided once when they first appear: `none` for someone already in the room
   * when you walk in, `left` for someone arriving while you watch. Left out, they hop up.
   */
  enter?: 'none' | 'left';
  /** Sliding out of the room: `right` for on to the next room, `left` for back out and home. */
  leave?: 'left' | 'right';
  onTap?: () => void;
  children?: ComponentChildren;
}

export function Cutout({ char, x, y, s = 1, z = 10, problem, happy, sit, job, gone, enter, leave, onTap, children }: CutoutProps) {
  const c = CHARACTERS[char];
  // Fixed at the first appearance: changing it later would play the entrance again.
  const came = useRef(enter).current;
  // Their own drawing of the trouble (momonga.fever.png) wins over the plain one (momonga.png).
  const look = job ?? (happy ? 'happy' : problem);
  // Seated, a character has one drawing (momonga.sit.png) whatever is wrong with them, unless
  // the trouble shows while sitting and has a drawing of its own (usagi.sit.personal.png).
  const seated = sit ? (problem && asset(`characters/${char}.sit.${problem}`)) || asset(`characters/${char}.sit`) : undefined;
  const own = seated || (look && asset(`characters/${char}.${look}`));
  const url = own || asset(`characters/${char}`);
  // Without a drawing of their own for it, the trouble is shown by marks over whatever stands in.
  const fx = problem && !happy && !own ? PROBLEMS[problem].fx : [];
  const mood = happy ? 'happy' : problem ? 'sick' : 'neutral';
  const style = `translate:${x - CUTOUT_W / 2}px ${y - CUTOUT_H}px;scale:${s};z-index:${z}`;
  return (
    <div class={cls('cutout', onTap && 'tappable', gone && 'gone', came && `in-${came}`, leave && `out-${leave}`)} style={style} onClick={onTap}>
      <div class="wob">
        {url ? <img src={url} alt={tr(c.name)} draggable={false} /> : <CharArt c={c} mood={mood} />}
        <FxArt fx={fx} />
      </div>
      {children}
    </div>
  );
}

/**
 * For a room's patients: how each should come on. Anyone there when the room is entered is simply
 * there, unless they have only just been sent in; anyone who turns up afterwards slides in from
 * the left, the way in.
 */
export function useArrivals(): (id: number) => 'none' | 'left' {
  const settled = useRef(false);
  useEffect(() => {
    settled.current = true;
  }, []);
  return id => (settled.current || justArrived(id) ? 'left' : 'none');
}

const TIMES: readonly TimeOfDay[] = ['day', 'evening', 'night'];

/** A room's picture at each time of day: `bg/door.night` where it is drawn, otherwise the plain `bg/door`. */
const bgByTime = (id: SceneId) => {
  const plain = asset(`bg/${id}`);
  return TIMES.map(t => asset(`bg/${id}.${t}`) ?? plain);
};

/**
 * A room's background. A room drawn at several times of day shows the one for the clinic clock,
 * and when the clock moves on while you are in the room the next fades in over it. Only what is
 * showing is kept on the page: these are the biggest pictures in the game, and a phone that runs
 * short of memory reloads the page.
 */
export function Bg({ id }: { id: SceneId }) {
  const now = TIMES.indexOf(timeOfDay.value);
  // The time of day when this room was walked into. Nothing fades in for being there already.
  const cameAt = useRef(now).current;
  const urls = bgByTime(id);
  if (!urls.some(Boolean)) return <BgArt id={id} />;
  // The pictures the room has, each with the time of day it starts at.
  const stages = urls.flatMap((url, from) => (url && url !== urls[from - 1] ? [{ url, from }] : []));
  const at = stages.reduce((last, s, i) => (s.from <= now ? i : last), -1);
  const current = stages[at];
  // The one before stays underneath only while the new one fades in over it.
  const changed = !!current && current.from > cameAt;
  const under = changed ? stages[at - 1] : undefined;
  return (
    <>
      {!urls[0] && <BgArt id={id} />}
      {under && <img key={under.from} class="bg" src={under.url} alt="" draggable={false} />}
      {current && <img key={current.from} class={cls('bg', changed && 'fade')} src={current.url} alt="" draggable={false} />}
    </>
  );
}

export function Fg({ id }: { id: 'doctor' | 'counter' }) {
  const url = asset(`fg/${id}`);
  if (url) return <img class="fg" src={url} alt="" draggable={false} />;
  // A drawn room already has its desk in the picture, so the placeholder desk would cover it.
  return bgByTime(id).some(Boolean) ? null : <FgArt id={id} />;
}

/** The medicine shelf on the wall behind the counter: a layer over the wall, under everyone else. */
export function Shelf() {
  const url = asset('bg/counter-shelf');
  return url ? <img class="bg" src={url} alt="" draggable={false} /> : <ShelfArt />;
}

/** The doctor's side desk, which the chart lies on (see DeskArt). */
export function Desk() {
  const url = asset('fg/doctor-desk');
  return url ? <img src={url} alt="" draggable={false} /> : <DeskArt />;
}
