(function() {
  if (!window.nwDispatcher) return;

  // Reload the page when anything in `dist` changes
  var fs = window.requireNode('fs');

  fs.watch('./dist', function() {
    window.location.reload();
  });
})();
