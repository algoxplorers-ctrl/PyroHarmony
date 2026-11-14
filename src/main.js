/**
 * @file src/main.js
 * @description Application bootstrap entry point for PyroHarmony v2.0.0.
 * Initializes the MVC AppController once the DOM is ready.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import { AppController } from './controllers/AppController.js';

function bootstrapPyroHarmony() {
  const app = new AppController();
  app.init();
  window.__PYROHARMONY_APP__ = app;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapPyroHarmony);
} else {
  bootstrapPyroHarmony();
}
