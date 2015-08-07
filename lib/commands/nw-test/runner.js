'use strict';

var spawn = require('child_process').spawn;
var argv = require('optimist').argv;

runNw(argv['nw-path'], argv['tests-path']);

function runNw(nwPath, testsPath) {
  var nw = spawn(nwPath, [testsPath]);
  var hasErrors = false;

  // Cleanup nw.js output to be TAP (test anything protocol) compliant
  nw.stderr.on('data', function(data) {
    data = data.toString('utf8');

    if (data.indexOf('[qunit-logger]') > -1) {
      data = data.replace(/.*\[qunit-logger] (.*)"", source:.*/g, '$1');
      data = data.replace(/\\"/g, '"');
      data = data.replace(/\\\\n/g, '\\n');
      process.stdout.write(data);

      if (data === '# done with errors') {
        hasErrors = true;
      }

      if (data.indexOf('# done') > -1) {
        nw.kill();
        process.exit(hasErrors ? 1 : 0);
      }
    }
  });

  process.on('SIGTERM', function() {
    nw.kill();
  });
}
