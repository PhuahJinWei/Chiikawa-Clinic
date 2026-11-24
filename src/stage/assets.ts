// Real art overrides placeholders automatically.
//
// Drop a file into src/assets/ with the right name (see src/assets/README.md) and it is used
// instead of the built-in placeholder drawing. Nothing else needs to change.

const files = import.meta.glob('../assets/**/*.{png,webp,jpg,jpeg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

// If the same name exists in several formats, the earlier one here wins.
const PREFERENCE = ['png', 'webp', 'jpg', 'jpeg', 'svg'];

const byKey = new Map<string, { ext: string; url: string }>();
for (const [path, url] of Object.entries(files)) {
  const m = /assets\/(.+)\.(\w+)$/.exec(path);
  if (!m) continue;
  const [, key, ext] = m;
  const current = byKey.get(key);
  if (!current || PREFERENCE.indexOf(ext) < PREFERENCE.indexOf(current.ext)) byKey.set(key, { ext, url });
}

/** URL of the art file for `key` (for example `characters/momonga`), or undefined to use the placeholder. */
export const asset = (key: string): string | undefined => byKey.get(key)?.url;

/** Downloads every drawing ahead of time, so walking into a room never waits for its picture. */
export function preloadArt() {
  for (const { url } of byKey.values()) new Image().src = url;
}

export const cls = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(' ');
