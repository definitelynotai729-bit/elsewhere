// The player's local profile: look, inventory, progress, settings.
// Prototype note: this lives in the browser. In the chain version, ownership of items
// and sigils moves to the ledger and this becomes a cache.
const KEY = 'elsewhere_profile_v1';

const fresh = () => ({
  v: 1,
  name: '',
  colors: { body: '#3ec8ff', head: '#eef1ff', visor: '#ff4fd8' },
  online: true,
  coins: 0,
  inv: {},            // itemId -> count
  eq: { head: null, back: null, hand: null, feet: null, board: null },
  flags: {},          // global quest flags, e.g. 'sigil.sky'
  worlds: {},         // worldId -> { coins: {id: 1}, store: {}, visits: n }
  settings: { quality: 'auto', sfx: true, music: true, sens: 1, invertY: false },
  created: 0,
});

let memory = null;
export const profile = {
  data: fresh(),
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.data = Object.assign(fresh(), JSON.parse(raw));
    } catch (e) {
      if (memory) this.data = memory;
    }
    const d = this.data;
    d.settings = Object.assign(fresh().settings, d.settings || {});
    d.eq = Object.assign(fresh().eq, d.eq || {});
    d.colors = Object.assign(fresh().colors, d.colors || {});
    return d;
  },
  save() {
    memory = this.data;
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {}
  },
  world(id) {
    const w = this.data.worlds[id] || (this.data.worlds[id] = { coins: {}, store: {}, visits: 0 });
    w.coins = w.coins || {}; w.store = w.store || {};
    return w;
  },
  reset() { this.data = fresh(); this.save(); },
  exportCode() { return btoa(unescape(encodeURIComponent(JSON.stringify(this.data)))); },
  importCode(code) {
    const d = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!d || d.v !== 1) throw new Error('not an Elsewhere profile');
    this.data = Object.assign(fresh(), d);
    this.save();
  },
};
