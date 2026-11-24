export type Lang = 'ja' | 'en';
export interface L10n {
  ja: string;
  en: string;
}

export type SceneId = 'door' | 'waiting' | 'doctor' | 'counter';
/** The light outside, which changes as the clinic day goes on. */
export type TimeOfDay = 'day' | 'evening' | 'night';
/** The three jobs the player takes over in first person. The nurse covers the door and the waiting room. */
export type Role = 'nurse' | 'doctor' | 'counter';
/** The outfits staff are drawn in while at work: `characters/<id>.nurse`, `characters/<id>.doctor`. */
export type Job = 'nurse' | 'doctor';

export type CharId =
  | 'chiikawa'
  | 'hachiware'
  | 'usagi'
  | 'rakko'
  | 'shisa'
  | 'furuhonya'
  | 'momonga'
  | 'kurimanju';

export type Ears = 'round' | 'pointy' | 'long' | 'none';
/** The face a placeholder character wears. Real art has one drawing per trouble instead. */
export type Mood = 'neutral' | 'sick' | 'happy';

export interface Character {
  id: CharId;
  name: L10n;
  /**
   * How they talk at the door, kept to how they talk in the original. Those who explain things in
   * sentences have a line for each trouble (`says`). The rest have only their own cries, or lines
   * that give nothing away (`cries`), and the nurse has to ask to learn what is wrong.
   */
  says?: Record<ProblemId, L10n>;
  cries?: L10n[];
  /**
   * How their words are lettered in the bubble. Those who only make sounds have them written
   * larger than a sentence (`cry`), and the one who yells them, larger still (`shout`).
   */
  lettering?: 'cry' | 'shout';
  /** What they come out with at the counter, handed the right thing and the wrong one. */
  thanks: L10n;
  puzzled: L10n;
  /**
   * Their own personal trouble: the nurse's note of it, what the counter does about it once the
   * toolbox is out (`help`, and the button's word `act`), and a reaction of its own if sorting
   * it out calls for one. Its picture is `items/<id>`.
   */
  personal: { complaint: L10n; help: L10n; act: L10n; thanks?: L10n };
  /** Placeholder colours and ear shape, only used until real art exists for this character. */
  body: string;
  accent: string;
  ears: Ears;
}

export type TempLevel = 'normal' | 'mild' | 'high';
/** The doctor has one instrument: a light to look down the throat. */
export type ExamKind = 'throat';
export type Finding = 'ok' | 'red';
/** Placeholder marks drawn over a character until their own drawing of the trouble exists. */
export type FxId = 'fever' | 'cough' | 'sniffle' | 'queasy' | 'bruise';

/**
 * What a visitor has come about. The doctor circles one of the same five on the chart.
 * `personal` is each character's own small disaster: a broken fork, a can that will not open.
 */
export type ProblemId = 'fever' | 'cold' | 'tummy' | 'bruise' | 'personal';
/** What the help counter can hand over. */
export type FixId = 'feverMed' | 'coldMed' | 'stomachMed' | 'compress' | 'toolbox';
export type FixShape = 'bottle' | 'box' | 'packet' | 'patch' | 'toolbox';

export interface Problem {
  id: ProblemId;
  name: L10n;
  /** The one thing at the counter that sorts it out. */
  fix: FixId;
  temp: TempLevel;
  exams: Record<ExamKind, Finding>;
  /** Placeholder marks, used only while the character has no drawing of this trouble. */
  fx: FxId[];
  /** What they are visibly doing. Always truthful, whatever they say. */
  acts: L10n;
  /** What the nurse writes down after asking. */
  complaint: L10n;
}

export interface Fix {
  id: FixId;
  name: L10n;
  color: string;
  shape: FixShape;
}

export interface Shift {
  nurse: CharId;
  doctor: CharId;
  counter: CharId;
  /** Regular staff who are on leave that day. */
  off: CharId[];
}

export type Where = 'door' | 'waiting' | 'doctor' | 'counter' | 'gone';

/** Everything the staff have written down about a patient. */
export interface Chart {
  /** What the nurse heard on asking, or null if nobody asked. */
  complaint: ProblemId | null;
  temp: number | null;
  exams: Partial<Record<ExamKind, Finding>>;
  diagnosis: ProblemId | null;
  /** The doctor has sealed it. A patient sent straight to the counter arrives without this. */
  stamped: boolean;
}

export interface Patient {
  id: number;
  char: CharId;
  problem: ProblemId;
  /** Body temperature the thermometer will show. */
  tempValue: number;
  /** The line they said at the door. */
  told: L10n;
  where: Where;
  seat: number | null;
  /** Play-clock time at which a running thermometer beeps. */
  thermoEndsAt: number | null;
  /** Play-clock time they reached the counter, for queue order. */
  counterAt: number | null;
  chart: Chart;
}

/** Sending someone home is the player's own call, so it is neither right nor wrong. */
export type Result = 'cured' | 'wrong' | 'sentHome' | 'unfinished';

export interface Outcome {
  char: CharId;
  problem: ProblemId;
  fix: FixId | null;
  result: Result;
}
