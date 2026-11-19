// Leonida Platinum — hand-in builder for the GTA 6 trophy guide.
//
// Node 22+, standard library only. It stages the guide (app/) and its four
// screenshots into the output directory (or $MAKEFUN_OUTPUT_DIR when set),
// then asks the kit's vendored library to write dossier.json — the compact
// summary the judge actually reads. vendor/makefun-frontend.ts is the kit's
// own file and must stay byte-for-byte as shipped, because the scorer
// rebuilds the dossier from its own copy of that library and compares.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts   # build the hand-in locally
//   node serve.ts                         # preview at http://localhost:8080
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const SHOT_EXT = /\.(png|jpe?g)$/i;

// Gate caps for gta6-trophy-guide-01 (from the competition's gate):
// dossier text budget, at most 4 screenshots of at most 256 KiB each,
// app/ at most 993 files and 48 MiB.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
} as const;

function countFiles(dir: string): number {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    n += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return n;
}

function stageHandIn(): { shots: string[]; appFiles: number } {
  // Wipe the target first: a stale file from an earlier run must never
  // sneak into the hand-in.
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  cpSync(join(ROOT, 'app'), join(OUT, 'app'), { recursive: true });
  const appFiles = countFiles(join(OUT, 'app'));

  const shotDir = join(ROOT, 'screenshots');
  const shots: string[] = [];
  if (existsSync(shotDir)) {
    cpSync(shotDir, join(OUT, 'screenshots'), { recursive: true });
    shots.push(...readdirSync(join(OUT, 'screenshots')).filter((f) => SHOT_EXT.test(f)).sort());
  }
  return { shots, appFiles };
}

function verifyHandIn(shots: string[]): void {
  const dossierPath = join(OUT, 'dossier.json');
  const parsed = JSON.parse(readFileSync(dossierPath, 'utf8'));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('dossier.json did not parse as an object');
  }
  // The scorer refuses a dossier over 1.5 MiB — catch that here, not at submit.
  const dossierBytes = statSync(dossierPath).size;
  if (dossierBytes > 1572864) {
    throw new Error(`dossier.json is ${dossierBytes} bytes — over the 1.5 MiB cap`);
  }
  if (!existsSync(join(OUT, 'app', 'index.html'))) {
    throw new Error('app/index.html missing from the hand-in');
  }
  if (shots.length === 0) throw new Error('no screenshots in the hand-in');
  for (const shot of shots) {
    const size = statSync(join(OUT, 'screenshots', shot)).size;
    if (size > DOSSIER_CAPS.screenshots.max_bytes) {
      throw new Error(`${shot} is ${size} bytes — over the 256 KiB screenshot cap`);
    }
  }
  const dataBytes = statSync(join(OUT, 'app', 'data', 'trophies.json')).size;
  console.log(`hand-in ready in ${OUT}: ${shots.length} screenshots, ${dataBytes} bytes of trophy data`);
}

const staged = stageHandIn();
const dossier = buildDossier(OUT, DOSSIER_CAPS);
writeFileSync(join(OUT, 'dossier.json'), dossier);
verifyHandIn(staged.shots);
console.log(`staged ${staged.appFiles} app files, shots: ${staged.shots.join(', ')}`);
