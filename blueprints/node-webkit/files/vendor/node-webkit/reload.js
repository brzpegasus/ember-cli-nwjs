/* jshint browser: true */
(function() {
  if (!window.nwDispatcher) { return; }

  // Reload the page when anything in `dist` changes
  var fs = window.requireNode('fs');
  var watchDir = './dist';

  if (fs.existsSync(watchDir)) {
    fs.watch(watchDir, function() {
      window.location.reload();
    });
  }
})();
