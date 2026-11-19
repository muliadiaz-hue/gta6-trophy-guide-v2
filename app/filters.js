// Leonida Platinum — checklist filtering.
//
// One pure function: given the full list, the current filter values and the
// saved state, return the trophies to show, in kit order. The spoiler rule
// lives here too — it masks, never removes, story trophies.
import { isEarned } from './state.js';

export const KIND_LABELS = {
  story: 'Story',
  'side-story': 'Side story',
  collectible: 'Collectible',
  activity: 'Activity',
  robbery: 'Robbery',
  misc: 'Misc',
  completion: '100%',
  platinum: 'Platinum',
};

export function kindLabel(kind) {
  return KIND_LABELS[kind] ?? kind;
}

// A trophy is masked when the spoiler guard is on, it is a story trophy,
// and the player has not earned it yet.
export function isMasked(state, trophy) {
  return state.spoiler && trophy.story && !isEarned(state, trophy);
}

export function applyFilters(trophies, state, filters) {
  const q = (filters.q ?? '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.kind === 'missable') {
      if (!t.missable && !t.missable_note) return false;
    } else if (filters.kind !== 'all' && !(t.kind ?? []).includes(filters.kind)) {
      return false;
    }
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    const earned = isEarned(state, t);
    if (filters.status === 'earned' && !earned) return false;
    if (filters.status === 'remaining' && earned) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${(t.kind ?? []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
