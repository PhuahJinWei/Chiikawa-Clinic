// All game content lives here: who exists, what can be wrong with them, and what fixes it.
// Adding a condition or a character is a data change, not a code change.

import type { CharId, Chart, Character, ExamKind, Finding, Fix, FixId, Job, L10n, Problem, ProblemId, Role, Shift, TempLevel } from './types';

export const CHARACTERS: Record<CharId, Character> = {
  chiikawa: {
    id: 'chiikawa', name: { ja: 'ちいかわ', en: 'Chiikawa' }, body: '#ffffff', accent: '#f7b6c8', ears: 'round',
    lettering: 'cry',
    // A line break in a cry is where its bubble breaks; anywhere else it reads as a space.
    cries: [
      { ja: 'ワッ・・ ァ・・', en: 'Wah... ah...' },
      { ja: 'ワッ・・\nヤダッ・・', en: 'Wah... yada...' },
    ],
    thanks: { ja: 'ワッ・・! フ!', en: 'Wah...! Hm!' },
    puzzled: { ja: '・・ヤダッ', en: '...Yada!' },
    personal: {
      complaint: { ja: 'フォークが おれた', en: 'fork has snapped' },
      help: { ja: 'どうぐばこで なおして あげよう', en: 'Mend it with the toolbox' },
      act: { ja: 'なおす', en: 'Mend it' },
    },
  },
  hachiware: {
    id: 'hachiware', name: { ja: 'ハチワレ', en: 'Hachiware' }, body: '#ffffff', accent: '#8fb7e8', ears: 'pointy',
    says: {
      fever: { ja: 'からだが あつい・・ ねつ・・ってコト!?', en: 'I feel so hot... so that means... a fever!?' },
      cold: { ja: 'せきが でるし・・ はなみずも とまんないんだ・・', en: "I keep coughing... and my nose won't stop running..." },
      tummy: { ja: 'おなかが いたくて・・ うう・・', en: 'My tummy hurts... ugh...' },
      bruise: { ja: 'ころんで ぶつけちゃった・・ ここ いたい・・', en: 'I fell over and bumped myself... it hurts right here...' },
      personal: { ja: 'カメラが こわれちゃって・・ しゃしん とれないんだ・・', en: "My camera broke... I can't take any photos..." },
    },
    thanks: { ja: 'ありがとう! たすかったよ!', en: 'Thank you! That really helps!' },
    puzzled: { ja: 'えっ・・ これで いい・・ってコト!?', en: 'Huh... so this is... the right one!?' },
    personal: {
      complaint: { ja: 'カメラが こわれた', en: 'camera is broken' },
      help: { ja: 'どうぐばこで なおして あげよう', en: 'Mend it with the toolbox' },
      act: { ja: 'なおす', en: 'Mend it' },
    },
  },
  usagi: {
    id: 'usagi', name: { ja: 'うさぎ', en: 'Usagi' }, body: '#fff0b8', accent: '#f0c14a', ears: 'long',
    lettering: 'shout',
    cries: [
      { ja: 'ウラ! ウラ!', en: 'Ura! Ura!' },
      { ja: 'ヤハ!\nプルルルル!', en: 'Yaha! Prrrrr!' },
      { ja: 'フゥン', en: 'Hmmn' },
    ],
    thanks: { ja: 'ヤハ!', en: 'Yaha!' },
    puzzled: { ja: 'ハァ?', en: 'Haa?' },
    personal: {
      complaint: { ja: 'まゆげが へん', en: 'eyebrows look odd' },
      help: { ja: 'えんぴつで かきなおして あげよう', en: 'Draw them again with a pencil' },
      act: { ja: 'かく', en: 'Draw' },
    },
  },
  rakko: {
    id: 'rakko', name: { ja: 'ラッコ', en: 'Rakko' }, body: '#f1dfc4', accent: '#a9805a', ears: 'round',
    says: {
      fever: { ja: 'からだが あつい・・ すこし ふらつく・・', en: "I'm burning up... a little unsteady..." },
      cold: { ja: 'せきが でる・・ はなみずも とまらない・・', en: "I have a cough... and my nose won't stop running..." },
      tummy: { ja: 'はらが いたい・・', en: 'My stomach hurts...' },
      bruise: { ja: 'とうばつで ぶつけた・・ ここが いたむ・・', en: 'I took a knock on a hunt... it aches here...' },
      personal: { ja: 'けんに ひびが はいった・・ これでは とうばつに いけない・・', en: "My sword has a crack in it... I can't hunt like this..." },
    },
    thanks: { ja: 'たすかった', en: 'That helps' },
    puzzled: { ja: '・・これは ちがうな', en: "...This isn't it" },
    personal: {
      complaint: { ja: 'けんに ひび', en: 'sword is cracked' },
      help: { ja: 'どうぐばこで なおして あげよう', en: 'Mend it with the toolbox' },
      act: { ja: 'なおす', en: 'Mend it' },
    },
  },
  shisa: {
    id: 'shisa', name: { ja: 'シーサー', en: 'Shisa' }, body: '#ffe0b5', accent: '#ef8a4c', ears: 'round',
    says: {
      fever: { ja: 'からだが あつくて・・ ふらふら するんです・・', en: "I feel so hot... and I'm all wobbly..." },
      cold: { ja: 'せきが でて・・ はなみずも とまらないんです・・', en: "I keep coughing... and my nose won't stop running..." },
      tummy: { ja: 'おなかが いたいんです・・ うう・・', en: 'My tummy hurts... ugh...' },
      bruise: { ja: 'ころんで ぶつけて しまって・・ ここが いたいんです・・', en: 'I fell and bumped myself... it hurts right here...' },
      personal: { ja: 'おなかが すいて・・ ちからが でないんです・・', en: "I'm so hungry... I have no strength left..." },
    },
    thanks: { ja: 'ありがとうございます!', en: 'Thank you very much!' },
    puzzled: { ja: 'あれ・・ これで あってますか?', en: 'Oh... is this the right one?' },
    personal: {
      complaint: { ja: 'おなかが すいた', en: 'hungry' },
      help: { ja: 'サタパンビンを ふくろで あげよう', en: 'Give them a bag of sata-panbin' },
      act: { ja: 'あげる', en: 'Give' },
    },
  },
  furuhonya: {
    id: 'furuhonya', name: { ja: 'ふるほんや', en: 'Furuhonya' }, body: '#ffd8e2', accent: '#e77b9b', ears: 'pointy',
    lettering: 'cry',
    cries: [
      { ja: '・・・・', en: '......' },
      { ja: '・・ッ', en: '...!' },
    ],
    thanks: { ja: '・・!', en: '...!' },
    puzzled: { ja: '・・?', en: '...?' },
    personal: {
      complaint: { ja: 'ほんが やぶれた', en: 'books are torn' },
      help: { ja: 'あたらしい ほんを わたそう', en: 'Hand over fresh copies' },
      act: { ja: 'わたす', en: 'Hand over' },
    },
  },
  momonga: {
    id: 'momonga', name: { ja: 'モモンガ', en: 'Momonga' }, body: '#ffffff', accent: '#9bd0ee', ears: 'round',
    cries: [
      { ja: 'おい! はやく みろ! たいへんなんだゾ!', en: 'Hey! Look at me, quick! This is serious!' },
      { ja: 'もっと しんぱい しろ! おおごとだゾ!', en: 'Worry about me more! This is a big deal!' },
    ],
    thanks: { ja: 'やったゾ!!', en: 'I did it!!' },
    puzzled: { ja: 'イーヤーヤダヤダ!', en: 'Nooo, no, no!' },
    personal: {
      complaint: { ja: 'おなかが すいた', en: 'hungry' },
      help: { ja: 'あめを ひとつ あげよう', en: 'Give them a wrapped candy' },
      act: { ja: 'あげる', en: 'Give' },
    },
  },
  kurimanju: {
    id: 'kurimanju', name: { ja: 'くりまんじゅう', en: 'Kurimanju' }, body: '#f5d7a3', accent: '#8b5a2b', ears: 'round',
    lettering: 'cry',
    cries: [
      { ja: '・・・・', en: '......' },
      { ja: '・・ッ', en: '...!' },
    ],
    thanks: { ja: '・・!', en: '...!' },
    puzzled: { ja: '・・?', en: '...?' },
    personal: {
      complaint: { ja: 'かんが あかない', en: "can won't open" },
      help: { ja: 'かわりに あけて あげよう', en: 'Open it for them' },
      act: { ja: 'あける', en: 'Open' },
      // The can is open at last, so he drinks, and lets out the one sound he is known for.
      thanks: { ja: 'ハァーッ!', en: 'Haaah!' },
    },
  },
};
export const CHAR_IDS = Object.keys(CHARACTERS) as CharId[];

/** One entry per day, repeating. Day 1 is the default line-up; later days show the stand-ins. */
export const ROSTER: Shift[] = [
  { nurse: 'chiikawa', doctor: 'rakko', counter: 'hachiware', off: [] },
  { nurse: 'chiikawa', doctor: 'rakko', counter: 'shisa', off: ['hachiware'] },
  { nurse: 'furuhonya', doctor: 'rakko', counter: 'hachiware', off: ['chiikawa'] },
  { nurse: 'chiikawa', doctor: 'usagi', counter: 'hachiware', off: ['rakko'] },
  { nurse: 'usagi', doctor: 'rakko', counter: 'shisa', off: ['chiikawa', 'hachiware'] },
  { nurse: 'kurimanju', doctor: 'rakko', counter: 'hachiware', off: ['chiikawa'] },
  { nurse: 'chiikawa', doctor: 'rakko', counter: 'momonga', off: ['hachiware'] },
];
export const shiftFor = (day: number): Shift => ROSTER[(day - 1) % ROSTER.length];

export const ROLE_NAME: Record<Role, L10n> = {
  nurse: { ja: 'ナース', en: 'Nurse' },
  doctor: { ja: 'ドクター', en: 'Doctor' },
  counter: { ja: 'うけつけ', en: 'Reception' },
};
/** What each job wears. Reception dresses as a nurse. */
export const ROLE_JOB: Record<Role, Job> = { nurse: 'nurse', doctor: 'doctor', counter: 'nurse' };
export const ROLE_PLACE: Record<Role, L10n> = {
  nurse: { ja: 'げんかん・まちあい', en: 'Door and waiting room' },
  doctor: { ja: 'しんさつしつ', en: 'Doctor room' },
  counter: { ja: 'おたすけ', en: 'Help counter' },
};

/** Everything a visitor can come about. Three are illnesses; two need no doctor. */
export const PROBLEMS: Record<ProblemId, Problem> = {
  fever: {
    id: 'fever', name: { ja: 'ねつ', en: 'Fever' }, fix: 'feverMed', temp: 'high', exams: { throat: 'ok' }, fx: ['fever'],
    acts: { ja: 'かおが まっかで ふらふら している', en: '(bright red and wobbling)' },
    complaint: { ja: 'からだが あつい', en: 'feels hot' },
  },
  cold: {
    id: 'cold', name: { ja: 'かぜ', en: 'Cold' }, fix: 'coldMed', temp: 'mild', exams: { throat: 'red' }, fx: ['sniffle', 'cough'],
    acts: { ja: 'はなを すすっている', en: '(sniffling)' },
    complaint: { ja: 'せきと はなみず', en: 'cough and runny nose' },
  },
  tummy: {
    id: 'tummy', name: { ja: 'はらいた', en: 'Stomach ache' }, fix: 'stomachMed', temp: 'normal', exams: { throat: 'ok' }, fx: ['queasy'],
    acts: { ja: 'おなかを おさえている', en: '(holding their tummy)' },
    complaint: { ja: 'おなかが いたい', en: 'tummy hurts' },
  },
  bruise: {
    id: 'bruise', name: { ja: 'あざ', en: 'Bruise' }, fix: 'compress', temp: 'normal', exams: { throat: 'ok' }, fx: ['bruise'],
    acts: { ja: 'ぶつけた ところを さすっている', en: '(rubbing the sore spot)' },
    complaint: { ja: 'ぶつけて いたい', en: 'bumped, and it hurts' },
  },
  personal: {
    id: 'personal', name: { ja: 'こまりごと', en: 'Personal trouble' }, fix: 'toolbox', temp: 'normal', exams: { throat: 'ok' }, fx: [],
    acts: { ja: 'なみだを ぽろぽろ こぼしている', en: '(tears rolling down)' },
    complaint: { ja: 'それぞれの こまりごと', en: 'a small trouble of their own' },
  },
};
export const PROBLEM_IDS = Object.keys(PROBLEMS) as ProblemId[];

/**
 * What this character might say at the door with this trouble: the one line that explains it, if
 * they are someone who explains things, or else any of their cries.
 */
export const doorLines = (char: CharId, problem: ProblemId): L10n[] => {
  const c = CHARACTERS[char];
  return c.says ? [c.says[problem]] : (c.cries ?? []);
};
/** What they come out with at the counter, handed the right thing (`cured`) or the wrong one. */
export const replyOf = (char: CharId, problem: ProblemId, cured: boolean): L10n => {
  const c = CHARACTERS[char];
  if (!cured) return c.puzzled;
  return (problem === 'personal' && c.personal.thanks) || c.thanks;
};
/** What the nurse writes down after asking this character about it. */
export const complaintOf = (char: CharId, problem: ProblemId): L10n =>
  problem === 'personal' ? CHARACTERS[char].personal.complaint : PROBLEMS[problem].complaint;

export const TEMP_RANGE: Record<TempLevel, [number, number]> = {
  normal: [36.2, 36.9],
  mild: [37.4, 38.0],
  high: [38.6, 39.4],
};
/** Reads a thermometer value back into the three levels the guide talks about. */
export const tempLevel = (t: number): TempLevel => (t < 37.2 ? 'normal' : t < 38.3 ? 'mild' : 'high');

/** What sits on the help counter's shelf, in shelf order. */
export const FIXES: Record<FixId, Fix> = {
  feverMed: { id: 'feverMed', name: { ja: 'げねつざい', en: 'Fever reducer' }, color: '#f39a9a', shape: 'box' },
  coldMed: { id: 'coldMed', name: { ja: 'かぜぐすり', en: 'Cold syrup' }, color: '#8fc4ee', shape: 'bottle' },
  stomachMed: { id: 'stomachMed', name: { ja: 'いぐすり', en: 'Stomach powder' }, color: '#ffe08a', shape: 'packet' },
  compress: { id: 'compress', name: { ja: 'しっぷ', en: 'Compress' }, color: '#bfe8d2', shape: 'patch' },
  toolbox: { id: 'toolbox', name: { ja: 'おたすけ', en: 'Help kit' }, color: '#f6a35c', shape: 'toolbox' },
};
export const FIX_IDS = Object.keys(FIXES) as FixId[];

/** The words printed on the chart for circling, and in the guide. */
const FINDING_NAME: Record<ExamKind, Record<Finding, L10n>> = {
  throat: { ok: { ja: 'きれい', en: 'Fine' }, red: { ja: 'まっか', en: 'Red' } },
};
export const findingName = (kind: ExamKind, f: Finding): L10n => FINDING_NAME[kind][f];

/** What each examination can show, in the order printed on the chart. */
export const FINDINGS: Record<ExamKind, Finding[]> = { throat: ['ok', 'red'] };
export const EXAM_NAME: Record<ExamKind, L10n> = { throat: { ja: 'のど', en: 'Throat' } };
export const EXAM_KINDS: ExamKind[] = ['throat'];

/**
 * The troubles a filled-in chart points to, reading it the way the guide does: first the throat,
 * then the nurse's temperature, then what the nurse heard. One answer means the chart settles it;
 * several mean the nurse's notes are missing and the doctor has to judge by eye.
 */
export function candidatesFor(chart: Chart): ProblemId[] {
  let ids = PROBLEM_IDS.filter(id => EXAM_KINDS.every(k => !chart.exams[k] || chart.exams[k] === PROBLEMS[id].exams[k]));
  if (chart.temp !== null) {
    const level = tempLevel(chart.temp);
    const fit = ids.filter(id => PROBLEMS[id].temp === level);
    if (fit.length) ids = fit;
  }
  if (chart.complaint && ids.includes(chart.complaint)) ids = [chart.complaint];
  return ids;
}
