import { useRef } from 'preact/hooks';
import { gamePhase, paused, scene } from './game/state';
import type { SceneId } from './game/types';
import { Counter } from './scenes/Counter';
import { Doctor } from './scenes/Doctor';
import { Door } from './scenes/Door';
import { Waiting } from './scenes/Waiting';
import { Grain } from './stage/lens';
import { Stage } from './stage/Stage';
import { Hud, Me } from './ui/Hud';
import { Intro, Pause, Summary, Title } from './ui/Screens';

/** The rooms in the order you walk through them, which is the order of their tabs. */
const ORDER: SceneId[] = ['door', 'waiting', 'doctor', 'counter'];

function Play() {
  const s = scene.value;
  // Which side the room comes in from: the right when it is further into the clinic than the one
  // you left, the left when it is back toward the door. Decided once per change of room.
  const walk = useRef<{ s: SceneId; from: string }>({ s, from: '' });
  if (walk.current.s !== s) {
    walk.current = { s, from: ORDER.indexOf(s) > ORDER.indexOf(walk.current.s) ? 'from-right' : 'from-left' };
  }
  return (
    <>
      {/* Keyed so each room is rebuilt, and plays its entrance, when you walk into it. */}
      <div class={`scene ${s} ${walk.current.from}`} key={s}>
        {s === 'door' && <Door />}
        {s === 'waiting' && <Waiting />}
        {s === 'doctor' && <Doctor />}
        {s === 'counter' && <Counter />}
        <Me />
      </div>
      <Grain />
      <Hud />
      {/* Arriving from the opening moment: the white it ended on clears. */}
      <i class="arrive" />
      {paused.value && <Pause />}
    </>
  );
}

export function App() {
  const phase = gamePhase.value;
  return (
    <Stage>
      {phase === 'title' && <Title />}
      {phase === 'intro' && <Intro />}
      {phase === 'play' && <Play />}
      {phase === 'summary' && <Summary />}
    </Stage>
  );
}
