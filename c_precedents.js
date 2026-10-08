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
    img.referrerPolicy = 'no-referrer';   // many sites block images when they see a referrer
    img.src = p.image; img.alt = p.title; img.loading = 'lazy';
    img.onerror = () => { console.warn('Image failed to load:', p.title, p.image); img.remove(); };
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

  const pts = new Map();   // fingers / pointers currently down, by id
  let pinch = null;        // set while two fingers are down

  const pinchState = () => {
    const [a, b] = [...pts.values()];
    return { cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, dist: Math.hypot(a.x - b.x, a.y - b.y) || 1 };
  };

  board.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    board.dataset.moved = '0';
    if (pts.size === 2) {                         // second finger: start pinch
      drag = null;
      pinch = pinchState();
      pts.forEach((_, id) => board.setPointerCapture(id));
      board.classList.add('grab');
    } else if (pts.size === 1 && !e.target.closest('.card')) {   // one finger on empty space: pan
      drag = { x: e.clientX - x, y: e.clientY - y, sx: e.clientX, sy: e.clientY };
      board.setPointerCapture(e.pointerId);
      board.classList.add('grab');
    }
  });

  board.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size === 2) {                // two fingers: zoom and pan together
      const m = pinchState(), r = board.getBoundingClientRect();
      x += m.cx - pinch.cx; y += m.cy - pinch.cy;
      zoomAt(m.dist / pinch.dist, m.cx - r.left, m.cy - r.top);
      pinch = m;
      board.dataset.moved = '1';
    } else if (drag) {                            // one finger / mouse: pan
      x = e.clientX - drag.x; y = e.clientY - drag.y; apply();
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 4) board.dataset.moved = '1';
    }
  });

  const release = e => {
    pts.delete(e.pointerId);
    pinch = null;
    if (pts.size === 1) {                         // one finger left after a pinch: keep panning
      const [p] = pts.values();
      drag = { x: p.x - x, y: p.y - y, sx: p.x, sy: p.y };
    } else if (pts.size === 0) {
      drag = null;
      board.classList.remove('grab');
    }
  };
  board.addEventListener('pointerup', release);
  board.addEventListener('pointercancel', release);

  fit();
}

const TYPES = ['Building', 'Hypothetical', 'Writing', 'Drawing', 'Painting', 'Sculpture'];
const PER_ROW = 10;        // designers per row in the matrix
const COL_W = 280;            // width of a column of cards
const COL_TOP = 70;           // space above cards for the axis
const MAX_PER_COL = 6;        // cards per column; busier years get extra columns
const COL_GAP = 16;           // space between extra columns of the same year
const YEAR_GAP = 28;          // space between neighbouring years that have projects
const SPAN_GAP = 6;           // extra space for each empty year in a short gap
const SHORT_GAP_YEARS = 10;   // gaps longer than this are collapsed into decades
const BREAK_BASE = 110;       // minimum space for a long empty stretch
const BREAK_PER_DECADE = 8;   // extra space per empty decade in a long stretch
const BREAK_MAX = 420;        // a long stretch never takes more than this


// Matrix: one section per project type, each section a wrapping grid of designers
// (PER_ROW across). A designer appears in every section where they have projects.
// Sections follow TYPES order; types nobody uses are hidden; untyped projects go in "Unsorted".
function buildMatrix(projects, world) {
  const typeOf = p => TYPES.includes(p.type) ? p.type : 'Unsorted';
  const nameOf = p => p.designer || 'Unknown';
  const sections = [...TYPES, 'Unsorted']
    .map(type => ({ type, list: projects.filter(p => typeOf(p) === type) }))
    .filter(s => s.list.length);
  const widest = Math.max(...sections.map(s => new Set(s.list.map(nameOf)).size));

  world.classList.add('matrix');
  world.style.setProperty('--per-row', Math.min(PER_ROW, widest));

  sections.forEach(({ type, list }) => {
    const section = el('div', 'mtype'), grid = el('div', 'mgrid');
    const groups = groupBy(list, nameOf);
    Object.keys(groups).sort((a, b) => a.localeCompare(b)).forEach(name => {
      const col = el('div', 'dcol'), stack = el('div', 'stack');
      groups[name]
        .sort((a, b) => (a.year || 9999) - (b.year || 9999))
        .forEach(p => stack.appendChild(makeCard(p)));
      col.append(el('h3', 'colhead', name), stack);
      grid.appendChild(col);
    });
    section.append(el('h2', 'typehead', type), grid);
    world.appendChild(section);
  });
}

// Timeline: only years that have projects get space. Years with many projects get extra
// columns; short gaps stay short; long empty stretches collapse into a small break scaled by decades.
function buildTimeline(projects, world) {
  world.classList.add('timeline');
  const dated = projects.filter(p => Number.isFinite(p.year));
  const undated = projects.filter(p => !Number.isFinite(p.year));
  const groups = groupBy(dated, p => p.year);
  const years = Object.keys(groups).map(Number).sort((a, b) => a - b);

  const axis = el('div', 'axis');
  world.appendChild(axis);
  let x = 0;

  const place = (label, list) => {
    list.sort((a, b) => (a.designer || '').localeCompare(b.designer || '') || a.title.localeCompare(b.title));
    const tick = el('div', 'tick decade', label);
    tick.style.left = x + 'px';
    world.appendChild(tick);
    const n = Math.ceil(list.length / MAX_PER_COL);
    for (let i = 0; i < n; i++) {
      const col = el('div', 'col'), stack = el('div', 'stack');
      list.slice(i * MAX_PER_COL, (i + 1) * MAX_PER_COL).forEach(p => stack.appendChild(makeCard(p)));
      col.appendChild(stack);
      col.style.left = x + 'px';
      world.appendChild(col);
      x += COL_W + (i < n - 1 ? COL_GAP : 0);
    }
  };

  years.forEach((y, i) => {
    if (i > 0) {
      const d = y - years[i - 1];
      const long = d > SHORT_GAP_YEARS;
      const gap = long
        ? Math.min(BREAK_MAX, BREAK_BASE + Math.floor(d / 10) * BREAK_PER_DECADE)
        : YEAR_GAP + (d - 1) * SPAN_GAP;
      if (long) {
        const note = el('div', 'gaplabel', `${d.toLocaleString()} years`);
        note.style.left = x + 'px';
        note.style.width = gap + 'px';
        world.appendChild(note);
      }
      x += gap;
    }
    place(fmtYear(y), groups[y]);
  });

  if (undated.length) {
    if (years.length) x += 90;
    place('Undated', undated);
  }

  axis.style.width = x + 'px';
  world.style.width = x + 'px';
  const bottoms = [...world.querySelectorAll('.col')].map(c => c.offsetTop + c.offsetHeight);
  world.style.height = Math.max(COL_TOP, ...bottoms) + 'px';
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

  if (view === 'timeline') buildTimeline(projects, world);
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