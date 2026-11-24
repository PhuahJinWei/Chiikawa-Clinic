// A character talking to you: what they say in a speech bubble with its tail toward them, what you
// can see or have found out on a strip of note paper under it, and your choices below that.
// Used at the door and when a waiting patient is brought to the front. The bubble alone is also
// what a patient answers with at the counter.

import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { Character } from '../game/types';
import { tr } from '../i18n';
import { sfx } from '../sfx';
import type { NoteKind } from '../stage/art';
import { NotePic } from '../stage/Props';
import { cls } from '../stage/assets';
import { Face } from './Hud';

/** A tick in red pen, for something already done. */
export function Tick() {
  return (
    <svg class="ticked" viewBox="0 0 40 36" aria-hidden="true">
      <path d="M5 19L15 30L35 6" />
    </svg>
  );
}

export interface Opt {
  label: string;
  /** Small second line, for example why the choice is unavailable. */
  sub?: string;
  /** A small picture in front of the label. */
  icon?: ComponentChildren;
  tone?: 'yes' | 'no';
  disabled?: boolean;
  /** Already done for this patient: it is ticked off in red pen. */
  done?: boolean;
  onPick: () => void;
}

/** Text that writes itself out. Tap to finish it at once. */
function Typed({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return;
    const id = window.setTimeout(() => setN(n + 1), 22);
    return () => window.clearTimeout(id);
  }, [n, text]);
  return (
    <p class="say" onClick={() => setN(text.length)}>
      {text.slice(0, n)}
      {/* The unwritten part still takes up space, so lines do not jump as they fill in. */}
      <span class="ghost">{text.slice(n)}</span>
    </p>
  );
}

interface TalkProps {
  who: Character;
  say: string;
  /** What you notice or have learned, and which sense it came by. */
  note?: { kind: NoteKind; text: string };
  opts: Opt[];
}

/**
 * The speech bubble: who is speaking on a tab, and their words, no bigger than they need. `reply`
 * is the one over the counter, said all at once with its tail pointing down at the speaker.
 */
export function Bubble({ who, say, reply }: { who: Character; say: string; reply?: boolean }) {
  return (
    <div class={cls('talk', who.lettering, reply && 'reply')}>
      <div class="who">
        <Face c={who} />
        {tr(who.name)}
      </div>
      {reply ? <p class="say">{say}</p> : <Typed key={say} text={say} />}
    </div>
  );
}

export function Talk({ who, say, note, opts }: TalkProps) {
  return (
    <>
      <Bubble who={who} say={say} />
      {note && (
        // Keyed so a new finding pops in afresh.
        <p class="seen" key={note.kind + note.text}>
          <NotePic kind={note.kind} />
          <span>{note.text}</span>
        </p>
      )}
      {opts.map((o, i) => (
        <button
          key={i}
          class={cls('tag', 'opt', `o${i}`, o.tone, o.done && 'done')}
          disabled={o.disabled || o.done}
          onClick={() => {
            sfx.tap();
            o.onPick();
          }}
        >
          <i class="pic">{o.icon}</i>
          <span>
            {o.label}
            {o.sub && <small>{o.sub}</small>}
          </span>
          {/* Done already: a tick in red pen. */}
          {o.done && <Tick />}
        </button>
      ))}
    </>
  );
}
