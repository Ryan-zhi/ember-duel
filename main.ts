// Ember Duel's hand-in program (Node 22, standard library only). The game is the
// game/ folder beside this file — plain static files a desktop browser loads
// offline — and this program hands it in: it copies game/ and screenshots/ to the
// output directory and writes dossier.json there with the vendored make.fun
// library, the summary the judge reads. Run it locally with
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// and serve the game with `node serve.ts` (http://localhost:8080). In the grader
// the output directory is /output.
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps, from the competition's gate: the text budget shapes the
// dossier's bytes; the rest refuse an entry the scorer would refuse — at most 4
// screenshots, each at most 256 KiB; at most 993 files in game/ and 48 MiB of game
// files in all; no path under game/ over 1000 bytes.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function handIn() {
  mkdirSync(outDir, { recursive: true });
  copyTree(join(root, 'game'), join(outDir, 'game'));
  const shotsDir = join(root, 'screenshots');
  if (existsSync(shotsDir) && readdirSync(shotsDir).length > 0) {
    copyTree(shotsDir, join(outDir, 'screenshots'));
  } else {
    mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  }
  const dossier = buildDossier(outDir, DOSSIER_CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

handIn();
