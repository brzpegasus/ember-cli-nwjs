(function() {
  if (!window.nwdispatcher) return;

  // Reload the page when anything in `dist` changes
  var fs = window.requirenode('fs');

  fs.watch('./dist', function() {
    window.location.reload();
  });
})();
