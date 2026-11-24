import { render } from 'preact';
import { App } from './App';
import { preloadArt } from './stage/assets';
import './styles.css';

// Keep the page from behaving like a web page: no pinch zoom, no long-press menu.
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());
// iOS only shows a button's pressed look when the page listens for touches.
document.addEventListener('touchstart', () => {}, { passive: true });
// Only the results list is meant to scroll. If a browser scrolls anything else (older ones can
// when focus moves), put it straight back, otherwise the stage would stay shifted with no way to
// drag it home.
document.addEventListener(
  'scroll',
  e => {
    const el = e.target === document ? document.scrollingElement : (e.target as Element);
    if (el && !el.classList.contains('results') && (el.scrollTop || el.scrollLeft)) el.scrollTo(0, 0);
  },
  true,
);

render(<App />, document.getElementById('app')!);
// Once the page itself has loaded, fetch the rest of the art while the title screen is up.
addEventListener('load', preloadArt, { once: true });
