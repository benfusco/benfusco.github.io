/* Add / edit / delete projects and save them to GitHub (c_prec-data/projects.js).
   Needs: c_projects (from projects.js), the #editor section in the HTML,
   and c_precedents.js (for the board refresh). */
(() => {
  const $ = id => document.getElementById(id);
  const FIELDS = ['title', 'type', 'year', 'designer', 'location', 'url', 'image'];
  const IMAGE_DIR = 'c_prec-data/images';

  // Fixed settings. Check these match your repo; only the token is entered in the page.
  const REPO = 'benfusco/benfusco.github.io';
  const BRANCH = 'main';
  const DATA_PATH = 'c_prec-data/projects.js';

  let projects = typeof c_projects !== 'undefined' ? c_projects.slice() : [];
  let editingId = null;

  /* ---------- helpers ---------- */
  const say = (text, ok = true) => { const m = $('e_msg'); m.textContent = text; m.className = ok ? 'ok' : 'err'; };
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const b64enc = s => btoa(unescape(encodeURIComponent(s)));
  const b64dec = s => decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));
  const parseJs = t => JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1));
  const toJs = list => `const c_projects = ${JSON.stringify(list, null, 2)};\n`;
  const refreshBoard = () => window.PrecedentsBoard && window.PrecedentsBoard.setData(projects);

  /* ---------- GitHub token ---------- */
  const cfg = () => ({ repo: REPO, branch: BRANCH, path: DATA_PATH, token: $('e_token').value.trim() });
  try { $('e_token').value = localStorage.getItem('precedent-token') || ''; } catch (e) {}
  $('e_token').addEventListener('change', () => {
    try { localStorage.setItem('precedent-token', $('e_token').value.trim()); say('Token saved in this browser.'); }
    catch (e) { say('Could not store the token.', false); }
  });

  const api = (path, opts = {}) => fetch(`https://api.github.com/repos/${cfg().repo}/contents/${path}`, {
    ...opts,
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${cfg().token}` }
  });

  // Reads the latest file from GitHub, applies `change`, writes it back.
  async function writeProjects(change, message) {
    const c = cfg();
    if (!c.token) throw new Error('Enter your access token first.');
    const r = await api(`${c.path}?ref=${c.branch}`);
    let latest = [], sha;
    if (r.ok) { const j = await r.json(); sha = j.sha; latest = parseJs(b64dec(j.content)); }
    else if (r.status !== 404) throw new Error('GitHub returned ' + r.status);
    const next = change(latest);
    const w = await api(c.path, { method: 'PUT', body: JSON.stringify({ message, branch: c.branch, sha, content: b64enc(toJs(next)) }) });
    if (!w.ok) throw new Error('GitHub returned ' + w.status);
    projects = next;
    refreshBoard(); fillPicker();
  }

  async function geocode(q) {
    if (!q) return {};
    try {
      const j = await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q))).json();
      return j[0] ? { lat: +(+j[0].lat).toFixed(5), lng: +(+j[0].lon).toFixed(5) } : {};
    } catch (e) { return {}; }
  }

  async function uploadImage(file, name) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${IMAGE_DIR}/${name}.${ext}`;
    const data = await new Promise((res, rej) => { const f = new FileReader(); f.onload = () => res(f.result.split(',')[1]); f.onerror = rej; f.readAsDataURL(file); });
    const existing = await api(`${path}?ref=${cfg().branch}`);
    const sha = existing.ok ? (await existing.json()).sha : undefined;
    const r = await api(path, { method: 'PUT', body: JSON.stringify({ message: `Add image ${name}`, branch: cfg().branch, sha, content: data }) });
    if (!r.ok) throw new Error('Image upload failed: ' + r.status);
    return path;
  }

  /* ---------- form ---------- */
  function fillPicker() {
    const pick = $('e_pick');
    pick.innerHTML = '';
    pick.appendChild(new Option('New project', ''));
    projects.slice().sort((a, b) => a.title.localeCompare(b.title))
      .forEach(p => pick.appendChild(new Option(`${p.title}${p.year ? ' (' + p.year + ')' : ''}`, p.id)));
    pick.value = editingId || '';
    const list = $('e_designers');
    list.innerHTML = '';
    [...new Set(projects.map(p => p.designer).filter(Boolean))].sort().forEach(d => list.appendChild(new Option(d)));
  }

  const highlight = id => {
    document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
    if (id) document.querySelectorAll('.card').forEach(c => { if (c.dataset.id === id) c.classList.add('selected'); });
  };

  function clearForm() {
    highlight(null);
    editingId = null;
    FIELDS.forEach(f => { $('e_' + f).value = ''; });
    $('e_file').value = '';
    $('e_pick').value = '';
    $('e_delete').hidden = true;
    $('e_save').textContent = 'Add project';
  }

  function loadIntoForm(id) {
    const p = projects.find(x => x.id === id);
    if (!p) return clearForm();
    editingId = id;
    FIELDS.forEach(f => { $('e_' + f).value = p[f] ?? ''; });
    $('e_file').value = '';
    $('e_delete').hidden = false;
    $('e_save').textContent = 'Save changes';
    $('e_pick').value = id;
    highlight(id);
    say(`Editing "${p.title}". Leave the image fields empty to keep the current image.`);
  }

  // clicking a card on the board opens it here
  document.addEventListener('prec:edit', e => {
    loadIntoForm(e.detail);
    $('editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('e_pick').onchange = e => e.target.value ? loadIntoForm(e.target.value) : clearForm();
  $('e_clear').onclick = () => { clearForm(); say(''); };

  $('e_save').onclick = async () => {
    const title = $('e_title').value.trim();
    if (!title) return say('Enter a title.', false);
    const type = $('e_type').value;
    if (!type) return say('Choose a type.', false);
    const year = $('e_year').value ? +$('e_year').value : null;
    const old = projects.find(p => p.id === editingId);
    const location = $('e_location').value.trim();
    let id = editingId;
    if (!id) {
      id = slug(title + (year ? '-' + year : ''));
      if (projects.some(p => p.id === id)) return say('A project with this title and year already exists.', false);
    }
    say('Saving…');
    try {
      const geo = old && old.location === location && old.lat != null ? { lat: old.lat, lng: old.lng } : await geocode(location);
      let image = $('e_image').value.trim() || (old ? old.image : '') || '';
      const file = $('e_file').files[0];
      if (file) image = await uploadImage(file, id);
      const rec = { id, title, type, year, designer: $('e_designer').value.trim(), location, ...geo, url: $('e_url').value.trim(), image };
      const wasEditing = !!editingId;
      await writeProjects(list => list.some(p => p.id === id) ? list.map(p => p.id === id ? rec : p) : [...list, rec],
        `${wasEditing ? 'Edit' : 'Add'} ${title}`);
      clearForm();
      say(geo.lat != null ? 'Saved. The live site updates in about a minute.' : 'Saved, but the location was not found so it has no map coordinates.');
    } catch (e) { say(e.message, false); }
  };

  $('e_delete').onclick = async () => {
    const p = projects.find(x => x.id === editingId);
    if (!p || !confirm(`Delete "${p.title}"?`)) return;
    say('Deleting…');
    try {
      await writeProjects(list => list.filter(x => x.id !== p.id), `Delete ${p.title}`);
      clearForm();
      say('Deleted.');
    } catch (e) { say(e.message, false); }
  };

  fillPicker();
  clearForm();
})();