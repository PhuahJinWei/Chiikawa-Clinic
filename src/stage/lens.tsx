// The "camera": a fisheye for the door's peephole and film grain over every room.
// Both are generated in the browser, so there are no image files to keep in step.

import { signal } from '@preact/signals';
import type { JSX } from 'preact';

function saved(): boolean {
  try {
    return localStorage.getItem('lens') !== 'off';
  } catch {
    return true;
  }
}

/** Off switch for phones that struggle with the effect, or players who dislike it. */
export const lensOn = signal(saved());

export function setLens(on: boolean) {
  lensOn.value = on;
  try {
    localStorage.setItem('lens', on ? 'on' : 'off');
  } catch {
    /* private mode: the choice just isn't remembered */
  }
}

/** The filtered layer is the whole background canvas, bleed included. */
const W = 2400;
const H = 1350;
/** How hard the edges are squeezed toward the middle. 0 is a flat window. */
const STRENGTH = 0.36;
/** Distance from the centre, in stage pixels, at which the squeeze reaches STRENGTH. */
const RADIUS = 1100;
/** The furthest any pixel is moved. Everything past this is under the dark rim anyway. */
const MAX_SHIFT = 330;

function canvas(w: number, h: number, paint: (px: Uint8ClampedArray) => void): string | null {
  try {
    const el = document.createElement('canvas');
    el.width = w;
    el.height = h;
    const g = el.getContext('2d');
    if (!g) return null;
    const img = g.createImageData(w, h);
    paint(img.data);
    g.putImageData(img, 0, 0);
    return el.toDataURL('image/png');
  } catch {
    return null;
  }
}

/**
 * Safari cannot draw the peephole: its engine (WebKit, which every browser on an iPhone or iPad
 * uses too) mishandles an SVG filter with an image in it when the filter is put on ordinary page
 * content, and shows a blur with nothing in it. There is no way to ask a browser whether it can,
 * so this goes by its name. Those browsers get the flat view under the same dark rim.
 */
export const isWebKit = (ua: string): boolean => /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg\/|OPR\/|Android/.test(ua);
const canBend = typeof navigator === 'undefined' || !isWebKit(navigator.userAgent);

let map: string | null | undefined;

/**
 * A displacement map: red says how far to look sideways for each pixel, green how far up or down.
 * Pixels look further out the further they are from the centre, which squeezes the edges inward
 * the way a door viewer does. The random half-step hides the banding 8-bit maps otherwise show,
 * and gives the glass a slightly rough look.
 */
function lensMap(): string | null {
  if (map !== undefined) return map;
  const w = W / 2;
  const h = H / 2;
  const clamp = (v: number) => Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, v));
  map = canvas(w, h, px => {
    for (let y = 0, i = 0; y < h; y++) {
      for (let x = 0; x < w; x++, i += 4) {
        const dx = (x + 0.5) * 2 - W / 2;
        const dy = (y + 0.5) * 2 - H / 2;
        const rn = Math.min(Math.hypot(dx, dy) / RADIUS, 1.2);
        const f = STRENGTH * rn * rn;
        px[i] = Math.round(127.5 + (clamp(dx * f) / (MAX_SHIFT * 2)) * 255 + Math.random() - 0.5);
        px[i + 1] = Math.round(127.5 + (clamp(dy * f) / (MAX_SHIFT * 2)) * 255 + Math.random() - 0.5);
        px[i + 2] = 0;
        px[i + 3] = 255;
      }
    }
  });
  return map;
}

let noise: string | null | undefined;

function grainTile(): string | null {
  if (noise !== undefined) return noise;
  noise = canvas(160, 160, px => {
    for (let i = 0; i < px.length; i += 4) {
      const v = Math.random() < 0.5 ? 0 : 255;
      px[i] = px[i + 1] = px[i + 2] = v;
      px[i + 3] = Math.random() * 46;
    }
  });
  return noise;
}

const only = (r: number, g: number, b: number) => `${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`;

/**
 * The peephole filter. Red, green and blue are bent by slightly different amounts, so colours
 * split apart toward the rim like they do through cheap glass.
 * Returns the CSS `filter` value to put on the layer, or nothing if the effect is unavailable.
 */
export function peephole(): { defs: JSX.Element | null; filter: string | undefined } {
  const url = lensOn.value && canBend ? lensMap() : null;
  if (!url) return { defs: null, filter: undefined };
  const s = MAX_SHIFT * 2;
  const bend = (scale: number, result: string) => (
    <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result={result} />
  );
  const defs = (
    <svg class="defs" width="0" height="0" aria-hidden="true">
      <filter id="peephole" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
        <feImage href={url} x="0" y="0" width={W} height={H} preserveAspectRatio="none" result="map" />
        {bend(s * 0.955, 'r0')}
        <feColorMatrix in="r0" type="matrix" values={only(1, 0, 0)} result="r" />
        {bend(s, 'g0')}
        <feColorMatrix in="g0" type="matrix" values={only(0, 1, 0)} result="g" />
        {bend(s * 1.045, 'b0')}
        <feColorMatrix in="b0" type="matrix" values={only(0, 0, 1)} result="b" />
        <feBlend in="r" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b" mode="screen" />
      </filter>
    </svg>
  );
  return { defs, filter: 'url(#peephole)' };
}

/** Film grain over the room, jumping a few times a second like the paper cutouts do. */
export function Grain() {
  const url = lensOn.value ? grainTile() : null;
  return url ? <div class="grain" style={`background-image:url(${url})`} /> : null;
}
