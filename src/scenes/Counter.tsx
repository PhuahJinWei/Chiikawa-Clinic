// Behind the help counter, where every visit ends. Read the paper that came with the patient
// (the doctor's note, or the nurse's memo if they skipped the doctor), put it down, pick the fix
// from the cabinet, which drops it into a paper bag on the tray, and hand it over. A personal trouble is sorted out from the toolbox, which
// opens a card with a picture of the thing in question and what to do about it.

import { useState } from 'preact/hooks';
import { CHARACTERS, FIXES, FIX_IDS, replyOf } from '../game/data';
import { EXIT_MS, dispense, judge, patients, shift } from '../game/state';
import type { FixId, Patient } from '../game/types';
import { UI, fmt, tr } from '../i18n';
import { sfx } from '../sfx';
import { BagArt, CABINET } from '../stage/art';
import { asset, cls } from '../stage/assets';
import { Bg, Cutout, Fg, Shelf, useArrivals } from '../stage/Cutout';
import { FixPic, Item } from '../stage/Props';
import { Note } from '../ui/Chart';
import { Bubble } from '../ui/Talk';

/** Where the patient at the counter stands, and where the next in line waits. */
const SPOT = { x: 500, y: 990, s: 1.7 };
const NEXT = { x: 765, y: 900, s: 1 };
/**
 * How far down its picture each fix's drawing reaches, as a fraction of the picture's height.
 * The pictures leave different gaps underneath, so each is lowered by its own gap to stand on
 * the shelf and not hover over it. A smaller number sets the fix lower. These are set by eye
 * against the cabinet's drawn shelf floors: the measured edge of a drawing includes faint stray
 * pixels below what is really drawn, so it cannot be trusted alone.
 */
const FIX_FOOT: Record<FixId, number> = { feverMed: 0.984, coldMed: 0.97, stomachMed: 0.887, compress: 0.87, toolbox: 0.975 };
/** How tall a fix is drawn in its cubby. Matches `.med img` in styles.css. */
const FIX_H = 150;

/** Top-left corner of each fix's cubby in the cabinet, in shelf order, left to right and down. */
const SLOTS = FIX_IDS.map((_, i) => ({
  left: CABINET.x + (i % CABINET.cols) * (CABINET.cell + CABINET.gap),
  top: CABINET.y + Math.floor(i / CABINET.cols) * (CABINET.row + CABINET.rail),
}));

/** What the patient at the desk is doing, which the scene needs to draw them: pleased, or on their way out. */
interface Mood {
  id: number;
  happy: boolean;
  leaving: boolean;
}

export function Counter() {
  const queue = patients.value
    .filter(p => p.where === 'counter')
    .sort((a, b) => (a.counterAt ?? 0) - (b.counterAt ?? 0));
  const arrive = useArrivals();
  const [mood, setMood] = useState<Mood | null>(null);
  const now = mood && mood.id === queue[0]?.id ? mood : null;
  return (
    <>
      <div class="world">
        <Bg id="counter" />
        <Shelf />
        {/* The one at the desk and the next in line. They keep their place in the list, so when
            the first leaves the second steps up to the desk instead of appearing there. */}
        {queue.slice(0, 2).map((q, i) => {
          const front = i === 0;
          const at = front ? SPOT : NEXT;
          return (
            <Cutout
              key={q.id}
              char={q.char}
              x={at.x}
              y={at.y}
              s={at.s}
              z={front ? 10 : 8}
              problem={q.problem}
              happy={front && !!now?.happy}
              enter={arrive(q.id)}
              // Helped, they go back out the way they came.
              leave={front && now?.leaving ? 'left' : undefined}
            />
          );
        })}
        <Fg id="counter" />
        <div class="edge-fade" />
      </div>
      <div class="vignette" />
      {/* Keyed by patient so the note comes back up and the pick is cleared for the next one. */}
      <Desk key={queue[0]?.id ?? 0} p={queue[0]} onMood={setMood} />
    </>
  );
}

function Desk({ p, onMood }: { p: Patient | undefined; onMood: (m: Mood) => void }) {
  const [noteUp, setNoteUp] = useState(true);
  const [picked, setPicked] = useState<FixId | null>(null);
  const [result, setResult] = useState<null | 'cured' | 'wrong'>(null);
  // They have said their piece and are on their way out.
  const [off, setOff] = useState(false);
  // The toolbox is for personal troubles. Taking it out for one shows what the trouble is and
  // what to do about it, on a card of its own.
  const [card, setCard] = useState(false);
  // The same arrow as on the choices that send someone somewhere: here it sends the bag across.
  const arrow = asset('ui/go');

  const give = () => {
    if (!p || !picked || result) return;
    const r = judge(p, picked);
    setCard(false);
    setResult(r);
    onMood({ id: p.id, happy: r === 'cured', leaving: false });
    if (r === 'cured') sfx.good();
    else sfx.bad();
    // Let them react, and leave time to read what they say; then they go, and are gone.
    window.setTimeout(() => {
      setOff(true);
      onMood({ id: p.id, happy: r === 'cured', leaving: true });
    }, 1600);
    window.setTimeout(() => dispense(p.id, picked), 1600 + EXIT_MS);
  };

  return (
    <>
      {FIX_IDS.map((id, i) => {
        const m = FIXES[id];
        const { left, top } = SLOTS[i];
        return (
          <button
            key={id}
            class={cls('med', picked === id && 'picked')}
            style={`left:${left}px;top:${top}px`}
            disabled={!p || !!result}
            onClick={() => {
              sfx.tap();
              setPicked(id);
              setCard(id === 'toolbox' && p?.problem === 'personal');
            }}
          >
            {/* Its name, on a card hanging from the board above. */}
            <span class="shelf-tag">{tr(m.name)}</span>
            {/* The fix itself, standing on the cubby's floor. */}
            <i class="med-pic" style={`margin-bottom:${Math.round(10 - (1 - FIX_FOOT[id]) * FIX_H)}px`}>
              <FixPic m={m} />
            </i>
          </button>
        );
      })}

      {/* While the paper is held up, a tap anywhere off it puts it down. */}
      {p && noteUp && (
        <div
          class="note-catcher"
          onClick={() => {
            sfx.page();
            setNoteUp(false);
          }}
        />
      )}
      {p && <Note p={p} doctor={shift.value.doctor} up={noteUp} onToggle={() => setNoteUp(u => !u)} />}

      {/* The tray on the counter, where things change hands. */}
      {p && <div class="salver" />}
      {p && picked && (
        <>
          {/* Once handed over, the bag goes across the counter to the patient. */}
          <div class={cls('bag', result && 'given')}>
            <BagArt part="back" />
            {/* Keyed so that a different pick drops into the bag afresh. */}
            <div class="bag-item" key={picked}>
              <FixPic m={FIXES[picked]} />
            </div>
            <BagArt part="front" />
            <span class="bag-name">{fmt(UI.bagFor, { name: tr(CHARACTERS[p.char].name) })}</span>
          </div>
          <button class="tag opt give" disabled={!!result} onClick={give}>
            <i class="pic">{arrow && <img src={arrow} alt="" draggable={false} />}</i>
            <span>{tr(UI.handOver)}</span>
          </button>
        </>
      )}
      {p && card && !result && (
        <div class="overlay" onClick={() => setCard(false)}>
          <div class="helpcard paper taped" onClick={e => e.stopPropagation()}>
            <div class="helpcard-art">
              <Item c={CHARACTERS[p.char]} />
            </div>
            <h2>{tr(CHARACTERS[p.char].personal.complaint)}</h2>
            <p>{tr(CHARACTERS[p.char].personal.help)}</p>
            <button class="tag opt act" onClick={give}>
              <span>{tr(CHARACTERS[p.char].personal.act)}</span>
            </button>
          </div>
        </div>
      )}
      {p && result && !off && <Bubble who={CHARACTERS[p.char]} say={tr(replyOf(p.char, p.problem, result === 'cured'))} reply />}
    </>
  );
}
