// The 'ultra' graphics preset, for desktop GPUs (phones keep medium and low). The preset itself (occlusion, soft
// shadows, the grade and the per-world looks) is gfx_ultra.js, its own file, loaded the first time a player picks
// ultra; until it arrives the game renders at 'high'. Visual only: world code never reads it and replays never load it.
import * as THREE from 'three';

// Adds the ultra preset to the renderer made by render.js (createRender). This file is imported by main.js only,
// and render.js stays as it is: render.js is part of the engine module that verifiers replay (for its materials),
// and any edit there, even to code the engine never runs, renames its minified symbols and so changes the engine's
// hash. Ultra therefore wraps setQuality, resize, applyTheme and render from outside.
export function installUltra(R) {
  const base = { setQuality: R.setQuality, resize: R.resize, applyTheme: R.applyTheme, render: R.render };
  const size = new THREE.Vector2();
  R.ultra = null;
  let createUltra = null, loading = null, want = false;
  const load = (r) => loading || (loading = import('./gfx_ultra.js').then((m) => {
    createUltra = m.createUltra;
    if (want) r.setQuality('ultra'); // still wanted: switch now
  }).catch((err) => { loading = null; console.warn('[ultra] the preset could not load:', err.message); }));
  R.setQuality = function (q) {
    const assets = typeof window !== 'undefined' && window.EW && window.EW.assets;
    if (assets && assets.setHiRes) assets.setHiRes(q === 'ultra'); // 1024 px texture sets, full anisotropy
    want = q === 'ultra';
    if (q !== 'ultra') {
      if (this.ultra) this.ultra.disable();
      return base.setQuality.call(this, q);
    }
    if (!createUltra) { base.setQuality.call(this, 'high'); load(this); return; } // first use: 'high' while it loads
    base.setQuality.call(this, 'medium'); // shadows on and no bloom composer of its own; then ultra's settings
    this.quality = 'ultra';
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (!this.ultra) { this.ultra = createUltra(this); this.ultra.bloom.strength = this.themeBloom == null ? 0.55 : this.themeBloom; this.ultra.themeChanged(); }
    const s = this.ultra.U.shadowSize, sh = this.sun.shadow;
    if (sh.mapSize.x !== s) { sh.mapSize.set(s, s); if (sh.map) { sh.map.dispose(); sh.map = null; } }
    this.ultra.enable();
    this.resize();
  };
  R.resize = function () {
    base.resize.call(this);
    if (this.ultra) { this.renderer.getSize(size); this.ultra.resize(size.x, size.y, this.renderer.getPixelRatio()); }
  };
  R.applyTheme = function (t = {}) {
    base.applyTheme.call(this, t);
    this.themeBloom = t.bloom == null ? 0.55 : t.bloom;
    if (this.ultra) { this.ultra.bloom.strength = this.themeBloom; this.ultra.themeChanged(); }
  };
  R.render = function () {
    if (this.quality === 'ultra' && this.ultra) this.ultra.render(); else base.render.call(this);
  };
  return R;
}
