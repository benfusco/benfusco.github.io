(() => {
/* Matrix view: designers as columns, projects as cards on a pan/zoom board.
   Needs: c_projects (from projects.js) and an empty <div id="matrix"></div>. */

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

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
  info.append(title, el('small', '', p.type || ''), el('small', '', p.location || ''), el('small', '', p.year ?? ''));
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
const PX_PER_YEAR = 320;   // horizontal scale of the timeline
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

// True-to-scale timeline: x position = year. Same-year projects stack in one column.
// Must be called after `world` is in the page so heights can be measured.
function buildTimeline(projects, world) {
  world.classList.add('timeline');
  const dated = projects.filter(p => Number.isFinite(p.year));
  const undated = projects.filter(p => !Number.isFinite(p.year));
  const groups = groupBy(dated, p => p.year);
  const years = dated.map(p => p.year);
  const min = years.length ? Math.min(...years) : 0;
  const max = years.length ? Math.max(...years) : 0;
  let width = years.length ? (max - min) * PX_PER_YEAR + COL_W : 0;

  const axis = el('div', 'axis');
  world.appendChild(axis);

  const addTick = (label, left, cls) => {
    const t = el('div', 'tick' + (cls ? ' ' + cls : ''), label);
    t.style.left = left + 'px';
    world.appendChild(t);
  };
  const addColumn = (list, left) => {
    const col = el('div', 'col'), stack = el('div', 'stack');
    list.sort((a, b) => (a.designer || '').localeCompare(b.designer || '') || a.title.localeCompare(b.title))
        .forEach(p => stack.appendChild(makeCard(p)));
    col.style.left = left + 'px';
    col.appendChild(stack);
    world.appendChild(col);
  };

  if (years.length) {
    for (let y = min; y <= max; y++) addTick(y, (y - min) * PX_PER_YEAR, y % 10 === 0 ? 'decade' : '');
    Object.keys(groups).forEach(y => addColumn(groups[y], (y - min) * PX_PER_YEAR));
  }
  if (undated.length) {
    const left = width ? width + 80 : 0;
    addTick('Undated', left, 'decade');
    addColumn(undated, left);
    width = left + COL_W;
  }

  axis.style.width = width + 'px';
  world.style.width = width + 'px';
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
  const layer = L.markerClusterGroup ? L.markerClusterGroup() : L.layerGroup();
  located.forEach(p => L.marker([p.lat, p.lng]).bindPopup(() => makeCard(p), { minWidth: 240 }).addTo(layer));
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