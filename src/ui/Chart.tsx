// The paperwork: the doctor's clipboard chart, the guide, and the paper the counter works from.

import type { ComponentChildren } from 'preact';
import { CHARACTERS, EXAM_KINDS, EXAM_NAME, FINDINGS, PROBLEMS, PROBLEM_IDS, complaintOf, findingName, tempLevel } from '../game/data';
import type { CharId, ExamKind, Finding, L10n, Patient, ProblemId, TempLevel } from '../game/types';
import { UI, tr } from '../i18n';
import { sfx } from '../sfx';
import { asset, cls } from '../stage/assets';
import { NotePic, Sign, Tool } from '../stage/Props';
import { Face } from './Hud';

const LEVEL_NAME: Record<TempLevel, L10n> = { normal: UI.lvlNone, mild: UI.lvlMild, high: UI.lvlHigh };

/** The five troubles. One can be circled, the way Japanese forms are filled in. */
export function DxGrid({ chosen, maybe = [], onPick }: { chosen: ProblemId | null; maybe?: ProblemId[]; onPick?: (dx: ProblemId) => void }) {
  return (
    <div class="dx">
      {PROBLEM_IDS.map(id => {
        const inner = (
          <>
            {tr(PROBLEMS[id].name)}
            {chosen === id && <i class="ring" />}
          </>
        );
        return onPick ? (
          <button key={id} class={cls(maybe.includes(id) && 'maybe', chosen === id && 'on')} onClick={() => onPick(id)}>
            {inner}
          </button>
        ) : (
          <span key={id} class={cls(chosen === id && 'on')}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}

/** The doctor's red seal. */
export function Seal({ by }: { by: CharId }) {
  return <div class="seal">{tr(CHARACTERS[by].name)}</div>;
}

/** Writing that only breaks between its words, never inside one or between its dots. */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((w, i) =>
        /\s/.test(w) ? (
          ' '
        ) : (
          <span key={i} class="word">
            {w}
          </span>
        ),
      )}
    </>
  );
}

/** One box of the form: a small picture of where it came from, what it is, and what was written. */
function Field({ kind, icon, label, empty, children }: { kind: string; icon: ComponentChildren; label: string; empty?: boolean; children: ComponentChildren }) {
  return (
    <div class={cls('field', kind, empty && 'empty')}>
      <div class="field-icon">{icon}</div>
      <div>
        <small>{label}</small>
        <p>{children}</p>
      </div>
    </div>
  );
}

/** What the nurse wrote down: what was said at the door, what came of asking, the temperature. */
function NurseFields({ p }: { p: Patient }) {
  const level = p.chart.temp === null ? null : tempLevel(p.chart.temp);
  return (
    <>
      <Field kind="said" icon={<Sign id="door" />} label={tr(UI.saidAtDoor)}>
        <Words text={tr(p.told)} />
      </Field>
      <Field kind="heard" icon={<NotePic kind="ear" />} label={tr(UI.interview)} empty={!p.chart.complaint}>
        <Words text={p.chart.complaint ? tr(complaintOf(p.char, p.chart.complaint)) : tr(UI.notAsked)} />
      </Field>
      <Field kind="temp" icon={<NotePic kind="temp" />} label={tr(UI.temperature)} empty={!level}>
        {level ? (
          <>
            {p.chart.temp!.toFixed(1)}℃ <i class={cls('level', level)}>{tr(LEVEL_NAME[level])}</i>
          </>
        ) : (
          tr(UI.notMeasured)
        )}
      </Field>
    </>
  );
}

interface ChartProps {
  p: Patient;
  /** No more circles: the chart is being, or has been, sealed. */
  locked: boolean;
  sealed: boolean;
  doctor: CharId;
  /** Troubles the filled-in chart cannot choose between; they are marked for the doctor. */
  maybe: ProblemId[];
  onTick: (kind: ExamKind, f: Finding) => void;
  onPick: (dx: ProblemId) => void;
}

/**
 * The clipboard on the doctor's side desk: the patient's picture and name at the top, the nurse's
 * notes in boxes down the left, and on the right the doctor's own part: what the throat looked
 * like, and the five troubles to circle.
 */
export function Chart({ p, locked, sealed, doctor, maybe, onTick, onPick }: ChartProps) {
  const who = CHARACTERS[p.char];
  // The board the sheet is clipped to: a drawing if there is one (`fg/doctor-clipboard`), or the
  // game's own wooden board and clip.
  const board = asset('fg/doctor-clipboard');
  return (
    <div class={cls('chart', board && 'drawn')}>
      {board && <img class="chart-board" src={board} alt="" draggable={false} />}
      <div class="chart-paper">
        <header>
          <div class="photo">
            <Face c={who} />
          </div>
          <div class="chart-title">
            <small>{tr(UI.chart)}</small>
            <b>{tr(who.name)}</b>
          </div>
          {/* Where the doctor's seal goes once the trouble is named. */}
          <div class="seal-spot">{sealed && <Seal by={doctor} />}</div>
        </header>
        <section class="part nurse">
          <h3>{tr(UI.nurseNotes)}</h3>
          <NurseFields p={p} />
        </section>
        <div>
          <section class="part exam">
            <h3>{tr(UI.examTitle)}</h3>
            {EXAM_KINDS.map(k => (
              <div key={k}>
                <div class="exam-name">
                  <Tool />
                  {tr(EXAM_NAME[k])}
                </div>
                {/* What the doctor saw is circled by hand, like the trouble. */}
                <div class="ticks">
                  {FINDINGS[k].map(f => (
                    <button key={f} disabled={locked} onClick={() => onTick(k, f)}>
                      {tr(findingName(k, f))}
                      {p.chart.exams[k] === f && <i class="ring" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
          <section class="part verdict">
            <h3>{tr(UI.dxTitle)}</h3>
            {/* When the notes leave more than one trouble open, the doctor is asked to choose. */}
            {maybe.length > 1 && <span class="narrowed">{tr(UI.narrowed)}</span>}
            <DxGrid chosen={p.chart.diagnosis} maybe={maybe.length > 1 ? maybe : []} onPick={locked ? undefined : onPick} />
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * The table the doctor checks the chart against: a page of the blue notebook on the desk, written
 * out by hand, with what gives each trouble away in red pen. The columns carry the same little
 * pictures as the chart's entries. Built from the same data the game judges by.
 */
export function Guide({ onClose }: { onClose: () => void }) {
  return (
    <div class="overlay" onClick={onClose}>
      <div class="guide">
        <h2>{tr(UI.guide)}</h2>
        <table>
          <thead>
            <tr>
              <th>{tr(UI.gCondition)}</th>
              <th>
                <NotePic kind="temp" />
                {tr(UI.gFever)}
              </th>
              {EXAM_KINDS.map(k => (
                <th key={k}>
                  <Tool />
                  {tr(EXAM_NAME[k])}
                </th>
              ))}
              <th>
                <NotePic kind="ear" />
                {tr(UI.gSays)}
              </th>
            </tr>
          </thead>
          <tbody>
            {PROBLEM_IDS.map(id => {
              const c = PROBLEMS[id];
              return (
                <tr key={id}>
                  <th>{tr(c.name)}</th>
                  <td class={c.temp === 'normal' ? 'miss' : 'hit'}>{tr(LEVEL_NAME[c.temp])}</td>
                  {EXAM_KINDS.map(k => (
                    <td key={k} class={c.exams[k] === 'ok' ? 'miss' : 'hit'}>
                      {c.exams[k] === 'ok' ? 'ー' : tr(findingName(k, c.exams[k]))}
                    </td>
                  ))}
                  <td class="says">{tr(c.complaint)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p class="legend">{tr(UI.gLegend)}</p>
      </div>
    </div>
  );
}

/**
 * The paper that came to the counter with the patient. With the doctor's seal it is the doctor's
 * note, and leads with the trouble the doctor circled; without, the patient skipped the doctor
 * and it is only the nurse's memo. Under that, either way, are the nurse's notes in the same boxes
 * as on the chart. Tap to put it down and reach the cabinet.
 */
export function Note({ p, doctor, up, onToggle }: { p: Patient; doctor: CharId; up: boolean; onToggle: () => void }) {
  const who = CHARACTERS[p.char];
  const seen = p.chart.stamped;
  return (
    <div
      class={cls('note', !up && 'down')}
      onClick={() => {
        sfx.page();
        onToggle();
      }}
    >
      {/* The strip that stays in view when the paper is lying on the counter. */}
      <div class="note-tab">
        {tr(seen ? UI.note : UI.memo)} <i>{up ? '▼' : '▲'}</i>
      </div>
      <header>
        <div class="photo">
          <Face c={who} />
        </div>
        <div class="chart-title">
          <small>{tr(UI.name)}</small>
          <b>{tr(who.name)}</b>
        </div>
        <div class="seal-spot">{seen && <Seal by={doctor} />}</div>
      </header>
      {seen && (
        <section class="part verdict">
          <h3>{tr(UI.dxTitle)}</h3>
          <DxGrid chosen={p.chart.diagnosis} />
        </section>
      )}
      <NurseFields p={p} />
    </div>
  );
}
