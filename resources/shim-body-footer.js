(function() {
  if (!window.nwDispatcher) {
    return;
  }

  // Restore Node's `global`
  window.global = window.nodeGlobal;
  delete window.nodeGlobal;

  // Shim `window.require`
  var _require = window.require;
  var nodeRequire = window.nodeRequire;
  delete window.nodeRequire;

  if (_require) {
    window.require = function() {
      try {
        return _require.apply(null, arguments);
      } catch (e) {
        return nodeRequire.apply(null, arguments);
      }
    };
  } else {
    window.require = nodeRequire;
  }
})();
