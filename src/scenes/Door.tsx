// Looking out through the peephole: the whole view is what the lens shows, bent toward the rim.
// Listen, look, then let them in or send them home. Either is the player's call; nothing judges it.

import { useState } from 'preact/hooks';
import { CHARACTERS, PROBLEMS } from '../game/data';
import { SEAT_COUNT, admit, closed, goTo, patients, scene, sendHome } from '../game/state';
import { UI, tr } from '../i18n';
import { sfx } from '../sfx';
import { cls } from '../stage/assets';
import { Bg, Cutout, useArrivals } from '../stage/Cutout';
import { peephole } from '../stage/lens';
import { GoTo } from '../stage/Props';
import { Talk } from '../ui/Talk';

/** Where the visitor stands outside the door. */
const SPOT = { x: 520, y: 1215, s: 1.9 };

export function Door() {
  const v = patients.value.find(p => p.where === 'door');
  const [exit, setExit] = useState<null | 'in' | 'home'>(null);
  const full = patients.value.filter(p => p.where === 'waiting').length >= SEAT_COUNT;

  const decide = (kind: 'in' | 'home') => {
    if (!v || exit) return;
    setExit(kind);
    if (kind === 'in') sfx.good();
    else sfx.page();
    // Let them walk off first; then the decision takes effect and we turn back to the room.
    window.setTimeout(() => {
      if (kind === 'in') admit(v.id);
      else sendHome(v.id);
      setExit(null);
      if (scene.value === 'door') goTo('waiting');
    }, 560);
  };

  const c = v && PROBLEMS[v.problem];
  const lens = peephole();
  const arrive = useArrivals();
  return (
    <>
      {lens.defs}
      {/* Only the outside world goes through the lens; the note and choices stay readable. */}
      <div class={cls("lens", lens.filter && "on")} style={lens.filter && `filter:${lens.filter}`}>
      <div class="world">
        <Bg id="door" />
        {v && c && (
          <Cutout
            key={v.id}
            char={v.char}
            x={SPOT.x}
            y={SPOT.y + (exit === 'in' ? 260 : exit === 'home' ? 120 : 0)}
            s={exit === 'in' ? 2.6 : exit === 'home' ? 1.6 : SPOT.s}
            gone={!!exit}
            problem={v.problem}
            enter={arrive(v.id)}
          />
        )}
      </div>
      </div>
      <div class="peep" />
      {/* Nobody outside: a slip says so, so the empty view does not look like something is missing. */}
      {!v && <p class="nobody">{tr(closed.value ? UI.closedNow : UI.nobody)}</p>}
      {v && c && !exit && (
        <Talk
          key={v.id}
          who={CHARACTERS[v.char]}
          say={tr(v.told)}
          note={{ kind: 'eye', text: tr(c.acts) }}
          opts={[
            { label: tr(UI.comeIn), sub: full ? tr(UI.full) : undefined, icon: <GoTo id="waiting" />, disabled: full, tone: 'yes', onPick: () => decide('in') },
            { label: tr(UI.takeCare), icon: <GoTo id="door" />, tone: 'no', onPick: () => decide('home') },
          ]}
        />
      )}
    </>
  );
}
