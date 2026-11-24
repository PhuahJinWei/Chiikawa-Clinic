// The pictures the player handles: the penlight, the mouth close-ups, the fixes on the shelf and
// the room signs. Each uses the drawing in src/assets/ when there is one (see src/assets/README.md),
// and the placeholder from art.tsx otherwise.

import type { Character, Finding, Fix, SceneId } from '../game/types';
import { FixArt, InsetArt, NavIcon, NoteIcon, ToolArt, type NoteKind } from './art';
import { asset } from './assets';

/** No alt text: each of these has its name written beside it, or must not say what it shows. */
const Picture = ({ url }: { url: string }) => <img src={url} alt="" draggable={false} />;

export function Tool() {
  const url = asset('tools/throat');
  return url ? <Picture url={url} /> : <ToolArt />;
}

export function Closeup({ f }: { f: Finding }) {
  const url = asset(`closeups/throat.${f}`);
  return url ? <Picture url={url} /> : <InsetArt f={f} />;
}

export function FixPic({ m }: { m: Fix }) {
  const url = asset(`fixes/${m.id}`);
  return url ? <Picture url={url} /> : <FixArt m={m} />;
}

/** The thing a character's personal trouble is about (`items/<id>`), or the toolbox if undrawn. */
export function Item({ c }: { c: Character }) {
  const url = asset(`items/${c.id}`) ?? asset('fixes/toolbox');
  return url ? <Picture url={url} /> : null;
}

export function Sign({ id }: { id: SceneId }) {
  const url = asset(`signs/${id}`);
  return url ? <Picture url={url} /> : <NavIcon id={id} />;
}

/** The pictures for what the nurse does, with their drawings: asking (`ui/ask`), the thermometer (`ui/temp`). */
const NOTE_ART: Partial<Record<NoteKind, string>> = { ear: 'ui/ask', temp: 'ui/temp' };

/** The small picture beside a note or on a ticket: how something was learned, or what a choice does. */
export function NotePic({ kind }: { kind: NoteKind }) {
  const key = NOTE_ART[kind];
  const url = key && asset(key);
  return url ? <Picture url={url} /> : <NoteIcon kind={kind} />;
}

/** The chart, for the button that turns to it: a drawing (`ui/chart`) or a plain clipboard in ink. */
export function ChartPic() {
  const url = asset('ui/chart');
  if (url) return <Picture url={url} />;
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="#5b4636" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="11" y="12" width="42" height="46" rx="5" fill="#fff9ee" />
      <rect x="23" y="5" width="18" height="13" rx="4" fill="#c9d2de" />
      <path d="M20 31h24M20 41h24M20 50h14" />
    </svg>
  );
}

/** The guide, for the button that opens it: a drawing (`ui/guide`) or a plain notebook in ink. */
export function BookPic() {
  const url = asset('ui/guide');
  if (url) return <Picture url={url} />;
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="#5b4636" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="14" y="8" width="38" height="48" rx="5" fill="#fff9ee" />
      <path d="M24 8v48" />
      <path d="M9 18h9M9 30h9M9 42h9" />
      <path d="M32 22h12M32 32h12" />
    </svg>
  );
}

/** "Go to": a room's sign with the arrow (`ui/go`) laid over it, for a choice that sends someone there. */
export function GoTo({ id }: { id: SceneId }) {
  const arrow = asset('ui/go');
  return (
    <span class="goto">
      <Sign id={id} />
      {arrow && <img class="goto-arrow" src={arrow} alt="" draggable={false} />}
    </span>
  );
}
