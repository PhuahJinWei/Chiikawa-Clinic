// A fixed 1920x1080 stage, scaled as one piece to fit whatever screen it is on.
// Everything in the game is positioned in stage pixels, so the composition is identical everywhere.

import { signal } from '@preact/signals';
import type { ComponentChildren } from 'preact';
import { lang } from '../i18n';

export const STAGE_W = 1920;
export const STAGE_H = 1080;

function measure() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // The game is landscape. If the page is upright (a phone held normally, or one with rotation
  // lock on), the stage is turned 90 degrees so the player only has to turn the phone itself.
  const rotated = vh > vw;
  const w = rotated ? vh : vw;
  const h = rotated ? vw : vh;
  const scale = Math.min(w / STAGE_W, h / STAGE_H);
  return { scale, rotated, visW: w / scale, visH: h / scale };
}

export const view = signal(measure());

const remeasure = () => {
  view.value = measure();
};
window.addEventListener('resize', remeasure);
window.addEventListener('orientationchange', () => setTimeout(remeasure, 250));
window.visualViewport?.addEventListener('resize', remeasure);

export function Stage({ children }: { children: ComponentChildren }) {
  const v = view.value;
  // The part of the stage coordinate space the screen can actually show. On screens wider than
  // 16:9 this starts left of zero, which is where the background bleed becomes visible.
  const left = (STAGE_W - v.visW) / 2;
  const top = (STAGE_H - v.visH) / 2;
  const style =
    `transform:${v.rotated ? 'rotate(90deg) ' : ''}scale(${v.scale});` +
    `--vis-l:${left}px;--vis-t:${top}px;--vis-w:${v.visW}px;--vis-h:${v.visH}px;` +
    `--edge-l:${Math.max(left, -420)}px`;
  return (
    <div class="stage" lang={lang.value} style={style}>
      {children}
    </div>
  );
}
