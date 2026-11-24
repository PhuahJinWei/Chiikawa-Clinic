import { signal } from '@preact/signals';
import type { L10n, Lang } from './game/types';

function saved(): Lang {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'ja';
  } catch {
    return 'ja';
  }
}

/** Japanese is the default; English is opt-in and remembered. */
export const lang = signal<Lang>(saved());

export function setLang(l: Lang) {
  lang.value = l;
  try {
    localStorage.setItem('lang', l);
  } catch {
    /* private mode: the choice just isn't remembered */
  }
}

/** Reads `lang`, so any component that calls it re-renders when the language changes. */
export const tr = (l: L10n): string => l[lang.value];
export const fmt = (l: L10n, vars: Record<string, string | number>): string =>
  tr(l).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

export const UI = {
  title: { ja: 'ちいかわクリニック', en: 'Chiikawa Clinic' },
  fanNote: { ja: 'ひこうしき ファンゲーム・しさくばん', en: 'Unofficial fan game (prototype)' },
  start: { ja: 'はじめる', en: 'Start' },
  turnPhone: { ja: 'スマホを よこむきに もってね', en: 'Hold your phone sideways' },

  dayN: { ja: '{n}にちめ', en: 'Day {n}' },
  shiftTitle: { ja: 'きょうの シフト', en: "Today's shift" },
  dayOff: { ja: '{name}は おやすみ', en: '{name} is off today' },
  openUp: { ja: 'かいいん!', en: 'Open the clinic!' },

  navDoor: { ja: 'げんかん', en: 'Door' },
  navWaiting: { ja: 'まちあい', en: 'Waiting' },
  navDoctor: { ja: 'しんさつ', en: 'Doctor' },
  navCounter: { ja: 'うけつけ', en: 'Counter' },
  closedNow: { ja: 'おわり', en: 'Closed' },

  nobody: { ja: 'だれも いないよ', en: 'Nobody is here' },
  comeIn: { ja: 'どうぞ', en: 'Come in' },
  takeCare: { ja: 'おだいじに', en: 'Take care' },
  full: { ja: 'まんいん', en: 'No seats' },

  ask: { ja: 'きく', en: 'Ask' },
  temp: { ja: 'たいおん', en: 'Temp' },
  measuring: { ja: 'はかりちゅう', en: 'Measuring' },
  measuringNote: { ja: 'ピッ・・ はかりちゅう', en: 'Beep... measuring' },
  tempNote: { ja: 'ピピッ! {t}℃', en: 'Beep beep! {t}°C' },
  sendIn: { ja: 'せんせいへ', en: 'To doctor' },
  doctorBusy: { ja: 'しんさつちゅう', en: 'Doctor busy' },
  sendCounter: { ja: 'うけつけへ', en: 'To counter' },

  chart: { ja: 'カルテ', en: 'Chart' },
  nurseNotes: { ja: 'ナースの きろく', en: "Nurse's notes" },
  saidAtDoor: { ja: 'いわれたこと', en: 'Said at door' },
  interview: { ja: 'きいたこと', en: 'Heard' },
  temperature: { ja: 'たいおん', en: 'Temperature' },
  notAsked: { ja: 'きいていない', en: 'not asked' },
  notMeasured: { ja: 'はかっていない', en: 'not taken' },
  examTitle: { ja: 'しんさつ', en: 'Exam' },
  asked: { ja: 'きいた', en: 'Asked' },
  tempDone: { ja: '{t}℃', en: '{t}°C' },
  dxTitle: { ja: 'おなやみ', en: 'Diagnosis' },
  narrowed: { ja: 'どれかな?', en: 'Which one?' },
  guideShort: { ja: 'はやみひょう', en: 'Guide' },

  guide: { ja: 'はやみひょう', en: 'Guide' },
  gCondition: { ja: 'こまりごと', en: 'Trouble' },
  gFever: { ja: 'ねつ', en: 'Fever' },
  gSays: { ja: 'きくと', en: 'When asked' },
  gLegend: { ja: 'ねつの めやす すこしは 37.5℃ ぐらい、たかいは 38.5℃ から', en: 'Fever: mild is about 37.5°C, high is 38.5°C or more' },
  lvlNone: { ja: 'なし', en: 'none' },
  lvlMild: { ja: 'すこし', en: 'mild' },
  lvlHigh: { ja: 'たかい', en: 'high' },

  note: { ja: 'せんせいの メモ', en: "Doctor's note" },
  memo: { ja: 'ナースの メモ', en: "Nurse's memo" },
  name: { ja: 'なまえ', en: 'Name' },
  handOver: { ja: 'わたす', en: 'Hand over' },
  bagFor: { ja: '{name} さま', en: 'For {name}' },

  paused: { ja: 'ひとやすみ', en: 'Paused' },
  resume: { ja: 'つづける', en: 'Resume' },
  language: { ja: 'ことば', en: 'Language' },
  sound: { ja: 'おと', en: 'Sound' },
  lens: { ja: 'レンズ', en: 'Lens effect' },
  on: { ja: 'オン', en: 'On' },
  off: { ja: 'オフ', en: 'Off' },
  endDay: { ja: 'きょうは おしまい', en: 'End the day' },
  dayOver: { ja: 'きょうは おしまい', en: 'Closed for today' },

  sumTitle: { ja: '{n}にちめ おつかれさま!', en: 'Day {n} done. Good work!' },
  sumSeen: { ja: 'てつだった', en: 'Helped' },
  sumCured: { ja: 'ぴったり', en: 'Spot on' },
  sumHome: { ja: 'おかえり', en: 'Sent home' },
  nextDay: { ja: 'つぎの ひ へ', en: 'Next day' },
  resCured: { ja: 'ぴったり!', en: 'Spot on!' },
  resWrong: { ja: 'ほんとは {dx}', en: 'Was really {dx}' },
  resHome: { ja: 'おかえり', en: 'Sent home' },
  resUnfinished: { ja: 'じかんぎれ', en: 'Ran out of time' },
  noPatients: { ja: 'きょうは だれも こなかった。', en: 'Nobody came today.' },
} satisfies Record<string, L10n>;
