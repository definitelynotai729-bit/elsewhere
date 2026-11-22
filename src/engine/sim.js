// The engine as one module, for verifiers. tools/build.mjs archives it by its SHA-256 at
// docs/engines/by-hash/<sha256>.js (see tools/engines.mjs). A proof names the engine it was played on (its `sim`),
// and verifiers replay it on exactly that engine, so gameplay code can change without breaking an old proof.
// Keep this interface stable (API): the validator calls archived engines through it for ever.
import { install } from './detmath.js';
import { replayRun as replay, checkShape } from './headless.js';

export const API = 1;
export { checkShape };
// several engines can share one process (a validator replays each proof on its own engine): each replay puts
// this engine's deterministic Math in place first. Replays must therefore run one at a time.
export async function replayRun(proof, env) { install(); return replay(proof, env); }
