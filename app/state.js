// Leonida Platinum — saved progress.
//
// One localStorage record holds everything: which trophies are earned (with
// the date), the PSN progress counters, and the spoiler setting. The demo
// seed used for screenshots lives only in memory and never overwrites a
// real save.
export const STORE_KEY = 'gta6-trophy-guide-v1';

export function blankState() {
  return { earned: {}, progress: {}, spoiler: true, version: 1 };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return blankState();
    return {
      earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
      progress: parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : {},
      spoiler: parsed.spoiler !== false,
      version: 1,
    };
  } catch {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...state, version: 1 }));
  } catch {
    // Private mode / storage full: the guide still works in memory.
  }
}

// Thirteen trophies earned and a few counters part-way, so screenshots show
// a guide in use rather than a blank checklist. In-memory only.
export function demoState() {
  const state = blankState();
  const earnedNames = [
    'Just Like Paradise', 'Paradise Lost', 'Trust', 'Baited My Tackle',
    'Stick Fiddler', 'Master of None', 'Hot Together', 'Retail Therapy',
    'Sneakthief', 'A Classic Blitz Play', 'Let’s Go Bowling',
    'Little Boxes', 'On the Spot',
  ];
  const stamp = new Date().toISOString().slice(0, 10);
  for (const name of earnedNames) state.earned[name] = stamp;
  state.progress = {
    'Cunning Stunts': 61,
    'You WAiNKer!': 23,
    'Whip It Good': 41,
    'Positive Mental Attitude': 4,
    'Top Fun': 3,
    'The Goodtime State': 19,
  };
  return state;
}

export function isEarned(state, trophy) {
  return Boolean(state.earned[trophy.name]);
}

export function earnedCount(state, trophies) {
  return trophies.reduce((n, t) => n + (isEarned(state, t) ? 1 : 0), 0);
}

export function toggleEarned(state, trophy) {
  if (isEarned(state, trophy)) {
    delete state.earned[trophy.name];
  } else {
    state.earned[trophy.name] = new Date().toISOString().slice(0, 10);
    if (trophy.psn_count != null) state.progress[trophy.name] = trophy.psn_count;
  }
  saveState(state);
}

export function counterOf(state, trophy) {
  if (trophy.psn_count == null) return null;
  const n = state.progress[trophy.name];
  return typeof n === 'number' ? Math.max(0, Math.min(trophy.psn_count, n)) : 0;
}

export function bumpCounter(state, trophy, delta) {
  if (trophy.psn_count == null) return;
  const next = Math.max(0, Math.min(trophy.psn_count, counterOf(state, trophy) + delta));
  state.progress[trophy.name] = next;
  if (next >= trophy.psn_count) state.earned[trophy.name] = new Date().toISOString().slice(0, 10);
  saveState(state);
}

// Keep only names the list knows; returns how many the file recognised.
export function importState(state, trophies, incoming) {
  const known = new Set(trophies.map((t) => t.name));
  let keptEarned = 0;
  let keptProgress = 0;
  if (incoming && typeof incoming === 'object') {
    if (incoming.earned && typeof incoming.earned === 'object') {
      for (const [name, date] of Object.entries(incoming.earned)) {
        if (known.has(name) && typeof date === 'string') {
          state.earned[name] = date;
          keptEarned++;
        }
      }
    }
    if (incoming.progress && typeof incoming.progress === 'object') {
      for (const [name, n] of Object.entries(incoming.progress)) {
        if (known.has(name) && typeof n === 'number') {
          state.progress[name] = n;
          keptProgress++;
        }
      }
    }
    if (typeof incoming.spoiler === 'boolean') state.spoiler = incoming.spoiler;
  }
  saveState(state);
  return { keptEarned, keptProgress };
}
