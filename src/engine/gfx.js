// The 'ultra' graphics preset, for desktop GPUs (phones keep medium and low). On top of 'high':
//  - Ambient occlusion (GTAO, screen space), applied to the sky and ambient light only, the way occlusion works in
//    reality: sunlit surfaces keep their sunlight (the shadow map handles the sun), crevices and contact areas lose
//    the sky light they cannot see.
//  - Contact-hardening soft shadows (PCSS) from a 4096 map: sharp where an object meets the ground, softer further
//    from it, sized from the sun's angular diameter.
//  - AgX tone mapping (Blender's default view transform: bright colours roll off to white instead of shifting hue),
//    bloom, and a light photographic grade (vignette, fine grain).
//  - A per-world look (LOOKS below): more of the ambient light from the photographed sky (image-based lighting) and
//    less from the flat two-colour hemisphere light, plus exposure and shadow softness.
// Visual only, like everything in the renderer: world code never reads it and replays never load it.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { allMaterials } from './render.js';

// Per-world looks for ultra (prototype: these would become a `theme.ultra` block in WORLD_API).
//  tone: 'agx' | 'neutral' | 'aces' (the view transform), exposure: scales the theme's exposure,
//  hemi: scales the hemisphere light, env: scales the sky's image-based light (when the world has theme.sky),
//  sunLight: scales the sun, sun: penumbra size in sun diameters (1 = a clear day's real sun), ao: occlusion power,
//  aoRadius: metres, contrast and saturation: a display-space grade after tone mapping.
const LOOK_DEFAULT = { tone: 'agx', exposure: 1, hemi: 1, env: 1, sunLight: 1, sun: 2, ao: 1.5, aoRadius: 2, contrast: 1, saturation: 1 };
const LOOKS = {
  // golden hour in flat colour (ART.md): ACES keeps the palette's contrast, AgX washes the cream stone out
  hub: { tone: 'aces', hemi: 0.85, sun: 2.2, ao: 1.3 },
  skyreach: { tone: 'agx', hemi: 0.55, env: 1.3, sunLight: 1.2, exposure: 1.1, sun: 1.5, contrast: 1.15, saturation: 1.2 },
  glowcave: { tone: 'aces', aoRadius: 2 },
  rush: { tone: 'aces', hemi: 0.75, env: 1.3, sun: 1.5 },
  circuit: { tone: 'aces' },
  clash: { tone: 'aces', hemi: 0.8, env: 1.2 }, // AgX flattened the sunlit arena seen from above
};

// ---------- PCSS: contact-hardening soft shadows ----------
// The engine never uses three's plain PCF shadows, so ultra switches the renderer to PCFShadowMap and this patch
// turns that branch into PCSS. Other presets (PCF soft) compile exactly as before.
// shadowRadius carries the penumbra growth: shadow-map texels of penumbra per unit of normalised depth between the
// blocker and the receiver (set from the sun's size and the shadow camera in setSun below).
const PCSS_FUNCS = `
#if defined( SHADOWMAP_TYPE_PCF )
	#define PCSS_BLOCKER_SAMPLES 16
	#define PCSS_FILTER_SAMPLES 32
	float pcssNoise( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }
	vec2 pcssDisk( int i, int n, float phi ) {
		float r = sqrt( ( float( i ) + 0.5 ) / float( n ) );
		float t = float( i ) * 2.39996323 + phi;
		return vec2( cos( t ), sin( t ) ) * r;
	}
	float pcssShadow( sampler2D map, vec2 mapSize, float growth, vec3 c ) {
		vec2 texel = 1.0 / mapSize;
		float phi = pcssNoise( gl_FragCoord.xy ) * 6.28318530;
		// 1. the average depth of what blocks the light, searched over the widest penumbra this point could have
		float search = clamp( growth * c.z, 3.0, 24.0 );
		float sum = 0.0, n = 0.0;
		for ( int i = 0; i < PCSS_BLOCKER_SAMPLES; i ++ ) {
			float d = unpackRGBAToDepth( texture2D( map, c.xy + pcssDisk( i, PCSS_BLOCKER_SAMPLES, phi ) * search * texel ) );
			if ( d < c.z ) { sum += d; n += 1.0; }
		}
		if ( n == 0.0 ) return 1.0;
		// 2. penumbra width from the blocker-to-receiver distance, then 3. filter over it
		float pen = clamp( ( c.z - sum / n ) * growth, 1.25, 24.0 );
		float lit = 0.0;
		for ( int i = 0; i < PCSS_FILTER_SAMPLES; i ++ ) {
			lit += step( c.z, unpackRGBAToDepth( texture2D( map, c.xy + pcssDisk( i, PCSS_FILTER_SAMPLES, phi + 1.7 ) * pen * texel ) ) );
		}
		return lit / float( PCSS_FILTER_SAMPLES );
	}
#endif
`;
let patched = false;
function patchShadowChunk() {
  if (patched) return;
  const S = THREE.ShaderChunk, src = S.shadowmap_pars_fragment;
  const a = src.indexOf('#if defined( SHADOWMAP_TYPE_PCF )'), b = src.indexOf('#elif defined( SHADOWMAP_TYPE_PCF_SOFT )'), f = src.indexOf('float getShadow(');
  if (a < 0 || b < a || f < 0 || f > a) { console.warn('ultra: unexpected shadow shader; PCSS off'); return; }
  S.shadowmap_pars_fragment = src.slice(0, f) + PCSS_FUNCS + '\n\t' + src.slice(f, a)
    + '#if defined( SHADOWMAP_TYPE_PCF )\n\t\t\tshadow = pcssShadow( shadowMap, shadowMapSize, shadowRadius, shadowCoord.xyz );\n\t\t' + src.slice(b);
  patched = true;
}

// ---------- screen-space occlusion on indirect light ----------
// Opaque standard materials get the GTAO result as a screen-space map that multiplies only their indirect light
// (hemisphere + sky), plus matching specular occlusion. Materials made later are picked up within a second.
const SSAO = { tSSAO: { value: null }, ssaoInv: { value: null } }; // filled in by createUltra (nothing runs at import)
const SSAO_FRAG = `#include <aomap_fragment>
	{
		float ssao = mix( texture2D( tSSAO, gl_FragCoord.xy * ssaoInv ).r, 1.0, smoothstep( 45.0, 90.0, length( vViewPosition ) ) );
		reflectedLight.indirectDiffuse *= ssao;
		#if defined( STANDARD )
			reflectedLight.indirectSpecular *= computeSpecularOcclusion( saturate( dot( geometryNormal, geometryViewDir ) ), ssao, material.roughness );
		#endif
	}`;
// ---------- planar reflection: a polished floor (look.mirror = { y, tex: [texture ids], rough: scale }) ----------
// The scene is drawn a second time from the camera mirrored in the floor plane (half resolution, with mip maps),
// and the floor's materials take that image as their reflected sky light (in place of the environment map), blurred
// by their roughness. Only up-facing surfaces at the floor's height mirror; walls and props keep the environment.
const MIRROR = { tPlanar: { value: null }, planarMatrix: { value: null }, planarY: { value: 0 }, planarMaxLod: { value: 6 } };
const MIRROR_FRAG = `#include <lights_fragment_maps>
	#if defined( RE_IndirectSpecular )
	{
		vec3 nW = inverseTransformDirection( geometryNormal, viewMatrix );
		float onFloor = smoothstep( 0.9, 0.98, nW.y ) * ( 1.0 - smoothstep( 0.05, 0.25, abs( vPlanarWorld.y - planarY ) ) );
		if ( onFloor > 0.0 ) {
			vec4 pc = planarMatrix * vec4( vPlanarWorld, 1.0 );
			vec2 uv = pc.xy / pc.w + nW.xz * 0.04; // the normal map ripples the reflection a little
			float lod = clamp( sqrt( material.roughness ) * planarMaxLod, 0.0, planarMaxLod );
			// clamped: the sun disc in the reflected sky would otherwise glare (its direct highlight is the sun light's job)
			radiance = mix( radiance, min( textureLod( tPlanar, uv, lod ).rgb, vec3( 1.5 ) ), onFloor );
		}
	}
	#endif`;
const compilers = new Map();
function compilerFor(ssao, mirror) {
  const key = (ssao ? 'a' : '') + (mirror ? 'm' : '');
  if (!compilers.has(key)) compilers.set(key, (shader) => {
    if (ssao) {
      Object.assign(shader.uniforms, SSAO);
      shader.fragmentShader = 'uniform sampler2D tSSAO;\nuniform vec2 ssaoInv;\n' + shader.fragmentShader.replace('#include <aomap_fragment>', SSAO_FRAG);
    }
    if (mirror) {
      Object.assign(shader.uniforms, MIRROR);
      shader.vertexShader = 'varying vec3 vPlanarWorld;\n' + shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n\tvPlanarWorld = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
      shader.fragmentShader = 'uniform sampler2D tPlanar;\nuniform mat4 planarMatrix;\nuniform float planarY, planarMaxLod;\nvarying vec3 vPlanarWorld;\n'
        + shader.fragmentShader.replace('#include <lights_fragment_maps>', MIRROR_FRAG);
    }
  });
  return compilers.get(key);
}
// flags: { ssao, mirror: { rough } }. A material keeps its own roughness in userData while a mirror overrides it.
function patchMaterial(m, flags) {
  if (!m || !m.isMeshStandardMaterial || m.transparent) return;
  const cur = m.userData.ew || {}, ssao = !!flags.ssao, mirror = flags.mirror || null;
  if (cur.ssao === ssao && !!cur.mirror === !!mirror) return;
  if (cur.mirror && !mirror) m.roughness = cur.rough;
  const rough = cur.mirror ? cur.rough : m.roughness;
  if (mirror && !cur.mirror) m.roughness = rough * (mirror.rough || 1);
  if (!ssao && !mirror) { unpatchMaterial(m); return; }
  m.userData.ew = { ssao, mirror, rough };
  m.onBeforeCompile = compilerFor(ssao, !!mirror);
  m.customProgramCacheKey = () => 'ew-' + (ssao ? 'a' : '') + (mirror ? 'm' : '') + '2';
  m.needsUpdate = true;
}
function unpatchMaterial(m) {
  if (!m || !m.userData.ew) return;
  if (m.userData.ew.mirror) m.roughness = m.userData.ew.rough;
  delete m.userData.ew; delete m.onBeforeCompile; delete m.customProgramCacheKey; // back to the prototype's
  m.needsUpdate = true;
}
const eachMaterial = (scene, f) => scene.traverse((o) => { if (o.material) [].concat(o.material).forEach(f); });

// ---------- grade: vignette and fine grain, after tone mapping (display space) ----------
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null }, tAO: { value: null }, showAO: { value: 0 }, vignette: { value: 0.22 }, grain: { value: 0.018 },
    contrast: { value: 1 }, saturation: { value: 1 }, seed: { value: 0 }, aspect: { value: 1 },
  },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse, tAO; uniform float showAO, vignette, grain, contrast, saturation, seed, aspect; varying vec2 vUv;
	void main() {
		vec4 c = texture2D( tDiffuse, vUv );
		if ( showAO > 0.5 ) { gl_FragColor = vec4( texture2D( tAO, vUv ).rrr, 1.0 ); return; } // debug: the occlusion
		float l = dot( c.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
		c.rgb = clamp( mix( vec3( l ), c.rgb, saturation ), 0.0, 1.0 );
		c.rgb = clamp( ( c.rgb - 0.5 ) * contrast + 0.5, 0.0, 1.0 ); // display-space contrast around mid grey
		vec2 d = ( vUv - 0.5 ) * vec2( aspect, 1.0 );
		c.rgb *= 1.0 - vignette * smoothstep( 0.45, 1.25, length( d ) );
		float n = fract( sin( dot( floor( gl_FragCoord.xy ) + seed, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ) - 0.5;
		c.rgb += n * grain * ( 1.0 - c.rgb ) * 1.5; // grain mostly in the darks, as film does
		gl_FragColor = c;
	}`,
};
const TONES = { agx: THREE.AgXToneMapping, neutral: THREE.NeutralToneMapping, aces: THREE.ACESFilmicToneMapping };

export function createUltra(R) {
  const { renderer, scene, camera, sun, hemi } = R;
  patchShadowChunk();
  SSAO.ssaoInv.value = new THREE.Vector2(1, 1);
  const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); white.needsUpdate = true;
  SSAO.tSSAO.value = white;

  const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.45, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);

  const gtao = new GTAOPass(scene, camera, 2, 2);
  gtao.output = GTAOPass.OUTPUT.Off; // compute only: the materials read gtao.gtaoMap
  // thickness: how far (m, in depth) a sample may sit from the point and still occlude it. three's default (1) misses
  // most wall-floor corners at human scale; much more (10) darkens whole walls near depth edges.
  gtao.updateGtaoMaterial({ radius: 2, distanceExponent: 1.5, thickness: 3, scale: 1.5, samples: 16, distanceFallOff: 1.0 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, radiusExponent: 1.5, rings: 2, samples: 16 });
  // the normals-and-depth pass draws solid surfaces only: no sky, labels, particles, glass or glows
  gtao.overrideVisibility = function () {
    const cache = this._visibilityCache;
    this.scene.traverse((o) => {
      cache.set(o, o.visible);
      const m = o.material;
      if (o.isPoints || o.isLine || o.isSprite || (m && !Array.isArray(m) && (m.transparent || m.isShaderMaterial || m.depthWrite === false))) o.visible = false;
    });
  };

  // switches (EW.render.ultra.set({...}) changes them at run time, for testing):
  //  aoScale 0.5: occlusion at half resolution. On an RTX 5090 at 1080p it cut the AO cost from 0.55 to 0.13 ms and
  //  looked the same in the final image (the half-resolution buffer only shows stair-steps on its own).
  const U = {
    on: false, ao: true, aoScale: 0.5, pcss: true, grade: true, mirror: true, tone: null, showAO: false, shadowSize: 4096, look: LOOK_DEFAULT, worldId: null,
    base: null, frames: 0, size: [2, 2, 1],
  };
  // the mirror: half-resolution reflection with mip maps (rougher floors read blurrier levels)
  const planarRT = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
  MIRROR.tPlanar.value = planarRT.texture; MIRROR.planarMatrix.value = new THREE.Matrix4();
  const mirrorCam = new THREE.PerspectiveCamera();
  const mv = { fwd: new THREE.Vector3(), up: new THREE.Vector3(), target: new THREE.Vector3(), plane: new THREE.Plane(), clip: new THREE.Vector4(), q: new THREE.Vector4() };
  const mirrorMeshes = new Set();
  const texOf = (id) => { const a = typeof window !== 'undefined' && window.EW && window.EW.assets; const t = a && a.texture ? a.texture(id) : null; return t && t.map; };
  // which patch a material gets in this world: occlusion for every opaque standard material, the mirror for the floor's
  function flagsFor(m, mesh) {
    const M = U.mirror && U.look.mirror;
    const isFloor = !!(M && m.map && M.tex.some((id) => texOf(id) === m.map));
    if (isFloor && mesh) mirrorMeshes.add(mesh);
    return { ssao: U.ao, mirror: isFloor ? M : null };
  }
  const patchScene = () => scene.traverse((o) => { if (o.isMesh && o.material && !Array.isArray(o.material)) patchMaterial(o.material, flagsFor(o.material, o)); });
  function renderMirror() {
    const M = U.look.mirror, y = M.y || 0;
    // the camera mirrored in the plane y: position, view direction and up all reflected
    camera.updateMatrixWorld();
    mirrorCam.position.copy(camera.position); mirrorCam.position.y = 2 * y - camera.position.y;
    camera.getWorldDirection(mv.fwd); mv.fwd.y = -mv.fwd.y;
    mv.up.set(0, 1, 0).applyQuaternion(camera.quaternion); mv.up.y = -mv.up.y;
    mirrorCam.up.copy(mv.up); mirrorCam.lookAt(mv.target.copy(mirrorCam.position).add(mv.fwd));
    mirrorCam.near = camera.near; mirrorCam.far = camera.far; mirrorCam.projectionMatrix.copy(camera.projectionMatrix);
    mirrorCam.updateMatrixWorld(); mirrorCam.matrixWorldInverse.copy(mirrorCam.matrixWorld).invert();
    MIRROR.planarMatrix.value.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse);
    MIRROR.planarY.value = y;
    // oblique near plane at the floor, so nothing below it shows in the reflection (as three's Reflector does)
    mv.plane.set(new THREE.Vector3(0, 1, 0), -y).applyMatrix4(mirrorCam.matrixWorldInverse);
    mv.clip.set(mv.plane.normal.x, mv.plane.normal.y, mv.plane.normal.z, mv.plane.constant);
    const e = mirrorCam.projectionMatrix.elements;
    mv.q.set((Math.sign(mv.clip.x) + e[8]) / e[0], (Math.sign(mv.clip.y) + e[9]) / e[5], -1, (1 + e[10]) / e[14]);
    mv.clip.multiplyScalar(2 / mv.clip.dot(mv.q));
    e[2] = mv.clip.x; e[6] = mv.clip.y; e[10] = mv.clip.z + 1 - 0.003; e[14] = mv.clip.w;
    mirrorCam.projectionMatrixInverse.copy(mirrorCam.projectionMatrix).invert();
    for (const o of mirrorMeshes) o.visible = false;
    const rtWas = renderer.getRenderTarget();
    renderer.setRenderTarget(planarRT); renderer.clear(); renderer.render(scene, mirrorCam);
    renderer.setRenderTarget(rtWas);
    for (const o of mirrorMeshes) o.visible = true;
  }
  const lookFor = (id) => Object.assign({}, LOOK_DEFAULT, LOOKS[id] || {});

  function setSun() {
    const sc = sun.shadow.camera, size = sun.shadow.mapSize.x;
    // penumbra growth: texels per unit of normalised depth = depth range x tan(sun diameter) / frustum width x map size
    const sunDiameter = 0.0093 * (U.look.sun || 1);
    sun.shadow.radius = (sc.far - sc.near) * sunDiameter / (sc.right - sc.left) * size;
  }
  function refreshMaterials() {
    for (const m of allMaterials()) m.needsUpdate = true;
    eachMaterial(scene, (m) => (m.needsUpdate = true));
  }
  function resizeAo() {
    const [w, h, pr] = U.size;
    const bw = Math.max(1, Math.round(w * pr)), bh = Math.max(1, Math.round(h * pr));
    gtao.setSize(Math.max(1, Math.round(bw * U.aoScale)), Math.max(1, Math.round(bh * U.aoScale)));
    SSAO.ssaoInv.value.set(1 / bw, 1 / bh);
    planarRT.setSize(Math.max(1, bw >> 1), Math.max(1, bh >> 1));
    MIRROR.planarMaxLod.value = Math.max(1, Math.floor(Math.log2(Math.max(bw, bh) / 2)) - 2);
  }

  return {
    U, composer, bloom, gtao, grade, planarRT, LOOKS,
    enable() {
      if (U.on) return;
      U.on = true;
      this.applyLook();
      if (U.pcss) renderer.shadowMap.type = THREE.PCFShadowMap; // = PCSS (patched above)
      sun.shadow.bias = -0.0002; sun.shadow.normalBias = 0.02;
      refreshMaterials();
      mirrorMeshes.clear(); patchScene();
    },
    disable() {
      if (!U.on) return;
      U.on = false;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 1;
      eachMaterial(scene, unpatchMaterial);
      for (const m of allMaterials()) unpatchMaterial(m);
      refreshMaterials();
      SSAO.tSSAO.value = white;
      this.restoreLook();
    },
    // options for experiments and the bench: { ao, aoScale, pcss, grade, shadowSize, look: {...} }
    set(o = {}) {
      const was = U.on;
      if (was) this.disable();
      Object.assign(U, o);
      if (o.look) U.lookOverride = Object.assign({}, o.look);
      if (was) { this.enable(); resizeAo(); }
      return Object.assign({}, U, { base: undefined });
    },
    resize(w, h, pr) {
      U.size = [w, h, pr];
      composer.setPixelRatio(pr); composer.setSize(w, h);
      grade.uniforms.aspect.value = w / h;
      resizeAo();
    },
    // the theme just changed (a new world): remember its light, then apply this world's ultra look on top
    themeChanged() {
      U.base = { hemi: hemi.intensity, sun: sun.intensity, exposure: renderer.toneMappingExposure, bloom: bloom.strength };
      U.worldId = (typeof window !== 'undefined' && window.EW && window.EW.world && window.EW.world.id) || null;
      mirrorMeshes.clear();
      if (U.on) { this.applyLook(); patchScene(); }
    },
    applyLook() {
      U.look = Object.assign(lookFor(U.worldId), U.lookOverride || {});
      renderer.toneMapping = TONES[U.tone || U.look.tone] || THREE.AgXToneMapping;
      if (!U.base) U.base = { hemi: hemi.intensity, sun: sun.intensity, exposure: renderer.toneMappingExposure, bloom: bloom.strength };
      hemi.intensity = U.base.hemi * U.look.hemi; sun.intensity = U.base.sun * U.look.sunLight;
      renderer.toneMappingExposure = U.base.exposure * U.look.exposure;
      gtao.updateGtaoMaterial({ radius: U.look.aoRadius, scale: U.look.ao });
      setSun();
    },
    restoreLook() {
      if (scene.userData.envBase != null) { if (scene.environmentIntensity === scene.userData.envSet) scene.environmentIntensity = scene.userData.envBase; delete scene.userData.envBase; delete scene.userData.envSet; }
      if (!U.base) return;
      hemi.intensity = U.base.hemi; sun.intensity = U.base.sun; renderer.toneMappingExposure = U.base.exposure;
    },
    render() {
      // the sky light is set by the sky loader (async): keep this world's image-based share on top of it
      if (scene.environment) {
        if (scene.userData.envBase == null || scene.userData.envSet !== scene.environmentIntensity) scene.userData.envBase = scene.environmentIntensity;
        scene.environmentIntensity = scene.userData.envBase * U.look.env; scene.userData.envSet = scene.environmentIntensity;
      }
      if ((U.frames++ % 30) === 0) patchScene(); // late arrivals: models, players, textures
      const sm = renderer.shadowMap;
      sm.autoUpdate = false; sm.needsUpdate = true; // the shadow map renders once, in the first pass of the frame
      if (U.ao) {
        const bg = scene.background; scene.background = null;
        gtao.render(renderer, null, null);
        scene.background = bg;
        SSAO.tSSAO.value = gtao.gtaoMap;
      }
      if (U.mirror && U.look.mirror && mirrorMeshes.size) renderMirror();
      const G = grade.uniforms;
      G.tAO.value = SSAO.tSSAO.value; G.showAO.value = U.showAO ? 1 : 0;
      G.contrast.value = U.look.contrast == null ? 1 : U.look.contrast; G.saturation.value = U.look.saturation == null ? 1 : U.look.saturation;
      G.vignette.value = U.grade ? 0.22 : 0; G.grain.value = U.grade ? 0.018 : 0;
      G.seed.value = (G.seed.value + 17.31) % 1000;
      composer.render();
      sm.autoUpdate = true;
    },
  };
}

// Adds the ultra preset to the renderer made by render.js (createRender). This file is imported by main.js only,
// and render.js stays as it is: render.js is part of the engine module that verifiers replay (for its materials),
// and any edit there, even to code the engine never runs, renames its minified symbols and so changes the engine's
// hash. Ultra therefore wraps setQuality, resize, applyTheme and render from outside.
export function installUltra(R) {
  const base = { setQuality: R.setQuality, resize: R.resize, applyTheme: R.applyTheme, render: R.render };
  const size = new THREE.Vector2();
  R.ultra = null;
  R.setQuality = function (q) {
    const assets = typeof window !== 'undefined' && window.EW && window.EW.assets;
    if (assets && assets.setHiRes) assets.setHiRes(q === 'ultra'); // 1024 px texture sets, full anisotropy
    if (q !== 'ultra') {
      if (this.ultra) this.ultra.disable();
      return base.setQuality.call(this, q);
    }
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
