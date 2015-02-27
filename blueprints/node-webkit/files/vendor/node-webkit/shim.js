(function(window) {
  if (!window.nwDispatcher) return;

  // Rename node's `require` to avoid conflicts with AMD's `require`.
  var requireNode = window.requireNode = window.require;
  delete window.require;

  window.addEventListener('load', function() {
    // Once the document is loaded, make node's `require` function
    // available again. This is required for certain node modules that
    // can't work with the alias, and for nw.js's GUI to function properly
    // (e.g. opening the dev tools from the window toolbar).
    var requireAMD = window.require;

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
  });
})(this);
