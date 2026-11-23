// The game's entry point (docs/engine.js). Deterministic Math goes in before any other module of the game runs:
// some gameplay modules compute values as they load, and a replay computes them with these same functions (sim.js
// installs them first too). The client is split into chunks, and a chunk's code runs before the code of the file
// that imports it, so importing detmath.js first in main.js would no longer be enough. Hence this tiny file: it
// installs deterministic Math, then imports the game. The page preloads the game's files, so nothing waits.
import './detmath.js';

import('./main.js').catch((err) => {
  console.error(err);
  const m = document.getElementById('load-msg');
  if (m) m.textContent = 'Elsewhere could not load (' + err.message + '). Check the connection and reload the page.';
});
