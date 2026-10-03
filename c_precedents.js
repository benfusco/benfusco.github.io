(() => {
/* Matrix view: designers as columns, projects as cards on a pan/zoom board.
   Needs: c_projects (from projects.js) and an empty <div id="matrix"></div>. */

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

// Years: negative numbers are BCE (e.g. -500 shows as 500 BCE)
const fmtYear = y => y == null ? '' : y < 0 ? `${-y} BCE` : String(y);

function makeCard(p) {
  const card = el('div', 'card'), info = el('div'), title = el('b');
  card.dataset.id = p.id;
  card.title = 'Click to edit';
  card.addEventListener('click', e => {
    if (e.target.closest('a')) return;   // title link still opens the project URL
    document.dispatchEvent(new CustomEvent('prec:edit', { detail: p.id }));
  });
  if (p.url) {
    const a = el('a', '', p.title);
    a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
    title.appendChild(a);
  } else {
    title.textContent = p.title;
  }
  info.append(title, el('small', '', p.type || ''), el('small', '', p.location || ''), el('small', '', fmtYear(p.year)));
  card.appendChild(info);
  if (p.image) {
    const img = el('img');
    img.src = p.image; img.alt = p.title; img.loading = 'lazy';
    img.onerror = () => img.remove();
    card.appendChild(img);
  }
  return card;
}

function groupBy(projects, keyFn) {
  const groups = {};
  projects.forEach(p => (groups[keyFn(p)] ||= []).push(p));
  return groups;
}

function enablePanZoom(board, world) {
  let scale = 1, x = 0, y = 0, drag = null;

  const apply = () => { world.style.transform = `translate(${x}px,${y}px) scale(${scale})`; };

  const zoomAt = (factor, px, py) => {
    const next = Math.min(2.5, Math.max(0.08, scale * factor));
    x = px - (px - x) * (next / scale);
    y = py - (py - y) * (next / scale);
    scale = next;
    apply();
  };

  const fit = () => {
    const vw = board.clientWidth, vh = board.clientHeight;
    const ww = world.offsetWidth, wh = world.offsetHeight;
    scale = Math.max(0.25, Math.min((vw - 80) / ww, (vh - 80) / wh, 1));
    x = ww * scale < vw ? (vw - ww * scale) / 2 : 40;
    y = 40;
    apply();
  };

  const controls = el('div', 'zoom');
  [
    ['+', () => zoomAt(1.25, board.clientWidth / 2, board.clientHeight / 2)],
    ['\u2212', () => zoomAt(0.8, board.clientWidth / 2, board.clientHeight / 2)],
    ['Fit', fit]
  ].forEach(([label, fn]) => {
    const b = el('button', 'ghost', label);
    b.onclick = fn;
    controls.appendChild(b);
  });
  board.appendChild(controls);

  board.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const r = board.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - r.left, e.clientY - r.top);
    } else {
      x -= e.deltaX; y -= e.deltaY; apply();
    }
  }, {passive: false});

  board.addEventListener('pointerdown', e => {
    if (e.target.closest('.card, button')) return;
    drag = {x: e.clientX - x, y: e.clientY - y};
    board.setPointerCapture(e.pointerId);
    board.classList.add('grab');
  });
  board.addEventListener('pointermove', e => {
    if (!drag) return;
    x = e.clientX - drag.x; y = e.clientY - drag.y; apply();
  });
  const stop = () => { drag = null; board.classList.remove('grab'); };
  board.addEventListener('pointerup', stop);
  board.addEventListener('pointercancel', stop);

  fit();
}

const TYPES = ['Building', 'Hypothetical', 'Writing', 'Drawing', 'Painting', 'Sculpture'];
const MAX_PX_PER_YEAR = 320;   // timeline never spreads wider than this per year
const LANE_GAP = 24;           // vertical space between rows of overlapping columns
const NICE_STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
const COL_W = 280;         // width of a year column
const COL_TOP = 70;        // space above cards for the axis

// Matrix: designers across the top, project types down the side.
// Rows follow TYPES order; types nobody uses are hidden; untyped projects go in "Unsorted".
function buildMatrix(projects, world) {
  const designers = [...new Set(projects.map(p => p.designer || 'Unknown'))].sort((a, b) => a.localeCompare(b));
  const typeOf = p => TYPES.includes(p.type) ? p.type : 'Unsorted';
  const rows = [...TYPES, 'Unsorted'].filter(t => projects.some(p => typeOf(p) === t));

  world.classList.add('matrix');
  world.style.setProperty('--cols', designers.length);

  world.appendChild(el('div', 'corner'));
  designers.forEach(d => world.appendChild(el('h2', 'colhead', d)));

  rows.forEach(type => {
    world.appendChild(el('div', 'rowlabel', type));
    designers.forEach(d => {
      const cell = el('div', 'cell'), stack = el('div', 'stack');
      projects
        .filter(p => (p.designer || 'Unknown') === d && typeOf(p) === type)
        .sort((a, b) => (a.year || 9999) - (b.year || 9999))
        .forEach(p => stack.appendChild(makeCard(p)));
      cell.appendChild(stack);
      world.appendChild(cell);
    });
  });
}

// Timeline scaled to the dates available: the whole range is fitted to the width of the board,
// whether that is a few years or thousands (never wider than MAX_PX_PER_YEAR per year). Columns that would overlap
// are placed on separate rows ("lanes"), with a thin line back to their spot on the axis.
// Must be called after `world` is in the page so heights can be measured.
function buildTimeline(projects, world, viewWidth) {
  world.classList.add('timeline');
  const dated = projects.filter(p => Number.isFinite(p.year));
  const undated = projects.filter(p => !Number.isFinite(p.year));
  const groups = groupBy(dated, p => p.year);
  const years = Object.keys(groups).map(Number).sort((a, b) => a - b);
  const min = years.length ? years[0] : 0;
  const max = years.length ? years[years.length - 1] : 0;
  const range = max - min;
  // fit the whole date range to the width of the board (leaving room for the last column)
  const avail = Math.max(500, viewWidth - COL_W * (undated.length ? 2 : 1) - 140);
  const ppy = range ? Math.min(MAX_PX_PER_YEAR, avail / range) : MAX_PX_PER_YEAR;  // pixels per year
  let width = years.length ? range * ppy + COL_W : 0;

  const axis = el('div', 'axis');
  world.appendChild(axis);
  const addTick = (label, left, cls) => {
    const t = el('div', 'tick' + (cls ? ' ' + cls : ''), label);
    t.style.left = left + 'px';
    world.appendChild(t);
  };

  // axis ticks at "nice" intervals that stay readable at this scale
  if (years.length) {
    const step = NICE_STEPS.find(s => s * ppy >= 90) || NICE_STEPS[NICE_STEPS.length - 1];
    for (let y = Math.ceil(min / step) * step; y <= max; y += step) {
      addTick(fmtYear(y), (y - min) * ppy, y % (step * 5) === 0 ? 'decade' : '');
    }
  }

  const items = years.map(y => ({ left: (y - min) * ppy, list: groups[y], label: fmtYear(y) }));
  if (undated.length) {
    const left = width ? width + 80 : 0;
    addTick('Undated', left, 'decade');
    items.push({ left, list: undated, label: 'Undated' });
    width = left + COL_W;
  }

  // assign each column to the first lane where it doesn't overlap
  const laneEdge = [];
  items.forEach(it => {
    let lane = laneEdge.findIndex(edge => edge + 16 <= it.left);
    if (lane === -1) lane = laneEdge.length;
    laneEdge[lane] = it.left + COL_W;
    it.lane = lane;

    const col = el('div', 'col'), stack = el('div', 'stack');
    it.list.sort((a, b) => (a.designer || '').localeCompare(b.designer || '') || a.title.localeCompare(b.title))
      .forEach(p => stack.appendChild(makeCard(p)));
    col.append(el('div', 'yearlabel', it.label), stack);
    col.style.left = it.left + 'px';
    world.appendChild(col);
    it.col = col;
  });

  // measure, then stack the lanes one under another
  const laneH = laneEdge.map(() => 0);
  items.forEach(it => { laneH[it.lane] = Math.max(laneH[it.lane], it.col.offsetHeight); });
  const laneTop = [];
  let y = COL_TOP;
  laneH.forEach((h, i) => { laneTop[i] = y; y += h + LANE_GAP; });

  items.forEach(it => {
    const top = laneTop[it.lane];
    it.col.style.top = top + 'px';
    const stem = el('div', 'stem');
    stem.style.left = it.left + 'px';
    stem.style.top = '36px';
    stem.style.height = (top - 36) + 'px';
    world.appendChild(stem);
  });

  axis.style.width = width + 'px';
  world.style.width = width + 'px';
  world.style.height = Math.max(COL_TOP, y - LANE_GAP) + 'px';
}

// Free key from https://carto.com/basemaps/apikey (emailed instantly, no account). Paste it between the quotes.
const CARTO_KEY = 'cb1_4860_1_aa0979f5aa48eb03c7cc56f1';
const CARTO_STYLE = 'light_all';   // other options: 'light_all', 'voyager_nolabels','Dark-matter'

let leafletMap = null;

// Map: one marker per project with coordinates, clustered where they overlap.
function buildMap(mount, projects) {
  if (typeof L === 'undefined') {
    mount.appendChild(el('p', 'empty', 'The map library could not be loaded.'));
    return;
  }
  const box = el('div');
  box.id = 'map';
  mount.appendChild(box);

  leafletMap = L.map(box).setView([30, 0], 2);
  // Base map. With a free CARTO key: simple light map. Without one: standard OpenStreetMap.
  const tiles = CARTO_KEY
    ? {
        url: `https://{s}.basemaps.cartocdn.com/rastertiles/${CARTO_STYLE}/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd', maxZoom: 19
      }
    : {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
      };
  L.tileLayer(tiles.url, tiles).addTo(leafletMap);

  const located = projects.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  // Marker and cluster looks are set in styles.css (.prec-marker, .prec-cluster)
  const markerIcon = L.divIcon({ className: 'prec-marker', iconSize: [16, 16] });
  const clusterIcon = c => L.divIcon({
    html: `<span>${c.getChildCount()}</span>`, className: 'prec-cluster', iconSize: [34, 34]
  });
  const layer = L.markerClusterGroup
    ? L.markerClusterGroup({ iconCreateFunction: clusterIcon, showCoverageOnHover: false })
    : L.layerGroup();
  located.forEach(p => L.marker([p.lat, p.lng], { icon: markerIcon }).bindPopup(() => makeCard(p), { minWidth: 240 }).addTo(layer));
  leafletMap.addLayer(layer);
  if (located.length) leafletMap.fitBounds(located.map(p => [p.lat, p.lng]), { padding: [40, 40], maxZoom: 12 });

  const missing = projects.length - located.length;
  if (missing) mount.appendChild(el('p', 'empty', `${missing} project${missing > 1 ? 's have' : ' has'} no map location.`));
}

function renderBoard(projects, view) {
  const mount = document.getElementById('matrix');
  if (leafletMap) { leafletMap.remove(); leafletMap = null; }
  mount.innerHTML = '';
  if (!projects.length) {
    mount.appendChild(el('p', 'empty', 'No projects yet.'));
    return;
  }
  if (view === 'map') return buildMap(mount, projects);

  const board = el('div'), world = el('div');
  board.id = 'board';
  world.id = 'world';
  board.appendChild(world);
  mount.appendChild(board);

  if (view === 'timeline') buildTimeline(projects, world, board.clientWidth);
  else buildMatrix(projects, world);

  enablePanZoom(board, world);
}

let data = typeof c_projects !== 'undefined' ? c_projects : [];
let currentView = 'matrix';
const switchButtons = document.querySelectorAll('.prec-views button');
switchButtons.forEach(btn => btn.addEventListener('click', () => {
  switchButtons.forEach(b => b.classList.toggle('on', b === btn));
  currentView = btn.dataset.v;
  renderBoard(data, currentView);
}));
renderBoard(data, currentView);

// lets c_editor.js refresh the board after saving
window.PrecedentsBoard = { setData(list) { data = list; renderBoard(data, currentView); } };
})();