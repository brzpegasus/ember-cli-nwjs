/* jshint browser: true */
(function(window) {
  if (!window.nwDispatcher && !window.nw) { return; }

  // Restore NW.js variables.
  global.window = window;
  window.process = global.process;

  // Redefine a global `require` function that can satisfy both
  // Node and AMD module systems.
  var requireAMD = window.require;
  var requireNode = window.requireNode;

  if (requireAMD) {
    window.require = function() {
      try {
        return requireAMD.apply(null, arguments);
      } catch (e) {
        return requireNode.apply(null, arguments);
      }
    };
  } else {
    window.require = requireNode;
  }
})(this);
