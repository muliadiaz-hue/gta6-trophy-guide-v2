// Leonida Platinum — view rendering.
//
// Every view is built with DOM calls (no innerHTML from data), so a trophy
// name like T**s Ass Drug Money can never break the page. Panels take the
// trophy list, the saved state and small callbacks; app.js owns the wiring.
import { counterOf, earnedCount, isEarned } from './state.js';
import { applyFilters, isMasked, kindLabel } from './filters.js';

export const STAGES = [
  { n: 0, title: 'Before you start', blurb: 'Spoiler guard ON. Save discipline from the first hour: a manual save at every chapter start, plus one untouched save just before the final mission. 15 manual slots + 1 autosave. No mission replay, no New Game Plus. Cheats off on the trophy save.' },
  { n: 1, title: 'Chapter 1', blurb: 'Gone Fishing opens the story. Do Lucia’s balcony meditation BEFORE Chapter 1 ends — it is the one missable risk. Beat Cal at fishing and finish one arcade game while you are here.' },
  { n: 2, title: 'Chapter 2', blurb: 'Jason and Lucia are both playable and can be called in as partners. Kingpin Bowling, garages via Daily Driver, and the Scooter Bros app via Moses. Start WAiNK scans, vehicle discovery and meditation spots with your partner.' },
  { n: 3, title: 'Chapter 3', blurb: 'Race Against Yago the moment it appears — it is time-sensitive. Yasmani’s Jewelry Jobs hands you the Snap Gun and opens jewelry robberies. Three shops with your partner for Retail Therapy.' },
  { n: 4, title: 'Chapter 4', blurb: 'Bank vaults arrive near the end of the chapter through That’s Where The Money Is. Vault jobs throw a 4-star Wanted Level at you — escaping one with your partner also earns Hot Together.' },
  { n: 5, title: 'Side stories', blurb: 'All six finales stay open after the credits. Finish Andy, Kenton, Billy, Randy, Tyrone and Bret, plus 8 stranger strands for Strangers & Freaks — Andy’s, Billy’s and Tyrone’s own finales do NOT count toward it.' },
  { n: 6, title: 'The 100% grind', blurb: 'Post-story checklist work: 300 stunts, 70 of 80 Challenges, 200 of 277 vehicles, all 8 vaults, all 39 illegal operations, 3 card sets, 100 WAiNK scans, 18 meditations, 42 shooting-range golds, 14 drone races, 52 areas.' },
  { n: 7, title: 'Finale', blurb: 'Untouched save first, then the final mission. The gold for the finale pops, and with the other 54 earned, the platinum follows: Vice Got a Price!' },
];

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function gradeBadge(trophy) {
  const span = el('span', 'grade');
  const dot = el('span', `dot ${trophy.grade}`);
  span.append(dot, document.createTextNode(trophy.grade));
  return span;
}

function tagRow(trophy) {
  const row = el('div', 'tags');
  for (const kind of trophy.kind ?? []) row.append(el('span', 'tag', kindLabel(kind)));
  if (trophy.missable) row.append(el('span', 'tag missable', 'missable'));
  else if (trophy.missable_note) row.append(el('span', 'tag missable', 'time-sensitive'));
  if (trophy.hidden) row.append(el('span', 'tag hidden', 'hidden'));
  return row;
}

export function renderChecklist(listEl, hintEl, trophies, state, filters, selectedName, hooks) {
  const shown = applyFilters(trophies, state, filters);
  hintEl.textContent = `Showing ${shown.length} of 55 trophies — ${earnedCount(state, trophies)} earned.`;
  listEl.replaceChildren();
  for (const t of shown) {
    const li = el('li', `trophy${isEarned(state, t) ? ' earned' : ''}${selectedName === t.name ? ' selected' : ''}`);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned(state, t);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', (ev) => { ev.stopPropagation(); hooks.onToggle(t); });
    const body = el('div');
    const masked = isMasked(state, t);
    const name = el('div', 'tname', masked ? '' : t.name);
    if (masked) name.append(el('span', 'masked', 'Hidden story trophy — earn it to reveal'));
    body.append(name);
    if (!masked) body.append(el('div', 'tdesc', t.description));
    body.append(tagRow(t));
    if (t.psn_count != null) {
      const counter = el('div', 'counter');
      const minus = el('button', null, '−');
      minus.type = 'button';
      minus.addEventListener('click', (ev) => { ev.stopPropagation(); hooks.onBump(t, -1); });
      const plus = el('button', null, '+');
      plus.type = 'button';
      plus.addEventListener('click', (ev) => { ev.stopPropagation(); hooks.onBump(t, 1); });
      const n = el('span', 'n', `${counterOf(state, t)} / ${t.psn_count}`);
      counter.append(minus, n, plus, document.createTextNode('PSN progress'));
      body.append(counter);
    }
    li.append(box, body, gradeBadge(t));
    li.addEventListener('click', () => hooks.onSelect(t));
    listEl.append(li);
  }
  if (shown.length === 0) {
    listEl.append(el('li', 'trophy', 'Nothing matches those filters.'));
  }
}

export function renderGuide(paneEl, trophy, state, sourceUrls) {
  paneEl.replaceChildren();
  if (!trophy) {
    paneEl.append(el('p', 'guide-empty', 'Pick a trophy on the left to read its guide — what to do, where, when it can be missed, and the sources behind it.'));
    return;
  }
  const masked = isMasked(state, trophy);
  paneEl.append(el('h2', null, masked ? 'Hidden story trophy' : trophy.name));
  const head = el('p');
  head.append(gradeBadge(trophy));
  paneEl.append(head);
  if (masked) {
    paneEl.append(el('p', 'gdesc', 'This story trophy stays hidden until you earn it. Its grade is shown; the name, description and guide stay masked.'));
    return;
  }
  paneEl.append(el('p', 'gdesc', `“${trophy.description}”`));
  paneEl.append(el('p', 'gtext', trophy.guide));
  if (trophy.missable_note) {
    paneEl.append(el('div', 'warnbox', `⚠ ${trophy.missable_note}`));
  }
  if (trophy.unconfirmed) {
    paneEl.append(el('div', 'unconfirmed', 'Method unconfirmed at launch: no guide has verified how this unlocks yet. The description above is the only hint — this guide does not invent a location or a step.'));
  }
  if (isEarned(state, trophy)) {
    paneEl.append(el('p', 'earnedline', `✓ Earned ${state.earned[trophy.name] ?? ''}`));
  }
  const sources = el('p', 'sources', 'Sources: ');
  for (const name of trophy.sources ?? []) {
    const url = sourceUrls[name];
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = name;
      sources.append(a);
    } else {
      sources.append(document.createTextNode(name));
    }
  }
  paneEl.append(sources);
}

export function nextUpTrophy(trophies, state) {
  const ordered = [...trophies].sort((a, b) => (a.roadmap_stage - b.roadmap_stage) || (a.id - b.id));
  return ordered.find((t) => !isEarned(state, t)) ?? null;
}

export function renderRoadmap(roadmapEl, nextUpEl, trophies, state, onSelect) {
  const next = nextUpTrophy(trophies, state);
  nextUpEl.replaceChildren();
  if (next) {
    nextUpEl.append(el('h2', null, `Next up: ${next.name}`));
    nextUpEl.append(el('p', null, `Stage ${next.roadmap_stage} · ${next.grade} · ${next.description}`));
    const btn = el('button', 'chip', 'Open its guide →');
    btn.type = 'button';
    btn.addEventListener('click', () => onSelect(next));
    nextUpEl.append(btn);
  } else {
    nextUpEl.append(el('h2', null, 'Platinum earned — Vice Got a Price!'));
    nextUpEl.append(el('p', null, 'All 55 trophies are checked off. Leonida Legend.'));
  }
  roadmapEl.replaceChildren();
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.roadmap_stage === stage.n);
    const done = members.filter((t) => isEarned(state, t)).length;
    const card = el('div', 'stage');
    const h = el('h3', null, `Stage ${stage.n} — ${stage.title} `);
    h.append(el('span', 'stagecount', `(${done}/${members.length} earned)`));
    card.append(h, el('p', null, stage.blurb));
    const chips = el('div', 'chips');
    for (const t of members) {
      const chip = el('button', `chip${isEarned(state, t) ? ' done' : ''}`, t.name);
      chip.type = 'button';
      chip.addEventListener('click', () => onSelect(t));
      chips.append(chip);
    }
    card.append(chips);
    roadmapEl.append(card);
  }
}

export function renderMissables(listEl, trophies, state) {
  listEl.replaceChildren();
  const flagged = trophies.filter((t) => t.missable_note);
  for (const t of flagged) {
    const card = el('div', 'misscard');
    card.append(el('h3', null, `${t.missable ? 'Missable risk' : 'Time-sensitive'} — ${t.name}`));
    card.append(el('p', null, t.missable_note));
    card.append(el('p', null, t.guide));
    listEl.append(card);
  }
  if (flagged.length === 0) listEl.append(el('p', null, 'No missable trophies flagged.'));
}

export function renderProgress(breakdownEl, counterEl, trophies, state) {
  breakdownEl.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const members = trophies.filter((t) => t.grade === grade);
    const done = members.filter((t) => isEarned(state, t)).length;
    const cell = el('div', 'bcell');
    cell.append(el('div', 'num', `${done}/${members.length}`), el('div', 'lbl', grade));
    breakdownEl.append(cell);
  }
  counterEl.replaceChildren();
  for (const t of trophies.filter((x) => x.psn_count != null)) {
    const li = el('li');
    li.append(el('span', null, t.name), el('span', 'cnum', `${counterOf(state, t)} / ${t.psn_count}`));
    counterEl.append(li);
  }
}
