import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';

const git = (args: string): string => {
  try {
    return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
};

// Which build this is: the version from package.json (bumped by hand), and the date and short id
// of the commit it was built from (automatic). The title screen shows it, and the game compares
// it with version.json on the server to notice an update.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };
const BUILD = {
  version: pkg.version,
  date: git('log -1 --format=%cs') || new Date().toISOString().slice(0, 10),
  commit: git('rev-parse --short HEAD') || 'local',
};

/** Writes version.json next to the built game, for the running game to check itself against. */
const versionFile = (): Plugin => ({
  name: 'version-file',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify(BUILD) });
  },
});

export default defineConfig({
  // Relative base so the built game works from any sub-path (e.g. GitHub Pages).
  base: './',
  plugins: [preact(), versionFile()],
  define: { __BUILD__: JSON.stringify(BUILD) },
  server: { port: 5173 },
});
