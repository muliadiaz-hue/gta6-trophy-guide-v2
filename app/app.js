// Leonida Platinum — boot and wiring.
//
// Loads data/trophies.json, reads the view from the URL (?tab=, ?guide=,
// ?seed=demo for screenshots), wires the tabs, filters, spoiler toggle and
// the progress tools, then renders every view. Nothing here fetches from
// the network at runtime beyond the app's own files.
import { blankState, bumpCounter, demoState, importState, isEarned, loadState, saveState, toggleEarned } from './state.js';
import { renderChecklist, renderGuide, renderMissables, renderProgress, renderRoadmap } from './panels.js';

const params = new URLSearchParams(location.search);
const state = params.get('seed') === 'demo' ? demoState() : loadState();

const $ = (id) => document.getElementById(id);
const els = {
  earned: $('earnedCount'),
  fill: $('progressFill'),
  pct: $('platinumPct'),
  tabs: [...document.querySelectorAll('#tabs button')],
  search: $('search'),
  kind: $('kindFilter'),
  grade: $('gradeFilter'),
  status: $('statusFilter'),
  spoiler: $('spoilerToggle'),
  list: $('trophyList'),
  hint: $('listHint'),
  guide: $('guidePane'),
  nextUp: $('nextUp'),
  roadmap: $('roadmap'),
  missables: $('missableList'),
  breakdown: $('gradeBreakdown'),
  counters: $('counterList'),
  exportBtn: $('exportBtn'),
  importFile: $('importFile'),
  importMsg: $('importMsg'),
  resetBtn: $('resetBtn'),
};

let data = null;
let selectedName = null;

function filters() {
  return {
    q: els.search.value,
    kind: els.kind.value,
    grade: els.grade.value,
    status: els.status.value,
  };
}

function selected() {
  return data?.trophies.find((t) => t.name === selectedName) ?? null;
}

function renderAll() {
  if (!data) return;
  const trophies = data.trophies;
  const earned = trophies.filter((t) => isEarned(state, t)).length;
  els.earned.textContent = String(earned);
  els.fill.style.width = `${(earned / trophies.length) * 100}%`;
  els.pct.textContent = `${Math.round((earned / trophies.length) * 100)}% to platinum`;
  els.spoiler.checked = state.spoiler;
  renderChecklist(els.list, els.hint, trophies, state, filters(), selectedName, {
    onSelect: (t) => { selectedName = t.name; renderAll(); },
    onToggle: (t) => { toggleEarned(state, t); renderAll(); },
    onBump: (t, d) => { bumpCounter(state, t, d); renderAll(); },
  });
  renderGuide(els.guide, selected(), state, data.source_urls ?? {});
  renderRoadmap(els.roadmap, els.nextUp, trophies, state, (t) => {
    selectedName = t.name;
    showTab('checklist');
    renderAll();
  });
  renderMissables(els.missables, trophies, state);
  renderProgress(els.breakdown, els.counters, trophies, state);
}

function showTab(name) {
  for (const btn of els.tabs) btn.classList.toggle('on', btn.dataset.tab === name);
  for (const view of document.querySelectorAll('.view')) {
    view.classList.toggle('on', view.id === `view-${name}`);
  }
}

for (const btn of els.tabs) {
  btn.addEventListener('click', () => { showTab(btn.dataset.tab); });
}
for (const input of [els.search, els.kind, els.grade, els.status]) {
  input.addEventListener('input', renderAll);
}
els.spoiler.addEventListener('change', () => {
  state.spoiler = els.spoiler.checked;
  saveState(state);
  renderAll();
});

els.exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
els.importFile.addEventListener('change', async () => {
  const file = els.importFile.files?.[0];
  if (!file) return;
  try {
    const incoming = JSON.parse(await file.text());
    const { keptEarned, keptProgress } = importState(state, data.trophies, incoming);
    els.importMsg.textContent = `Imported ${keptEarned} earned trophies and ${keptProgress} counters.`;
  } catch {
    els.importMsg.textContent = 'That file is not a Leonida Platinum progress export.';
  }
  els.importFile.value = '';
  renderAll();
});
els.resetBtn.addEventListener('click', () => {
  if (!window.confirm('Clear every earned trophy and counter?')) return;
  const fresh = blankState();
  state.earned = fresh.earned;
  state.progress = fresh.progress;
  state.spoiler = fresh.spoiler;
  selectedName = null;
  saveState(state);
  renderAll();
});

const res = await fetch('data/trophies.json');
if (!res.ok) throw new Error(`trophies.json failed to load (${res.status})`);
data = await res.json();

const guideName = params.get('guide');
if (guideName && data.trophies.some((t) => t.name === guideName)) selectedName = guideName;
const tab = params.get('tab');
if (['checklist', 'roadmap', 'missables', 'progress'].includes(tab)) showTab(tab);
renderAll();

// Signal the screenshot driver that the first paint is complete.
requestAnimationFrame(() => {
  setTimeout(() => { window.__shotReady = true; }, 150);
});
