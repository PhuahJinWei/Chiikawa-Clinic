// The doctor's room, seen from the doctor's desk. The chart peeks in from the right; tapping it,
// or the patient, turns the camera toward the side desk, with the patient still in view on the
// left, and tapping the patient again turns back. The doctor's
// one instrument is a light for looking down the throat, moved around by dragging. Circling what it showed lets the chart
// name the trouble by itself when it can; circling a trouble ends the examination at once.

import { useEffect, useState } from 'preact/hooks';
import { EXAM_KINDS, EXAM_NAME, candidatesFor } from '../game/data';
import { EXIT_MS, circle, examine, patients, shift, stamp, tickExam } from '../game/state';
import type { ExamKind, Finding, Patient, ProblemId } from '../game/types';
import { UI, tr } from '../i18n';
import { sfx } from '../sfx';
import { cls } from '../stage/assets';
import { Bg, Cutout, Desk, Fg, useArrivals } from '../stage/Cutout';
import { BookPic, ChartPic, Tool } from '../stage/Props';
import { Chart, Guide } from '../ui/Chart';
import { Tick } from '../ui/Talk';
import { Scope } from '../ui/Scope';

/** Where the patient stands, in front of the chair and close to the doctor's desk. */
const SPOT = { x: 955, y: 1008, s: 1.6 };
/** A beat between the last circle and the chart's own diagnosis, so you see it happen. */
const AUTO_MS = 500;
/** How long the seal sits on the chart before the patient leaves for the counter. */
const LEAVE_MS = 1100;

/** What the doctor has done with the patient in the chair. */
interface Exam {
  id: number;
  inset: { kind: ExamKind; f: Finding } | null;
  seen: ExamKind[];
  /** The chart no longer takes circles. */
  locked: boolean;
  /** The seal is on it. */
  sealed: boolean;
}
const fresh = (id: number): Exam => ({ id, inset: null, seen: [], locked: false, sealed: false });

const full = (p: Patient) => EXAM_KINDS.every(k => p.chart.exams[k]);

export function Doctor() {
  const p = patients.value.find(q => q.where === 'doctor');
  const pid = p?.id ?? 0;
  const [open, setOpen] = useState(false);
  const [guide, setGuide] = useState(false);
  const [leaving, setLeaving] = useState<number | null>(null);
  const arrive = useArrivals();
  const [state, setState] = useState<Exam>(fresh(pid));
  // Anything remembered about the previous patient is ignored for the next one.
  const ex = state.id === pid ? state : fresh(pid);
  const patch = (id: number, part: Partial<Exam>) => setState(s => ({ ...(s.id === id ? s : fresh(id)), ...part }));

  // When the patient leaves, or a new one sits down, the doctor turns back to the room.
  useEffect(() => setOpen(false), [pid]);

  const look = (kind: ExamKind) => {
    if (!p || ex.locked) return;
    sfx.tap();
    // Looking means turning to the patient, so the chart is put aside first.
    setOpen(false);
    // Nothing says what the light shows: finding it, and circling the chart to match, is the
    // doctor's job.
    patch(p.id, { inset: { kind, f: examine(p.id, kind) }, seen: ex.seen.includes(kind) ? ex.seen : [...ex.seen, kind] });
  };

  const conclude = (id: number, dx: ProblemId) => {
    circle(id, dx);
    patch(id, { locked: true, sealed: true });
    sfx.stamp();
    // The seal sits a moment, then they get up and go out to the counter.
    window.setTimeout(() => setLeaving(id), LEAVE_MS);
    window.setTimeout(() => stamp(id), LEAVE_MS + EXIT_MS);
  };

  const onTick = (kind: ExamKind, f: Finding) => {
    if (!p || ex.locked) return;
    sfx.tap();
    tickExam(p.id, kind, f);
    const now = patients.value.find(q => q.id === p.id);
    if (!now || !full(now)) return;
    const found = candidatesFor(now.chart);
    // With one answer left the chart diagnoses by itself. Otherwise the doctor has to choose.
    if (found.length !== 1) return;
    patch(p.id, { locked: true });
    window.setTimeout(() => conclude(now.id, found[0]), AUTO_MS);
  };

  const onPick = (dx: ProblemId) => {
    if (!p || ex.locked) return;
    conclude(p.id, dx);
  };

  const turn = (to: boolean) => {
    sfx.page();
    setOpen(to);
    // Turning to the chart puts the penlight down.
    if (to && p) patch(p.id, { inset: null });
  };
  const readGuide = () => {
    sfx.page();
    setGuide(true);
  };

  const maybe = p && !ex.locked && full(p) ? candidatesFor(p.chart) : [];
  return (
    <>
      {/* The room. It slides left when the chart is opened, keeping the patient on screen. */}
      <div class={cls('cam', open && 'side')}>
        <div class="world">
          <Bg id="doctor" />
          {/* Tapping the patient opens the chart. With it open, the catcher below is over the
              whole room, so tapping them again (or anywhere off the chart) puts it away. */}
          {p && (
            <Cutout
              key={p.id}
              char={p.char}
              x={SPOT.x}
              y={SPOT.y}
              s={SPOT.s}
              problem={p.problem}
              enter={arrive(p.id)}
              leave={leaving === p.id ? 'right' : undefined}
              onTap={() => turn(true)}
            />
          )}
          <Fg id="doctor" />
          <div class="edge-fade" />
        </div>

        {/* Looking down the throat. It is part of the room, under the two buttons, so that the
            chart can be turned to straight from looking. */}
        {p && ex.inset && !open && <Scope key={p.id} f={ex.inset.f} onClose={() => patch(p.id, { inset: null })} />}

        {/* The doctor's two things to do, as plain buttons beside the patient: look down the
            throat, and turn to the chart. A throat already looked at is ticked. */}
        {EXAM_KINDS.map(k => (
          <button key={k} class="tag opt d0" disabled={!p || ex.locked} onClick={() => look(k)}>
            <i class="pic">
              <Tool />
            </i>
            <span>{tr(EXAM_NAME[k])}</span>
            {ex.seen.includes(k) && <Tick />}
          </button>
        ))}
        <button class="tag opt d1" disabled={!p} onClick={() => turn(true)}>
          <i class="pic">
            <ChartPic />
          </i>
          <span>{tr(UI.chart)}</span>
        </button>
      </div>
      <div class="vignette" />

      {/* With the chart open, a tap anywhere off it turns back to the patient. */}
      {open && <div class="catcher" onClick={() => turn(false)} />}

      {/* The side desk: the chart, with the instruments and the guide within reach under it.
          Its edge peeks in from the right; tapping that opens it. */}
      <div
        class={cls('sidedesk', open && 'in')}
        onClick={e => {
          if (!open) {
            if (p) turn(true);
          } else if (!(e.target as Element).closest('.chart, .tray button')) {
            // Anywhere on the desk that is not the chart or one of the buttons under it.
            turn(false);
          }
        }}
      >
        <Desk />
        {p && <Chart p={p} locked={ex.locked} sealed={ex.sealed} doctor={shift.value.doctor} maybe={maybe} onTick={onTick} onPick={onPick} />}
        <div class="tray">
          {EXAM_KINDS.map(k => (
            <button key={k} disabled={!p || ex.locked} onClick={() => look(k)}>
              <Tool />
              {tr(EXAM_NAME[k])}
              {ex.seen.includes(k) && <Tick />}
            </button>
          ))}
          <button class="book" onClick={readGuide}>
            <BookPic />
            {tr(UI.guideShort)}
          </button>
        </div>
      </div>


      {guide && <Guide onClose={() => setGuide(false)} />}
    </>
  );
}
