// Looking down the throat with the penlight. The inside of the mouth is much bigger than the
// round view, so the doctor drags to move the light around it and find what there is to see.

import { useRef, useState } from 'preact/hooks';
import type { Finding } from '../game/types';
import { Closeup } from '../stage/Props';
import { view } from '../stage/Stage';

/** Width of the round view, and how much larger than it the picture of the mouth is drawn. */
const VIEW = 620;
const ZOOM = 2.2;
/** How far the picture can slide each way before its edge would show. */
const REACH = (VIEW * ZOOM - VIEW) / 2;
/** Where the light starts: low on the tongue, so the throat has to be looked for. */
const START = { x: 200, y: -REACH };

const clamp = (v: number) => Math.max(-REACH, Math.min(REACH, v));

export function Scope({ f, onClose }: { f: Finding; onClose: () => void }) {
  const [pos, setPos] = useState(START);
  const last = useRef<{ id: number; x: number; y: number } | null>(null);

  const move = (e: PointerEvent) => {
    const from = last.current;
    if (!from || from.id !== e.pointerId) return;
    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    last.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    // Screen pixels to stage pixels. An upright phone shows the stage turned a quarter turn, so
    // there a drag down the screen is a drag along the stage.
    const { scale, rotated } = view.value;
    const sx = (rotated ? dy : dx) / scale;
    const sy = (rotated ? -dx : dy) / scale;
    // The picture follows the finger, as if pulling the mouth past the light.
    setPos(p => ({ x: clamp(p.x + sx), y: clamp(p.y + sy) }));
  };
  const release = (e: PointerEvent) => {
    if (last.current?.id === e.pointerId) last.current = null;
  };

  return (
    <>
      <div class="scope-dim" onClick={onClose} />
      <div
        class="scope"
        onPointerDown={e => {
          try {
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
          } catch {
            /* a pointer that cannot be captured still drags while it stays over the view */
          }
          last.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
        }}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <div class="scope-pan" style={`translate:${pos.x}px ${pos.y}px`}>
          <Closeup f={f} />
        </div>
      </div>
    </>
  );
}
