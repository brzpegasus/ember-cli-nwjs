/* jshint browser: true */
(function(window) {
  if (!window.nwDispatcher) { return; }

  // Delete some variables that mislead third-party libraries into thinking
  // that the running environment is Node.
  delete global.window;   // can be accessed via `window`
  delete window.process;  // can be accessed via `global.process`

  // Rename node's `require` to avoid conflicts with AMD's `require`.
  window.requireNode = window.require;
  delete window.require;
})(this);
