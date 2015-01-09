if (window.nwDispatcher) {
  // Stub out Node's `require` so it doesn't conflict with
  // AMD's `require` function.
  window.nodeRequire = window.require;
  window.require = undefined;

  // Stub out Node's `global` so some third-party libraries
  // can bind to `window` properly.
  window.nodeGlobal = window.global;
  window.global = undefined;
}
