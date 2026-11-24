// The waiting room. Patients sit on the bench until tapped, then come to the front so the nurse
// can ask what is wrong, take a temperature, and sort them: in to the doctor if they look ill,
// or straight to the help counter when no doctor is needed.

import { useState } from 'preact/hooks';
import { CHARACTERS, PROBLEMS, complaintOf } from '../game/data';
import { EXIT_MS, THERMO_MS, callIn, focusId, interview, patients, playMs, startThermo, toCounter } from '../game/state';
import type { Patient } from '../game/types';
import { UI, fmt, tr } from '../i18n';
import { sfx } from '../sfx';
import type { NoteKind } from '../stage/art';
import { Bg, Cutout, useArrivals } from '../stage/Cutout';
import { GoTo, NotePic } from '../stage/Props';
import { Talk } from '../ui/Talk';

/** Seat positions, nearest first: down the middle of the seat cushion, between its back and its front edge. */
const SEATS = [
  { x: 540, y: 965, s: 1.1 },
  { x: 810, y: 765, s: 0.92 },
  { x: 1060, y: 580, s: 0.76 },
];
/** Where a patient stands once brought to the front. */
const FRONT = { x: 520, y: 1215, s: 1.9 };

/**
 * The slip over a patient's head: while the thermometer is in, its picture and three dots that
 * fill in as it counts; once it has beeped, the reading.
 */
function Thermo({ p }: { p: Patient }) {
  if (p.thermoEndsAt !== null) {
    const left = Math.max(0, p.thermoEndsAt - playMs.value);
    const done = Math.min(2, Math.floor((1 - left / THERMO_MS) * 3));
    return (
      <div class="slip thermo">
        <NotePic kind="temp" />
        <span class="dots">
          {[0, 1, 2].map(i => (
            <i key={i} class={i <= done ? 'on' : undefined} />
          ))}
        </span>
      </div>
    );
  }
  if (p.chart.temp !== null) {
    return (
      <div class="slip temp-tag">
        <NotePic kind="temp" />
        {p.chart.temp.toFixed(1)}℃
      </div>
    );
  }
  return null;
}

export function Waiting() {
  const list = patients.value.filter(p => p.where === 'waiting');
  const fid = focusId.value;
  const f = list.find(p => p.id === fid);
  const doctorBusy = patients.value.some(p => p.where === 'doctor');
  // The last thing the nurse did, and with whom. It decides what the note says for that patient.
  const [did, setDid] = useState<{ id: number; what: 'ask' | 'thermo' } | null>(null);
  // Someone who has been sent on, sliding out before they actually go.
  const [leaving, setLeaving] = useState<number | null>(null);
  const arrive = useArrivals();
  const send = (id: number, go: (id: number) => boolean) => {
    sfx.good();
    setLeaving(id);
    window.setTimeout(() => {
      go(id);
      setLeaving(null);
    }, EXIT_MS);
  };

  let talk = null;
  if (f && leaving !== f.id) {
    const c = PROBLEMS[f.problem];
    const measuring = f.thermoEndsAt !== null;
    const temp = f.chart.temp;
    const last = did?.id === f.id ? did.what : null;
    // The bubble is always what they said. The strip under it is the newest thing the nurse knows:
    // what she can see, then what asking or the thermometer turned up.
    const note: { kind: NoteKind; text: string } =
      last === 'ask'
        ? { kind: 'ear', text: tr(complaintOf(f.char, f.problem)) }
        : last === 'thermo'
          ? { kind: 'temp', text: temp !== null ? fmt(UI.tempNote, { t: temp.toFixed(1) }) : tr(UI.measuringNote) }
          : { kind: 'eye', text: tr(c.acts) };
    talk = (
      <Talk
        key={f.id}
        who={CHARACTERS[f.char]}
        say={tr(f.told)}
        note={note}
        opts={[
          {
            label: tr(f.chart.complaint ? UI.asked : UI.ask),
            icon: <NotePic kind="ear" />,
            done: !!f.chart.complaint,
            onPick: () => {
              interview(f.id);
              setDid({ id: f.id, what: 'ask' });
            },
          },
          {
            label: temp !== null ? fmt(UI.tempDone, { t: temp.toFixed(1) }) : measuring ? tr(UI.measuring) : tr(UI.temp),
            icon: <NotePic kind="temp" />,
            disabled: measuring,
            done: temp !== null,
            onPick: () => {
              startThermo(f.id);
              setDid({ id: f.id, what: 'thermo' });
            },
          },
          {
            label: tr(UI.sendIn),
            icon: <GoTo id="doctor" />,
            sub: doctorBusy ? tr(UI.doctorBusy) : undefined,
            disabled: doctorBusy || measuring,
            tone: 'yes',
            onPick: () => send(f.id, callIn),
          },
          {
            // Tapping the dimmed room steps back, so the fourth choice is free for the shortcut.
            label: tr(UI.sendCounter),
            icon: <GoTo id="counter" />,
            disabled: measuring,
            tone: 'yes',
            onPick: () => send(f.id, toCounter),
          },
        ]}
      />
    );
  }

  return (
    <>
      <div class="world">
        <Bg id="waiting" />
        {f && <div class="dimmer" onClick={() => (focusId.value = null)} />}
        {list.map(p => {
          const on = p.id === fid;
          const spot = on ? FRONT : SEATS[p.seat ?? 0];
          return (
            <Cutout
              key={p.id}
              char={p.char}
              x={spot.x}
              y={spot.y}
              s={spot.s}
              // Nearer seats overlap farther ones; the focused patient is above the dimmer.
              z={on ? 40 : 20 - (p.seat ?? 0)}
              problem={p.problem}
              // Brought to the front, they have got up to talk.
              sit={!on}
              enter={arrive(p.id)}
              // Sent on to the doctor or the counter: out to the right.
              leave={leaving === p.id ? 'right' : undefined}
              onTap={
                on
                  ? undefined
                  : () => {
                      sfx.tap();
                      focusId.value = p.id;
                    }
              }
            >
              <Thermo p={p} />
            </Cutout>
          );
        })}
        <div class="edge-fade" />
      </div>
      <div class="vignette" />
      {talk}
    </>
  );
}
