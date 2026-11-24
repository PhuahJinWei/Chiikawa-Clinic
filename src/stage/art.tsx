// Placeholder drawings. Each is a stand-in for real art and is only drawn when no matching file
// exists in src/assets/ (see assets.ts, Cutout.tsx and Props.tsx). Coordinates are stage pixels.

import { tr } from '../i18n';
import type { Character, Finding, Fix, FxId, Mood, SceneId, TimeOfDay } from '../game/types';

export const INK = '#5b4636';
const L = { stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } as const;

// ---------- characters ----------

function Ears({ kind }: { kind: Character['ears'] }) {
  if (kind === 'round') return <><circle cx="88" cy="80" r="42" /><circle cx="312" cy="80" r="42" /></>;
  if (kind === 'pointy') return <><path d="M58 128 L82 26 L156 76 Z" /><path d="M342 128 L318 26 L244 76 Z" /></>;
  if (kind === 'long') {
    return (
      <>
        <ellipse cx="150" cy="60" rx="27" ry="52" transform="rotate(-8 150 60)" />
        <ellipse cx="250" cy="60" rx="27" ry="52" transform="rotate(8 250 60)" />
      </>
    );
  }
  return null;
}

function Body() {
  return (
    <>
      <ellipse cx="160" cy="436" rx="36" ry="17" />
      <ellipse cx="240" cy="436" rx="36" ry="17" />
      <ellipse cx="200" cy="370" rx="98" ry="76" />
      <ellipse cx="110" cy="348" rx="31" ry="22" transform="rotate(-28 110 348)" />
      <ellipse cx="290" cy="348" rx="31" ry="22" transform="rotate(28 290 348)" />
      <ellipse cx="200" cy="192" rx="152" ry="138" />
    </>
  );
}

/** A generic blob with a white paper border, tinted and lettered so you can tell who it stands for. */
export function CharArt({ c, mood }: { c: Character; mood: Mood }) {
  return (
    <svg viewBox="0 0 400 460" overflow="visible" aria-hidden="true">
      <ellipse cx="200" cy="448" rx="132" ry="14" fill="rgba(91,70,54,.2)" />
      <g fill="#fff" stroke="#fff" stroke-width="30" stroke-linejoin="round">
        <Ears kind={c.ears} />
        <Body />
      </g>
      <g fill={c.accent} {...L} stroke-width="8">
        <Ears kind={c.ears} />
      </g>
      <g fill={c.body} {...L} stroke-width="8">
        <Body />
      </g>
      <g fill="#f7b6c8" opacity=".85">
        <ellipse cx="108" cy="240" rx="27" ry="16" />
        <ellipse cx="292" cy="240" rx="27" ry="16" />
      </g>
      {mood === 'happy' && (
        <>
          <g fill="none" {...L} stroke-width="8">
            <path d="M134 208 q16 -22 32 0" />
            <path d="M234 208 q16 -22 32 0" />
          </g>
          <path d="M182 224 q18 26 36 0 z" fill="#f29a9a" {...L} />
        </>
      )}
      {mood === 'sick' && (
        <>
          <g fill="none" {...L} stroke-width="8">
            <path d="M132 196 l32 12" />
            <path d="M268 196 l-32 12" />
          </g>
          <path d="M176 238 q8 -12 16 0 t16 0 t16 0" fill="none" {...L} />
        </>
      )}
      {mood === 'neutral' && (
        <>
          <g fill={INK}>
            <circle cx="150" cy="202" r="13" />
            <circle cx="250" cy="202" r="13" />
          </g>
          <path d="M184 226 q8 12 16 0 q8 12 16 0" fill="none" {...L} />
        </>
      )}
      <text x="200" y="398" text-anchor="middle" font-size="68" fill={c.accent} stroke={INK} stroke-width="5" paint-order="stroke">
        {tr(c.name)[0]}
      </text>
    </svg>
  );
}

/** Marks that show a character's trouble until their own drawing of it exists. */
export function FxArt({ fx }: { fx: readonly FxId[] }) {
  if (!fx.length) return null;
  return (
    <svg class="fx" viewBox="0 0 400 460" overflow="visible" aria-hidden="true">
      {fx.includes('fever') && (
        <>
          <ellipse cx="200" cy="236" rx="128" ry="38" fill="#ff6b6b" opacity=".3" />
          <g class="fx-float" fill="none" stroke="#f08080" stroke-width="9" stroke-linecap="round">
            <path d="M112 34 q-14 -16 0 -32 q14 -16 0 -32" />
            <path d="M288 34 q14 -16 0 -32 q-14 -16 0 -32" />
          </g>
        </>
      )}
      {fx.includes('queasy') && (
        <>
          <ellipse cx="200" cy="128" rx="118" ry="46" fill="#8fcf8f" opacity=".4" />
          <path class="fx-float" d="M152 26 q12 -14 24 0 t24 0 t24 0 t24 0" fill="none" stroke="#7fbf7f" stroke-width="9" stroke-linecap="round" />
        </>
      )}
      {fx.includes('cough') && (
        <g class="fx-pop" fill="none" stroke={INK} stroke-width="8" stroke-linecap="round">
          <path d="M306 228 l36 -16" />
          <path d="M310 250 l42 2" />
          <path d="M304 272 l36 18" />
          <circle cx="378" cy="252" r="15" fill="#fff" />
        </g>
      )}
      {fx.includes('sniffle') && <path class="fx-float" d="M214 230 q-13 22 0 30 q13 -8 0 -30z" fill="#8fd0ee" stroke={INK} stroke-width="4" />}
      {fx.includes('bruise') && (
        <g {...L}>
          <ellipse cx="286" cy="96" rx="40" ry="32" fill="#a58ad6" />
          <path d="M270 88 l32 16 M302 88 l-32 16" fill="none" stroke="#fff" stroke-width="7" />
        </g>
      )}
    </svg>
  );
}

// ---------- rooms ----------

function DoorBg() {
  return (
    <>
      <rect x="-240" y="-135" width="2400" height="1350" fill="#cfeaf7" />
      <circle cx="1090" cy="170" r="84" fill="#fff1b8" {...L} />
      <g fill="#fff" {...L}>
        <path d="M130 250 q40 -70 120 -40 q60 -50 120 10 q70 0 60 60 h-320 q-40 -10 20 -30z" />
        <path d="M700 110 q30 -50 90 -30 q50 -40 100 10 q50 0 40 45 h-250 q-30 -8 20 -25z" />
      </g>
      <path d="M-240 640 Q 260 480 820 610 T 2160 560 V1215 H-240Z" fill="#c9ecd2" {...L} />
      <path d="M-240 800 Q 420 690 1040 790 T 2160 740 V1215 H-240Z" fill="#aadcb9" {...L} />
      <path d="M300 1215 Q 500 930 620 800 Q 760 930 940 1215Z" fill="#f8ecd0" {...L} />
      <g fill="#8fcfa3" {...L}>
        <circle cx="150" cy="900" r="120" />
        <circle cx="1060" cy="880" r="130" />
        <circle cx="1560" cy="850" r="150" />
      </g>
      <g fill="#fff" {...L}>
        <path d="M1320 760 v-150 h120 v150" />
        <path d="M1380 760 v230" fill="none" />
      </g>
      {/* the porch the visitor stands on */}
      <rect x="-240" y="985" width="2400" height="230" fill="#edcfa2" {...L} />
      <g stroke="#d3b084" stroke-width="6" stroke-linecap="round">
        {[-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <path key={i} d={`M${960 + i * 200} 985 L${960 + i * 330} 1215`} />
        ))}
      </g>
    </>
  );
}

function WaitingBg() {
  return (
    <>
      {/* walls and floor, meeting at the far corner */}
      <polygon points="-240,-135 1150,-135 1150,470 -240,1178" fill="#fbe5e8" {...L} />
      <polygon points="1150,-135 1760,-135 1760,500 1150,470" fill="#fff4e0" {...L} />
      <polygon points="1760,-135 2160,-135 2160,1100 1760,500" fill="#f9dfe3" {...L} />
      <polygon points="-240,1178 1150,470 1760,500 2160,1100 2160,1215 -240,1215" fill="#f6dcb4" {...L} />
      <g stroke="#e6c79a" stroke-width="6" stroke-linecap="round">
        <path d="M1330 482 L1010 1215" />
        <path d="M1500 490 L1500 1215" />
        <path d="M1650 496 L2000 1215" />
      </g>
      {/* the bench: near end, front and top faces */}
      <polygon points="150,829 470,950 470,1100 150,979" fill="#8cc3de" {...L} />
      <polygon points="470,950 1216,489 1216,548 470,1100" fill="#a4d3ea" {...L} />
      <polygon points="150,829 1090,441 1216,489 470,950" fill="#cfeaf7" {...L} />
      {/* things on the back wall */}
      <path d="M1295 52 L1228 112 M1295 52 L1362 112" fill="none" {...L} />
      <rect x="1225" y="110" width="140" height="105" fill="#fff" {...L} />
      <circle cx="1295" cy="52" r="8" fill={INK} />
      <rect x="1410" y="95" width="220" height="205" fill="#fff" {...L} transform="rotate(2 1520 197)" />
      <g stroke="#c9b8a6" stroke-width="8" stroke-linecap="round">
        <path d="M1452 150 h130" />
        <path d="M1452 196 h110" />
        <path d="M1452 242 h130" />
      </g>
      <polygon points="1850,236 2010,346 2010,580 1850,446" fill="#fff" {...L} />
    </>
  );
}

function DoctorBg() {
  return (
    <>
      <rect x="-240" y="-135" width="2400" height="1350" fill="#dcf1e8" />
      <rect x="-240" y="640" width="2400" height="140" fill="#c6e6d8" />
      <rect x="-240" y="780" width="2400" height="435" fill="#f6e3c6" />
      <path d="M-240 780 H2160" {...L} />
      {/* the patient's chair */}
      <rect x="925" y="830" width="50" height="170" fill="#c9b8a6" {...L} />
      <rect x="600" y="180" width="700" height="640" rx="170" fill="#f9c9d6" {...L} />
      <rect x="560" y="650" width="780" height="200" rx="90" fill="#f4b3c6" {...L} />
      {/* board the instruments hang on */}
      <rect x="1376" y="104" width="412" height="668" rx="28" fill="#fff4dc" {...L} />
    </>
  );
}

function CounterBg() {
  return (
    <>
      <rect x="-240" y="-135" width="2400" height="1350" fill="#ece6f8" />
      <rect x="-240" y="640" width="2400" height="575" fill="#ddd3f1" />
      <path d="M-240 640 H2160" {...L} />
    </>
  );
}

/** The ink and line weight of the drawn rooms, so the game's own shelf sits among them. */
const ROOM = { stroke: '#2e1c0c', 'stroke-width': 10, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } as const;

/**
 * Where the cabinet's cubbies are, in stage pixels: the top-left one's corner, each one's width
 * and the divider between two, how tall a cubby is, and how tall the rail under it that carries
 * the labels. Counter.tsx stands the fixes in them from the same numbers. It hangs low enough
 * to leave the top-right corner of the screen to the pause button.
 *
 * These match the drawn cabinet (`bg/counter-shelf`), which has thin boards and no label rail, so
 * each fix and its label both sit inside the cubby. The game's own drawing below is only a
 * stand-in for when that picture is missing.
 */
export const CABINET = { x: 953, y: 161, cell: 299, gap: 13, row: 210, rail: 18, cols: 3, rows: 2 };

const CAB = { paint: '#bfe3d0', shade: '#a2d2ba', back: '#fff6e6', wood: '#f3c59b', lip: '#fde3c8', leaf: '#8fcfae' };

/**
 * The medicine cabinet on the counter wall: a painted box hung under a little cross, with six
 * cubbies. Each has a wooden rail along its front edge where the labels are clipped. Five hold
 * the fixes; the last keeps the paper bags and a plant.
 */
export function ShelfArt() {
  const { x, y, cell, gap, row, rail, cols, rows } = CABINET;
  const w = cols * cell + (cols - 1) * gap;
  const h = rows * (row + rail);
  /** How thick the painted frame is round the cubbies, and under them. */
  const F = 24;
  const bottom = y + h + 20;
  const line = { stroke: ROOM.stroke, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } as const;
  // The last cubby, which is only for show.
  const dx = x + (cols - 1) * (cell + gap);
  const floor = y + h - rail;
  const px = dx + 214;
  return (
    <svg class="bg" viewBox="-240 -135 2400 1350" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        {/* A slight waver, so the straight lines look drawn by hand like the rest of the room. */}
        <filter id="shelf-hand">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="6" />
        </filter>
      </defs>
      <g filter="url(#shelf-hand)">
        {/* its shadow on the wall */}
        <rect x={x - F + 14} y={y - F + 18} width={w + 2 * F} height={h + F + 20} rx="26" fill={ROOM.stroke} opacity="0.1" />
        {/* the two brackets it rests on */}
        {[x + 70, x + w - 70].map((bx, i) => (
          <path
            key={bx}
            d={i ? `M${bx + 30} ${bottom - 6}H${bx - 30}Q${bx - 24} ${bottom + 40} ${bx + 30} ${bottom + 46}Z` : `M${bx - 30} ${bottom - 6}H${bx + 30}Q${bx + 24} ${bottom + 40} ${bx - 30} ${bottom + 46}Z`}
            fill={CAB.shade}
            {...line}
            stroke-width="8"
          />
        ))}
        {/* the painted box, and the pale back of the cubbies */}
        <rect x={x - F} y={y - F} width={w + 2 * F} height={h + F + 20} rx="24" fill={CAB.paint} {...line} stroke-width="9" />
        <rect x={x} y={y} width={w} height={h} fill={CAB.back} {...line} stroke-width="7" />
        {Array.from({ length: rows }, (_, r) => {
          const top = y + r * (row + rail);
          return (
            <g key={r}>
              {/* the shadow under the board above */}
              <rect x={x + 4} y={top + 4} width={w - 8} height="20" fill={ROOM.stroke} opacity="0.08" />
              {Array.from({ length: cols }, (_, c) => (
                <g key={c}>
                  {/* where whatever stands here touches the shelf */}
                  <ellipse cx={x + c * (cell + gap) + cell / 2} cy={top + row - 7} rx="92" ry="9" fill={ROOM.stroke} opacity="0.1" />
                  {c > 0 && <rect x={x + c * (cell + gap) - gap} y={top} width={gap} height={row} fill={CAB.paint} {...line} stroke-width="6" />}
                </g>
              ))}
              {/* the shelf: a strip of its top, then the front edge the labels are clipped to */}
              <rect x={x} y={top + row} width={w} height={rail} fill={CAB.wood} {...line} stroke-width="7" />
              <rect x={x + 5} y={top + row + 5} width={w - 10} height="9" fill={CAB.lip} />
              <path d={`M${x + 4} ${top + row + 16}H${x + w - 4}`} {...line} stroke-width="4" opacity="0.45" fill="none" />
            </g>
          );
        })}
        {/* the spare cubby: two paper bags, and a plant in a pot */}
        {[
          [dx + 30, 122, -5],
          [dx + 74, 108, 3],
        ].map(([bx, bh, tilt]) => (
          <g key={bx} transform={`rotate(${tilt} ${bx + 44} ${floor})`}>
            <rect x={bx} y={floor - bh} width="88" height={bh - 4} rx="4" fill="#fff" {...line} stroke-width="6" />
            <rect x={bx} y={floor - bh} width="88" height="22" rx="4" fill="#f1e7d6" {...line} stroke-width="6" />
            <path d={`M${bx + 44} ${floor - bh / 2 - 6}v24M${bx + 32} ${floor - bh / 2 + 6}h24`} stroke="#7fcfa6" stroke-width="8" stroke-linecap="round" fill="none" />
          </g>
        ))}
        {[
          `M${px} ${floor - 62}C${px - 50} ${floor - 92} ${px - 56} ${floor - 136} ${px - 30} ${floor - 154}C${px - 8} ${floor - 126} ${px - 4} ${floor - 92} ${px} ${floor - 62}Z`,
          `M${px} ${floor - 62}C${px + 10} ${floor - 96} ${px + 34} ${floor - 132} ${px + 62} ${floor - 138}C${px + 60} ${floor - 104} ${px + 36} ${floor - 76} ${px} ${floor - 62}Z`,
          `M${px} ${floor - 62}C${px - 22} ${floor - 106} ${px - 14} ${floor - 156} ${px + 4} ${floor - 174}C${px + 24} ${floor - 146} ${px + 20} ${floor - 100} ${px} ${floor - 62}Z`,
        ].map(d => (
          <path key={d} d={d} fill={CAB.leaf} {...line} stroke-width="6" />
        ))}
        <path d={`M${px - 36} ${floor - 50}H${px + 36}L${px + 27} ${floor - 4}H${px - 27}Z`} fill="#e39472" {...line} stroke-width="6" />
        <rect x={px - 44} y={floor - 66} width="88" height="20" rx="6" fill="#eda885" {...line} stroke-width="6" />
        {/* the board along the top, and the clinic's cross on a plaque in the middle of it */}
        <rect x={x - F - 18} y={y - F - 16} width={w + 2 * F + 36} height="28" rx="12" fill={CAB.shade} {...line} stroke-width="9" />
        <circle cx={x + w / 2} cy={y - F - 2} r="32" fill="#fff" {...line} stroke-width="8" />
        <path d={`M${x + w / 2} ${y - F - 18}v32M${x + w / 2 - 16} ${y - F - 2}h32`} stroke="#7fcfa6" stroke-width="11" stroke-linecap="round" fill="none" />
      </g>
    </svg>
  );
}

/** A pinked edge from x0 to x1 at height y: `n` little teeth, each `d` tall. */
function pinked(x0: number, x1: number, y: number, n: number, d: number): string {
  const step = (x1 - x0) / (2 * n);
  let path = `M${x0} ${y}`;
  for (let i = 1; i <= 2 * n; i++) path += `L${(x0 + i * step).toFixed(1)} ${i % 2 ? y - d : y}`;
  return path;
}

/**
 * The clinic's paper bag, in two halves so that what goes into it can stand between them: the
 * back, and the front, which hides the lower half of whatever is inside. The front carries the
 * clinic's cross and a dotted line, where the game writes who the bag is for.
 */
export function BagArt({ part }: { part: 'back' | 'front' }) {
  const line = { stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } as const;
  return (
    <svg class={`bag-${part}`} viewBox="0 0 260 270" aria-hidden="true">
      {part === 'back' ? (
        <path d={`${pinked(28, 232, 78, 9, 9)}L232 262H28Z`} fill="#e9dcc3" {...line} />
      ) : (
        <>
          <path d={`${pinked(14, 246, 126, 10, 10)}L241 254Q241 264 231 264H29Q19 264 19 254Z`} fill="#fffaf0" {...line} />
          {/* the fold down its side */}
          <path d="M42 134V258" stroke={INK} stroke-width="3" opacity="0.16" fill="none" />
          <circle cx="130" cy="170" r="22" fill="#c8ecd9" stroke={INK} stroke-width="4" />
          <path d="M130 158v24M118 170h24" stroke="#5fbb8d" stroke-width="9" stroke-linecap="round" fill="none" />
          <path d="M50 242H210" stroke={INK} stroke-width="3" stroke-dasharray="1 9" stroke-linecap="round" opacity="0.45" fill="none" />
        </>
      )}
    </svg>
  );
}

export function BgArt({ id }: { id: SceneId }) {
  return (
    <svg class="bg" viewBox="-240 -135 2400 1350" preserveAspectRatio="none" aria-hidden="true">
      {id === 'door' && <DoorBg />}
      {id === 'waiting' && <WaitingBg />}
      {id === 'doctor' && <DoctorBg />}
      {id === 'counter' && <CounterBg />}
    </svg>
  );
}

/** Things that sit in front of the characters: the edge of the doctor's desk and the reception counter. */
export function FgArt({ id }: { id: 'doctor' | 'counter' }) {
  return (
    <svg class="fg" viewBox="-240 -135 2400 1350" preserveAspectRatio="none" aria-hidden="true">
      {id === 'doctor' && <path d="M-240 1000 Q 320 905 960 895 Q 1600 905 2160 1000 V1215 H-240Z" fill="#f3d5a4" {...L} />}
      {id === 'counter' && (
        <>
          <path d="M-240 1004 Q 250 872 760 838 L 2160 838 V1215 H-240Z" fill="#f6dfb8" {...L} />
          <path d="M-240 1060 Q 250 928 760 894 L 2160 894" fill="none" stroke="#e6c79a" stroke-width="6" />
        </>
      )}
    </svg>
  );
}

/**
 * The doctor's side desk, seen from above. It slides in from the right when the chart is opened
 * and fills the screen from its left edge outward; the chart and the instrument tray sit on it.
 */
export function DeskArt() {
  return (
    <svg viewBox="0 0 1700 1350" preserveAspectRatio="none" aria-hidden="true">
      <rect width="1700" height="1350" fill="#f3d5a4" />
      <g stroke="#e3c08a" stroke-width="6" stroke-linecap="round">
        <path d="M70 90 h620 M900 60 h500 M1180 330 h420 M1200 760 h380 M1240 1010 h360 M120 1290 h700" />
      </g>
      <path d="M4 0 V1350" {...L} stroke-width="8" />
      {/* a pen, out past the chart where only wide screens reach */}
      <g {...L} transform="rotate(14 1300 500)">
        <rect x="1276" y="330" width="48" height="330" rx="18" fill="#8fb7e8" />
        <path d="M1276 660 h48 l-24 56z" fill="#fff" />
      </g>
    </svg>
  );
}

// ---------- props ----------

export function FixArt({ m }: { m: Fix }) {
  const f = m.color;
  return (
    <svg viewBox="0 0 160 180" aria-hidden="true">
      {m.shape === 'bottle' && (
        <g fill={f} {...L}>
          <rect x="60" y="14" width="40" height="22" rx="6" fill="#fff" />
          <rect x="64" y="34" width="32" height="26" />
          <rect x="38" y="58" width="84" height="110" rx="18" />
          <rect x="50" y="92" width="60" height="44" rx="6" fill="#fff" />
        </g>
      )}
      {m.shape === 'box' && (
        <g fill={f} {...L}>
          <rect x="26" y="50" width="108" height="118" rx="12" />
          <path d="M80 82 v54 M53 109 h54" stroke="#fff" stroke-width="16" />
        </g>
      )}
      {m.shape === 'packet' && (
        <g fill={f} {...L}>
          <path d="M30 44 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l12 12 l12 -12 l4 4 V168 H30Z" />
          <rect x="50" y="86" width="60" height="46" rx="6" fill="#fff" />
        </g>
      )}
      {m.shape === 'patch' && (
        <g fill={f} {...L}>
          <rect x="22" y="70" width="116" height="92" rx="14" fill="#fff" transform="rotate(-6 80 116)" />
          <rect x="30" y="60" width="116" height="92" rx="14" />
          <path d="M52 86 h72 M52 106 h72 M52 126 h72" fill="none" stroke="#fff" stroke-width="7" />
        </g>
      )}
      {m.shape === 'toolbox' && (
        <g fill={f} {...L}>
          <path d="M56 78 v-22 a12 12 0 0 1 12 -12 h24 a12 12 0 0 1 12 12 v22" fill="none" stroke-width="9" />
          <rect x="22" y="76" width="116" height="92" rx="12" />
          <path d="M22 110 h116" fill="none" />
          <rect x="68" y="98" width="24" height="26" rx="5" fill="#fff" />
        </g>
      )}
    </svg>
  );
}

/** The doctor's penlight. */
export function ToolArt() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <g {...L}>
        <path d="M146 74 L198 18 L198 98 Z" fill="#ffe9a8" />
        <rect x="22" y="78" width="130" height="46" rx="20" fill="#bfe4f4" transform="rotate(-25 87 101)" />
        <circle cx="92" cy="99" r="9" fill="#fff" />
      </g>
    </svg>
  );
}

/** The close-up of the inside of the mouth. Real art is one drawing per finding. */
export function InsetArt({ f }: { f: Finding }) {
  return (
    <svg viewBox="0 0 420 420" aria-hidden="true">
      <rect width="420" height="420" fill="#fff6ea" />
      <g {...L}>
        <ellipse cx="210" cy="214" rx="176" ry="170" fill="#f29aa8" />
        <circle cx="210" cy="222" r="128" fill="#a8455a" />
        <ellipse cx="210" cy="170" rx="58" ry="50" fill={f === 'red' ? '#e5303f' : '#f3aab8'} />
        <path d="M210 110 v40" stroke-width="16" />
        <ellipse cx="210" cy="316" rx="92" ry="52" fill="#f58a9c" />
        {f === 'red' ? (
          <path d="M178 158 l16 14 M242 158 l-16 14 M196 198 q14 -12 28 0" fill="none" stroke="#fff" stroke-width="7" />
        ) : (
          <path d="M336 70 l8 20 l20 8 l-20 8 l-8 20 l-8 -20 l-20 -8 l20 -8z" fill="#fff" stroke-width="4" />
        )}
      </g>
    </svg>
  );
}

/** The light outside, as a small badge on the clock: sun, setting sun, or moon. */
export function SkyIcon({ t }: { t: TimeOfDay }) {
  const s = { stroke: INK, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } as const;
  return (
    <svg class="sky-icon" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill={t === 'night' ? '#39407a' : t === 'evening' ? '#ffc9a3' : '#bfe4f4'} {...s} />
      {t === 'day' && (
        <g {...s}>
          <path d="M32 9 v6 M32 49 v6 M9 32 h6 M49 32 h6 M16 16 l4 4 M44 44 l4 4 M48 16 l-4 4 M20 44 l-4 4" stroke-width="4" />
          <circle cx="32" cy="32" r="11" fill="#ffe08a" />
        </g>
      )}
      {t === 'evening' && (
        <g {...s}>
          <path d="M17 40 a15 15 0 0 1 30 0z" fill="#f6924e" />
          <path d="M11 40 h42 M20 48 h24" stroke-width="4" />
        </g>
      )}
      {t === 'night' && (
        <g stroke-linejoin="round">
          <path d="M40 15 a18 18 0 1 0 9 27 a14 14 0 0 1 -9 -27z" fill="#ffe9a8" stroke={INK} stroke-width="4" />
          <path d="M22 16 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z" fill="#fff" />
        </g>
      )}
    </svg>
  );
}

export type NoteKind = 'eye' | 'ear' | 'temp';

/** Small ink drawings for the dialogue: how you came to know something, and choices without a room sign. */
export function NoteIcon({ kind }: { kind: NoteKind }) {
  const s = { stroke: INK, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } as const;
  return (
    <svg class="note-icon" viewBox="0 0 64 64" aria-hidden="true">
      {kind === 'eye' && (
        <g {...s}>
          <path d="M5 32 Q32 6 59 32 Q32 58 5 32Z" fill="#fff" />
          <circle cx="32" cy="32" r="10" fill="#8fc4ee" />
          <circle cx="32" cy="32" r="3" fill={INK} stroke="none" />
        </g>
      )}
      {kind === 'ear' && (
        <g {...s}>
          <path d="M8 12 h48 a6 6 0 0 1 6 6 v20 a6 6 0 0 1 -6 6 h-22 l-14 12 v-12 h-12 a6 6 0 0 1 -6 -6 v-20 a6 6 0 0 1 6 -6z" fill="#fff" transform="translate(-2 0)" />
          <g fill={INK} stroke="none">
            <circle cx="20" cy="28" r="4" />
            <circle cx="32" cy="28" r="4" />
            <circle cx="44" cy="28" r="4" />
          </g>
        </g>
      )}
      {kind === 'temp' && (
        <g {...s} transform="rotate(35 32 32)">
          <rect x="24" y="2" width="16" height="44" rx="8" fill="#fff" />
          <circle cx="32" cy="50" r="12" fill="#f39a9a" />
          <path d="M32 22 v24" stroke="#f39a9a" stroke-width="7" />
        </g>
      )}
    </svg>
  );
}

export function NavIcon({ id }: { id: SceneId }) {
  const s = { stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } as const;
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {id === 'door' && (
        <g {...s}>
          <rect x="16" y="6" width="32" height="52" rx="4" fill="#f3d5a4" />
          <circle cx="40" cy="34" r="3" fill={INK} />
        </g>
      )}
      {id === 'waiting' && (
        <g {...s}>
          <circle cx="24" cy="20" r="10" fill="#fff" />
          <rect x="8" y="32" width="48" height="12" rx="4" fill="#bfe4f4" />
          <path d="M14 44 v12 M50 44 v12" fill="none" />
        </g>
      )}
      {id === 'doctor' && (
        <g {...s} fill="none">
          <path d="M16 8 v14 a12 12 0 0 0 24 0 v-14" />
          <path d="M28 34 v8 a11 11 0 0 0 22 0 v-4" />
          <circle cx="50" cy="34" r="6" fill="#f9c9d6" />
        </g>
      )}
      {id === 'counter' && (
        <g {...s}>
          <rect x="14" y="12" width="36" height="44" rx="4" fill="#fff" />
          <path d="M32 24 v20 M22 34 h20" fill="none" stroke="#ee8ea9" stroke-width="7" />
        </g>
      )}
    </svg>
  );
}
